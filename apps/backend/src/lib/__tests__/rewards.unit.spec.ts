import { birthdayDue, birthdaySchema, earnedOrderPoints } from "../rewards"

describe("rewards eligibility", () => {
  it("requires full capture and excludes canceled orders", () => {
    expect(earnedOrderPoints(50, 60, 59, 0, 1, false)).toBe(0)
    expect(earnedOrderPoints(50, 60, 60, 0, 1, true)).toBe(0)
    expect(earnedOrderPoints(50.9, 60, 60, 0, 1, false)).toBe(50)
  })
  it("reverses points proportionally for partial refunds and fully for full refunds", () => {
    expect(earnedOrderPoints(50, 60, 60, 30, 1, false)).toBe(25)
    expect(earnedOrderPoints(50, 60, 60, 60, 1, false)).toBe(0)
  })
  it("accepts leap-day birthdays and rejects invalid dates", () => {
    expect(birthdaySchema.safeParse({ month: 2, day: 29 }).success).toBe(true)
    expect(birthdaySchema.safeParse({ month: 2, day: 30 }).success).toBe(false)
    expect(birthdaySchema.safeParse({ month: 4, day: 31 }).success).toBe(false)
  })
  it("requires 30 days notice and limits eligibility to birthday week", () => {
    const member = { birthday_month: 9, birthday_day: 18, birthday_registered_at: "2026-08-01T00:00:00Z" }
    expect(birthdayDue(member, new Date("2026-09-18T12:00:00Z"))).toBe(true)
    expect(birthdayDue(member, new Date("2026-09-25T00:00:00Z"))).toBe(false)
    expect(birthdayDue({ ...member, birthday_registered_at: "2026-09-01T00:00:00Z" }, new Date("2026-09-18T12:00:00Z"))).toBe(false)
  })
  it("celebrates leap-day birthdays on February 28 in non-leap years", () => {
    const member = { birthday_month: 2, birthday_day: 29, birthday_registered_at: "2024-01-01T00:00:00Z" }
    expect(birthdayDue(member, new Date("2025-02-28T12:00:00Z"))).toBe(true)
    expect(birthdayDue(member, new Date("2024-02-28T12:00:00Z"))).toBe(false)
    expect(birthdayDue(member, new Date("2024-02-29T12:00:00Z"))).toBe(true)
  })
})
