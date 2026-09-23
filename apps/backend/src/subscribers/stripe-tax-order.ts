import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, MedusaError, Modules } from "@medusajs/framework/utils"
import { StripeTaxClient } from "../modules/stripe-tax/client"
import { toCents } from "../modules/stripe-tax/service"

type TaxLine = { data?: { stripe_calculation_id?: string } | null }
type Order = {
  id: string
  total: unknown
  metadata?: Record<string, unknown> | null
  shipping_address?: { country_code?: string | null } | null
  region?: { automatic_taxes?: boolean } | null
  items?: { tax_lines?: TaxLine[] }[]
  shipping_methods?: { tax_lines?: TaxLine[] }[]
}

async function getOrder(container: SubscriberArgs<{ id: string }>["container"], id: string): Promise<Order | undefined> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "order",
    fields: ["id", "total", "metadata", "shipping_address.country_code", "region.automatic_taxes", "items.id", "items.tax_lines.data", "shipping_methods.tax_lines.data"],
    filters: { id },
  })
  return data[0] as Order | undefined
}

export default async function stripeTaxOrder({ event: { name, data }, container }: SubscriberArgs<{ id: string }>) {
  if (process.env.STRIPE_TAX_ENABLED !== "true") return
  const order = await getOrder(container, data.id)
  if (!order) throw new MedusaError(MedusaError.Types.INVALID_DATA, `Stripe Tax cannot find order ${data.id}`)
  const client = new StripeTaxClient(process.env.STRIPE_API_KEY || "")
  const orderService = container.resolve(Modules.ORDER)

  if (name === "order.placed") {
    if (order.metadata?.stripe_tax_transaction_id) return
    const ids = new Set((order.items || []).flatMap(item => item.tax_lines || []).map(line => line.data?.stripe_calculation_id).filter(Boolean))
    if (!ids.size) {
      if (order.shipping_address?.country_code?.toLowerCase() === "us" && order.region?.automatic_taxes && order.items?.length) {
        throw new MedusaError(MedusaError.Types.INVALID_DATA, `Order ${order.id} has no Stripe Tax calculation`)
      }
      return
    }
    if (ids.size !== 1) throw new MedusaError(MedusaError.Types.INVALID_DATA, `Order ${order.id} has inconsistent Stripe Tax calculations`)
    const calculation = [...ids][0] as string
    const stripeCalculation = await client.get<{ amount_total: number }>(`calculations/${calculation}`)
    if (stripeCalculation.amount_total !== toCents(order.total)) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, `Order ${order.id} total does not match its Stripe Tax calculation`)
    }
    const transaction = await client.post<{ id: string }>(
      "transactions/create_from_calculation",
      new URLSearchParams({ calculation, reference: order.id }),
      `stripe-tax-order-${order.id}`
    )
    await orderService.updateOrders(order.id, { metadata: { ...order.metadata, stripe_tax_transaction_id: transaction.id } })
  }

  if (name === "order.canceled") {
    const transactionId = order.metadata?.stripe_tax_transaction_id
    if (typeof transactionId !== "string" || order.metadata?.stripe_tax_reversal_id) return
    const reversal = await client.post<{ id: string }>(
      "transactions/create_reversal",
      new URLSearchParams({ mode: "full", original_transaction: transactionId, reference: `${order.id}-canceled` }),
      `stripe-tax-cancel-${order.id}`
    )
    await orderService.updateOrders(order.id, { metadata: { ...order.metadata, stripe_tax_reversal_id: reversal.id } })
  }
}

export const config: SubscriberConfig = {
  event: ["order.placed", "order.canceled"],
  context: { subscriberId: "stripe-tax-orders" },
}
