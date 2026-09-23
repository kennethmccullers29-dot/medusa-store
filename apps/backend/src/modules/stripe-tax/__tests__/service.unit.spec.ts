import StripeTaxProviderService, { toCents } from "../service"

const item = { line_item: { id: "item_1", product_id: "prod_1", quantity: 2, unit_price: 12.5, currency_code: "usd" }, rates: [] }
const shipping = { shipping_line: { id: "ship_1", shipping_option_id: "so_1", unit_price: 5, currency_code: "usd" }, rates: [] }
const context = {
  address: { country_code: "us", postal_code: "27601", province_code: "nc" },
  additional_context: {
    stripe_tax_basket: {
      currency_code: "usd",
      items: [{ id: "item_1", quantity: 2, unit_price: 12.5 }],
      shipping_methods: [{ id: "ship_1", amount: 5 }],
    },
  },
}

describe("Stripe Tax provider", () => {
  const originalFetch = global.fetch
  afterEach(() => { global.fetch = originalFetch })

  it("sends the entire basket and maps product and shipping tax separately", async () => {
    const requests: URLSearchParams[] = []
    global.fetch = jest.fn(async (_url: RequestInfo | URL, options?: RequestInit) => {
      requests.push(options?.body as URLSearchParams)
      return new Response(JSON.stringify({
          id: "taxcalc_1",
          amount_total: 3200,
          currency: "usd",
          line_items: { data: [{ reference: "item_1", amount: 2500, amount_tax: 200 }], has_more: false },
          shipping_cost: { amount: 500, amount_tax: 0 },
      }), { status: 200 })
    })
    const provider = new StripeTaxProviderService({}, { apiKey: "sk_test_example" })
    const itemLines = await provider.getTaxLines([item], [], context)
    const shippingLines = await provider.getTaxLines([], [shipping], context)

    expect(requests).toHaveLength(2)
    expect(requests[0].get("line_items[0][amount]")).toBe("2500")
    expect(requests[0].get("shipping_cost[amount]")).toBe("500")
    expect(requests[1].get("line_items[0][reference]")).toBe("item_1")
    expect(itemLines[0]).toMatchObject({ line_item_id: "item_1", rate: 8, data: { stripe_calculation_id: "taxcalc_1" } })
    expect(shippingLines[0]).toMatchObject({ shipping_line_id: "ship_1", rate: 0 })
  })

  it("deducts Medusa's allocated adjustments from the taxable line amount", async () => {
    const requests: URLSearchParams[] = []
    global.fetch = jest.fn(async (_url: RequestInfo | URL, options?: RequestInit) => {
      requests.push(options?.body as URLSearchParams)
      return new Response(JSON.stringify({ id: "taxcalc_discount", amount_total: 2680, currency: "usd", line_items: { data: [{ reference: "item_1", amount: 2250, amount_tax: 180 }], has_more: false }, shipping_cost: { amount: 250, amount_tax: 0 } }), { status: 200 })
    })
    const provider = new StripeTaxProviderService({}, { apiKey: "sk_test_example" })
    await provider.getTaxLines([item], [], {
      ...context,
      additional_context: { stripe_tax_basket: {
        ...context.additional_context.stripe_tax_basket,
        items: [{ id: "item_1", quantity: 2, unit_price: 12.5, adjustments: [{ amount: 2.5 }] }],
        shipping_methods: [{ id: "ship_1", amount: 5, adjustments: [{ amount: 2.5 }] }],
      } },
    })
    expect(requests[0].get("line_items[0][amount]")).toBe("2250")
    expect(requests[0].get("shipping_cost[amount]")).toBe("250")
  })

  it("does not quote until the destination has a postal code", async () => {
    global.fetch = jest.fn() as typeof fetch
    const provider = new StripeTaxProviderService({}, { apiKey: "sk_test_example" })
    expect(await provider.getTaxLines([item], [], { ...context, address: { country_code: "us" } })).toEqual([])
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it("converts major USD units exactly to cents", () => {
    expect(toCents(12.34)).toBe(1234)
    expect(() => toCents(12.345)).toThrow("whole cents")
  })
})
