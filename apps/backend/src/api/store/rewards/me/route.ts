import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { birthdaySchema, redeemSchema } from "../../../../lib/rewards"
import { manageRewardsWorkflow } from "../../../../workflows/manage-rewards"

const schema = z.discriminatedUnion("action", [z.object({ action: z.literal("join") }), z.object({ action: z.literal("birthday"), birthday: birthdaySchema }), z.object({ action: z.literal("redeem"), redemption: redeemSchema })])

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { result } = await manageRewardsWorkflow(req.scope).run({ input: { customer_id: req.auth_context.actor_id, action: "sync" } })
  res.json({ rewards: result })
}
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ message: parsed.error.issues.map(issue => issue.message).join(". ") }); return }
  const data = parsed.data
  const { result } = await manageRewardsWorkflow(req.scope).run({ input: { customer_id: req.auth_context.actor_id, action: data.action, ...(data.action === "birthday" ? data.birthday : {}), ...(data.action === "redeem" ? data.redemption : {}) } })
  res.json({ rewards: result })
}
