"use client"

import { Table, Text, clx } from "@modules/common/components/ui"
import { updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import Thumbnail from "@modules/products/components/thumbnail"
import { useState } from "react"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  currencyCode: string
}

const Item = ({ item, type = "full", currencyCode }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const changeQuantity = async (quantity: number) => {
    setError(null)
    setUpdating(true)

    await updateLineItem({
      lineId: item.id,
      quantity,
    })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setUpdating(false)
      })
  }

  // TODO: Update this to grab the actual max inventory
  const maxQtyFromInventory = 10
  const maxQuantity = item.variant?.manage_inventory ? 10 : maxQtyFromInventory

  if (type === "full") {
    return (
      <article className="flex gap-4 border-b border-homestead-border p-4 last:border-b-0 sm:gap-6 sm:p-6" data-testid="product-row">
        <LocalizedClientLink href={`/products/${item.product_handle}`} className="block h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-homestead-linen sm:h-32 sm:w-32" aria-label={`View ${item.product_title}`}>
          <Thumbnail thumbnail={item.thumbnail} images={item.variant?.product?.images} size="square" className="!h-full !w-full !rounded-lg !p-0 !shadow-none" />
        </LocalizedClientLink>
        <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <LocalizedClientLink href={`/products/${item.product_handle}`} className="font-heading text-lg leading-snug text-homestead-ink hover:text-homestead-olive sm:text-xl" data-testid="product-title">
              {item.product_title}
            </LocalizedClientLink>
            {item.variant?.title && item.variant.title !== "Default variant" && (
              <p className="mt-1 text-xs text-homestead-muted" data-testid="product-variant">{item.variant.title}</p>
            )}
            <div className="mt-2 text-sm text-homestead-muted"><LineItemUnitPrice item={item} style="tight" currencyCode={currencyCode} /><span className="sr-only"> each</span></div>
            <div className="mt-4 flex items-center gap-4">
              <label htmlFor={`quantity-${item.id}`} className="text-xs font-semibold uppercase tracking-widest text-homestead-muted">Qty</label>
              <select id={`quantity-${item.id}`} value={item.quantity} onChange={(event) => changeQuantity(Number(event.target.value))} disabled={updating} className="h-10 min-w-16 rounded-md border border-homestead-border bg-white px-3 text-sm text-homestead-ink focus:border-homestead-olive focus:outline-none" data-testid="product-select-button">
                {Array.from({ length: Math.max(maxQuantity, item.quantity) }, (_, index) => <option value={index + 1} key={index + 1}>{index + 1}</option>)}
              </select>
              <DeleteButton id={item.id} data-testid="product-delete-button" className="text-homestead-muted">Remove</DeleteButton>
              {updating && <Spinner />}
            </div>
            <ErrorMessage error={error} data-testid="product-error-message" />
          </div>
          <div className="mt-3 shrink-0 font-semibold text-homestead-ink sm:mt-0" data-testid="product-price"><LineItemPrice item={item} style="tight" currencyCode={currencyCode} /></div>
        </div>
      </article>
    )
  }

  return (
    <Table.Row className="w-full" data-testid="product-row">
      <Table.Cell className="!pl-0 p-4 w-24">
        <LocalizedClientLink
          href={`/products/${item.product_handle}`}
          className="flex w-16"
        >
          <Thumbnail
            thumbnail={item.thumbnail}
            images={item.variant?.product?.images}
            size="square"
          />
        </LocalizedClientLink>
      </Table.Cell>

      <Table.Cell className="text-left">
        <Text
          className="txt-medium-plus text-ui-fg-base"
          data-testid="product-title"
        >
          {item.product_title}
        </Text>
        <LineItemOptions variant={item.variant} data-testid="product-variant" />
      </Table.Cell>

      <Table.Cell className="!pr-0">
        <span
          className={clx("!pr-0", {
            "flex flex-col items-end h-full justify-center": type === "preview",
          })}
        >
          {type === "preview" && (
            <span className="flex gap-x-1 ">
              <Text className="text-ui-fg-muted">{item.quantity}x </Text>
              <LineItemUnitPrice
                item={item}
                style="tight"
                currencyCode={currencyCode}
              />
            </span>
          )}
          <LineItemPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </span>
      </Table.Cell>
    </Table.Row>
  )
}

export default Item
