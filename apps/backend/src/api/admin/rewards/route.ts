import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { REWARDS_MODULE } from "../../../modules/rewards"
import RewardsModuleService from "../../../modules/rewards/service"
import { rewardsSettingsSchema } from "../../../lib/rewards"
import { saveRewardsSettingsWorkflow } from "../../../workflows/save-rewards-settings"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<RewardsModuleService>(REWARDS_MODULE)
  const [members, count] = await service.listAndCountRewardsMembers({}, { take: 50, order: { created_at: "DESC" } })
  const summaries = await Promise.all(members.map(async member => { const summary = await service.summary(member.customer_id); return { ...member, balance: summary.balance, lifetime_points: summary.lifetime_points } }))
  res.json({ settings: await service.settings(), members: summaries, count })
}
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = rewardsSettingsSchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ message: parsed.error.issues.map(issue => issue.message).join(". ") }); return }
  const { result } = await saveRewardsSettingsWorkflow(req.scope).run({ input: parsed.data })
  res.json({ settings: result })
}
