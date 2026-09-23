"use client"

import { updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { useState } from "react"

export default function QuantityControl({ item }: { item: HttpTypes.StoreCartLineItem }) {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const changeQuantity = async (quantity: number) => {
    setUpdating(true)
    setError(null)

    try {
      await updateLineItem({ lineId: item.id, quantity })
    } catch {
      setError("Couldn’t update the quantity. Please try again.")
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div>
      <div className="inline-flex h-9 items-center rounded-md border border-homestead-border bg-white text-homestead-ink" aria-label={`Quantity for ${item.product_title}`}>
        <button
          type="button"
          onClick={() => changeQuantity(item.quantity - 1)}
          disabled={updating || item.quantity <= 1}
          aria-label={`Decrease quantity of ${item.product_title}`}
          className="flex h-9 w-9 items-center justify-center rounded-l-md text-lg hover:bg-homestead-linen disabled:cursor-not-allowed disabled:opacity-40"
        >
          −
        </button>
        <span className="min-w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite" data-testid="cart-item-quantity" data-value={item.quantity}>
          {item.quantity}
        </span>
        <button
          type="button"
          onClick={() => changeQuantity(item.quantity + 1)}
          disabled={updating}
          aria-label={`Increase quantity of ${item.product_title}`}
          className="flex h-9 w-9 items-center justify-center rounded-r-md text-lg hover:bg-homestead-linen disabled:cursor-not-allowed disabled:opacity-40"
        >
          +
        </button>
      </div>
      {updating && <span className="ml-2 text-xs text-homestead-muted" role="status">Updating…</span>}
      {error && <p className="mt-2 text-xs text-red-700" role="alert">{error}</p>}
    </div>
  )
}
