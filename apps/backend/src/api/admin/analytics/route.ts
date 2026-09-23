import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { analyticsQuerySchema } from "../../../lib/analytics"
import { getAnalyticsWorkflow } from "../../../workflows/get-analytics"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const today = new Date().toISOString().slice(0, 10)
  const from = new Date(Date.parse(today) - 29 * 86400000).toISOString().slice(0, 10)
  const parsed = analyticsQuerySchema.safeParse({ from, to: today, currency: "usd", ...req.query })
  if (!parsed.success) { res.status(400).json({ message: parsed.error.issues.map(issue => issue.message).join(". ") }); return }
  const { result } = await getAnalyticsWorkflow(req.scope).run({ input: parsed.data })
  res.setHeader("Cache-Control", "no-store")
  res.json({ analytics: result })
}
