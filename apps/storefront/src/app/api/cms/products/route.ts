import { sdk } from "@lib/config"
import type { HttpTypes } from "@medusajs/types"

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const handles = params.getAll("handle").filter(Boolean).slice(0, 8)
  const q = (params.get("q") || "").trim().slice(0, 100)
  const offset = Math.max(0, Math.min(10000, Math.floor(Number(params.get("offset")) || 0)))
  try {
    const result = await sdk.client.fetch<{ products: HttpTypes.StoreProduct[]; count: number }>("/store/products", {
      query: { fields: "id,title,handle,thumbnail", limit: handles.length ? 8 : 12, offset: handles.length ? 0 : offset, ...(handles.length ? { handle: handles } : q ? { q } : {}), order: "-created_at" },
      cache: "no-store",
    })
    return Response.json({ products: result.products.filter(product => product.handle).map(product => ({ id: product.id, title: product.title, handle: product.handle, thumbnail: product.thumbnail })), count: result.count }, { headers: { "Cache-Control": "no-store" } })
  } catch {
    return Response.json({ message: "Could not load the Medusa catalog. Please try again." }, { status: 502 })
  }
}
