import { listCategories } from "@lib/data/categories"
import { getStorefrontSettings } from "@lib/data/storefront-settings"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { newsletterAvailable } from "@lib/data/newsletter"
import Newsletter from "@modules/layout/components/newsletter"

const information = [
  { label: "Rewards club", href: "/rewards" },
  { label: "Our journal", href: "/blog" },
  { label: "Contact us", href: "/contact" },
  { label: "Shipping & returns", href: "/shipping-returns" },
  { label: "Privacy policy", href: "/privacy" },
  { label: "Terms & conditions", href: "/terms" },
]

const customer = [
  { label: "My account", href: "/account" },
  { label: "Order history", href: "/account/orders" },
  { label: "My rewards", href: "/account/rewards" },
  { label: "Shopping bag", href: "/cart" },
]

export default async function Footer() {
  const [settings, categories, showNewsletter] = await Promise.all([
    getStorefrontSettings(),
    listCategories().catch(() => []),
    newsletterAvailable(),
  ])
  const topCategories = categories.filter((category) => !category.parent_category).slice(0, 6)

  return (
    <footer className="bg-homestead-forest text-white">
      <div className="border-b border-white/15">
        <div className="content-container grid gap-8 py-12 md:grid-cols-[1fr_auto] md:items-center md:py-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-homestead-linen">Stories from the shop</p>
            <h2 className="mt-3 max-w-2xl font-heading text-3xl leading-tight md:text-5xl">A little inspiration for slower, softer days.</h2>
          </div>
          <LocalizedClientLink href="/blog" className="inline-flex min-h-12 w-fit items-center justify-center gap-5 rounded-sm bg-homestead-cream px-7 py-3 text-sm font-semibold text-homestead-forest transition-colors hover:bg-homestead-linen">
            Visit the journal <span aria-hidden="true">→</span>
          </LocalizedClientLink>
        </div>
      </div>

      <div className="content-container grid gap-14 py-16 md:grid-cols-[1.5fr_2fr] md:py-20 lg:gap-24">
        <div className="max-w-sm">
          <LocalizedClientLink href="/" className="inline-flex">
            {settings.logo_url ? <img src={settings.logo_url} alt={settings.brand_name} className="h-11 w-auto max-w-64 object-contain" /> : <span className="max-w-sm font-heading text-3xl leading-tight text-homestead-cream md:text-4xl">{settings.brand_name}</span>}
          </LocalizedClientLink>
          <p className="mt-6 text-sm leading-7 text-white/65">Thoughtfully chosen pieces for everyday living, made to feel at home in the moments that matter.</p>
          <LocalizedClientLink href="/store" className="mt-7 inline-flex items-center gap-4 border-b border-white/35 pb-1 text-sm font-semibold text-white hover:border-white">
            Shop the collection <span aria-hidden="true">→</span>
          </LocalizedClientLink>
          {showNewsletter && <Newsletter />}
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-homestead-linen">Shop</h3>
            <ul className="mt-5 grid gap-3 text-sm text-white/65">
              {topCategories.map((category) => <li key={category.id}><LocalizedClientLink href={`/categories/${category.handle}`} className="transition-colors hover:text-white">{category.name}</LocalizedClientLink></li>)}
              <li><LocalizedClientLink href="/store" className="transition-colors hover:text-white">View all</LocalizedClientLink></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-homestead-linen">Explore</h3>
            <ul className="mt-5 grid gap-3 text-sm text-white/65">
              {information.map((item) => <li key={item.href}><LocalizedClientLink href={item.href} className="transition-colors hover:text-white">{item.label}</LocalizedClientLink></li>)}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-homestead-linen">Customer care</h3>
            <ul className="mt-5 grid gap-3 text-sm text-white/65">
              {customer.map((item) => <li key={item.href}><LocalizedClientLink href={item.href} className="transition-colors hover:text-white">{item.label}</LocalizedClientLink></li>)}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="content-container flex flex-col gap-3 py-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {settings.brand_name}. All rights reserved.</p>
          <p>Made for the simple things.</p>
        </div>
      </div>
    </footer>
  )
}
