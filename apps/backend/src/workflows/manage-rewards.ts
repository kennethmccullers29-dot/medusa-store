import { randomUUID } from "crypto"
import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, MedusaError, Modules } from "@medusajs/framework/utils"
import type { MedusaContainer, ILockingModule, IPromotionModuleService } from "@medusajs/framework/types"
import { REWARDS_MODULE } from "../modules/rewards"
import RewardsModuleService from "../modules/rewards/service"
import { birthdayDue, earnedOrderPoints } from "../lib/rewards"

type Input = { customer_id: string; action: "join" | "birthday" | "redeem" | "sync"; month?: number; day?: number; request_id?: string; currency_code?: string }
type Order = { id: string; status: string; created_at: string; item_total: number; item_tax_total: number; total: number; payment_collections?: { payments?: { captures?: { amount: number }[]; refunds?: { amount: number }[] }[] }[] }

async function syncOrders(container: MedusaContainer, service: RewardsModuleService, member: Awaited<ReturnType<RewardsModuleService["listRewardsMembers"]>>[number]) {
  const settings = await service.settings()
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const activity = await service.activities(member.customer_id)
  for (let skip = 0; ; skip += 100) {
    const { data } = await query.graph({ entity: "order", fields: ["id", "status", "created_at", "item_total", "item_tax_total", "total", "payment_collections.payments.captures.amount", "payment_collections.payments.refunds.amount"], filters: { customer_id: member.customer_id, created_at: { $gte: member.created_at } }, pagination: { take: 100, skip } })
    for (const order of data as unknown as Order[]) {
      const entries = activity.filter(entry => entry.order_id === order.id)
      const original = entries.find(entry => entry.kind === "purchase")
      if (!settings.enabled && !original) continue
      const rate = original?.earning_rate ?? settings.points_per_unit
      const payments = (order.payment_collections || []).flatMap(collection => collection.payments || [])
      const captured = payments.flatMap(payment => payment.captures || []).reduce((sum, capture) => sum + Number(capture.amount), 0)
      const refunded = payments.flatMap(payment => payment.refunds || []).reduce((sum, refund) => sum + Number(refund.amount), 0)
      const target = earnedOrderPoints(Number(order.item_total) - Number(order.item_tax_total || 0), Number(order.total), captured, refunded, rate, order.status === "canceled")
      const current = entries.reduce((sum, entry) => sum + entry.points, 0)
      if (target === current) continue
      const delta = target - current
      await service.createRewardsActivities({ customer_id: member.customer_id, source_key: `order:${order.id}:${entries.length}:${target}`, points: delta, kind: delta > 0 ? "purchase" : "refund", note: delta > 0 ? "Points for a paid purchase" : "Points adjusted for a refund or cancellation", order_id: order.id, earning_rate: rate })
    }
    if (data.length < 100) break
  }
}

const manageRewardsStep = createStep("manage-rewards", async (input: Input, { container }) => {
  const locking = container.resolve<ILockingModule>(Modules.LOCKING)
  const service = container.resolve<RewardsModuleService>(REWARDS_MODULE)
  const result = await locking.execute(`rewards:${input.customer_id}`, async () => {
    const settings = await service.settings()
    let [member] = await service.listRewardsMembers({ customer_id: input.customer_id })
    if (input.action === "join") {
      if (!settings.enabled) throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "The rewards program is currently paused")
      const customer = await container.resolve(Modules.CUSTOMER).retrieveCustomer(input.customer_id)
      if (!customer.has_account) throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Create a customer account to join rewards")
      if (!member) member = await service.createRewardsMembers({ customer_id: input.customer_id, signup_points: settings.signup_points })
      const existing = await service.listRewardsActivities({ source_key: `signup:${input.customer_id}` })
      if (!existing.length) await service.createRewardsActivities({ customer_id: input.customer_id, source_key: `signup:${input.customer_id}`, points: member.signup_points, kind: "signup", note: "Welcome to the club" })
    }
    if (!member) {
      if (input.action === "sync") return service.summary(input.customer_id)
      throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Join the rewards program first")
    }
    if (input.action === "birthday") {
      if (member.birthday_month) throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Your birthday is already saved. Contact us if it needs a correction")
      member = await service.updateRewardsMembers({ id: member.id, birthday_month: input.month, birthday_day: input.day, birthday_registered_at: new Date() })
    }
    if (settings.enabled && birthdayDue(member)) {
      const source = `birthday:${input.customer_id}:${new Date().getUTCFullYear()}`
      const existing = await service.listRewardsActivities({ source_key: source })
      if (!existing.length && settings.birthday_points > 0) await service.createRewardsActivities({ customer_id: input.customer_id, source_key: source, points: settings.birthday_points, kind: "birthday", note: "Happy birthday! A little gift from us" })
    }
    await syncOrders(container, service, member)
    if (input.action === "redeem") {
      const requestId = `${input.customer_id}:${input.request_id}`
      let [redemption] = await service.listRewardsRedemptions({ request_id: requestId })
      if (!redemption) {
        if (!settings.enabled) throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "The rewards program is currently paused")
        const { available_points } = await service.summary(input.customer_id)
        if (available_points < settings.redemption_points) throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "You do not have enough points for this reward")
        redemption = await service.createRewardsRedemptions({ customer_id: input.customer_id, request_id: requestId, code: `CLUB-${randomUUID().replace(/-/g, "").toUpperCase()}`, points: settings.redemption_points, discount_percent: settings.discount_percent, currency_code: input.currency_code! })
      }
      if (redemption.status === "pending") {
        const source = `redemption:${redemption.id}`
        const [debit] = await service.listRewardsActivities({ source_key: source })
        if (!debit) {
          const { available_points } = await service.summary(input.customer_id)
          if (available_points < redemption.points) throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "You do not have enough points for this reward")
          await service.createRewardsActivities({ customer_id: input.customer_id, source_key: source, points: -redemption.points, kind: "redemption", note: `${redemption.discount_percent}% discount reward` })
        }
        const promotion = container.resolve<IPromotionModuleService>(Modules.PROMOTION)
        let [coupon] = await promotion.listPromotions({ code: redemption.code })
        if (!coupon) coupon = await promotion.createPromotions({ code: redemption.code, type: "standard", status: "active", application_method: { type: "percentage", target_type: "order", allocation: "across", value: redemption.discount_percent, currency_code: redemption.currency_code }, rules: [{ attribute: "customer_id", operator: "eq", values: [input.customer_id] }], campaign: { name: redemption.code, campaign_identifier: redemption.code, budget: { type: "usage", limit: 1 } } })
        await service.updateRewardsRedemptions({ id: redemption.id, status: "ready", promotion_id: coupon.id })
      }
    }
    const summary = await service.summary(input.customer_id)
    const ids = summary.redemptions.map(reward => reward.promotion_id).filter((id): id is string => !!id)
    const coupons = ids.length ? await container.resolve<IPromotionModuleService>(Modules.PROMOTION).listPromotions({ id: ids }, { relations: ["campaign.budget"] }) : []
    return { ...summary, redemptions: summary.redemptions.map(reward => {
      const coupon = coupons.find(value => value.id === reward.promotion_id)
      return { ...reward, used: Number(coupon?.campaign?.budget?.used || 0) >= 1, available: reward.status === "pending" || !!coupon && coupon.status === "active" }
    }) }
  }, { timeout: 30, expire: 120 })
  return new StepResponse(result)
})

export const manageRewardsWorkflow = createWorkflow("manage-rewards", (input: Input) => new WorkflowResponse(manageRewardsStep(input)))
