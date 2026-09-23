import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import { ExecArgs } from "@medusajs/framework/types"
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { PRODUCT_REVIEW_MODULE } from "../modules/product-review"
import ProductReviewModuleService from "../modules/product-review/service"
import { createReviewWorkflow } from "../workflows/create-review"
import { updateReviewStatusWorkflow } from "../workflows/update-review-status"
import { GET as getStoreReviews } from "../api/store/reviews/route"

export default async function verifyProductReviews({ container }: ExecArgs) {
  const [product] = await container.resolve(Modules.PRODUCT).listProducts({}, { take: 1 })
  assert.ok(product, "A product is required to verify reviews")
  const customerId = `review_test_${randomUUID()}`
  const service: ProductReviewModuleService = container.resolve(PRODUCT_REVIEW_MODULE)
  let reviewId = ""
  const read = async () => {
    const output = { status: 200, body: {} as any }
    const response = {
      status(code: number) { output.status = code; return this },
      json(body: unknown) { output.body = body; return this },
      setHeader() { return this },
    }
    await getStoreReviews(
      { scope: container, query: { product_id: product.id, limit: "100", offset: "0" } } as unknown as MedusaRequest,
      response as unknown as MedusaResponse
    )
    return output
  }
  try {
    const { result } = await createReviewWorkflow(container).run({ input: {
      product_id: product.id,
      customer_id: customerId,
      first_name: "Review",
      last_name: "Tester",
      title: "A thoughtful review",
      content: "This is a useful review submitted during verification.",
      rating: 5,
    } })
    reviewId = result.review.id
    assert.equal(result.review.status, "pending")
    assert.ok(!(await read()).body.reviews.some((review: { id: string }) => review.id === reviewId))
    let duplicateBlocked = false
    try {
      await createReviewWorkflow(container).run({ input: {
        product_id: product.id, customer_id: customerId, first_name: "Review",
        last_name: "Tester", content: "A second review should not be allowed.", rating: 4,
      } })
    } catch { duplicateBlocked = true }
    assert.ok(duplicateBlocked)
    await updateReviewStatusWorkflow(container).run({ input: { id: reviewId, status: "approved" } })
    const published = await read()
    assert.ok(published.body.reviews.some((review: { id: string }) => review.id === reviewId))
    assert.equal(published.body.average_rating, 5)
    await updateReviewStatusWorkflow(container).run({ input: { id: reviewId, status: "rejected" } })
    assert.ok(!(await read()).body.reviews.some((review: { id: string }) => review.id === reviewId))
    console.log(`PASS: pending moderation, duplicate prevention, publishing, rating summary, and rejection for ${product.handle}`)
  } finally {
    if (reviewId) await service.deleteReviews(reviewId)
    console.log("Test review removed")
  }
}

