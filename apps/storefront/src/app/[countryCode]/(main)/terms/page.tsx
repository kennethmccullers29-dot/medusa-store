import type { Metadata } from "next"
import { getSiteContent } from "@lib/data/site-content"
import LegalPage, { isStarterPolicy, PolicyPending } from "@modules/content/components/legal-page"
import PageBuilder from "@modules/content/components/page-builder"
import { getCmsPage } from "../../../../sanity/data"

export async function generateMetadata(): Promise<Metadata> { const page = await getCmsPage("terms"); const starter = !page && isStarterPolicy((await getSiteContent()).terms.content); return { title: page?.seo_title || page?.title || "Terms & Conditions", description: page?.seo_description, robots: starter ? { index: false, follow: false } : undefined } }
export default async function InformationPage({ params }: { params: Promise<{ countryCode: string }> }) {
  const page = await getCmsPage("terms")
  if (page) return <PageBuilder page={page} countryCode={(await params).countryCode} />
  const content = (await getSiteContent()).terms
  if (isStarterPolicy(content.content)) return <PolicyPending title={content.title} />
  return <LegalPage title={content.title} content={content.content} updatedAt={content.updated_at} />
}
