import { writeFile } from "fs/promises"
import { resolve } from "path"
import type { ExecArgs } from "@medusajs/framework/types"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { readSettings } from "../lib/storefront-settings"
import { readSiteContent } from "../lib/site-content"

const portable = (text: string) => text.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => ({ _key: `paragraph-${index}`, _type: "block", style: "normal", markDefs: [], children: [{ _key: `span-${index}`, _type: "span", marks: [], text: paragraph }] }))

export default async function exportSanity({ container }: ExecArgs) {
  const [store] = await container.resolve(Modules.STORE).listStores()
  const settings = readSettings(store?.metadata || null)
  const content = readSiteContent(store?.metadata || null)
  const section = (value: typeof settings.homepage_sections[number], index: number) => ({ ...value, _type: value.type, _key: `section-${index}`, ...(value.type === "value_props" ? { items: (value.items || []).map((item, itemIndex) => ({ ...item, _key: `item-${itemIndex}` })) } : {}) })
  const documents: Record<string, unknown>[] = [
    { _id: "site-settings", _type: "siteSettings", brand_name: settings.brand_name, logo_url: settings.logo_url || undefined, contact_heading: content.contact.heading, contact_introduction: content.contact.introduction, contact_email: content.contact.email },
    { _id: "homepage", _type: "page", title: "Homepage", slug: { _type: "slug", current: "home" }, sections: [{ _key: "hero", _type: "hero", enabled: settings.hero_enabled, eyebrow: settings.hero_eyebrow, heading: settings.hero_title, accent: settings.hero_accent, description: settings.hero_description, button_label: settings.hero_button_label, button_url: settings.hero_button_url, image_url: settings.hero_image_url || undefined, image_alt: settings.hero_image_alt }, ...settings.homepage_sections.map(section)], seo_title: settings.brand_name, seo_description: settings.hero_description },
    ...(["privacy", "terms"] as const).map(slug => ({ _id: `page-${slug}`, _type: "page", title: content[slug].title, slug: { _type: "slug", current: slug }, sections: [{ _key: "body", _type: "rich_text", enabled: true, body: portable(content[slug].content) }] })),
    { _id: "page-contact", _type: "page", title: "Contact us", slug: { _type: "slug", current: "contact" }, sections: [{ _key: "introduction", _type: "rich_text", enabled: true, heading: content.contact.heading, body: portable(`${content.contact.introduction}\n\n${content.contact.email}`) }, { _key: "contact-form", _type: "contact_form", enabled: true }] },
    ...content.blog_posts.map(post => ({ _id: `${post.published ? "" : "drafts."}post-${post.slug}`, _type: "post", title: post.title, slug: { _type: "slug", current: post.slug }, excerpt: post.excerpt, body: portable(post.content), image_url: post.cover_image_url || undefined, published_at: post.published_at })),
  ]
  if (new Set(content.blog_posts.map(post => post.slug)).size !== content.blog_posts.length) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Blog slugs must be unique before migration")
  const path = resolve(process.env.SANITY_EXPORT_PATH || "../../sanity-export.ndjson")
  await writeFile(path, documents.map(document => JSON.stringify(document)).join("\n") + "\n")
  console.log(`Exported ${documents.length} website documents to ${path}. Customer data and contact messages were excluded.`)
}
