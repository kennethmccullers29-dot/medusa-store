import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function diagnoseShippo({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: products, metadata: productPage } = await query.graph({
    entity: "product",
    fields: ["id", "title", "status", "variants.id", "variants.title", "variants.weight"],
    pagination: { take: 100 },
  })
  const published = products.filter(product => product.status === "published")
  const variants = published.flatMap(product => product.variants || [])
  const missingWeight = variants.filter(variant => !Number.isFinite(Number(variant.weight)) || Number(variant.weight) <= 0)
  const { data: options } = await query.graph({
    entity: "shipping_option",
    fields: ["id", "name", "provider_id", "price_type", "data"],
    pagination: { take: 100 },
  })
  const { data: locations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name", "address.address_1", "address.city", "address.postal_code", "address.country_code"],
    pagination: { take: 100 },
  })
  console.log(JSON.stringify({
    published_products_sampled: published.length,
    product_count: productPage?.count,
    published_variants_sampled: variants.length,
    missing_weight_variants: published.flatMap(product => (product.variants || []).filter(variant => missingWeight.some(missing => missing.id === variant.id)).map(variant => ({ product: product.title, variant: variant.title, variant_id: variant.id }))),
    shipping_options: options.map(option => ({ id: option.id, name: option.name, provider_id: option.provider_id, price_type: option.price_type, carrier_selected: !!option.data?.carrier_account_id, service_selected: !!option.data?.servicelevel_token })),
    stock_locations: locations.map(location => ({ id: location.id, name: location.name, address_complete: !!(location.address?.address_1 && location.address?.city && location.address?.postal_code && location.address?.country_code) })),
  }))
}
