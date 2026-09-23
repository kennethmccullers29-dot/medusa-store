"use client"

import type { ProductReview } from "@lib/data/reviews"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useMemo, useState } from "react"
import ReviewForm from "../review-form"

const Stars = ({ rating, large = false }: { rating: number; large?: boolean }) => (
  <span
    className={`inline-flex gap-0.5 ${large ? "text-xl" : "text-base"}`}
    aria-label={`${rating.toFixed(1)} out of 5 stars`}
  >
    <span aria-hidden="true" className="text-homestead-olive">{"★".repeat(Math.round(rating))}</span>
    <span aria-hidden="true" className="text-homestead-border">{"★".repeat(5 - Math.round(rating))}</span>
  </span>
)

const reviewerName = (review: ProductReview) =>
  `${review.first_name} ${review.last_name ? `${review.last_name.charAt(0)}.` : ""}`.trim()

export default function ReviewsPanel({
  reviews,
  averageRating,
  productId,
  reviewPath,
  canReview,
}: {
  reviews: ProductReview[]
  averageRating: number
  productId: string
  reviewPath: string
  canReview: boolean
}) {
  const [sort, setSort] = useState("newest")
  const [showForm, setShowForm] = useState(false)
  const distribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((review) => review.rating === rating).length,
  }))
  const sortedReviews = useMemo(() => {
    const next = [...reviews]
    if (sort === "highest") return next.sort((a, b) => b.rating - a.rating)
    if (sort === "lowest") return next.sort((a, b) => a.rating - b.rating)
    return next.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }, [reviews, sort])

  return (
    <section aria-labelledby="reviews-heading" className="border-y border-homestead-border bg-homestead-cream">
      <div className="content-container py-14 md:py-20">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-homestead-olive">Tried &amp; loved</p>
          <h2 id="reviews-heading" className="mt-2 font-heading text-4xl text-homestead-forest md:text-5xl">Customer Reviews</h2>
        </div>

        <div className="mt-10 grid overflow-hidden rounded-sm border border-homestead-border bg-white md:grid-cols-[1fr_1.25fr_1fr]">
          <div className="flex flex-col items-center justify-center px-8 py-9 text-center">
            <strong className="font-heading text-5xl font-normal leading-none text-homestead-forest">
              {reviews.length ? averageRating.toFixed(1) : "0.0"}
            </strong>
            <div className="mt-3"><Stars rating={averageRating} large /></div>
            <p className="mt-2 text-sm text-homestead-muted">Based on {reviews.length} review{reviews.length === 1 ? "" : "s"}</p>
          </div>

          <div className="border-y border-homestead-border px-8 py-7 md:border-x md:border-y-0">
            <div className="grid gap-2.5">
              {distribution.map(({ rating, count }) => (
                <div key={rating} className="grid grid-cols-[38px_1fr_24px] items-center gap-3 text-xs text-homestead-muted">
                  <span>{rating} ★</span>
                  <div className="h-2 overflow-hidden rounded-full bg-homestead-linen">
                    <div className="h-full rounded-full bg-homestead-olive" style={{ width: reviews.length ? `${(count / reviews.length) * 100}%` : "0%" }} />
                  </div>
                  <span className="text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center px-8 py-9 text-center">
            <p className="text-sm leading-6 text-homestead-muted">Share your thoughts with our community.</p>
            {canReview ? (
              <button type="button" onClick={() => setShowForm((open) => !open)} aria-expanded={showForm} className="mt-4 min-h-11 w-full max-w-52 rounded-sm bg-homestead-olive px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-homestead-forest">
                {showForm ? "Close form" : "Write a review"}
              </button>
            ) : (
              <LocalizedClientLink href="/account" className="mt-4 inline-flex min-h-11 w-full max-w-52 items-center justify-center rounded-sm bg-homestead-olive px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-homestead-forest">
                Sign in to review
              </LocalizedClientLink>
            )}
          </div>
        </div>

        {showForm && canReview && <div className="mx-auto mt-8 max-w-2xl"><ReviewForm productId={productId} path={reviewPath} /></div>}

        <div className="mt-12 flex items-center justify-between border-b border-homestead-border pb-4">
          <p className="text-sm font-semibold text-homestead-ink">{reviews.length} review{reviews.length === 1 ? "" : "s"}</p>
          {reviews.length > 1 && (
            <label className="flex items-center gap-3 text-sm text-homestead-muted">
              <span>Sort by</span>
              <select value={sort} onChange={(event) => setSort(event.target.value)} className="h-10 rounded-sm border border-homestead-border bg-white px-3 text-sm text-homestead-ink outline-none focus:border-homestead-olive">
                <option value="newest">Newest</option>
                <option value="highest">Highest rating</option>
                <option value="lowest">Lowest rating</option>
              </select>
            </label>
          )}
        </div>

        {!sortedReviews.length ? (
          <div className="py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-homestead-linen text-xl text-homestead-olive">★</div>
            <h3 className="mt-5 font-heading text-2xl text-homestead-forest">No reviews yet</h3>
            <p className="mt-2 text-sm text-homestead-muted">Be the first to share your experience.</p>
          </div>
        ) : (
          <div className="divide-y divide-homestead-border">
            {sortedReviews.map((review) => (
              <article key={review.id} className="grid gap-5 py-8 md:grid-cols-[190px_1fr] md:py-10">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-homestead-linen font-semibold uppercase text-homestead-forest">{review.first_name.charAt(0)}{review.last_name.charAt(0)}</span>
                  <div>
                    <p className="text-sm font-semibold text-homestead-ink">{reviewerName(review)}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-homestead-olive">
                      <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-homestead-olive text-[9px] text-white" aria-hidden="true">✓</span>
                      Verified buyer
                    </p>
                  </div>
                </div>
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Stars rating={review.rating} />
                    <time className="text-xs text-homestead-muted" dateTime={review.created_at}>{new Date(review.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</time>
                  </div>
                  {review.title && <h3 className="mt-3 font-heading text-2xl text-homestead-ink">{review.title}</h3>}
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-homestead-ink">{review.content}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
