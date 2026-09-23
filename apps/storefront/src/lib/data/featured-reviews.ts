import { sdk } from "@lib/config"

export type FeaturedReview = { id: string; title: string | null; content: string; rating: number; author: string; product: { id: string; title: string; handle: string; thumbnail: string | null } | null }
export type FeaturedReviews = { reviews: FeaturedReview[]; count: number }
export async function getFeaturedReviews(ids?: string[], offset = 0): Promise<FeaturedReviews> {
  return sdk.client.fetch<FeaturedReviews>("/store/featured-reviews", { query: { ...(ids?.length ? { ids: ids.slice(0, 6).join(",") } : {}), offset, limit: ids?.length ? 6 : 12 }, cache: "no-store" })
}
