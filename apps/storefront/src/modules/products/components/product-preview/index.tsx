import { Text } from "@modules/common/components/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import PreviewRating from "./rating"
import { getProductReviewSummary } from "@lib/data/reviews"

export default async function ProductPreview({
  product,
  isFeatured,
  region: _region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  // const pricedProduct = await listProducts({
  //   regionId: region.id,
  //   queryParams: { id: [product.id!] },
  // }).then(({ response }) => response.products[0])

  // if (!pricedProduct) {
  //   return null
  // }

  const { cheapestPrice } = getProductPrice({
    product,
  })
  const reviews = isFeatured ? await getProductReviewSummary(product.id) : null

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="group">
      <div data-testid="product-wrapper">
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
          isFeatured={isFeatured}
        />
        <div className={isFeatured ? "mt-5 flex flex-col gap-3" : "flex txt-compact-medium mt-4 justify-between"}>
          <Text className="font-heading text-xl leading-7 text-homestead-ink" data-testid="product-title">
            {product.title}
          </Text>
          <div className={`flex flex-wrap items-center gap-x-2 ${isFeatured ? "font-nav text-base font-medium text-homestead-forest" : ""}`}>
            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
            {isFeatured && !cheapestPrice && <span className="text-sm text-homestead-muted">Price unavailable in this region</span>}
          </div>
          {reviews && <PreviewRating count={reviews.count} average={reviews.average} />}
        </div>
      </div>
    </LocalizedClientLink>
  )
}
