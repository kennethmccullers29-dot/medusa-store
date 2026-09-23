import { getProductReviews } from "@lib/data/reviews"
import { retrieveCustomer } from "@lib/data/customer"
import ReviewsPanel from "../reviews-panel"

export default async function ProductReviews({
  productId,
  productHandle,
  countryCode,
}: {
  productId: string
  productHandle: string
  countryCode: string
}) {
  const [data, customer] = await Promise.all([
    getProductReviews(productId),
    retrieveCustomer(),
  ])

  return (
    <ReviewsPanel
      reviews={data.reviews}
      averageRating={data.average_rating}
      productId={productId}
      reviewPath={`/${countryCode}/products/${productHandle}`}
      canReview={Boolean(customer)}
    />
  )
}
