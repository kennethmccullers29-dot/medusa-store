import assert from "node:assert/strict"
import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { PRODUCT_REVIEW_MODULE } from "../modules/product-review"
import type ProductReviewModuleService from "../modules/product-review/service"
import { getFeaturedReviewsWorkflow } from "../workflows/get-featured-reviews"

export default async function verifyFeaturedReviews({ container }: ExecArgs) {
  const service: ProductReviewModuleService = container.resolve(PRODUCT_REVIEW_MODULE)
  const { data: products } = await container.resolve(ContainerRegistrationKeys.QUERY).graph({ entity: "product", fields: ["id", "handle"], filters: { status: "published" }, pagination: { take: 1 } })
  assert.ok(products[0], "A published product is required for this check")
  const ids: string[] = []
  try {
    for (const status of ["approved", "pending", "rejected"] as const) {
      const review = await service.createReviews({ product_id: products[0].id, title: "Temporary section verification", content: "Temporary review created by the section verification script.", rating: 4, first_name: "Preview", last_name: "Tester", status })
      ids.push(review.id)
    }
    const { result } = await getFeaturedReviewsWorkflow(container).run({ input: { ids, offset: 0, limit: 6 } })
    assert.equal(result.count, 1)
    assert.equal(result.reviews.length, 1)
    assert.equal(result.reviews[0].id, ids[0])
    assert.equal(result.reviews[0].author, "Preview T.")
    assert.equal(result.reviews[0].product?.handle, products[0].handle)
    await service.updateReviews({ id: ids[0], status: "rejected" })
    const { result: removed } = await getFeaturedReviewsWorkflow(container).run({ input: { ids, offset: 0, limit: 6 } })
    assert.equal(removed.reviews.length, 0)
    console.log("PASS: approved reviews only, chosen IDs, public author initials, product links, approval revocation")
  } finally {
    if (ids.length) await service.deleteReviews(ids)
    console.log("Temporary verification reviews removed")
  }
}
