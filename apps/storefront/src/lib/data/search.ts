"use server"

import { listProducts } from "./products"
import { getProductPrice } from "@lib/util/get-product-price"

export async function searchProducts(query: string, countryCode: string) {
  const term = query.trim().slice(0, 100)
  if (term.length < 2) return { products: [], count: 0, error: null }
  try {
    const { response } = await listProducts({ countryCode, queryParams: { q: term, limit: 8, fields: "id,title,handle,thumbnail,*variants.calculated_price" } })
    return { products: response.products.filter(product => product.handle).map(product => ({ id: product.id, title: product.title, handle: product.handle!, thumbnail: product.thumbnail, price: getProductPrice({ product }).cheapestPrice?.calculated_price })), count: response.count, error: null }
  } catch {
    return { products: [], count: 0, error: "We couldn’t load results. Please try again." }
  }
}
