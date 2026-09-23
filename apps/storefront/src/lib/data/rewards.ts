"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"
import { FetchError } from "@medusajs/js-sdk"

export type RewardsSettings = { name: string; enabled: boolean; signup_points: number; points_per_unit: number; birthday_points: number; redemption_points: number; discount_percent: number }
export type RewardsSummary = {
  settings: RewardsSettings
  member: { id: string; created_at: string; birthday_month: number | null; birthday_day: number | null } | null
  balance: number
  available_points: number
  lifetime_points: number
  activity: { id: string; points: number; note: string; kind: string; created_at: string }[]
  redemptions: { id: string; request_id: string; code: string; points: number; discount_percent: number; currency_code: string; status: "pending" | "ready"; used?: boolean; available?: boolean; created_at: string }[]
}

export async function getRewardsSettings() {
  return sdk.client.fetch<{ settings: RewardsSettings }>("/store/rewards", { cache: "no-store" }).then(result => result.settings)
}
export async function getRewards(): Promise<RewardsSummary | null> {
  const headers = await getAuthHeaders()
  if (!("authorization" in headers)) return null
  try {
    const { rewards } = await sdk.client.fetch<{ rewards: RewardsSummary }>("/store/rewards/me", { headers, cache: "no-store" })
    return rewards
  } catch (error) {
    if (error instanceof FetchError && error.status === 401) return null
    throw error
  }
}
export async function updateRewards(body: { action: "join" } | { action: "birthday"; birthday: { month: number; day: number } } | { action: "redeem"; redemption: { request_id: string; currency_code: string } }) {
  try {
    const { rewards } = await sdk.client.fetch<{ rewards: RewardsSummary }>("/store/rewards/me", { method: "POST", headers: await getAuthHeaders(), body, cache: "no-store" })
    return { rewards, error: null }
  } catch (error) {
    return { rewards: null, error: (error as Error).message || "We could not update your rewards. Please try again." }
  }
}
