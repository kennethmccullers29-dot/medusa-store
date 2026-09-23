"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"
import { revalidatePath } from "next/cache"

export type ReviewFormState = { success: boolean; message: string } | null

export async function submitReview(
  _state: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const headers = await getAuthHeaders()
  if (!headers || !("authorization" in headers)) {
    return { success: false, message: "Please sign in before writing a review." }
  }
  const path = String(formData.get("path") || "")
  try {
    await sdk.client.fetch("/store/reviews", {
      method: "POST",
      headers,
      body: {
        product_id: String(formData.get("product_id") || ""),
        rating: Number(formData.get("rating")),
        title: String(formData.get("title") || "") || undefined,
        content: String(formData.get("content") || ""),
      },
    })
    if (path.startsWith("/")) revalidatePath(path)
    return { success: true, message: "Thanks! Your review was submitted for approval." }
  } catch (error) {
    const message = error instanceof Error && error.message.includes("already reviewed")
      ? "You have already reviewed this product."
      : "We couldn't submit your review. Check the fields and try again."
    return { success: false, message }
  }
}
