"use client"

import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export type MenuCategory = {
  id: string
  name: string
  handle: string
  children: { id: string; name: string; handle: string }[]
}
export type MenuCollection = { id: string; title: string; handle: string }
export type MenuProduct = {
  id: string
  title: string
  handle: string
  thumbnail?: string | null
  price?: string
}

export default function MegaMenu({ categories, collections, products = [] }: {
  categories: MenuCategory[]
  collections: MenuCollection[]
  products?: MenuProduct[]
}) {
  return (
    <Popover className="flex h-full items-center">
      {({ open, close }) => (
        <>
          <PopoverButton className="flex h-full items-center gap-2 py-2 font-nav text-[18px] leading-6 font-medium tracking-[0.015em] text-homestead-forest outline-none transition-colors hover:text-homestead-olive focus-visible:underline underline-offset-4">
            Shop
            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none" className={`transition-transform ${open ? "rotate-180" : ""}`}><path d="m3 4.5 3 3 3-3" stroke="currentColor" strokeWidth="1.5" /></svg>
          </PopoverButton>
          <PopoverPanel transition className="absolute inset-x-0 top-full max-h-[calc(100dvh-8rem)] overflow-y-auto bg-homestead-cream font-sans text-sm text-homestead-ink shadow-xl origin-top transition duration-150 ease-out data-[closed]:-translate-y-2 data-[closed]:opacity-0">
            <div className="content-container grid grid-cols-[minmax(220px,0.8fr)_minmax(0,2.2fr)] gap-12 py-9">
              <div>
                <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-homestead-muted">Shop by category</p>
                <ul className="grid grid-cols-2 gap-x-5 gap-y-4">
                  {categories.map((category) => (
                    <li key={category.id}>
                      <LocalizedClientLink href={`/categories/${category.handle}`} onClick={() => close()} className="font-nav text-lg font-medium text-homestead-forest hover:underline underline-offset-4">{category.name}</LocalizedClientLink>
                      {!!category.children.length && <ul className="mt-2 grid gap-2">{category.children.map((child) => <li key={child.id}><LocalizedClientLink href={`/categories/${child.handle}`} onClick={() => close()} className="text-sm text-homestead-muted hover:text-homestead-ink">{child.name}</LocalizedClientLink></li>)}</ul>}
                    </li>
                  ))}
                  {!categories.length && <li className="text-sm text-homestead-muted">Explore our full range in the shop.</li>}
                </ul>
                {!!collections.length && <div className="mt-8 border-t border-homestead-border pt-6">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-homestead-muted">Collections</p>
                  <ul className="grid gap-3">{collections.slice(0, 4).map((collection) => <li key={collection.id}><LocalizedClientLink href={`/collections/${collection.handle}`} onClick={() => close()} className="text-sm hover:underline underline-offset-4">{collection.title}</LocalizedClientLink></li>)}</ul>
                </div>}
              </div>
              <div>
                <div className="mb-5 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-widest text-homestead-muted">Featured right now</p>
                  <LocalizedClientLink href="/store" onClick={() => close()} className="text-xs font-semibold text-homestead-olive hover:underline underline-offset-4">Shop all <span aria-hidden="true">→</span></LocalizedClientLink>
                </div>
                {products.length ? <div className="grid grid-cols-3 gap-5">
                  {products.map((product) => (
                    <LocalizedClientLink key={product.id} href={`/products/${product.handle}`} onClick={() => close()} className="group/product">
                      <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-homestead-linen">
                        {product.thumbnail ? <img src={product.thumbnail} alt="" className="h-full w-full object-cover transition duration-500 group-hover/product:scale-105" /> : <div className="flex h-full items-center justify-center font-heading text-2xl text-homestead-muted">{product.title.charAt(0)}</div>}
                        <span className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-homestead-cream text-homestead-forest opacity-0 shadow-sm transition group-hover/product:opacity-100" aria-hidden="true">→</span>
                      </div>
                      <div className="mt-3 flex items-start justify-between gap-3">
                        <p className="font-heading text-lg leading-tight text-homestead-forest">{product.title}</p>
                        {product.price && <span className="shrink-0 text-xs text-homestead-muted">{product.price}</span>}
                      </div>
                    </LocalizedClientLink>
                  ))}
                </div> : <LocalizedClientLink href="/store" onClick={() => close()} className="flex min-h-48 items-center justify-center rounded-sm bg-homestead-linen font-heading text-3xl text-homestead-forest">Find your next favorite <span className="ml-4" aria-hidden="true">→</span></LocalizedClientLink>}
              </div>
            </div>
            <div className="border-t border-homestead-border"><div className="content-container flex items-center justify-between py-4 text-sm"><span className="text-homestead-muted">Explore the shop</span><LocalizedClientLink href="/store" onClick={() => close()} className="font-medium hover:underline underline-offset-4">View all products <span aria-hidden="true">→</span></LocalizedClientLink></div></div>
          </PopoverPanel>
        </>
      )}
    </Popover>
  )
}
