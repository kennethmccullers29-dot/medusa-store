import type { Metadata } from "next"
import { getSiteContent } from "@lib/data/site-content"
import ContactForm from "@modules/content/components/contact-form"
import PageBuilder from "@modules/content/components/page-builder"
import { getCmsPage, getCmsSettings } from "../../../../sanity/data"

export async function generateMetadata(): Promise<Metadata> { const page = await getCmsPage("contact"); return { title: page?.seo_title || page?.title || "Contact us", description: page?.seo_description || "Get in touch with our team." } }
export default async function ContactPage({ params }: { params: Promise<{ countryCode: string }> }) {
  const page = await getCmsPage("contact")
  if (page) return <PageBuilder page={page} countryCode={(await params).countryCode} />
  const [legacy, cms] = await Promise.all([getSiteContent(), getCmsSettings()])
  const contact = { heading: cms?.contact_heading || legacy.contact.heading, introduction: cms?.contact_introduction || legacy.contact.introduction, email: cms?.contact_email || legacy.contact.email }
  return <main className="bg-homestead-cream"><div className="content-container grid gap-12 py-16 md:py-24 lg:grid-cols-[0.8fr_1.2fr]"><div><p className="text-xs uppercase tracking-widest text-homestead-olive">Contact us</p><h1 className="mt-4 font-heading text-5xl leading-tight text-homestead-forest md:text-6xl">{contact.heading}</h1><p className="mt-6 whitespace-pre-line leading-8 text-homestead-muted">{contact.introduction}</p><a href={`mailto:${contact.email}`} className="mt-6 inline-block text-sm text-homestead-olive underline">{contact.email}</a></div><ContactForm /></div></main>
}
