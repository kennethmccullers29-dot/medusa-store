import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

const CartTemplate = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  const itemCount = cart?.items?.reduce((count, item) => count + item.quantity, 0) ?? 0

  return (
    <main className="bg-homestead-cream py-10 sm:py-14" data-testid="cart-container">
      <div className="content-container max-w-[1240px]">
        <div className="mb-9 flex flex-col gap-5 sm:mb-11 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-nav text-xs font-semibold uppercase tracking-[0.22em] text-homestead-olive">Your selections</p>
            <h1 className="mt-2 font-heading text-4xl leading-tight text-homestead-ink sm:text-5xl">Shopping bag</h1>
            {itemCount > 0 && <p className="mt-3 text-sm text-homestead-muted">{itemCount} {itemCount === 1 ? "item" : "items"} in your bag</p>}
          </div>
          <LocalizedClientLink href="/store" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-homestead-forest hover:text-homestead-olive">
            <span aria-hidden="true">←</span> Continue shopping
          </LocalizedClientLink>
        </div>
        {cart?.items?.length ? (
          <div className="grid gap-8 small:grid-cols-[minmax(0,1fr)_360px] small:items-start">
            <div className="min-w-0 space-y-5">
              <ItemsTemplate cart={cart} />
              {!customer && <SignInPrompt />}
            </div>
            {cart.region && <div className="small:sticky small:top-28"><Summary cart={cart} /></div>}
          </div>
        ) : (
          <EmptyCartMessage />
        )}
      </div>
    </main>
  )
}

export default CartTemplate
