import ShippoProviderService, { packageWeight, selectRate } from "../service"
import ShippoClient, { ShippoRate } from "../client"

const option = { carrier_account_id: "carrier", servicelevel_token: "priority" }
const rate: ShippoRate = { object_id: "rate", carrier_account: "carrier", amount: "7.50", currency: "USD", servicelevel: { token: "priority", name: "Priority" } }

describe("Shippo fulfillment", () => {
  it("calculates gram weights for all units and rejects missing weights", () => {
    expect(packageWeight([{ quantity: 3, variant: { weight: 400 } }, { quantity: "2", variant: { weight: 100 } }])).toBe(1400)
    expect(() => packageWeight([{ quantity: 1 }])).toThrow("positive weight")
  })

  it("matches carrier, service, and currency instead of choosing an unrelated rate", () => {
    expect(selectRate([{ ...rate, carrier_account: "other", amount: "1" }, { ...rate, currency: "EUR" }, rate], option, "usd")).toEqual(rate)
    expect(() => selectRate([], option, "USD")).toThrow("no available rate")
    expect(() => selectRate([{ ...rate, amount: "invalid" }], option, "USD")).toThrow("no available rate")
  })

  it("validates shipping options against active carrier services", async () => {
    const provider = new ShippoProviderService({}, { api_token: "test", parcel_length_cm: 25, parcel_width_cm: 20, parcel_height_cm: 10 })
    jest.spyOn(ShippoClient.prototype, "carriers").mockResolvedValue([{ object_id: "carrier", active: true, carrier: "usps", service_levels: [{ token: "priority", name: "Priority" }] }])
    expect(await provider.validateOption(option)).toBe(true)
    expect(await provider.validateOption({ ...option, servicelevel_token: "missing" })).toBe(false)
    expect(await provider.validateOption({ ...option, is_return: true })).toBe(false)
    jest.restoreAllMocks()
  })

  it("rejects HTTP failures even without a JSON error body", async () => {
    const fetchMock = jest.spyOn(globalThis, "fetch").mockResolvedValue(new Response("Unauthorized", { status: 401 }))
    await expect(new ShippoClient("test").request("/carrier_accounts/")).rejects.toThrow("HTTP 401")
    fetchMock.mockRestore()
  })

  it("creates labels for the fulfilled quantity and returns tracking information", async () => {
    const provider = new ShippoProviderService({}, { api_token: "test", parcel_length_cm: 25, parcel_width_cm: 20, parcel_height_cm: 10 })
    const request = jest.spyOn(ShippoClient.prototype, "request")
      .mockResolvedValueOnce({ address_from: { country: "US", email: "sender@example.com" }, address_to: { country: "US" } })
      .mockResolvedValueOnce({ object_id: "shipment", rates: [rate] })
      .mockResolvedValueOnce({ object_id: "transaction", status: "SUCCESS", label_url: "https://example.com/label.pdf", tracking_number: "123", tracking_url_provider: "https://example.com/track" })
    const result = await provider.createFulfillment(
      { ...option, shippo_shipment_id: "original", shippo_weights: { variant: 400 } },
      [{ line_item_id: "line", quantity: 1 }],
      { currency_code: "usd", items: [{ id: "line", variant_id: "variant", quantity: 3 }] } as Parameters<ShippoProviderService["createFulfillment"]>[2],
      { id: "fulfillment" }
    )
    expect(request.mock.calls[1][1]).toMatchObject({ parcels: [{ weight: "400", mass_unit: "g" }] })
    expect(result.labels[0]).toMatchObject({ tracking_number: "123", label_url: "https://example.com/label.pdf" })
    expect(result.data.shippo_transaction_id).toBe("transaction")
    request.mockRestore()
  })

  it("does not report a failed label purchase as a successful fulfillment", async () => {
    const provider = new ShippoProviderService({}, { api_token: "test", parcel_length_cm: 25, parcel_width_cm: 20, parcel_height_cm: 10 })
    const request = jest.spyOn(ShippoClient.prototype, "request")
      .mockResolvedValueOnce({ address_from: { email: "sender@example.com" }, address_to: {} })
      .mockResolvedValueOnce({ object_id: "shipment", rates: [rate] })
      .mockResolvedValueOnce({ object_id: "failed", status: "ERROR" })
    await expect(provider.createFulfillment(
      { ...option, shippo_shipment_id: "original", shippo_weights: { variant: 400 } },
      [{ line_item_id: "line", quantity: 1 }],
      { currency_code: "usd", items: [{ id: "line", variant_id: "variant" }] } as Parameters<ShippoProviderService["createFulfillment"]>[2],
      { id: "fulfillment" }
    )).rejects.toThrow("Shippo label failed is ERROR")
    request.mockRestore()
  })
})
