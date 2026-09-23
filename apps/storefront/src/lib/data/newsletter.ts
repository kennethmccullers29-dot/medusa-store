"use server"

import { sdk } from "@lib/config"

export async function newsletterAvailable() {
  try {
    const result = await sdk.client.fetch<{ available: boolean }>("/store/newsletter", { cache: "no-store" })
    return result.available
  } catch { return false }
}

export async function subscribeNewsletter(_: { message: string; success: boolean }, data: FormData) {
  const email = String(data.get("email") || "").trim()
  if (!email || data.get("consent") !== "on") return { success: false, message: "Enter your email and agree to receive our newsletter." }
  try {
    await sdk.client.fetch("/store/newsletter", { method: "POST", body: { email, consent: true, website: String(data.get("website") || "") } })
    return { success: true, message: "Thanks! Check your inbox if a confirmation email is needed to finish signing up." }
  } catch { return { success: false, message: "We couldn’t process your signup. Please try again later." } }
}
