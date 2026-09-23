import { getFeaturedReviews } from "@lib/data/featured-reviews"

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const ids = params.get("ids")?.split(",").filter(Boolean).slice(0, 6)
  const offset = Math.max(0, Math.min(10000, Math.floor(Number(params.get("offset")) || 0)))
  try { return Response.json(await getFeaturedReviews(ids, offset), { headers: { "Cache-Control": "no-store" } }) }
  catch { return Response.json({ message: "Could not load reviews. Please try again." }, { status: 502 }) }
}
