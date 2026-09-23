"use client"

import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import DiscountCode from "@modules/checkout/components/discount-code"
import CartTotals from "@modules/common/components/cart-totals"
import { HttpTypes } from "@medusajs/types"
import { convertToLocale } from "@lib/util/money"
import { useState } from "react"

const CheckoutSummary = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="small:sticky small:top-6">
      <button type="button" aria-expanded={open} aria-controls="checkout-order-summary" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between rounded-lg border border-homestead-border bg-homestead-linen/45 px-5 py-4 text-sm font-medium text-homestead-forest small:hidden">
        <span>{open ? "Hide" : "Show"} order summary <span aria-hidden="true">{open ? "⌃" : "⌄"}</span></span>
        <span>{convertToLocale({ amount: cart.total ?? 0, currency_code: cart.currency_code })}</span>
      </button>
      <div id="checkout-order-summary" className={open ? "mt-3 small:mt-0" : "hidden small:block"}>
      <div className="rounded-lg border border-homestead-border bg-homestead-linen/45 p-5 small:p-7">
        <div className="flex items-baseline justify-between gap-4 border-b border-homestead-border pb-5">
          <h2 className="font-heading text-2xl text-homestead-forest">Your order</h2>
          <span className="text-xs text-homestead-muted">{cart.items?.reduce((count, item) => count + item.quantity, 0) ?? 0} items</span>
        </div>
        <div className="py-5"><ItemsPreviewTemplate cart={cart} /></div>
        <div className="border-t border-homestead-border pt-4"><DiscountCode cart={cart} subtle /></div>
        <div className="border-t border-homestead-border pt-5"><CartTotals totals={cart} /></div>
      </div>
      <p className="mt-4 text-center text-xs text-homestead-muted">Your order details stay with you through checkout.</p>
      </div>
    </div>
  )
}

export default CheckoutSummary
