import { listCartShippingMethods } from "@lib/data/fulfillment"
import { listCartPaymentMethods } from "@lib/data/payment"
import { HttpTypes } from "@medusajs/types"
import Addresses from "@modules/checkout/components/addresses"
import Payment from "@modules/checkout/components/payment"
import Review from "@modules/checkout/components/review"
import Shipping from "@modules/checkout/components/shipping"

export default async function CheckoutForm({
  cart,
  customer,
  brandName,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
  brandName: string
}) {
  if (!cart) {
    return null
  }

  const shippingMethods = await listCartShippingMethods(cart.id)
  const paymentMethods = await listCartPaymentMethods(cart.region?.id ?? "")

  if (!shippingMethods || !paymentMethods) {
    return <p role="alert" className="rounded-lg border border-homestead-border bg-homestead-linen p-6 text-sm text-homestead-forest">Checkout options are temporarily unavailable. Please refresh the page or contact us for help.</p>
  }

  return (
    <div className="grid w-full grid-cols-1 gap-4">
      <section className="rounded-lg border border-homestead-border bg-white p-5 shadow-sm small:p-7"><Addresses cart={cart} customer={customer} /></section>
      <section className="rounded-lg border border-homestead-border bg-white p-5 shadow-sm small:p-7"><Shipping cart={cart} availableShippingMethods={shippingMethods} /></section>
      <section className="rounded-lg border border-homestead-border bg-white p-5 shadow-sm small:p-7"><Payment cart={cart} availablePaymentMethods={paymentMethods} /></section>
      <section className="rounded-lg border border-homestead-border bg-white p-5 shadow-sm small:p-7"><Review cart={cart} brandName={brandName} /></section>
    </div>
  )
}
