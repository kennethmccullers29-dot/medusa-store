"use client"

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import DeleteButton from "@modules/common/components/delete-button"
import X from "@modules/common/icons/x"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import CartIcon from "../cart-icon"
import QuantityControl from "./quantity-control"
import ShippingEstimate from "./shipping-estimate"

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart.shipping_address?.address_1 || !cart.email) return "address"
  if (!cart.shipping_methods?.length) return "delivery"
  return "payment"
}

const CartDropdown = ({ cart: cartState }: { cart?: HttpTypes.StoreCart | null }) => {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const totalItems = cartState?.items?.reduce((count, item) => count + item.quantity, 0) ?? 0
  const previousItems = useRef(totalItems)

  useEffect(() => {
    if (totalItems > previousItems.current && !pathname.includes("/cart")) setOpen(true)
    previousItems.current = totalItems
  }, [totalItems, pathname])

  useEffect(() => { setOpen(false) }, [pathname])

  const items = [...(cartState?.items ?? [])].sort((a, b) => (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1)
  const subtotal = cartState?.item_subtotal ?? 0
  const close = () => setOpen(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-homestead-linen focus-visible:outline-offset-2"
        data-testid="nav-cart-link"
        aria-label={`Open cart, ${totalItems} ${totalItems === 1 ? "item" : "items"}`}
        title="Open shopping bag"
      >
        <CartIcon count={totalItems} />
      </button>

      <Dialog open={open} onClose={setOpen} className="relative z-[80]">
        <DialogBackdrop transition className="fixed inset-0 bg-homestead-ink/35 transition-opacity duration-300 ease-out data-[closed]:opacity-0 motion-reduce:transition-none" />
        <div className="fixed inset-0 flex justify-end">
          <DialogPanel transition className="flex h-full w-full max-w-[440px] flex-col bg-homestead-cream shadow-2xl transition-transform duration-300 ease-out data-[closed]:translate-x-full motion-reduce:transition-none" data-testid="nav-cart-dropdown">
            <div className="flex items-center justify-between border-b border-homestead-border px-6 py-6">
              <div>
                <p className="font-nav text-xs font-semibold uppercase tracking-[0.2em] text-homestead-olive">Your selections</p>
                <DialogTitle className="mt-1 font-heading text-3xl text-homestead-ink">Shopping bag <span className="font-nav text-sm font-normal text-homestead-muted">({totalItems})</span></DialogTitle>
              </div>
              <button type="button" onClick={close} aria-label="Close shopping bag" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-homestead-border text-homestead-forest hover:bg-homestead-linen focus-visible:outline-offset-2"><X size={20} aria-hidden="true" /></button>
            </div>

            {items.length ? (
              <>
                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 border-b border-homestead-border py-5 last:border-b-0" data-testid="cart-item">
                      <LocalizedClientLink href={`/products/${item.product_handle}`} onClick={close} className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-homestead-linen" aria-label={`View ${item.product_title}`}>
                        <Thumbnail thumbnail={item.thumbnail} images={item.variant?.product?.images} size="square" className="!h-full !w-full !rounded-lg !p-0 !shadow-none" />
                      </LocalizedClientLink>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <LocalizedClientLink href={`/products/${item.product_handle}`} onClick={close} className="font-heading text-lg leading-snug text-homestead-ink hover:text-homestead-olive" data-testid="product-link">{item.product_title}</LocalizedClientLink>
                            {item.variant?.title && item.variant.title !== "Default variant" && <p className="mt-1 text-xs text-homestead-muted" data-testid="cart-item-variant">{item.variant.title}</p>}
                          </div>
                          <span className="shrink-0 text-sm font-semibold text-homestead-ink">{convertToLocale({ amount: item.total ?? 0, currency_code: cartState!.currency_code })}</span>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <QuantityControl item={item} />
                          <DeleteButton id={item.id} data-testid="cart-item-remove-button">Remove</DeleteButton>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-homestead-border bg-[#f3eef5] px-6 py-6">
                  <div className="flex items-baseline justify-between gap-3 text-homestead-ink">
                    <span className="text-sm font-semibold">Subtotal</span>
                    <span className="font-heading text-2xl" data-testid="cart-subtotal" data-value={subtotal}>{convertToLocale({ amount: subtotal, currency_code: cartState!.currency_code })}</span>
                  </div>
                  <ShippingEstimate cart={cartState!} />
                  <p className="mt-2 text-xs text-homestead-muted">Taxes are confirmed at checkout.</p>
                  <LocalizedClientLink href={`/checkout?step=${getCheckoutStep(cartState!)}`} onClick={close} className="mt-5 flex min-h-12 items-center justify-center rounded-md bg-homestead-forest px-5 text-sm font-semibold text-white hover:bg-homestead-olive" data-testid="checkout-button">Continue to checkout <span className="ml-2" aria-hidden="true">→</span></LocalizedClientLink>
                  <LocalizedClientLink href="/cart" onClick={close} className="mt-3 flex min-h-11 items-center justify-center text-sm font-semibold text-homestead-forest underline decoration-homestead-border underline-offset-4 hover:text-homestead-olive" data-testid="go-to-cart-button">View shopping bag</LocalizedClientLink>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-homestead-linen text-homestead-forest" aria-hidden="true">
                  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" className="h-8 w-8"><path d="M7 11h18l-1.3 16H8.3L7 11Z" /><path d="M11.5 12V9a4.5 4.5 0 0 1 9 0v3" /></svg>
                </div>
                <h3 className="mt-6 font-heading text-2xl text-homestead-ink">Your bag is waiting</h3>
                <p className="mt-3 text-sm leading-6 text-homestead-muted">Find something lovely for your everyday routine.</p>
                <LocalizedClientLink href="/store" onClick={close} className="mt-7 inline-flex min-h-11 items-center justify-center rounded-md bg-homestead-forest px-6 text-sm font-semibold text-white hover:bg-homestead-olive">Explore the shop</LocalizedClientLink>
              </div>
            )}
          </DialogPanel>
        </div>
      </Dialog>
    </>
  )
}

export default CartDropdown
