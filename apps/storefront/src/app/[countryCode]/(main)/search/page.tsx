import { Metadata } from "next"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = { title: "Search products", robots: { index: false, follow: true } }
export default async function SearchPage({ params, searchParams }: { params: Promise<{ countryCode: string }>; searchParams: Promise<{ q?: string; page?: string }> }) {
  const { countryCode } = await params
  const search = await searchParams
  const term = (typeof search.q === "string" ? search.q : "").trim().slice(0, 100)
  const page = Math.max(1, Math.min(1000, Math.floor(Number(search.page) || 1)))
  const region = await getRegion(countryCode)
  if (!region) return null
  const response = term.length >= 2 ? await listProducts({ countryCode, pageParam: page, queryParams: { q: term, limit: 12, fields: "*variants.calculated_price,*images" } }) : null
  const count = response?.response.count || 0
  return <main className="content-container py-16"><p className="text-xs uppercase tracking-widest text-homestead-olive">The collection</p><h1 className="mt-3 font-heading text-4xl text-homestead-forest">Find your next favorite</h1><form action={`/${countryCode}/search`} className="mt-7 flex max-w-xl gap-3"><label htmlFor="search-query" className="sr-only">Search products</label><input id="search-query" name="q" type="search" required minLength={2} maxLength={100} defaultValue={term} placeholder="Search products…" className="min-w-0 flex-1 rounded-sm border border-homestead-border bg-homestead-cream px-4 py-3 text-base" /><button className="rounded-sm bg-homestead-forest px-6 py-3 text-sm text-homestead-cream">Search</button></form>{response ? <><p className="mt-8 text-sm text-homestead-muted">{count} {count === 1 ? "result" : "results"} for “{term}”</p>{response.response.products.length ? <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4">{response.response.products.map(product => <li key={product.id}><ProductPreview product={product} region={region} /></li>)}</ul> : <p className="mt-10 rounded-sm border border-homestead-border p-8 text-center text-homestead-muted">No products on this page. Try another search or return to the first page.</p>}<nav aria-label="Search result pages" className="mt-10 flex items-center gap-6">{page > 1 && <LocalizedClientLink href={`/search?q=${encodeURIComponent(term)}&page=${page - 1}`} className="text-sm text-homestead-olive underline">← Previous</LocalizedClientLink>}{response.nextPage && <LocalizedClientLink href={`/search?q=${encodeURIComponent(term)}&page=${response.nextPage}`} className="text-sm text-homestead-olive underline">Next →</LocalizedClientLink>}</nav></> : <p className="mt-8 text-homestead-muted">Enter at least two characters to search our products.</p>}</main>
}
