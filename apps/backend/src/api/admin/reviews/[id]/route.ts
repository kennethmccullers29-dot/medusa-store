import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { updateReviewStatusWorkflow } from "../../../../workflows/update-review-status"

const UpdateReviewSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
}).strict()

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = UpdateReviewSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: "Choose pending, approved, or rejected." })
    return
  }
  const { result } = await updateReviewStatusWorkflow(req.scope).run({
    input: { id: req.params.id, status: parsed.data.status },
  })
  res.json({ review: result })
}

