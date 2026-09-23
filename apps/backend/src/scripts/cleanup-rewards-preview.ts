import assert from "node:assert/strict"
import type { ExecArgs, IAuthModuleService, ICustomerModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { REWARDS_MODULE } from "../modules/rewards"
import RewardsModuleService from "../modules/rewards/service"

export default async function cleanupRewardsPreview({ container }: ExecArgs) {
  const customerId = process.env.REWARDS_PREVIEW_CUSTOMER_ID
  const identityId = process.env.REWARDS_PREVIEW_IDENTITY_ID
  assert(customerId && identityId, "Supply the disposable preview customer and identity IDs")
  const customers = container.resolve<ICustomerModuleService>(Modules.CUSTOMER)
  const auth = container.resolve<IAuthModuleService>(Modules.AUTH)
  const customer = await customers.retrieveCustomer(customerId)
  assert(/^rewards-ui-\d+@example\.invalid$/.test(customer.email), "Only disposable rewards preview customers may be removed")
  const identity = await auth.retrieveAuthIdentity(identityId, { relations: ["provider_identities"] })
  assert(identity.provider_identities?.some(provider => provider.entity_id === customer.email), "Identity must belong to the preview customer")
  const service = container.resolve<RewardsModuleService>(REWARDS_MODULE)
  const rewards = await service.summary(customerId)
  assert.equal(rewards.redemptions.length, 0, "Remove preview promotions before cleaning up a redeemed account")
  await service.deleteRewardsActivities(rewards.activity.map(activity => activity.id))
  if (rewards.member) await service.deleteRewardsMembers(rewards.member.id)
  await customers.deleteCustomers(customerId)
  await auth.deleteAuthIdentities([identityId])
  console.log("Disposable rewards preview customer, points, and login removed.")
}
