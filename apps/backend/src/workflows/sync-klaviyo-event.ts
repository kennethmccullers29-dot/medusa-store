import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { eventPayload, klaviyoReady, klaviyoRequest } from "../lib/klaviyo"

type Input = { id: string; event: "order.placed" | "order.canceled" | "customer.created" }
const sendKlaviyoEvent = createStep("send-klaviyo-event", async (input: Input, { container }) => {
  if (!klaviyoReady()) return new StepResponse({ sent: false })
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  if (input.event === "customer.created") {
    const { data: customers } = await query.graph({ entity: "customer", fields: ["id", "email", "first_name", "last_name", "created_at"], filters: { id: input.id } })
    const customer = customers[0]
    if (!customer?.email) return new StepResponse({ sent: false })
    await klaviyoRequest("events/", eventPayload({ name: "Created Account", uniqueId: `account:${customer.id}`, email: customer.email, firstName: customer.first_name || undefined, lastName: customer.last_name || undefined, time: new Date(customer.created_at).toISOString(), properties: { CustomerID: customer.id } }))
  } else {
    const { data: orders } = await query.graph({ entity: "order", fields: ["id", "display_id", "email", "currency_code", "total", "created_at", "canceled_at", "items.id", "items.title", "items.product_id", "items.quantity", "items.unit_price", "items.total", "items.variant_sku"], filters: { id: input.id } })
    const order = orders[0]
    if (!order?.email) return new StepResponse({ sent: false })
    const items = (order.items || []).filter(item => !!item).map(item => ({ LineID: item.id, ProductID: item.product_id, ProductName: item.title, SKU: item.variant_sku, Quantity: Number(item.quantity), ItemPrice: Number(item.unit_price), RowTotal: Number(item.total) }))
    const base = { email: order.email, currency: order.currency_code, properties: { OrderID: order.id, OrderNumber: order.display_id, ItemNames: items.map(item => item.ProductName), Items: items } }
    await klaviyoRequest("events/", eventPayload({ ...base, name: input.event === "order.placed" ? "Placed Order" : "Cancelled Order", uniqueId: `${input.event}:${order.id}`, time: new Date(input.event === "order.canceled" && order.canceled_at ? order.canceled_at : order.created_at).toISOString(), value: Number(order.total) }))
    if (input.event === "order.placed") {
      for (const item of items) await klaviyoRequest("events/", eventPayload({ ...base, name: "Ordered Product", uniqueId: `ordered-product:${order.id}:${item.LineID}`, time: new Date(order.created_at).toISOString(), value: item.RowTotal, properties: { OrderID: order.id, ...item } }))
    }
  }
  return new StepResponse({ sent: true })
})
export const syncKlaviyoEventWorkflow = createWorkflow("sync-klaviyo-event", (input: Input) => new WorkflowResponse(sendKlaviyoEvent(input)))
