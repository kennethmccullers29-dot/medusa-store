"use client"

import { submitReview, ReviewFormState } from "@lib/data/review-actions"
import { useActionState, useState } from "react"

const initialState: ReviewFormState = null

export default function ReviewForm({
  productId,
  path,
}: {
  productId: string
  path: string
}) {
  const [state, action, pending] = useActionState(submitReview, initialState)
  const [rating, setRating] = useState(5)
  if (state?.success) {
    return <div role="status" className="rounded-sm border border-homestead-border bg-white p-7 text-center text-homestead-forest">{state.message}</div>
  }
  return (
    <form action={action} className="grid gap-5 rounded-sm border border-homestead-border bg-white p-6 shadow-sm md:p-8">
      <input type="hidden" name="product_id" value={productId} />
      <input type="hidden" name="path" value={path} />
      <div className="text-center">
        <h3 className="font-heading text-3xl text-homestead-forest">Write a review</h3>
        <p className="mt-1 text-sm text-homestead-muted">Tell us what you think about this product.</p>
      </div>
      <fieldset className="grid gap-2">
        <legend className="text-center text-sm font-medium">Your rating</legend>
        <div className="flex justify-center gap-1" aria-label="Choose a rating">
          {[1, 2, 3, 4, 5].map((value) => (
            <label key={value} className="cursor-pointer">
              <input className="peer sr-only" type="radio" name="rating" value={value} checked={rating === value} onChange={() => setRating(value)} required />
              <span className={`block text-3xl transition-transform hover:scale-110 ${value <= rating ? "text-homestead-olive" : "text-homestead-border"}`} aria-hidden="true">★</span>
              <span className="sr-only">{value} star{value === 1 ? "" : "s"}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-2"><label htmlFor="review-title" className="text-sm font-medium">Review title <span className="font-normal text-homestead-muted">(optional)</span></label><input id="review-title" name="title" maxLength={120} className="h-12 rounded-sm border border-homestead-border bg-homestead-cream/40 px-4 outline-none focus:border-homestead-olive" placeholder="Give your review a title" /></div>
      <div className="grid gap-2"><label htmlFor="review-content" className="text-sm font-medium">Your review</label><textarea id="review-content" name="content" required minLength={10} maxLength={2000} rows={5} className="rounded-sm border border-homestead-border bg-homestead-cream/40 px-4 py-3 outline-none focus:border-homestead-olive" placeholder="What did you like about this product?" /></div>
      {state && <p role="alert" className="text-sm text-red-700">{state.message}</p>}
      <button disabled={pending} className="min-h-12 rounded-sm bg-homestead-olive px-6 py-3 text-sm font-semibold text-white hover:bg-homestead-forest disabled:opacity-60">{pending ? "Submitting…" : "Submit review"}</button>
      <p className="text-center text-xs leading-5 text-homestead-muted">Reviews are checked before they appear publicly.</p>
    </form>
  )
}
