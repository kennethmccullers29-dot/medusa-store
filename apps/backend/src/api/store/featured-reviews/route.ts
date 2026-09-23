import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { getFeaturedReviewsWorkflow } from "../../../workflows/get-featured-reviews"

const schema = z.object({ ids: z.string().max(1000).optional(), offset: z.coerce.number().int().min(0).max(10000).default(0), limit: z.coerce.number().int().min(1).max(24).default(12) })
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const parsed = schema.safeParse(req.query)
  if (!parsed.success) { res.status(400).json({ message: "Invalid review query." }); return }
  const ids = parsed.data.ids?.split(",").filter(Boolean).slice(0, 6)
  const { result } = await getFeaturedReviewsWorkflow(req.scope).run({ input: { ids, offset: parsed.data.offset, limit: parsed.data.limit } })
  res.setHeader("Cache-Control", "no-store")
  res.json(result)
}
