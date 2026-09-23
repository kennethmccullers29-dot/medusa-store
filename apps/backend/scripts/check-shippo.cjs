const { loadEnv } = require("@medusajs/framework/utils")
require("ts-node/register/transpile-only")
const ShippoProvider = require("../src/modules/shippo/service").default

loadEnv("development", process.cwd())

async function main() {
  const token = process.env.SHIPPO_API_TOKEN || process.env.SHIPPO_API_KEY || ""
  if (!token.trim().startsWith("shippo_test_")) {
    throw new Error("This check requires a Shippo test token; it will not purchase live labels")
  }
  const provider = new ShippoProvider({}, {
    api_token: token,
    from_email: "shippo-test@example.com",
    parcel_length_cm: Number(process.env.SHIPPO_PARCEL_LENGTH_CM || 25),
    parcel_width_cm: Number(process.env.SHIPPO_PARCEL_WIDTH_CM || 20),
    parcel_height_cm: Number(process.env.SHIPPO_PARCEL_HEIGHT_CM || 10),
  })
  const options = await provider.getFulfillmentOptions()
  const option = options.find(option => option.servicelevel_token === "usps_priority")
  if (!option) throw new Error("Enable USPS Priority in your Shippo test account to run this check")
  console.log(JSON.stringify({ stage: "carrier_access", option_count: options.length, selected_service: option.name, valid: await provider.validateOption(option) }))
  const context = {
    id: "shippo-smoke-cart",
    currency_code: "usd",
    from_location: { name: "Shippo Test Sender", address: { address_1: "215 Clayton St", city: "San Francisco", province: "CA", postal_code: "94117", country_code: "us", phone: "4155550100" } },
    shipping_address: { first_name: "Shippo", last_name: "Test Recipient", address_1: "965 Mission St", city: "San Francisco", province: "CA", postal_code: "94103", country_code: "us", phone: "4155550101" },
    items: [{ id: "test-line", variant_id: "test-variant", title: "Test product", quantity: 2, variant: { id: "test-variant", weight: 400 } }],
  }
  const price = await provider.calculatePrice(option, {}, context)
  console.log(JSON.stringify({ stage: "rate", ...price, currency: "USD" }))
  const data = await provider.validateFulfillmentData(option, {}, context)
  const fulfillment = await provider.createFulfillment(data, [{ line_item_id: "test-line", quantity: 1 }], { currency_code: "usd", items: context.items }, { id: "shippo-test-" + Date.now() })
  console.log(JSON.stringify({ stage: "test_label", transaction_id: fulfillment.data.shippo_transaction_id, label_present: !!fulfillment.labels[0]?.label_url, tracking_present: !!fulfillment.labels[0]?.tracking_number }))
  await provider.cancelFulfillment(fulfillment.data)
  console.log(JSON.stringify({ stage: "test_refund_request", accepted: true }))
}

main().catch(error => {
  console.error(error.message)
  process.exitCode = 1
})
