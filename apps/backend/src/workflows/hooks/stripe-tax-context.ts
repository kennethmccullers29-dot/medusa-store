import { updateTaxLinesWorkflow, upsertTaxLinesWorkflow, updateOrderTaxLinesWorkflow } from "@medusajs/medusa/core-flows"
import { StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"

type BasketLine = { id: string; quantity?: unknown; unit_price?: unknown; amount?: unknown; is_tax_inclusive?: boolean; is_giftcard?: boolean; adjustments?: unknown[] }
type Basket = { currency_code?: string; items?: BasketLine[]; shipping_methods?: BasketLine[] }

function taxContext(basket: Basket, items?: BasketLine[], shippingMethods?: BasketLine[]) {
  const basketItems = basket.items ?? items ?? []
  const basketShipping = basket.shipping_methods ?? shippingMethods ?? []
  return {
    stripe_tax_basket: {
      currency_code: basket.currency_code,
      items: basketItems,
      shipping_methods: basketShipping,
    },
  }
}

async function completeBasket(entity: "cart" | "order", id: string, container: { resolve: (key: string) => any }): Promise<Basket> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity,
    fields: ["currency_code", "items.id", "items.quantity", "items.unit_price", "items.is_tax_inclusive", "items.is_giftcard", "items.adjustments.*", "shipping_methods.id", "shipping_methods.amount", "shipping_methods.is_tax_inclusive", "shipping_methods.adjustments.*"],
    filters: { id },
  })
  if (!data[0]) throw new MedusaError(MedusaError.Types.INVALID_DATA, `Cannot calculate Stripe Tax for missing ${entity} ${id}`)
  return data[0]
}

updateTaxLinesWorkflow.hooks.setTaxLineContext(async ({ cart, items, shipping_methods }, { container }) => {
  if (process.env.STRIPE_TAX_ENABLED !== "true") return new StepResponse({})
  const basket = await completeBasket("cart", cart.id, container)
  return new StepResponse(taxContext(basket, items, shipping_methods))
})

upsertTaxLinesWorkflow.hooks.setTaxLineContext(async ({ cart, items, shipping_methods }, { container }) => {
  if (process.env.STRIPE_TAX_ENABLED !== "true") return new StepResponse({})
  const basket = await completeBasket("cart", cart.id, container)
  return new StepResponse(taxContext(basket, items, shipping_methods))
})

updateOrderTaxLinesWorkflow.hooks.setTaxLineContext(async ({ order, items, shipping_methods }, { container }) => {
  if (process.env.STRIPE_TAX_ENABLED !== "true") return new StepResponse({})
  const basket = await completeBasket("order", order.id, container)
  return new StepResponse(taxContext(basket, items, shipping_methods))
})
