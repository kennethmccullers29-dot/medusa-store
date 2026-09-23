import { getFeaturedReviews } from "@lib/data/featured-reviews"
import type { CmsSection } from "../../../../sanity/data"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { draftMode } from "next/headers"

export default async function CustomerReviews({ section }: { section: CmsSection }) {
  const preview = (await draftMode()).isEnabled
  let reviews
  try {
    const data = await getFeaturedReviews(section.review_ids)
    reviews = section.review_ids?.length ? section.review_ids.flatMap(id => data.reviews.filter(review => review.id === id)) : data.reviews.slice(0, 3)
  } catch { return preview ? <p className="content-container py-12 text-homestead-muted">Customer reviews could not load. Check the Medusa backend.</p> : null }
  if (!reviews.length && !preview) return null
  return <section className="bg-homestead-linen/40 py-16 md:py-24"><div className="content-container"><div className="mx-auto max-w-2xl text-center">{section.eyebrow && <p className="text-xs uppercase tracking-[0.2em] text-homestead-olive">{section.eyebrow}</p>}<h2 className="mt-3 font-heading text-4xl text-homestead-forest md:text-5xl">{section.heading || "Kind words from our customers"}</h2>{section.description && <p className="mt-5 leading-7 text-homestead-muted">{section.description}</p>}</div>{!reviews.length ? <p className="mt-10 text-center text-sm text-homestead-muted">No approved reviews selected yet. Approve reviews in Medusa, then select them in this section.</p> : <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{reviews.map(review => <li key={review.id} className="flex flex-col rounded-sm border border-homestead-border bg-homestead-cream p-7"><span role="img" aria-label={`${review.rating} out of 5 stars`} className="text-lg tracking-[3px] text-homestead-olive">{"★".repeat(Math.round(review.rating))}{"☆".repeat(5 - Math.round(review.rating))}</span>{review.title && <h3 className="mt-5 font-heading text-2xl text-homestead-forest">{review.title}</h3>}<blockquote className="mt-4 flex-1 whitespace-pre-line break-words text-sm leading-7 text-homestead-ink">{review.content}</blockquote><p className="mt-6 font-nav text-sm font-medium text-homestead-forest">{review.author}</p>{review.product?.handle && <LocalizedClientLink href={`/products/${review.product.handle}`} className="mt-5 flex items-center gap-3 border-t border-homestead-border pt-5 text-sm text-homestead-muted hover:text-homestead-olive"><span>{review.product.title}</span><span aria-hidden="true">→</span></LocalizedClientLink>}</li>)}</ul>}</div></section>
}
