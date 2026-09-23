"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { SortOptions } from "@modules/store/components/refinement-list/sort-products"

export default function CategorySort({ sortBy }: { sortBy: SortOptions }) {
  const router = useRouter()
  const pathname = usePathname()
  const search = useSearchParams()
  return <div className="flex items-center gap-3"><label htmlFor="category-sort" className="text-sm text-homestead-muted">Sort by</label><select id="category-sort" value={sortBy} className="rounded-sm border border-homestead-border bg-homestead-cream py-2 pl-3 pr-8 text-sm text-homestead-forest focus:border-homestead-olive" onChange={event => {
    const params = new URLSearchParams(search.toString())
    params.set("sortBy", event.target.value)
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }}><option value="created_at">Latest arrivals</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option></select></div>
}
