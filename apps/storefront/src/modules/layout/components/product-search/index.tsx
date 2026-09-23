"use client"

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { searchProducts } from "@lib/data/search"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

function SearchIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg>
}
export default function ProductSearch({ countryCode }: { countryCode: string }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [result, setResult] = useState<Awaited<ReturnType<typeof searchProducts>> | null>(null)
  const [loading, setLoading] = useState(false)
  const [retry, setRetry] = useState(0)
  const router = useRouter()
  const pathname = usePathname()
  const term = query.trim()
  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => {
    let active = true
    setResult(null)
    if (!open || term.length < 2) { setLoading(false); return }
    setLoading(true)
    const timeout = setTimeout(async () => {
      try {
        const response = await searchProducts(term, countryCode)
        if (active) setResult(response)
      } catch {
        if (active) setResult({ products: [], count: 0, error: "We couldn’t load results. Please try again." })
      } finally { if (active) setLoading(false) }
    }, 300)
    return () => { active = false; clearTimeout(timeout) }
  }, [open, term, countryCode, retry])
  function submit(event: React.FormEvent) {
    event.preventDefault()
    if (term.length < 2) return
    setOpen(false)
    router.push(`/${countryCode}/search?q=${encodeURIComponent(term)}`)
  }
  return <>
    <button type="button" aria-label="Search products" title="Search" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-homestead-linen focus-visible:outline-offset-2" onClick={() => setOpen(true)}><SearchIcon /></button>
    <Dialog open={open} onClose={setOpen} className="relative z-[80]"><div className="fixed inset-0 bg-homestead-ink/40" /><div className="fixed inset-0 overflow-y-auto px-3 py-6 sm:px-6 sm:py-20"><DialogPanel className="mx-auto w-full max-w-2xl rounded-sm border border-homestead-border bg-homestead-cream shadow-xl"><header className="flex items-center justify-between gap-4 px-6 pt-6"><DialogTitle className="font-heading text-3xl text-homestead-forest">Find your next favorite</DialogTitle><button type="button" aria-label="Close search" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-2xl text-homestead-forest hover:bg-homestead-linen" onClick={() => setOpen(false)}>×</button></header><form onSubmit={submit} className="m-6 flex items-center gap-3 rounded-sm border border-homestead-border bg-white px-4 focus-within:border-homestead-olive"><SearchIcon /><label htmlFor="navbar-product-search" className="sr-only">Search products</label><input id="navbar-product-search" data-autofocus type="search" value={query} maxLength={100} onChange={event => setQuery(event.target.value)} placeholder="Search products…" className="min-w-0 flex-1 border-0 bg-transparent py-4 text-base text-homestead-ink outline-none" autoComplete="off" /><button type="submit" disabled={term.length < 2} className="text-sm font-medium text-homestead-olive disabled:opacity-40">Search</button></form><div className="px-6 pb-6" aria-busy={loading}><div role="status" aria-live="polite" className="mb-4 text-sm text-homestead-muted">{term.length < 2 ? "Type at least two characters to search the collection." : loading ? "Searching the collection…" : result?.error ? "" : result ? `${result.count} ${result.count === 1 ? "product" : "products"} found` : ""}</div>{result?.error ? <div role="alert"><p className="text-sm text-homestead-muted">{result.error}</p><button className="mt-3 text-sm text-homestead-olive underline" onClick={() => setRetry(value => value + 1)}>Try again</button></div> : result && !result.products.length ? <div className="rounded-sm bg-homestead-linen/50 px-5 py-8 text-center"><p className="font-heading text-2xl text-homestead-forest">No favorites found just yet.</p><p className="mt-2 text-sm text-homestead-muted">Try another product name or a shorter search.</p></div> : <ul className="divide-y divide-homestead-border">{result?.products.map(product => <li key={product.id}><LocalizedClientLink href={`/products/${product.handle}`} onClick={() => setOpen(false)} className="flex items-center gap-4 rounded-sm py-3 hover:bg-homestead-linen/40"><div className="h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-homestead-linen">{product.thumbnail && <img src={product.thumbnail} alt="" className="h-full w-full object-cover" />}</div><div className="min-w-0 flex-1"><p className="font-heading text-xl text-homestead-forest">{product.title}</p>{product.price && <p className="mt-1 text-sm text-homestead-muted">{product.price}</p>}</div><span aria-hidden="true" className="text-homestead-olive">→</span></LocalizedClientLink></li>)}</ul>}{!!result?.products.length && <LocalizedClientLink href={`/search?q=${encodeURIComponent(term)}`} onClick={() => setOpen(false)} className="mt-5 block rounded-sm bg-homestead-forest px-5 py-3 text-center text-sm text-homestead-cream">View all results →</LocalizedClientLink>}</div></DialogPanel></div></Dialog>
  </>
}
