import { sdk } from "@lib/config"
import { cache } from "react"

export type ProductReview = {
  id: string
  title?: string | null
  content: string
  rating: number
  first_name: string
  last_name: string
  created_at: string
}
export type ProductReviewsResponse = {
  reviews: ProductReview[]
  count: number
  average_rating: number
  limit: number
  offset: number
}
export async function getProductReviews(productId: string) {
  return sdk.client.fetch<ProductReviewsResponse>("/store/reviews", {
    query: { product_id: productId, limit: 100 },
    cache: "no-store",
  }).catch(() => ({ reviews: [], count: 0, average_rating: 0, limit: 100, offset: 0 }))
}
export const getProductReviewSummary = cache(async (productId: string) => {
  try {
    const data = await sdk.client.fetch<ProductReviewsResponse>("/store/reviews", {
      query: { product_id: productId, limit: 1 },
      cache: "no-store",
    })
    return { count: data.count, average: data.average_rating }
  } catch { return null }
})
