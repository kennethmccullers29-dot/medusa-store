"use client"

import DiscountCode from "@modules/checkout/components/discount-code"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type SummaryProps = {
  cart: HttpTypes.StoreCart
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

const Summary = ({ cart }: SummaryProps) => {
  const step = getCheckoutStep(cart)
  const money = (amount: number | null | undefined) => convertToLocale({ amount: amount ?? 0, currency_code: cart.currency_code })

  return (
    <section className="rounded-2xl border border-homestead-border bg-[#f3eef5] p-6 sm:p-7" aria-labelledby="order-summary-heading">
      <h2 id="order-summary-heading" className="font-heading text-2xl text-homestead-ink">Order summary</h2>
      <div className="mt-6 space-y-3 text-sm text-homestead-muted">
        <div className="flex justify-between gap-4"><span>Subtotal</span><span data-testid="cart-subtotal" data-value={cart.item_subtotal ?? 0}>{money(cart.item_subtotal)}</span></div>
        {!!cart.discount_total && <div className="flex justify-between gap-4 text-homestead-forest"><span>Discount</span><span data-testid="cart-discount" data-value={cart.discount_total}>−{money(cart.discount_total)}</span></div>}
        <div className="flex justify-between gap-4"><span>Shipping</span><span data-testid="cart-shipping" data-value={cart.shipping_subtotal ?? 0}>{cart.shipping_methods?.length ? money(cart.shipping_subtotal) : "Calculated at checkout"}</span></div>
        <div className="flex justify-between gap-4"><span>Taxes</span><span data-testid="cart-taxes" data-value={cart.tax_total ?? 0}>{cart.shipping_address?.postal_code ? money(cart.tax_total) : "Calculated at checkout"}</span></div>
      </div>
      <div className="mt-6 border-t border-homestead-border pt-5">
        <div className="flex items-baseline justify-between gap-4 text-homestead-ink">
          <span className="font-semibold">Estimated total</span>
          <span className="font-heading text-2xl" data-testid="cart-total" data-value={cart.total ?? 0}>{money(cart.total)}</span>
        </div>
        <p className="mt-2 text-xs leading-5 text-homestead-muted">Shipping and any applicable taxes are confirmed during checkout.</p>
      </div>
      <LocalizedClientLink
        href={"/checkout?step=" + step}
        className="mt-6 flex min-h-12 w-full items-center justify-center rounded-md bg-homestead-forest px-5 text-sm font-semibold text-white transition-colors hover:bg-homestead-olive"
        data-testid="checkout-button"
      >
        Continue to checkout <span className="ml-2" aria-hidden="true">→</span>
      </LocalizedClientLink>
      <div className="mt-5 border-t border-homestead-border pt-4"><DiscountCode cart={cart} subtle /></div>
    </section>
  )
}

export default Summary
