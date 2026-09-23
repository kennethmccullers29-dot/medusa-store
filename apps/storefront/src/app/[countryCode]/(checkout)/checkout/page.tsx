import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { getStorefrontSettings } from "@lib/data/storefront-settings"
import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Checkout",
}

export default async function Checkout() {
  const cart = await retrieveCart()

  if (!cart) {
    return notFound()
  }

  const [customer, settings] = await Promise.all([retrieveCustomer(), getStorefrontSettings()])

  return (
    <div className="mx-auto grid w-full max-w-[1280px] gap-10 px-5 pb-16 pt-8 small:grid-cols-[minmax(0,1fr)_minmax(340px,440px)] small:gap-12 small:px-10 small:pt-12">
      <section className="order-2 min-w-0 small:order-1" aria-labelledby="checkout-heading">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-homestead-olive">Almost there</p>
        <h1 id="checkout-heading" className="mt-2 font-heading text-4xl leading-tight text-homestead-forest">Checkout</h1>
        <p className="mb-9 mt-2 text-sm text-homestead-muted">A few details, then your order is on its way.</p>
        <PaymentWrapper cart={cart}>
          <CheckoutForm cart={cart} customer={customer} brandName={settings.brand_name} />
        </PaymentWrapper>
      </section>
      <aside className="order-1 min-w-0 small:order-2" aria-label="Order summary">
        <CheckoutSummary cart={cart} />
      </aside>
    </div>
  )
}
