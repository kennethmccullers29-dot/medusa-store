import { Metadata } from "next"

import Hero from "@modules/home/components/hero"
import { getRegion } from "@lib/data/regions"
import HomepageContent from "@modules/home/components/homepage-content"
import { getStorefrontSettings } from "@lib/data/storefront-settings"
import { getCmsPage } from "../../../sanity/data"
import PageBuilder from "@modules/content/components/page-builder"

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getCmsPage("home"), getStorefrontSettings()])
  return { title: page?.seo_title || settings.brand_name, description: page?.seo_description || "Thoughtfully chosen pieces for slower, softer days." }
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const [region, settings, page] = await Promise.all([
    getRegion(countryCode),
    getStorefrontSettings(),
    getCmsPage("home"),
  ])

  if (!region) {
    return null
  }
  if (page) return <PageBuilder page={page} countryCode={countryCode} region={region} />

  return (
    <>
      <Hero />
      <HomepageContent countryCode={countryCode} region={region} sections={settings.homepage_sections} />
    </>
  )
}
