import { AbstractFulfillmentProviderService, MedusaError } from "@medusajs/framework/utils"
import type { IFulfillmentProvider, CalculatedShippingOptionPrice, CreateFulfillmentResult, FulfillmentOption, BigNumberValue, CartPropsForFulfillment, StockLocationDTO } from "@medusajs/framework/types"
import ShippoClient, { ShippoAddress, ShippoParcel, ShippoRate, ShippoShipment, ShippoTransaction } from "./client"

type Options = { api_token?: string; from_email?: string; parcel_length_cm: number; parcel_width_cm: number; parcel_height_cm: number }
type Address = { address_1?: string | null; address_2?: string | null; city?: string | null; province?: string | null; postal_code?: string | null; country_code?: string; phone?: string | null; first_name?: string | null; last_name?: string | null }
type WeightedItem = { id?: string; variant_id?: string | null; title?: string; quantity: BigNumberValue; variant?: { id?: string; weight?: number | null } }

export function packageWeight(items: WeightedItem[]): number {
  if (!items.length) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Shippo requires items to ship")
  return items.reduce((total, item) => {
    const weight = Number(item.variant?.weight)
    const quantity = Number(item.quantity)
    if (!Number.isFinite(weight) || weight <= 0 || !Number.isFinite(quantity) || quantity <= 0) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, `Set a positive weight in grams for ${item.title || item.variant_id || "every shipped item"}`)
    }
    return total + weight * quantity
  }, 0)
}

export function selectRate(rates: ShippoRate[], data: Record<string, unknown>, currency: string): ShippoRate {
  const matches = rates.filter(rate => rate.carrier_account === data.carrier_account_id && rate.servicelevel.token === data.servicelevel_token && rate.currency.toUpperCase() === currency.toUpperCase() && Number.isFinite(Number(rate.amount)) && Number(rate.amount) > 0)
  matches.sort((a, b) => Number(a.amount) - Number(b.amount))
  if (!matches.length) throw new MedusaError(MedusaError.Types.INVALID_DATA, `Shippo has no available rate for the selected service in ${currency.toUpperCase()}`)
  return matches[0]
}

export default class ShippoProviderService extends AbstractFulfillmentProviderService {
  static identifier = "shippo"
  protected client: ShippoClient
  protected options: Options

  constructor(_container: Record<string, unknown>, options: Options) {
    super()
    this.options = options
    this.client = new ShippoClient(options.api_token?.trim() || "")
  }

  async getFulfillmentOptions(): Promise<FulfillmentOption[]> {
    const carriers = await this.client.carriers()
    return carriers.filter(carrier => carrier.active).flatMap(carrier => (carrier.service_levels || []).map(service => ({
      id: `${carrier.object_id}__${service.token}`,
      name: `${carrier.carrier_name || carrier.carrier} — ${service.name}`,
      carrier_account_id: carrier.object_id,
      servicelevel_token: service.token,
      is_return: false,
    })))
  }

  async validateOption(data: Record<string, unknown>): Promise<boolean> {
    if (typeof data.carrier_account_id !== "string" || typeof data.servicelevel_token !== "string" || data.is_return) return false
    return (await this.getFulfillmentOptions()).some(option => option.carrier_account_id === data.carrier_account_id && option.servicelevel_token === data.servicelevel_token)
  }

  async canCalculate(): Promise<boolean> { return true }

  private address(address: Address | undefined | null, name?: string): ShippoAddress {
    if (!address?.address_1 || !address.city || !address.postal_code || !address.country_code) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Shippo requires street, city, postal code, and country on both the stock location and shipping address")
    }
    return {
      name: name || [address.first_name, address.last_name].filter(Boolean).join(" "),
      street1: address.address_1,
      street2: address.address_2 || undefined,
      city: address.city,
      state: address.province || undefined,
      zip: address.postal_code,
      country: address.country_code.toUpperCase(),
      phone: address.phone || undefined,
    }
  }

  private parcel(items: WeightedItem[]): ShippoParcel {
    const dimensions = [this.options.parcel_length_cm, this.options.parcel_width_cm, this.options.parcel_height_cm]
    if (dimensions.some(value => !Number.isFinite(value) || value <= 0)) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Configure positive SHIPPO_PARCEL_LENGTH_CM, SHIPPO_PARCEL_WIDTH_CM, and SHIPPO_PARCEL_HEIGHT_CM")
    }
    return { weight: String(packageWeight(items)), mass_unit: "g", length: String(dimensions[0]), width: String(dimensions[1]), height: String(dimensions[2]), distance_unit: "cm" }
  }

  private async shipment(option: Record<string, unknown>, context: CartPropsForFulfillment & { from_location?: StockLocationDTO }): Promise<ShippoShipment> {
    const from = this.address(context.from_location?.address, context.from_location?.name)
    from.email = this.options.from_email
    const to = this.address(context.shipping_address)
    if (from.country !== to.country) throw new MedusaError(MedusaError.Types.INVALID_DATA, "This Shippo provider currently supports domestic shipping only; international shipments require customs declarations")
    return await this.client.request<ShippoShipment>("/shipments/", {
      address_from: from, address_to: to,
      parcels: [this.parcel(context.items || [])],
      carrier_accounts: [option.carrier_account_id], async: false,
    })
  }

  async calculatePrice(...[option, _data, context]: Parameters<IFulfillmentProvider["calculatePrice"]>): Promise<CalculatedShippingOptionPrice> {
    const shipment = await this.shipment(option, context)
    const rate = selectRate(shipment.rates || [], option, String(context.currency_code))
    return { calculated_amount: Number(rate.amount), is_calculated_price_tax_inclusive: false }
  }

  async validateFulfillmentData(...[option, data, context]: Parameters<IFulfillmentProvider["validateFulfillmentData"]>): Promise<Record<string, unknown>> {
    const shipment = await this.shipment(option, context)
    selectRate(shipment.rates || [], option, String(context.currency_code))
    const weights: Record<string, number> = {}
    for (const item of context.items) {
      const variantId = item.variant_id || item.variant?.id
      if (variantId) weights[variantId] = Number(item.variant?.weight)
    }
    return { ...data, carrier_account_id: option.carrier_account_id, servicelevel_token: option.servicelevel_token, shippo_shipment_id: shipment.object_id, shippo_weights: weights }
  }

  async createFulfillment(...[data, items, order, fulfillment]: Parameters<IFulfillmentProvider["createFulfillment"]>): Promise<CreateFulfillmentResult> {
    if (!data.shippo_shipment_id || !order?.items || !order.currency_code) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Shippo shipping method and order items are required to create a label")
    const original = await this.client.request<ShippoShipment>(`/shipments/${encodeURIComponent(String(data.shippo_shipment_id))}/`)
    original.address_from.email = this.options.from_email || original.address_from.email
    if (!original.address_from.email) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Set SHIPPO_FROM_EMAIL to your sender email before creating a Shippo label")
    const weights = data.shippo_weights as Record<string, number> || {}
    const selected = items.map(item => {
      const line = order.items!.find(line => line.id === item.line_item_id)
      if (!line || !item.quantity) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Unable to match a fulfillment item to its order line")
      return { ...line, quantity: item.quantity, variant: { weight: weights[line.variant_id || ""] } }
    })
    const shipment = await this.client.request<ShippoShipment>("/shipments/", {
      address_from: original.address_from, address_to: original.address_to,
      parcels: [this.parcel(selected)], carrier_accounts: [data.carrier_account_id], async: false,
    })
    const rate = selectRate(shipment.rates || [], data, order.currency_code)
    let transaction = await this.client.request<ShippoTransaction>("/transactions/", { rate: rate.object_id, label_file_type: "PDF_4x6", async: false, metadata: fulfillment.id || "Medusa fulfillment" })
    for (let attempt = 0; ["WAITING", "QUEUED"].includes(transaction.status) && attempt < 10; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      transaction = await this.client.request<ShippoTransaction>(`/transactions/${encodeURIComponent(transaction.object_id)}/`)
    }
    if (transaction.status !== "SUCCESS" || !transaction.label_url) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, `Shippo label ${transaction.object_id} is ${transaction.status}. Check this transaction in Shippo before retrying`)
    }
    return {
      data: { ...data, shippo_transaction_id: transaction.object_id, shippo_shipment_id: shipment.object_id },
      labels: [{ label_url: transaction.label_url, tracking_number: transaction.tracking_number || "", tracking_url: transaction.tracking_url_provider || "" }],
    }
  }

  async cancelFulfillment(data: Record<string, unknown>): Promise<void> {
    if (!data.shippo_transaction_id) return
    const refund = await this.client.request<{ object_id: string; status: string }>("/refunds/", { transaction: data.shippo_transaction_id, async: false })
    if (!["SUCCESS", "QUEUED", "PENDING"].includes(refund.status)) throw new MedusaError(MedusaError.Types.INVALID_DATA, `Shippo label refund ${refund.object_id} is ${refund.status}`)
  }

  async createReturnFulfillment(): Promise<CreateFulfillmentResult> {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Shippo return labels are not supported by this provider yet")
  }
}
