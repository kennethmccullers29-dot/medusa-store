"use client"

import { calculatePriceForShippingOption, listCartShippingMethods } from "@lib/data/fulfillment"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { useEffect, useState } from "react"

export default function ShippingEstimate({ cart }: { cart: HttpTypes.StoreCart }) {
  const [estimate, setEstimate] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const address = cart.shipping_address
  const hasAddress = !!(address?.address_1 && address?.city && address?.postal_code && address?.country_code)
  const selectedShipping = !!cart.shipping_methods?.length
  const itemSignature = cart.items?.map((item) => `${item.id}:${item.quantity}`).join(",") ?? ""

  useEffect(() => {
    if (!hasAddress || selectedShipping) {
      setEstimate(null)
      setLoading(false)
      return
    }

    let active = true
    setEstimate(null)
    setLoading(true)

    const loadEstimate = async () => {
      try {
        const options = await listCartShippingMethods(cart.id)
        const shippingOptions = (options ?? []).filter((option) =>
          (option as typeof option & { service_zone?: { fulfillment_set?: { type?: string } } }).service_zone?.fulfillment_set?.type !== "pickup"
        )
        const amounts = await Promise.all(shippingOptions.map(async (option) => {
          if (option.price_type !== "calculated") return option.amount
          const result = await calculatePriceForShippingOption(option.id, cart.id)
          return result.shippingOption?.amount
        }))
        const available = amounts.filter((amount): amount is number => typeof amount === "number" && Number.isFinite(amount))
        if (active) setEstimate(available.length ? Math.min(...available) : null)
      } catch {
        if (active) setEstimate(null)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadEstimate()
    return () => { active = false }
  }, [cart.id, hasAddress, selectedShipping, itemSignature, address?.address_1, address?.city, address?.postal_code, address?.country_code])

  const shippingAmount = selectedShipping ? cart.shipping_subtotal : estimate
  const label = selectedShipping ? "Shipping" : estimate !== null ? "Shipping from" : "Shipping"
  const value = typeof shippingAmount === "number"
    ? convertToLocale({ amount: shippingAmount, currency_code: cart.currency_code })
    : loading ? "Calculating…" : "Calculated at checkout"

  return (
    <div className="mt-3 flex justify-between gap-3 text-xs text-homestead-muted" aria-live="polite">
      <span>{label}</span>
      <span className="text-right">{value}</span>
    </div>
  )
}
