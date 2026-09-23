import { Suspense } from "react"
import { listCategories } from "@lib/data/categories"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import type { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import type { HttpTypes } from "@medusajs/types"
import type { OptionValueIds } from "@lib/util/product-option-filters"
import CategorySort from "../components/category-sort"

export default async function CategoryTemplate({ category, sortBy, page, countryCode, optionValueIds }: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
}) {
  const pageNumber = Math.max(1, Math.floor(Number(page) || 1))
  const sort = ["created_at", "price_asc", "price_desc"].includes(sortBy || "") ? sortBy! : "created_at"
  const categories = await listCategories({ fields: "id,name,handle,parent_category_id,*category_children" }).catch(() => [])
  const roots = categories.filter(item => !item.parent_category_id)
  const parents: HttpTypes.StoreProductCategory[] = []
  let parent = category.parent_category
  while (parent && !parents.some(item => item.id === parent!.id)) {
    parents.unshift(parent)
    parent = parent.parent_category
  }
  return <main data-testid="category-container" className="bg-homestead-cream">
    <header className="border-b border-homestead-border bg-gradient-to-br from-homestead-linen/70 via-homestead-cream to-homestead-linen/30">
      <div className="content-container py-10 md:py-16">
        <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 text-xs text-homestead-muted"><LocalizedClientLink href="/">Home</LocalizedClientLink><span aria-hidden="true">/</span><LocalizedClientLink href="/store">Shop</LocalizedClientLink>{parents.map(item => <span key={item.id} className="flex items-center gap-2"><span aria-hidden="true">/</span><LocalizedClientLink href={`/categories/${item.handle}`}>{item.name}</LocalizedClientLink></span>)}<span aria-hidden="true">/</span><span aria-current="page" className="text-homestead-forest">{category.name}</span></nav>
        <p className="font-nav text-xs font-medium uppercase tracking-[0.2em] text-homestead-olive">A little care for your everyday</p>
        <h1 data-testid="category-page-title" className="mt-4 font-heading text-5xl leading-tight text-homestead-forest md:text-6xl">{category.name}</h1>
        {category.description && <p className="mt-5 max-w-2xl whitespace-pre-line text-base leading-8 text-homestead-muted">{category.description}</p>}
        {!!category.category_children?.length && <nav aria-label="Subcategories" className="mt-8 flex flex-wrap gap-3">{category.category_children.map(item => <LocalizedClientLink key={item.id} href={`/categories/${item.handle}`} className="rounded-full border border-homestead-border bg-homestead-cream/80 px-5 py-2.5 font-nav text-sm font-medium text-homestead-forest transition-colors hover:border-homestead-olive hover:bg-homestead-linen">{item.name} <span aria-hidden="true" className="ml-2">↗</span></LocalizedClientLink>)}</nav>}
      </div>
    </header>
    <div className="content-container grid gap-10 py-10 md:py-14 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-12">
      <aside><nav aria-label="Shop categories"><p className="mb-4 font-nav text-sm font-medium text-homestead-forest">Explore the collection</p><ul className="flex flex-wrap gap-2 lg:flex-col"><li><LocalizedClientLink href="/store" className="block rounded-sm px-3 py-2.5 text-sm text-homestead-muted hover:bg-homestead-linen/60">All products</LocalizedClientLink></li>{roots.map(item => <li key={item.id}><LocalizedClientLink href={`/categories/${item.handle}`} aria-current={item.id === category.id ? "page" : undefined} className={`block rounded-sm px-3 py-2.5 font-nav text-sm transition-colors ${item.id === category.id || parents.some(p => p.id === item.id) ? "bg-homestead-linen font-medium text-homestead-forest" : "text-homestead-muted hover:bg-homestead-linen/60"}`}>{item.name}</LocalizedClientLink>{(item.id === category.id || parents.some(p => p.id === item.id)) && !!item.category_children?.length && <ul className="ml-3 mt-2 hidden border-l border-homestead-border pl-3 lg:block">{item.category_children.map(child => <li key={child.id}><LocalizedClientLink href={`/categories/${child.handle}`} aria-current={child.id === category.id ? "page" : undefined} className={`block py-2 text-sm ${child.id === category.id ? "font-medium text-homestead-forest" : "text-homestead-muted hover:text-homestead-olive"}`}>{child.name}</LocalizedClientLink></li>)}</ul>}</li>)}</ul></nav></aside>
      <section aria-label={`${category.name} products`} className="min-w-0"><div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-homestead-border pb-5"><h2 className="font-heading text-2xl text-homestead-forest">Find your everyday favorite</h2><CategorySort sortBy={sort} /></div><Suspense key={`${category.id}-${sort}-${pageNumber}-${JSON.stringify(optionValueIds)}`} fallback={<SkeletonProductGrid numberOfProducts={8} />}><PaginatedProducts sortBy={sort} page={pageNumber} categoryId={category.id} countryCode={countryCode} optionValueIds={optionValueIds} showSummary /></Suspense></section>
    </div>
  </main>
}
