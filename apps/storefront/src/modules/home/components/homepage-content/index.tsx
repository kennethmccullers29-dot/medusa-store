import { listCategories } from "@lib/data/categories"
import { listProducts } from "@lib/data/products"
import type { HomepageSection } from "@lib/data/storefront-settings"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPreview from "@modules/products/components/product-preview"

const ButtonLink = ({ href, children, className }: { href: string; children: React.ReactNode; className: string }) =>
  href.startsWith("/") ? <LocalizedClientLink href={href} className={className}>{children}</LocalizedClientLink> : <a href={href} className={className}>{children}</a>

export default async function HomepageContent({ countryCode, region, sections }: {
  countryCode: string
  region: HttpTypes.StoreRegion
  sections: HomepageSection[]
}) {
  const [categories, productResult] = await Promise.all([
    listCategories({ limit: 12 }),
    listProducts({ countryCode, queryParams: { limit: 8, fields: "*variants.calculated_price,*images" } }),
  ])
  const products = productResult.response.products
  const featuredProducts = products.slice(0, 4)
  const topCategories = categories.filter((category) => !category.parent_category).slice(0, 4)
  const fallbackStoryImage = products[1]?.thumbnail || products[1]?.images?.[0]?.url || products[0]?.thumbnail

  return <>{sections.filter((section) => section.enabled).map((section) => {
    if (section.type === "value_props") return (
      <section key={section.type} aria-label="Our values" className="border-b border-homestead-border bg-homestead-forest text-white">
        <div className={`content-container grid ${section.items.length === 3 ? "md:grid-cols-3" : section.items.length === 2 ? "md:grid-cols-2" : "md:grid-cols-1"}`}>
          {section.items.map((item, index) => <div key={`${item.title}-${index}`} className={`px-5 py-6 text-center md:py-8 ${index > 0 ? "border-t border-white/15 md:border-l md:border-t-0" : ""}`}><p className="text-xs font-semibold uppercase tracking-[0.2em] text-homestead-linen">{item.title}</p><p className="mt-2 text-sm text-white/70">{item.text}</p></div>)}
        </div>
      </section>
    )
    if (section.type === "intro") return (
      <section key={section.type} className="bg-homestead-cream py-20 md:py-28"><div className="content-container grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-homestead-olive">{section.eyebrow}</p><h2 className="mt-4 max-w-xl font-heading text-4xl leading-tight text-homestead-forest md:text-6xl">{section.heading}</h2></div><div className="max-w-2xl lg:justify-self-end"><p className="whitespace-pre-line text-lg leading-8 text-homestead-muted">{section.body}</p>{section.button_label && section.button_url && <ButtonLink href={section.button_url} className="mt-7 inline-flex items-center gap-4 border-b border-homestead-olive pb-1 text-sm font-semibold text-homestead-olive">{section.button_label} <span aria-hidden="true">→</span></ButtonLink>}</div></div></section>
    )
    if (section.type === "categories") return topCategories.length ? (
      <section key={section.type} className="border-y border-homestead-border bg-homestead-linen/45 py-16 md:py-24"><div className="content-container"><div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-homestead-olive">{section.eyebrow}</p><h2 className="mt-3 font-heading text-4xl text-homestead-forest md:text-5xl">{section.heading}</h2></div><LocalizedClientLink href="/store" className="text-sm font-semibold text-homestead-olive underline decoration-homestead-border underline-offset-4">View everything</LocalizedClientLink></div><div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">{topCategories.map((category, index) => { const item = category.products?.[0]; const image = item?.thumbnail || item?.images?.[0]?.url; return <LocalizedClientLink key={category.id} href={`/categories/${category.handle}`} className="group relative isolate min-h-[300px] overflow-hidden rounded-sm bg-homestead-forest sm:min-h-[440px]">{image ? <img src={image} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover transition duration-700 group-hover:scale-105" /> : <div className={`absolute inset-0 -z-20 ${index % 2 ? "bg-homestead-olive" : "bg-homestead-forest"}`} />}<div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-black/5 to-transparent" /><div className="flex h-full min-h-[300px] flex-col justify-end p-5 text-white sm:min-h-[440px] sm:p-7"><span className="text-xs uppercase tracking-[0.2em] text-white/70">Explore</span><h3 className="mt-2 font-heading text-3xl sm:text-4xl">{category.name}</h3><span className="mt-4 inline-flex items-center gap-3 text-sm font-medium opacity-80 transition group-hover:gap-5 group-hover:opacity-100">Shop now <span aria-hidden="true">→</span></span></div></LocalizedClientLink> })}</div></div></section>
    ) : null
    if (section.type === "featured_products") return featuredProducts.length ? (
      <section key={section.type} className="bg-homestead-cream py-16 md:py-24"><div className="content-container"><div className="text-center"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-homestead-olive">{section.eyebrow}</p><h2 className="mt-3 font-heading text-4xl text-homestead-forest md:text-5xl">{section.heading}</h2><p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-homestead-muted">{section.description}</p></div><ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4 lg:gap-x-6">{featuredProducts.map((product) => <li key={product.id}><ProductPreview product={product} region={region} isFeatured /></li>)}</ul></div></section>
    ) : null
    if (section.type === "story") { const image = section.image_url || fallbackStoryImage; return (
      <section key={section.type} className="border-y border-homestead-border bg-homestead-linen/60"><div className="grid min-h-[560px] lg:grid-cols-2"><div className="relative min-h-[420px] overflow-hidden bg-homestead-linen lg:min-h-full">{image ? <img src={image} alt={section.image_alt} className="absolute inset-0 h-full w-full object-cover" /> : <div className="absolute inset-0 bg-homestead-olive" />}<div aria-hidden="true" className="absolute inset-5 border border-white/30" /></div><div className="flex items-center px-7 py-16 sm:px-14 lg:px-20"><div className="max-w-xl"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-homestead-olive">{section.eyebrow}</p><h2 className="mt-4 font-heading text-4xl leading-tight text-homestead-forest md:text-6xl">{section.heading}{section.accent && <><br /><span className="italic">{section.accent}</span></>}</h2><p className="mt-7 whitespace-pre-line text-base leading-8 text-homestead-muted">{section.body}</p>{section.button_label && section.button_url && <ButtonLink href={section.button_url} className="mt-9 inline-flex min-h-12 items-center justify-center gap-5 rounded-sm bg-homestead-olive px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-homestead-forest">{section.button_label} <span aria-hidden="true">→</span></ButtonLink>}</div></div></div></section>
    ) }
    if (section.type === "cta") return (
      <section key={section.type} className="relative overflow-hidden bg-homestead-forest px-6 py-20 text-center text-white md:py-28"><div aria-hidden="true" className="absolute -left-20 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full border border-white/10" /><div aria-hidden="true" className="absolute -right-16 top-1/2 h-52 w-52 -translate-y-1/2 rounded-full border border-white/10" /><div className="relative mx-auto max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-homestead-linen">{section.eyebrow}</p><h2 className="mt-4 font-heading text-4xl leading-tight md:text-6xl">{section.heading}</h2>{section.button_label && section.button_url && <ButtonLink href={section.button_url} className="mt-8 inline-flex min-h-12 items-center justify-center rounded-sm bg-homestead-cream px-8 py-3 text-sm font-semibold text-homestead-forest hover:bg-homestead-linen">{section.button_label}</ButtonLink>}</div></section>
    )
    return null
  })}</>
}
