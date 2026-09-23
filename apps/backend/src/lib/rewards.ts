import { z } from "@medusajs/framework/zod"

export const rewardsSettingsSchema = z.object({
  name: z.string().trim().min(1).max(80), enabled: z.boolean(),
  signup_points: z.number().int().min(0).max(100000),
  points_per_unit: z.number().int().min(0).max(100),
  birthday_points: z.number().int().min(0).max(100000),
  redemption_points: z.number().int().min(1).max(1000000),
  discount_percent: z.number().int().min(1).max(100),
})
export const birthdaySchema = z.object({ month: z.number().int().min(1).max(12), day: z.number().int().min(1).max(31) }).refine(({ month, day }) => new Date(Date.UTC(2000, month - 1, day)).getUTCMonth() === month - 1, "Choose a valid birthday")
export const redeemSchema = z.object({ request_id: z.string().uuid(), currency_code: z.string().regex(/^[a-zA-Z]{3}$/).transform(value => value.toLowerCase()) })

export function birthdayDue(member: { birthday_month: number | null; birthday_day: number | null; birthday_registered_at: Date | string | null }, now = new Date()) {
  if (!member.birthday_month || !member.birthday_day || !member.birthday_registered_at) return false
  const year = now.getUTCFullYear()
  const leap = new Date(Date.UTC(year, 1, 29)).getUTCMonth() === 1
  const day = member.birthday_month === 2 && member.birthday_day === 29 && !leap ? 28 : member.birthday_day
  const birthday = new Date(Date.UTC(year, member.birthday_month - 1, day))
  return now.getTime() >= birthday.getTime() && now.getTime() < birthday.getTime() + 7 * 86400000 && new Date(member.birthday_registered_at).getTime() <= birthday.getTime() - 30 * 86400000
}

export function earnedOrderPoints(subtotal: number, total: number, captured: number, refunded: number, rate: number, canceled: boolean) {
  if (canceled || !Number.isFinite(total) || total <= 0 || captured + 0.00001 < total) return 0
  const retained = Math.max(0, Math.min(1, (total - Math.max(0, refunded)) / total))
  return Math.floor(Math.max(0, subtotal) * Math.max(0, rate) * retained)
}
