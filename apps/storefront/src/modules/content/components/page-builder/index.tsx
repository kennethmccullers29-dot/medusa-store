import { getRegion } from "@lib/data/regions"
import { getBlogPosts } from "@lib/data/site-content"
import { listProducts } from "@lib/data/products"
import type { HomepageSection } from "@lib/data/storefront-settings"
import type { CmsPage, CmsSection } from "../../../../sanity/data"
import type { HttpTypes } from "@medusajs/types"
import type { PortableTextBlock } from "@portabletext/types"
import HomepageContent from "@modules/home/components/homepage-content"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPreview from "@modules/products/components/product-preview"
import ContactForm from "../contact-form"
import RichText, { safeContentLink } from "../rich-text"
import { draftMode } from "next/headers"
import EditableSections from "./editable-sections"
import CustomerReviews from "../customer-reviews"

const buttonStyle = "mt-8 inline-flex min-h-12 items-center justify-center rounded-sm bg-homestead-cream px-8 py-3 text-sm font-medium text-homestead-forest transition hover:bg-homestead-linen"
function CmsButton({ section }: { section: CmsSection }) {
  if (!section.button_label || !safeContentLink(section.button_url)) return null
  return section.button_url.startsWith("/") ? <LocalizedClientLink className={buttonStyle} href={section.button_url}>{section.button_label} →</LocalizedClientLink> : <a className={buttonStyle} href={section.button_url}>{section.button_label} →</a>
}
async function Block({ section, countryCode, region }: { section: CmsSection; countryCode: string; region: HttpTypes.StoreRegion }) {
  if (section._type === "customer_reviews") return <CustomerReviews section={section} />
  if (section._type === "hero") return <section className="relative isolate flex min-h-[65vh] items-center justify-center overflow-hidden bg-homestead-forest px-6 py-24 text-center text-homestead-cream md:py-32">{section.image_url && <><img src={section.image_url} alt={section.image_alt || ""} fetchPriority="high" className="absolute inset-0 -z-20 h-full w-full object-cover" /><div className="absolute inset-0 -z-10 bg-homestead-forest/65" /></>}<div aria-hidden="true" className="pointer-events-none absolute inset-5 border border-homestead-cream/25" /><div className="max-w-3xl">{section.eyebrow && <p className="mb-6 text-xs uppercase tracking-[0.25em]">{section.eyebrow}</p>}<h1 className="font-heading text-5xl leading-tight md:text-7xl">{section.heading}{section.accent && <><br /><span className="italic">{section.accent}</span></>}</h1>{section.description && <p className="mx-auto mt-6 max-w-lg whitespace-pre-line leading-7">{section.description}</p>}<CmsButton section={section} /></div></section>
  if (section._type === "rich_text") return <section className="content-container max-w-3xl py-16 md:py-24">{section.heading && <h2 className="mb-8 font-heading text-4xl text-homestead-forest">{section.heading}</h2>}{Array.isArray(section.body) && <RichText value={section.body as PortableTextBlock[]} />}</section>
  if (section._type === "image_section") return section.image_url ? <figure className="content-container py-10"><img src={section.image_url} alt={section.image_alt || ""} className="max-h-[800px] w-full rounded-sm object-cover" />{section.caption && <figcaption className="mt-3 text-center text-sm text-homestead-muted">{section.caption}</figcaption>}</figure> : null
  if (section._type === "faq") return <section className="bg-homestead-linen/50 py-16"><div className="content-container max-w-3xl"><h2 className="mb-8 font-heading text-4xl text-homestead-forest">{section.heading}</h2>{section.items?.map(item => <details key={item._key} className="border-b border-homestead-border py-5"><summary className="cursor-pointer font-heading text-xl text-homestead-forest">{item.question}</summary><p className="mt-4 whitespace-pre-line leading-8 text-homestead-muted">{item.answer}</p></details>)}</div></section>
  if (section._type === "contact_form") return <section className="content-container max-w-3xl py-16">{section.heading && <h2 className="mb-8 font-heading text-4xl text-homestead-forest">{section.heading}</h2>}<ContactForm /></section>
  if (section._type === "latest_posts") {
    const posts = (await getBlogPosts()).slice(0, 3)
    return <section className="content-container py-16"><p className="text-xs uppercase tracking-widest text-homestead-olive">{section.eyebrow}</p><h2 className="mt-3 font-heading text-4xl text-homestead-forest">{section.heading || "From the journal"}</h2><div className="mt-8 grid gap-8 md:grid-cols-3">{posts.map(post => <LocalizedClientLink key={post.id} href={`/blog/${post.slug}`} className="group">{post.cover_image_url && <img src={post.cover_image_url} alt={post.image_alt || ""} className="aspect-[4/3] w-full rounded-sm object-cover" />}<h3 className="mt-4 font-heading text-2xl text-homestead-forest group-hover:underline">{post.title}</h3><p className="mt-3 leading-7 text-homestead-muted">{post.excerpt}</p></LocalizedClientLink>)}</div><LocalizedClientLink href="/blog" className="mt-6 inline-block text-sm text-homestead-olive underline">Visit the journal →</LocalizedClientLink></section>
  }
  if (section._type === "featured_products" && section.product_handles?.length) {
    const { response: { products } } = await listProducts({ countryCode, queryParams: { handle: section.product_handles, limit: 8, fields: "*variants.calculated_price,*images" } })
    const ordered = [...products].sort((a, b) => section.product_handles!.indexOf(a.handle || "") - section.product_handles!.indexOf(b.handle || ""))
    return <section className="content-container py-16"><div className="text-center"><p className="text-xs uppercase tracking-widest text-homestead-olive">{section.eyebrow}</p><h2 className="mt-3 font-heading text-4xl text-homestead-forest">{section.heading}</h2><p className="mx-auto mt-4 max-w-xl leading-7 text-homestead-muted">{section.description}</p></div><ul className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4">{ordered.map(product => <li key={product.id}><ProductPreview product={product} region={region} isFeatured /></li>)}</ul></section>
  }
  if (["intro", "categories", "featured_products", "story", "cta", "value_props"].includes(section._type)) {
    const buttonUrl = safeContentLink(section.button_url) ? section.button_url : ""
    const legacy = { ...section, type: section._type, enabled: true, eyebrow: section.eyebrow || "", heading: section.heading || "", accent: section.accent || "", body: typeof section.body === "string" ? section.body : "", description: section.description || "", button_label: section.button_label || "", button_url: buttonUrl, image_url: section.image_url || "", image_alt: section.image_alt || "", items: (section.items || []).map(item => ({ title: item.title || "", text: item.text || "" })) } as HomepageSection
    return <HomepageContent countryCode={countryCode} region={region} sections={[legacy]} />
  }
  return null
}
export default async function PageBuilder({ page, countryCode, region: suppliedRegion }: { page: CmsPage; countryCode: string; region?: HttpTypes.StoreRegion }) {
  const region = suppliedRegion || await getRegion(countryCode)
  if (!region) return null
  const preview = (await draftMode()).isEnabled
  const sections = (page.sections || []).filter(section => section.enabled !== false)
  return <main className="bg-homestead-cream">{page.slug !== "home" && !sections.some(section => section._type === "hero") && <header className="content-container py-16 text-center"><h1 className="font-heading text-5xl text-homestead-forest md:text-7xl">{page.title}</h1></header>}{preview ? <EditableSections documentId={page._id} sections={page.sections || []} blocks={(page.sections || []).map(section => ({ key: section._key, content: <Block section={section} countryCode={countryCode} region={region} /> }))} /> : sections.map(section => <Block key={section._key} section={section} countryCode={countryCode} region={region} />)}</main>
}
