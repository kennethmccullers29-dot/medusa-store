import { HttpTypes } from "@medusajs/types"
import Item from "@modules/cart/components/item"

type ItemsTemplateProps = {
  cart?: HttpTypes.StoreCart
}

const ItemsTemplate = ({ cart }: ItemsTemplateProps) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-homestead-border bg-white/70">
      {cart?.items?.map((item) => (
        <Item key={item.id} item={item} currencyCode={cart.currency_code} />
      ))}
    </div>
  )
}

export default ItemsTemplate
