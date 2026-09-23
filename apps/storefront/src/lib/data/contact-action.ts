"use server"
import { sdk } from "@lib/config"

export type ContactState = { success: boolean; message: string } | null
export async function submitContact(_: ContactState, data: FormData): Promise<ContactState> {
  try { const result = await sdk.client.fetch<{ message: string }>("/store/contact", { method: "POST", body: { name: String(data.get("name") || ""), email: String(data.get("email") || ""), subject: String(data.get("subject") || ""), message: String(data.get("message") || "") } }); return { success: true, message: result.message } }
  catch { return { success: false, message: "We couldn’t send your message. Please check the fields and try again." } }
}
