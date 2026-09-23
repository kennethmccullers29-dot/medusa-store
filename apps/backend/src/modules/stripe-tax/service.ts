import type { ITaxProvider, TaxTypes } from "@medusajs/framework/types"
import { MedusaError } from "@medusajs/framework/utils"
import { StripeTaxClient, type StripeTaxCalculation } from "./client"

type Options = { apiKey?: string; productTaxCode?: string }
type Adjustment = { amount?: unknown }
type BasketItem = { id: string; quantity?: unknown; unit_price?: unknown; currency_code?: string; is_tax_inclusive?: boolean; is_giftcard?: boolean; adjustments?: Adjustment[] }
type BasketShipping = { id: string; amount?: unknown; unit_price?: unknown; currency_code?: string; is_tax_inclusive?: boolean; adjustments?: Adjustment[] }
type Basket = { items?: BasketItem[]; shipping_methods?: BasketShipping[]; currency_code?: string }

export function toCents(value: unknown): number {
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount < 0) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Stripe Tax requires a nonnegative price")
  const cents = Math.round(amount * 100)
  if (Math.abs(amount * 100 - cents) > 0.000001) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Stripe Tax requires prices in whole cents")
  return cents
}

function discountCents(adjustments?: Adjustment[]): number {
  return (adjustments || []).reduce((total, adjustment) => total + toCents(adjustment.amount ?? 0), 0)
}

export default class StripeTaxProviderService implements ITaxProvider {
  static identifier = "stripe-tax"
  private readonly client: StripeTaxClient
  private readonly productTaxCode: string

  constructor(_container: Record<string, unknown>, options: Options) {
    this.client = new StripeTaxClient(options.apiKey || "")
    this.productTaxCode = options.productTaxCode || "txcd_99999999"
  }

  getIdentifier(): string { return StripeTaxProviderService.identifier }

  async getTaxLines(
    itemLines: TaxTypes.ItemTaxCalculationLine[],
    shippingLines: TaxTypes.ShippingTaxCalculationLine[],
    context: TaxTypes.TaxCalculationContext
  ): Promise<(TaxTypes.ItemTaxLineDTO | TaxTypes.ShippingTaxLineDTO)[]> {
    if (context.is_return) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Stripe Tax returns require a transaction reversal")
    if (!context.address?.country_code || !context.address.postal_code) return []
    if (context.address.country_code.toLowerCase() !== "us") throw new MedusaError(MedusaError.Types.INVALID_DATA, "Stripe Tax provider is configured for US sales only")

    const basket = context.additional_context?.stripe_tax_basket as Basket | undefined
    const items = basket?.items || itemLines.map(({ line_item }) => line_item as BasketItem)
    const shipping: BasketShipping[] = basket?.shipping_methods || shippingLines.map(({ shipping_line }) => ({ id: shipping_line.id, unit_price: shipping_line.unit_price, currency_code: shipping_line.currency_code }))
    const taxableItems = items.filter(item => !item.is_giftcard)
    if (!taxableItems.length) return []
    if (shipping.length > 1) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Stripe Tax currently supports one shipping method per order")
    if (taxableItems.some(item => item.is_tax_inclusive) || shipping.some(method => method.is_tax_inclusive)) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Stripe Tax currently requires tax-exclusive prices")
    }

    const currency = (basket?.currency_code || itemLines[0]?.line_item.currency_code || shippingLines[0]?.shipping_line.currency_code || "usd").toLowerCase()
    if (currency !== "usd") throw new MedusaError(MedusaError.Types.INVALID_DATA, "Stripe Tax provider currently supports USD only")
    const form = new URLSearchParams({ currency, "customer_details[address_source]": "shipping", "customer_details[address][country]": "US", "customer_details[address][postal_code]": context.address.postal_code, "expand[0]": "line_items" })
    if (context.address.province_code) form.set("customer_details[address][state]", context.address.province_code.toUpperCase())
    if (context.address.city) form.set("customer_details[address][city]", context.address.city)
    if (context.address.address_1) form.set("customer_details[address][line1]", context.address.address_1)
    if (context.address.address_2) form.set("customer_details[address][line2]", context.address.address_2)

    taxableItems.forEach((item, index) => {
      const quantity = Number(item.quantity ?? 1)
      if (!Number.isInteger(quantity) || quantity <= 0) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Stripe Tax requires a positive whole-item quantity")
      const amount = toCents(item.unit_price) * quantity - discountCents(item.adjustments)
      if (amount < 0) throw new MedusaError(MedusaError.Types.INVALID_DATA, "A Stripe Tax product discount exceeds its line amount")
      form.set(`line_items[${index}][amount]`, String(amount))
      form.set(`line_items[${index}][quantity]`, String(quantity))
      form.set(`line_items[${index}][reference]`, item.id)
      form.set(`line_items[${index}][tax_code]`, this.productTaxCode)
      form.set(`line_items[${index}][tax_behavior]`, "exclusive")
    })

    if (shipping.length) {
      const amount = toCents(shipping[0].amount ?? shipping[0].unit_price) - discountCents(shipping[0].adjustments)
      if (amount < 0) throw new MedusaError(MedusaError.Types.INVALID_DATA, "A Stripe Tax shipping discount exceeds its shipping amount")
      form.set("shipping_cost[amount]", String(amount))
      form.set("shipping_cost[tax_code]", "txcd_92010001")
      form.set("shipping_cost[tax_behavior]", "exclusive")
    }

    const calculation = await this.client.post<StripeTaxCalculation>("calculations", form)
    if (calculation.line_items.has_more || calculation.line_items.data.length !== taxableItems.length) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Stripe Tax returned an incomplete set of line items")
    }
    const byReference = new Map(calculation.line_items.data.map(item => [item.reference, item]))
    const providerId = this.getIdentifier()

    const result: (TaxTypes.ItemTaxLineDTO | TaxTypes.ShippingTaxLineDTO)[] = itemLines.map(({ line_item }) => {
      const stripeLine = byReference.get(line_item.id)
      if (!stripeLine) throw new MedusaError(MedusaError.Types.INVALID_DATA, `Stripe Tax did not return line ${line_item.id}`)
      return {
        line_item_id: line_item.id,
        rate: stripeLine.amount ? stripeLine.amount_tax / stripeLine.amount * 100 : 0,
        code: "STRIPE_TAX",
        name: "Sales tax",
        provider_id: providerId,
        data: { stripe_calculation_id: calculation.id, stripe_amount_tax: stripeLine.amount_tax },
      }
    })

    for (const { shipping_line } of shippingLines) {
      if (shipping[0]?.id !== shipping_line.id || !calculation.shipping_cost) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Stripe Tax did not return the shipping tax")
      result.push({
        shipping_line_id: shipping_line.id,
        rate: calculation.shipping_cost.amount ? calculation.shipping_cost.amount_tax / calculation.shipping_cost.amount * 100 : 0,
        code: "STRIPE_TAX_SHIPPING",
        name: "Shipping sales tax",
        provider_id: providerId,
        data: { stripe_calculation_id: calculation.id, stripe_amount_tax: calculation.shipping_cost.amount_tax },
      })
    }
    return result
  }
}
