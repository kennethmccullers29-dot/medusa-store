import { aggregateAnalytics, analyticsQuerySchema, analyticsRange, AnalyticsOrder } from "../analytics"

const input = { from: "2026-09-01", to: "2026-09-02", currency: "usd" }
const order = (patch: Partial<AnalyticsOrder> = {}): AnalyticsOrder => ({ id: "order-1", display_id: 1, status: "pending", currency_code: "usd", created_at: "2026-09-01T12:00:00Z", customer_id: "customer-1", total: 100, items: [{ product_id: "product-1", product_title: "Lavender soap", title: "Small", quantity: 2, total: 80 }], ...patch })
describe("store analytics", () => {
  it("keeps currencies separate and excludes drafts/cancellations", () => {
    const result = aggregateAnalytics([order(), order({ currency_code: "eur" }), order({ status: "canceled" }), order({ status: "draft" })], input)
    expect(result.current.orders).toBe(1)
    expect(result.current.sales).toBe(100)
    expect(result.current.units).toBe(2)
  })
  it("separates unpaid order sales from captures and refunds", () => {
    const result = aggregateAnalytics([order({ payment_collections: [{ payments: [{ captures: [{ amount: 60 }, { amount: 40 }], refunds: [{ amount: 25 }] }] }] }), order({ id: "unpaid", total: 50 })], input)
    expect(result.current.sales).toBe(125)
    expect(result.current.collected).toBe(75)
    expect(result.current.refunds).toBe(25)
    expect(result.current.aov).toBe(62.5)
  })
  it("uses inclusive UTC calendar dates and a matching previous period", () => {
    const result = aggregateAnalytics([order({ created_at: "2026-08-30T00:00:00Z", total: 30 }), order({ created_at: "2026-08-31T23:59:59Z", total: 40 }), order({ created_at: "2026-09-02T23:59:59Z", total: 50 }), order({ created_at: "2026-09-03T00:00:00Z", total: 999 })], input)
    expect(result.previous.sales).toBe(70)
    expect(result.current.sales).toBe(50)
    expect(result.trend.map(day => [day.sales, day.previous_sales])).toEqual([[0, 30], [50, 40]])
    expect(result.previous_from).toBe("2026-08-30")
  })
  it("groups variants into products and counts unique known customers", () => {
    const result = aggregateAnalytics([order(), order({ id: "order-2" }), order({ id: "guest", customer_id: null })], input, new Set(["customer-1"]))
    expect(result.top_products[0]).toMatchObject({ title: "Lavender soap", units: 6, sales: 240 })
    expect(result.customers).toEqual({ total: 1, returning: 1, new: 0, returning_rate: 100 })
  })
  it("produces zero-filled trends and finite metrics for an empty store", () => {
    const result = aggregateAnalytics([], input)
    expect(result.current).toEqual({ orders: 0, sales: 0, collected: 0, refunds: 0, units: 0, aov: 0 })
    expect(result.trend).toHaveLength(2)
    expect(result.customers.returning_rate).toBe(0)
  })
  it("validates real dates, bounded ranges, and currencies", () => {
    expect(analyticsQuerySchema.safeParse({ ...input, from: "2026-02-30" }).success).toBe(false)
    expect(analyticsQuerySchema.safeParse({ ...input, to: "2026-08-31" }).success).toBe(false)
    expect(analyticsQuerySchema.safeParse({ ...input, from: "2020-01-01" }).success).toBe(false)
    expect(analyticsQuerySchema.parse({ ...input, currency: "USD" }).currency).toBe("usd")
    expect(analyticsRange({ ...input, from: "2024-02-28", to: "2024-03-01" }).days).toBe(3)
  })
})
