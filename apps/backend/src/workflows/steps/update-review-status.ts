import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PRODUCT_REVIEW_MODULE } from "../../modules/product-review"
import ProductReviewModuleService from "../../modules/product-review/service"

export type UpdateReviewStatusStepInput = {
  id: string
  status: "pending" | "approved" | "rejected"
}

export const updateReviewStatusStep = createStep(
  "update-review-status",
  async (input: UpdateReviewStatusStepInput, { container }) => {
    const service: ProductReviewModuleService = container.resolve(PRODUCT_REVIEW_MODULE)
    const previous = await service.retrieveReview(input.id)
    const review = await service.updateReviews(input)
    return new StepResponse(review, { id: previous.id, status: previous.status })
  },
  async (previous, { container }) => {
    if (!previous) return
    const service: ProductReviewModuleService = container.resolve(PRODUCT_REVIEW_MODULE)
    await service.updateReviews(previous)
  }
)

