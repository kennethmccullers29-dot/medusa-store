import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { aggregateAnalytics, analyticsRange, AnalyticsInput, AnalyticsOrder } from "../lib/analytics"

const analyticsStep = createStep("analytics", async (input: AnalyticsInput, { container }) => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const range = analyticsRange(input)
  const orders: AnalyticsOrder[] = []
  for (let skip = 0; ; skip += 250) {
    const { data } = await query.graph({ entity: "order", fields: ["id", "display_id", "created_at", "status", "currency_code", "customer_id", "total", "items.product_id", "items.product_title", "items.title", "items.quantity", "items.total", "payment_collections.payments.captures.amount", "payment_collections.payments.refunds.amount"], filters: { created_at: { $gte: new Date(range.previousStart), $lt: new Date(range.end) } }, pagination: { take: 250, skip, order: { created_at: "ASC", id: "ASC" } } })
    orders.push(...data as unknown as AnalyticsOrder[])
    if (data.length < 250) break
  }
  const customerIds = [...new Set(orders.filter(order => order.currency_code === input.currency && !["canceled", "draft"].includes(order.status) && new Date(order.created_at).getTime() >= range.start).map(order => order.customer_id).filter((id): id is string => !!id))]
  const previousCustomers = new Set<string>()
  for (let offset = 0; offset < customerIds.length; offset += 100) {
    for (let skip = 0; ; skip += 250) {
      const { data } = await query.graph({ entity: "order", fields: ["customer_id", "status"], filters: { customer_id: customerIds.slice(offset, offset + 100), created_at: { $lt: new Date(range.start) } }, pagination: { take: 250, skip } })
      data.forEach(order => { if (order.customer_id && !["canceled", "draft"].includes(order.status)) previousCustomers.add(order.customer_id) })
      if (data.length < 250) break
    }
  }
  const { data: regions } = await query.graph({ entity: "region", fields: ["currency_code"] })
  const currencies = [...new Set([input.currency, ...regions.map(region => region.currency_code), ...orders.map(order => order.currency_code)])].sort()
  return new StepResponse({ ...aggregateAnalytics(orders, input, previousCustomers), currencies, generated_at: new Date().toISOString() })
})
export const getAnalyticsWorkflow = createWorkflow("get-analytics", (input: AnalyticsInput) => new WorkflowResponse(analyticsStep(input)))
