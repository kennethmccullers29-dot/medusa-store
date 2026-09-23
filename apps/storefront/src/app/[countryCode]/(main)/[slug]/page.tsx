import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getCmsPage } from "../../../../sanity/data"
import PageBuilder from "@modules/content/components/page-builder"

type Props = { params: Promise<{ countryCode: string; slug: string }> }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getCmsPage((await params).slug)
  return page ? { title: page.seo_title || page.title, description: page.seo_description } : { title: "Page not found" }
}
export default async function ContentPage({ params }: Props) {
  const { slug, countryCode } = await params
  if (slug === "home") notFound()
  const page = await getCmsPage(slug)
  if (!page) notFound()
  return <PageBuilder page={page} countryCode={countryCode} />
}
