import { Suspense } from "react"

import { OptionValueIds } from "@lib/util/product-option-filters"
import { listCategories } from "@lib/data/categories"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import CategorySort from "@modules/categories/components/category-sort"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = async ({
  sortBy,
  page,
  countryCode,
  optionValueIds,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
}) => {
  const pageNumber = Math.max(1, Math.floor(Number(page) || 1))
  const sort = ["created_at", "price_asc", "price_desc"].includes(sortBy || "") ? sortBy! : "created_at"
  const categories = await listCategories({ fields: "id,name,handle,parent_category_id" }).catch(() => [])
  const roots = categories.filter((category) => !category.parent_category_id)

  return (
    <main className="bg-homestead-cream" data-testid="category-container">
      <header className="border-b border-homestead-border bg-gradient-to-br from-homestead-linen/70 via-homestead-cream to-homestead-linen/30">
        <div className="content-container py-10 md:py-16">
          <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-homestead-muted">
            <LocalizedClientLink href="/">Home</LocalizedClientLink>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-homestead-forest">Shop</span>
          </nav>
          <p className="font-nav text-xs font-medium uppercase tracking-[0.2em] text-homestead-olive">A little care for your everyday</p>
          <h1 data-testid="store-page-title" className="mt-4 font-heading text-5xl leading-tight text-homestead-forest md:text-6xl">All products</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-homestead-muted">Explore everyday essentials and small comforts, thoughtfully made for moments that feel like yours.</p>
          {!!roots.length && <nav aria-label="Shop by category" className="mt-8 flex flex-wrap gap-3">{roots.map((category) => <LocalizedClientLink key={category.id} href={`/categories/${category.handle}`} className="rounded-full border border-homestead-border bg-homestead-cream/80 px-5 py-2.5 font-nav text-sm font-medium text-homestead-forest transition-colors hover:border-homestead-olive hover:bg-homestead-linen">{category.name} <span aria-hidden="true" className="ml-2">↗</span></LocalizedClientLink>)}</nav>}
        </div>
      </header>
      <div className="content-container grid gap-10 py-10 md:py-14 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-12">
        <aside>
          <nav aria-label="Shop categories">
            <p className="mb-4 font-nav text-sm font-medium text-homestead-forest">Explore the collection</p>
            <ul className="flex flex-wrap gap-2 lg:flex-col">
              <li><LocalizedClientLink href="/store" aria-current="page" className="block rounded-sm bg-homestead-linen px-3 py-2.5 font-nav text-sm font-medium text-homestead-forest">All products</LocalizedClientLink></li>
              {roots.map((category) => <li key={category.id}><LocalizedClientLink href={`/categories/${category.handle}`} className="block rounded-sm px-3 py-2.5 font-nav text-sm text-homestead-muted transition-colors hover:bg-homestead-linen/60">{category.name}</LocalizedClientLink></li>)}
            </ul>
          </nav>
        </aside>
        <section aria-label="All products" className="min-w-0">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-homestead-border pb-5">
            <h2 className="font-heading text-2xl text-homestead-forest">Find your everyday favorite</h2>
            <CategorySort sortBy={sort} />
          </div>
        <Suspense key={`${sort}-${pageNumber}-${JSON.stringify(optionValueIds)}`} fallback={<SkeletonProductGrid numberOfProducts={8} />}>
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            countryCode={countryCode}
            optionValueIds={optionValueIds}
            showSummary
          />
        </Suspense>
        </section>
      </div>
    </main>
  )
}

export default StoreTemplate
