import type { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import PageBuilder from "@modules/content/components/page-builder"
import { getCmsPage } from "../../../../sanity/data"

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPage("shipping-returns")
  return {
    title: page?.seo_title || page?.title || "Shipping & Returns",
    description: page?.seo_description,
  }
}

export default async function ShippingReturnsPage({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const page = await getCmsPage("shipping-returns")
  if (page) return <PageBuilder page={page} countryCode={(await params).countryCode} />

  return (
    <main className="content-container py-16 md:py-24">
      <div className="mx-auto max-w-2xl space-y-7">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-homestead-forest">Help with your order</p>
        <h1 className="font-heading text-4xl text-homestead-forest md:text-5xl">Shipping & Returns</h1>
        <div className="space-y-4 leading-7">
          <p>Shipping options and costs are shown at checkout after you enter your address. Delivery timing depends on the destination and selected service.</p>
          <p>If you have a question about your order or a possible return, please contact us before sending an item back. Include your order number so we can help.</p>
        </div>
        <LocalizedClientLink href="/contact" className="inline-block font-semibold underline underline-offset-4">
          Contact us
        </LocalizedClientLink>
      </div>
    </main>
  )
}
