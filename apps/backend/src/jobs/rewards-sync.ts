import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { REWARDS_MODULE } from "../modules/rewards"
import RewardsModuleService from "../modules/rewards/service"
import { manageRewardsWorkflow } from "../workflows/manage-rewards"

export default async function rewardsSync(container: MedusaContainer) {
  const service = container.resolve<RewardsModuleService>(REWARDS_MODULE)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  for (let skip = 0; ; skip += 100) {
    const members = await service.listRewardsMembers({}, { take: 100, skip, order: { created_at: "ASC" } })
    for (const member of members) {
      try { await manageRewardsWorkflow(container).run({ input: { customer_id: member.customer_id, action: "sync" } }) }
      catch (error) { logger.error(`Rewards sync failed for member ${member.id}: ${(error as Error).message}`) }
    }
    if (members.length < 100) break
  }
}
export const config = { name: "rewards-sync", schedule: "*/15 * * * *" }
