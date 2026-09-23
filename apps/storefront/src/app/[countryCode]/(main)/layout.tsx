import { Metadata } from "next"

import { listCartOptions, retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { getBaseURL } from "@lib/util/env"
import { StoreCartShippingOption } from "@medusajs/types"
import CartMismatchBanner from "@modules/layout/components/cart-mismatch-banner"
import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import AnnouncementBar from "@modules/layout/components/announcement-bar"
import FreeShippingPriceNudge from "@modules/shipping/components/free-shipping-price-nudge"
import { draftMode } from "next/headers"
import { VisualEditing } from "next-sanity/visual-editing"
import { sanityConfigured } from "../../../sanity/client"
import { SanityLive } from "../../../sanity/live"
import CmsPreview from "@modules/content/components/cms-preview"
import { getRewardsSettings } from "@lib/data/rewards"
import RewardsPanel from "@modules/layout/components/rewards-panel"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PageLayout(props: {
  children: React.ReactNode
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const preview = (await draftMode()).isEnabled
  const customer = await retrieveCustomer()
  const rewardsSettings = await getRewardsSettings()
  const cart = await retrieveCart()
  let shippingOptions: StoreCartShippingOption[] = []

  if (cart) {
    const { shipping_options } = await listCartOptions()

    shippingOptions = shipping_options
  }

  return (
    <>
      <AnnouncementBar />
      <Nav countryCode={countryCode} />
      {customer && cart && (
        <CartMismatchBanner customer={customer} cart={cart} />
      )}

      {cart && (
        <FreeShippingPriceNudge
          variant="popup"
          cart={cart}
          shippingOptions={shippingOptions}
        />
      )}
      {props.children}
      <Footer />
      {!preview && <RewardsPanel settings={rewardsSettings} signedIn={!!customer} />}
      {sanityConfigured && <SanityLive />}
      {sanityConfigured && preview && <><meta name="robots" content="noindex,nofollow" /><VisualEditing /><CmsPreview /></>}
    </>
  )
}
