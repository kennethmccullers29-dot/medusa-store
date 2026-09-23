import { z } from "@medusajs/framework/zod"

const DAY = 86400000
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => { const parsed = new Date(value); return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value }, "Choose a valid date")
export const analyticsQuerySchema = z.object({ from: date, to: date, currency: z.string().regex(/^[a-zA-Z]{3}$/).transform(value => value.toLowerCase()) }).refine(value => {
  const days = (Date.parse(value.to) - Date.parse(value.from)) / DAY + 1
  return days > 0 && days <= 366
}, "Choose an ordered date range of at most 366 days")

export type AnalyticsOrder = {
  id: string; display_id: number; created_at: string | Date; status: string; currency_code: string; customer_id: string | null; total: number
  items?: { product_id: string | null; product_title?: string | null; title: string; quantity: number; total: number }[]
  payment_collections?: { payments?: { captures?: { amount: number }[]; refunds?: { amount: number }[] }[] }[]
}
export type AnalyticsInput = z.infer<typeof analyticsQuerySchema>
export function analyticsRange(input: AnalyticsInput) {
  const start = Date.parse(input.from)
  const end = Date.parse(input.to) + DAY
  return { start, end, previousStart: start - (end - start), days: (end - start) / DAY }
}
const amount = (value: unknown) => Number.isFinite(Number(value)) ? Number(value) : 0
const round = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100
export function aggregateAnalytics(orders: AnalyticsOrder[], input: AnalyticsInput, previousCustomers = new Set<string>()) {
  const range = analyticsRange(input)
  const eligible = orders.filter(order => !["canceled", "draft"].includes(order.status) && order.currency_code === input.currency)
  const previous = eligible.filter(order => new Date(order.created_at).getTime() >= range.previousStart && new Date(order.created_at).getTime() < range.start)
  const current = eligible.filter(order => new Date(order.created_at).getTime() >= range.start && new Date(order.created_at).getTime() < range.end)
  const money = (order: AnalyticsOrder) => {
    const payments = (order.payment_collections || []).flatMap(collection => collection.payments || [])
    const refunded = payments.flatMap(payment => payment.refunds || []).reduce((sum, refund) => sum + amount(refund.amount), 0)
    const captured = payments.flatMap(payment => payment.captures || []).reduce((sum, capture) => sum + amount(capture.amount), 0)
    return { sales: Math.max(0, amount(order.total) - refunded), collected: captured - refunded, refunds: refunded }
  }
  const metrics = (list: AnalyticsOrder[]) => {
    const sums = list.reduce((sum, order) => { const values = money(order); return { sales: sum.sales + values.sales, collected: sum.collected + values.collected, refunds: sum.refunds + values.refunds, units: sum.units + (order.items || []).reduce((total, item) => total + amount(item.quantity), 0) } }, { sales: 0, collected: 0, refunds: 0, units: 0 })
    return { orders: list.length, sales: round(sums.sales), collected: round(sums.collected), refunds: round(sums.refunds), units: sums.units, aov: list.length ? round(sums.sales / list.length) : 0 }
  }
  const buckets = Array.from({ length: range.days }, (_, index) => ({ date: new Date(range.start + index * DAY).toISOString().slice(0, 10), sales: 0, previous_sales: 0, orders: 0 }))
  current.forEach(order => { const bucket = buckets[Math.floor((new Date(order.created_at).getTime() - range.start) / DAY)]; bucket.sales += money(order).sales; bucket.orders++ })
  previous.forEach(order => { buckets[Math.floor((new Date(order.created_at).getTime() - range.previousStart) / DAY)].previous_sales += money(order).sales })
  const products = new Map<string, { id: string; title: string; units: number; sales: number }>()
  for (const order of current) for (const item of order.items || []) {
    const key = item.product_id || `deleted:${item.product_title || item.title}`
    const product = products.get(key) || { id: key, title: item.product_title || item.title, units: 0, sales: 0 }
    product.units += amount(item.quantity)
    product.sales += amount(item.total)
    products.set(key, product)
  }
  const customerOrders = new Map<string, number>()
  current.forEach(order => { if (order.customer_id) customerOrders.set(order.customer_id, (customerOrders.get(order.customer_id) || 0) + 1) })
  const returning = [...customerOrders.keys()].filter(id => previousCustomers.has(id)).length
  const statuses = new Map<string, number>()
  current.forEach(order => statuses.set(order.status, (statuses.get(order.status) || 0) + 1))
  return {
    currency: input.currency, from: input.from, to: input.to,
    previous_from: new Date(range.previousStart).toISOString().slice(0, 10), previous_to: new Date(range.start - DAY).toISOString().slice(0, 10),
    current: metrics(current), previous: metrics(previous),
    customers: { total: customerOrders.size, returning, new: customerOrders.size - returning, returning_rate: customerOrders.size ? round(returning / customerOrders.size * 100) : 0 },
    trend: buckets.map(bucket => ({ ...bucket, sales: round(bucket.sales), previous_sales: round(bucket.previous_sales) })),
    top_products: [...products.values()].map(product => ({ ...product, sales: round(product.sales) })).sort((a, b) => b.sales - a.sales || b.units - a.units).slice(0, 8),
    statuses: [...statuses].map(([status, count]) => ({ status, count })),
    recent_orders: [...current].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 8).map(order => ({ id: order.id, display_id: order.display_id, status: order.status, created_at: order.created_at, total: round(amount(order.total)) })),
  }
}
