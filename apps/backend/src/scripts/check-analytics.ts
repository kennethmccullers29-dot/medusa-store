import assert from "node:assert/strict"
import type { ExecArgs } from "@medusajs/framework/types"
import { getAnalyticsWorkflow } from "../workflows/get-analytics"

export default async function checkAnalytics({ container }: ExecArgs) {
  const to = new Date().toISOString().slice(0, 10)
  const from = new Date(Date.parse(to) - 29 * 86400000).toISOString().slice(0, 10)
  const { result } = await getAnalyticsWorkflow(container).run({ input: { from, to, currency: "usd" } })
  assert.equal(result.trend.length, 30)
  assert.equal(result.trend.reduce((sum, day) => sum + day.orders, 0), result.current.orders)
  assert(Math.abs(result.trend.reduce((sum, day) => sum + day.sales, 0) - result.current.sales) < 0.05)
  assert(result.currencies.includes("usd"))
  assert(Number.isFinite(result.current.aov))
  console.log(`Analytics read check passed: ${result.current.orders} USD orders, 30 daily buckets, reconciled totals. No data was changed.`)
}
