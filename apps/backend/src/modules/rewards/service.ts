import { MedusaService } from "@medusajs/framework/utils"
import RewardsMember from "./models/member"
import RewardsActivity from "./models/activity"
import RewardsRedemption from "./models/redemption"
import RewardsConfig from "./models/config"

export const DEFAULT_REWARDS = {
  name: "The Everyday Club", enabled: true, signup_points: 100,
  points_per_unit: 1, birthday_points: 200, redemption_points: 500, discount_percent: 10,
}

export default class RewardsModuleService extends MedusaService({ RewardsMember, RewardsActivity, RewardsRedemption, RewardsConfig }) {
  async settings() {
    const [config] = await this.listRewardsConfigs({ id: "rewards_settings" })
    return config || DEFAULT_REWARDS
  }

  async activities(customerId: string) {
    const result: Awaited<ReturnType<typeof this.listRewardsActivities>> = []
    for (let skip = 0; ; skip += 500) {
      const page = await this.listRewardsActivities({ customer_id: customerId }, { take: 500, skip, order: { created_at: "DESC" } })
      result.push(...page)
      if (page.length < 500) return result
    }
  }

  async summary(customerId: string) {
    const [member] = await this.listRewardsMembers({ customer_id: customerId })
    const activities = member ? await this.activities(customerId) : []
    const balance = activities.reduce((sum, activity) => sum + activity.points, 0)
    const redemptions = member ? await this.listRewardsRedemptions({ customer_id: customerId }, { take: 100, order: { created_at: "DESC" } }) : []
    return { member: member || null, balance, available_points: Math.max(0, balance), lifetime_points: activities.filter(activity => activity.points > 0).reduce((sum, activity) => sum + activity.points, 0), activity: activities.slice(0, 50), redemptions, settings: await this.settings() }
  }
}
