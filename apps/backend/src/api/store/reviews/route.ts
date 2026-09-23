import type {
  AuthenticatedMedusaRequest,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { createReviewWorkflow } from "../../../workflows/create-review"
import { PRODUCT_REVIEW_MODULE } from "../../../modules/product-review"
import ProductReviewModuleService from "../../../modules/product-review/service"
import { Modules } from "@medusajs/framework/utils"

import { z } from "@medusajs/framework/zod"

export const PostStoreReviewSchema = z.object({
  title: z.string().trim().max(120).optional(),
  content: z.string().trim().min(10).max(2000),
  rating: z.preprocess(
    (val) => {
      if (val && typeof val === "string") {
        return parseInt(val)
      }
      return val
    },
    z.number().int().min(1).max(5)
  ),
  product_id: z.string().trim().min(1),
})

export const GetStoreReviewsSchema = z.object({
  product_id: z.string().trim().min(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const parsed = GetStoreReviewsSchema.safeParse(req.query)
  if (!parsed.success) {
    res.status(400).json({ message: "A valid product_id is required." })
    return
  }
  const service: ProductReviewModuleService = req.scope.resolve(PRODUCT_REVIEW_MODULE)
  const [reviews, count] = await service.listAndCountReviews(
    { product_id: parsed.data.product_id, status: "approved" },
    { order: { created_at: "DESC" }, skip: parsed.data.offset, take: parsed.data.limit }
  )
  const allApproved = await service.listReviews({
    product_id: parsed.data.product_id,
    status: "approved",
  })
  const average_rating = allApproved.length
    ? allApproved.reduce((sum, review) => sum + review.rating, 0) / allApproved.length
    : 0
  res.setHeader("Cache-Control", "no-store")
  res.json({ reviews, count, average_rating, limit: parsed.data.limit, offset: parsed.data.offset })
}

type PostStoreReviewReq = z.infer<typeof PostStoreReviewSchema>

export const POST = async (
  req: AuthenticatedMedusaRequest<PostStoreReviewReq>,
  res: MedusaResponse
) => {
  const input = req.validatedBody
  const customerId = req.auth_context?.actor_id
  const customerService = req.scope.resolve(Modules.CUSTOMER)
  const customer = await customerService.retrieveCustomer(customerId!)

  const { result } = await createReviewWorkflow(req.scope)
    .run({
      input: {
        ...input,
        customer_id: customerId,
        first_name: customer.first_name || "Customer",
        last_name: customer.last_name || "",
      },
    })

  res.json(result)
}
