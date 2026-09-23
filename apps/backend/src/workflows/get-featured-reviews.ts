import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { PRODUCT_REVIEW_MODULE } from "../modules/product-review"
import type ProductReviewModuleService from "../modules/product-review/service"

type Input = { ids?: string[]; offset: number; limit: number }
const loadFeaturedReviews = createStep("load-featured-reviews", async (input: Input, { container }) => {
  const service: ProductReviewModuleService = container.resolve(PRODUCT_REVIEW_MODULE)
  const [reviews, count] = await service.listAndCountReviews({ status: "approved", ...(input.ids?.length ? { id: input.ids } : {}) }, { take: input.limit, skip: input.offset, order: { created_at: "DESC" } })
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const products = reviews.length ? (await query.graph({ entity: "product", fields: ["id", "title", "handle", "thumbnail"], filters: { id: reviews.map(review => review.product_id), status: "published" } })).data : []
  return new StepResponse({ reviews: reviews.map(review => ({ id: review.id, title: review.title, content: review.content, rating: review.rating, author: [review.first_name, review.last_name?.trim() ? `${review.last_name.trim()[0]}.` : ""].filter(Boolean).join(" "), product: products.find(product => product.id === review.product_id) || null })), count })
})
export const getFeaturedReviewsWorkflow = createWorkflow("get-featured-reviews", (input: Input) => new WorkflowResponse(loadFeaturedReviews(input)))
