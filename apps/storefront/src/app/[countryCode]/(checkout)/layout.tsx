import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"
import Brand from "@modules/layout/components/brand"
import { getStorefrontSettings } from "@lib/data/storefront-settings"

export default async function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getStorefrontSettings()
  return (
    <div className="min-h-screen bg-white font-nav text-homestead-ink">
      <header className="border-b border-homestead-border bg-white">
        <nav className="mx-auto flex h-20 w-full max-w-[1280px] items-center justify-between gap-4 px-5 small:px-10" aria-label="Checkout navigation">
          <LocalizedClientLink
            href="/cart"
            className="flex min-w-0 flex-1 basis-0 items-center gap-2 text-sm font-medium text-homestead-muted transition-colors hover:text-homestead-forest"
            data-testid="back-to-cart-link"
          >
            <ChevronDown className="rotate-90" size={16} />
            <span className="hidden small:block">
              Return to cart
            </span>
            <span className="small:hidden">
              Back
            </span>
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/"
            className="flex items-center justify-center"
            data-testid="store-link"
          >
            <Brand name={settings.brand_name} logo={settings.logo_url} />
          </LocalizedClientLink>
          <div className="flex-1 basis-0 text-right text-xs font-medium text-homestead-muted"><span className="hidden small:inline">Secure checkout</span></div>
        </nav>
      </header>
      <div data-testid="checkout-container">{children}</div>
      <footer className="mx-auto flex w-full max-w-[1280px] flex-wrap gap-x-6 gap-y-3 border-t border-homestead-border px-5 py-6 text-xs text-homestead-muted small:px-10">
        <span>© {new Date().getFullYear()} {settings.brand_name}</span>
        <LocalizedClientLink href="/privacy" className="hover:text-homestead-forest">Privacy</LocalizedClientLink>
        <LocalizedClientLink href="/terms" className="hover:text-homestead-forest">Terms</LocalizedClientLink>
        <LocalizedClientLink href="/contact" className="hover:text-homestead-forest">Contact</LocalizedClientLink>
      </footer>
    </div>
  )
}
