import { Suspense } from "react"

import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import CartIcon from "@modules/layout/components/cart-icon"
import User from "@modules/common/icons/user"
import ProductSearch from "@modules/layout/components/product-search"
import NavigationLinks from "@modules/layout/components/navigation-links"
import { getStorefrontSettings } from "@lib/data/storefront-settings"
import Brand from "@modules/layout/components/brand"
import MegaMenu from "@modules/layout/components/mega-menu"
import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import { listProducts } from "@lib/data/products"
import { getProductPrice } from "@lib/util/get-product-price"

export default async function Nav({ countryCode }: { countryCode: string }) {
  const settings = await getStorefrontSettings()
  const [regions, locales, currentLocale, categoryData, collectionData, region] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
    listCategories({ fields: "id,name,handle,parent_category_id,*category_children" }).catch(() => []),
    listCollections({ fields: "id,title,handle" }).catch(() => ({ collections: [], count: 0 })),
    getRegion(countryCode),
  ])
  const productData = region
    ? await listProducts({
        regionId: region.id,
        queryParams: { limit: 3, fields: "id,title,handle,thumbnail,*variants.calculated_price" },
      }).catch(() => ({ response: { products: [], count: 0 }, nextPage: null }))
    : { response: { products: [], count: 0 }, nextPage: null }
  const categories = categoryData.filter((category) => !category.parent_category_id).map((category) => ({
    id: category.id, name: category.name, handle: category.handle,
    children: (category.category_children ?? []).map((child) => ({ id: child.id, name: child.name, handle: child.handle })),
  }))
  const collections = collectionData.collections.map(({ id, title, handle }) => ({ id, title, handle }))
  const products = productData.response.products.map((product) => ({
    id: product.id,
    title: product.title,
    handle: product.handle,
    thumbnail: product.thumbnail,
    price: getProductPrice({ product }).cheapestPrice?.calculated_price,
  }))

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative min-h-16 mx-auto border-b duration-200 bg-homestead-cream border-ui-border-base">
        <nav className="content-container txt-xsmall-plus text-ui-fg-subtle flex min-h-16 items-center justify-between gap-4 w-full text-small-regular">
          <div className="flex-1 basis-0 min-w-0 self-stretch flex items-center">
            <div className="h-16 xl:hidden">
              <SideMenu regions={regions} locales={locales} currentLocale={currentLocale} categories={categories} collections={collections} brandName={settings.brand_name} links={settings.navigation_links} />
            </div>
            <ul className="hidden xl:flex flex-wrap w-full items-center gap-x-5 py-1 font-nav text-[18px] leading-6 font-medium tracking-[0.015em] text-homestead-forest">
              <li><LocalizedClientLink href="/" className="block py-2 transition-colors hover:text-homestead-olive focus-visible:outline-offset-4">Home</LocalizedClientLink></li>
              <li className="h-full"><MegaMenu categories={categories} collections={collections} products={products} /></li>
              <NavigationLinks links={settings.navigation_links} />
            </ul>
          </div>

          <div className="flex items-center h-full">
            <LocalizedClientLink
              href="/"
              className="text-base xsmall:txt-compact-xlarge-plus hover:text-ui-fg-base"
              data-testid="nav-store-link"
            >
              <Brand name={settings.brand_name} logo={settings.logo_url} />
            </LocalizedClientLink>
          </div>

          <div className="flex items-center gap-x-1 xsmall:gap-x-3 h-full flex-1 basis-0 justify-end text-homestead-ink">
            <ProductSearch countryCode={countryCode} />
            <div className="flex items-center h-full">
              <LocalizedClientLink
                className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-homestead-linen focus-visible:outline-offset-2"
                href="/account"
                data-testid="nav-account-link"
                aria-label="Account"
                title="Account"
              >
                <User size="22" aria-hidden="true" />
              </LocalizedClientLink>
            </div>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="flex items-center rounded-full hover:bg-homestead-linen focus-visible:outline-offset-2"
                  href="/cart"
                  data-testid="nav-cart-link"
                  aria-label="Cart, 0 items"
                >
                  <CartIcon count={0} />
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
