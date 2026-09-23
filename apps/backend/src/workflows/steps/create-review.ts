import {
    createStep,
    StepResponse
} from "@medusajs/framework/workflows-sdk"
import { PRODUCT_REVIEW_MODULE } from "../../modules/product-review"
import ProductReviewModuleService from "../../modules/product-review/service"
import { MedusaError } from "@medusajs/framework/utils"

export type CreateReviewStepInput = {
    title?: string
    content: string
    rating:  number
    product_id: string
    customer_id?: string
    first_name: string
    last_name: string
    status?: "pending" | "approved" | "rejected"
}

export const createReviewStep = createStep(
    "create-review",
    async (input: CreateReviewStepInput, { container }) => {
        const reviewModuleService: ProductReviewModuleService = container.resolve(
            PRODUCT_REVIEW_MODULE
        )

        if (!input.customer_id) {
            throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Sign in to write a review.")
        }

        const existing = await reviewModuleService.listReviews({
            product_id: input.product_id,
            customer_id: input.customer_id,
        })
        if (existing.length) {
            throw new MedusaError(MedusaError.Types.DUPLICATE_ERROR, "You have already reviewed this product.")
        }

        const review = await reviewModuleService.createReviews(input)

        return new StepResponse(review, review.id)
    },
    async (reviewId, { container }) => {
        if (!reviewId) {
            return
        }

        const reviewModuleService: ProductReviewModuleService = container.resolve(
            PRODUCT_REVIEW_MODULE
        )

        await reviewModuleService.deleteReviews(reviewId)
    }
)
