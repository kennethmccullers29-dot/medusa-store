import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { REWARDS_MODULE } from "../../../modules/rewards"
import RewardsModuleService from "../../../modules/rewards/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  res.json({ settings: await req.scope.resolve<RewardsModuleService>(REWARDS_MODULE).settings() })
}
