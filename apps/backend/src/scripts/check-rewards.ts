import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import type { ExecArgs, ICustomerModuleService, IPromotionModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { REWARDS_MODULE } from "../modules/rewards"
import RewardsModuleService from "../modules/rewards/service"
import { manageRewardsWorkflow } from "../workflows/manage-rewards"

// Uses disposable local fixtures and removes them in finally. No payments are made.
export default async function checkRewards({ container }: ExecArgs) {
  const service = container.resolve<RewardsModuleService>(REWARDS_MODULE)
  const customers = container.resolve<ICustomerModuleService>(Modules.CUSTOMER)
  const promotions = container.resolve<IPromotionModuleService>(Modules.PROMOTION)
  const settings = await service.settings()
  assert(settings.enabled, "Enable the rewards program before running this check")
  const customer = await customers.createCustomers({ email: `rewards-check-${randomUUID()}@example.invalid`, has_account: true, first_name: "Rewards", last_name: "Test" })
  const run = async (input: { action: "join" | "birthday" | "redeem" | "sync"; month?: number; day?: number; request_id?: string; currency_code?: string }) => (await manageRewardsWorkflow(container).run({ input: { ...input, customer_id: customer.id } })).result
  try {
    const first = await run({ action: "join" })
    const second = await run({ action: "join" })
    assert.equal(first.available_points, settings.signup_points)
    assert.equal(second.available_points, first.available_points)
    assert.equal(second.activity.filter(activity => activity.kind === "signup").length, 1)
    const now = new Date()
    await run({ action: "birthday", month: now.getUTCMonth() + 1, day: now.getUTCDate() })
    await service.updateRewardsMembers({ id: first.member!.id, birthday_registered_at: new Date(now.getTime() - 40 * 86400000) })
    const birthday = await run({ action: "sync" })
    const repeat = await run({ action: "sync" })
    assert.equal(birthday.available_points, settings.signup_points + settings.birthday_points)
    assert.equal(repeat.available_points, birthday.available_points)
    if (birthday.available_points < settings.redemption_points) {
      await assert.rejects(run({ action: "redeem", request_id: randomUUID(), currency_code: "usd" }))
    }
    await service.createRewardsActivities({ customer_id: customer.id, source_key: `test:${customer.id}`, points: settings.redemption_points, kind: "purchase", note: "Disposable rewards verification fixture" })
    const before = await service.summary(customer.id)
    const requestId = randomUUID()
    const redeemed = await run({ action: "redeem", request_id: requestId, currency_code: "usd" })
    const retry = await run({ action: "redeem", request_id: requestId, currency_code: "usd" })
    assert.equal(redeemed.available_points, before.available_points - settings.redemption_points)
    assert.equal(retry.available_points, redeemed.available_points)
    assert.equal(retry.redemptions.length, 1)
    assert.equal(retry.redemptions[0].status, "ready")
    const reward = retry.redemptions[0]
    const context = { currency_code: "usd", customer_id: customer.id, customer: { id: customer.id }, items: [{ id: "test-item", quantity: 1, subtotal: 100, total: 100, original_total: 100, unit_price: 100, is_discountable: true }], shipping_methods: [] }
    const actions = await promotions.computeActions([reward.code], context)
    assert(actions.some(action => action.action === "addItemAdjustment"), "Reward must discount an eligible cart")
    const other = await promotions.computeActions([reward.code], { ...context, customer_id: "other-customer", customer: { id: "other-customer" } })
    assert(!other.some(action => action.action === "addItemAdjustment"), "Reward must be restricted to its owner")
    const foreignCurrency = await promotions.computeActions([reward.code], { ...context, currency_code: "eur" })
    assert(!foreignCurrency.some(action => action.action === "addItemAdjustment"), "Reward must be restricted to its currency")
    await promotions.registerUsage([{ code: reward.code, amount: 10 }], { customer_id: customer.id, customer_email: customer.email! })
    const used = await promotions.computeActions([reward.code], context)
    assert(!used.some(action => action.action === "addItemAdjustment"), "Reward must be single use")
    const afterUse = await run({ action: "sync" })
    assert("used" in afterUse.redemptions[0] && afterUse.redemptions[0].used === true, "Customer dashboard must identify used rewards")
    console.log("Rewards checks passed: joining, birthday, insufficient balance, redemption retries, customer/currency restrictions, and single-use discount.")
  } finally {
    const redemptions = await service.listRewardsRedemptions({ customer_id: customer.id })
    for (const redemption of redemptions) {
      if (!redemption.promotion_id) continue
      const promotion = await promotions.retrievePromotion(redemption.promotion_id, { relations: ["campaign"] })
      await promotions.deletePromotions(redemption.promotion_id)
      if (promotion.campaign?.id) await promotions.deleteCampaigns(promotion.campaign.id)
    }
    await service.deleteRewardsRedemptions(redemptions.map(value => value.id))
    const activities = await service.activities(customer.id)
    await service.deleteRewardsActivities(activities.map(value => value.id))
    const members = await service.listRewardsMembers({ customer_id: customer.id })
    await service.deleteRewardsMembers(members.map(value => value.id))
    await customers.deleteCustomers(customer.id)
    console.log("Disposable rewards fixtures removed.")
  }
}

