import { eventPayload, klaviyoRequest, subscriptionPayload } from "../klaviyo"

describe("Klaviyo API contracts", () => {
  const original = { enabled: process.env.KLAVIYO_ENABLED, key: process.env.KLAVIYO_PRIVATE_API_KEY }
  beforeEach(() => {
    process.env.KLAVIYO_ENABLED = "true"
    process.env.KLAVIYO_PRIVATE_API_KEY = "private-fixture-key"
  })
  afterEach(() => {
    if (original.enabled === undefined) delete process.env.KLAVIYO_ENABLED
    else process.env.KLAVIYO_ENABLED = original.enabled
    if (original.key === undefined) delete process.env.KLAVIYO_PRIVATE_API_KEY
    else process.env.KLAVIYO_PRIVATE_API_KEY = original.key
    jest.useRealTimers()
  })
  it("does not make requests when disabled", async () => {
    process.env.KLAVIYO_ENABLED = "false"
    const fetcher = jest.fn()
    await expect(klaviyoRequest("events/", {}, fetcher)).rejects.toThrow("not configured")
    expect(fetcher).not.toHaveBeenCalled()
  })
  it("subscribes explicitly to the selected list without bypassing opt-in", () => {
    const payload = subscriptionPayload("fixture@example.com", "list-fixture")
    expect(payload.data.relationships.list.data.id).toBe("list-fixture")
    expect(payload.data.attributes.profiles.data[0].attributes.subscriptions.email.marketing.consent).toBe("SUBSCRIBED")
    expect(payload.data.attributes).not.toHaveProperty("historical_import")
  })
  it("preserves currency units and stable event identity without marketing consent", () => {
    const input = { name: "Placed Order", uniqueId: "order.placed:order-fixture", email: "fixture@example.com", value: 9.99, currency: "usd", properties: { OrderID: "order-fixture" } }
    const attributes = eventPayload(input).data.attributes
    expect(attributes.value).toBe(9.99)
    expect(attributes.value_currency).toBe("USD")
    expect(attributes.unique_id).toBe(eventPayload(input).data.attributes.unique_id)
    expect(attributes.profile.data.attributes).not.toHaveProperty("subscriptions")
  })
  it("sends private authentication server-side and hides upstream error details", async () => {
    const fetcher = jest.fn().mockResolvedValue(new Response("sensitive upstream details", { status: 401 }))
    await expect(klaviyoRequest("events/", {}, fetcher)).rejects.toThrow("Klaviyo request failed (401)")
    expect(fetcher.mock.calls[0][1].headers.Authorization).toBe("Klaviyo-API-Key private-fixture-key")
    expect(fetcher).toHaveBeenCalledTimes(1)
  })
  it("retries rate-limited requests with the same payload", async () => {
    jest.useFakeTimers()
    const fetcher = jest.fn().mockResolvedValueOnce(new Response(null, { status: 429, headers: { "Retry-After": "1" } })).mockResolvedValueOnce(new Response(null, { status: 202 }))
    const payload = eventPayload({ name: "Placed Order", uniqueId: "order-fixture", email: "fixture@example.com", properties: {} })
    const result = klaviyoRequest("events/", payload, fetcher)
    await jest.advanceTimersByTimeAsync(1000)
    expect((await result).status).toBe(202)
    expect(fetcher).toHaveBeenCalledTimes(2)
    expect(fetcher.mock.calls[0][1].body).toBe(fetcher.mock.calls[1][1].body)
  })
})
