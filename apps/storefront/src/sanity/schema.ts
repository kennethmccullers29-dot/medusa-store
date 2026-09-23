import { defineArrayMember, defineField, defineType } from "sanity"
import ProductPicker from "./components/product-picker"
import ReviewPicker from "./components/review-picker"

const safeLink = (value: unknown) => {
  if (!value) return true
  if (typeof value !== "string") return "Enter a link"
  if (value.startsWith("/") && !value.startsWith("//")) return true
  try { return ["https:", "http:", "mailto:"].includes(new URL(value).protocol) || "Use a website URL or a path beginning with /" } catch { return "Enter a valid link" }
}
const text = (name: string, title: string, type: "string" | "text" = "string") => defineField({ name, title, type })
const enabled = defineField({ name: "enabled", title: "Show this section", type: "boolean", initialValue: true })
const eyebrow = text("eyebrow", "Small heading")
const heading = text("heading", "Heading")
const button = [text("button_label", "Button label"), defineField({ name: "button_url", title: "Button link", type: "string", validation: rule => rule.custom(safeLink) })]
const picture = defineField({ name: "image", title: "Image", type: "image", options: { hotspot: true }, fields: [defineField({ name: "alt", title: "Alternative text", type: "string", description: "Describe the image for people using screen readers", validation: rule => rule.required() })] })
const legacyImage = [defineField({ name: "image_url", title: "Existing image URL", type: "url", description: "Preserved by the migration. Upload an image above to replace it." }), text("image_alt", "Existing image alternative text")]

const richText = defineType({ name: "richText", title: "Rich text", type: "array", of: [defineArrayMember({ type: "block", styles: [{ title: "Paragraph", value: "normal" }, { title: "Heading 2", value: "h2" }, { title: "Heading 3", value: "h3" }, { title: "Quote", value: "blockquote" }], marks: { decorators: [{ title: "Strong", value: "strong" }, { title: "Emphasis", value: "em" }], annotations: [{ name: "link", type: "object", title: "Link", fields: [{ name: "href", type: "string", title: "URL", validation: rule => rule.required().custom(safeLink) }] }] } }), defineArrayMember({ type: "image", options: { hotspot: true }, fields: [{ name: "alt", type: "string", title: "Alternative text", validation: rule => rule.required() }, { name: "caption", type: "string", title: "Caption" }] })] })
const section = (name: string, title: string, fields: ReturnType<typeof defineField>[]) => defineType({ name, title, type: "object", fields: [enabled, ...fields], preview: { select: { title: "heading", enabled: "enabled", media: "image" }, prepare: value => ({ title: value.title || title, subtitle: `${title}${value.enabled === false ? " · Hidden" : ""}`, media: value.media }) } })

const sections = [
  section("customer_reviews", "Customer reviews", [eyebrow, heading, text("description", "Description", "text"), defineField({ name: "review_ids", title: "Featured reviews", type: "array", of: [{ type: "string" }], components: { input: ReviewPicker }, validation: rule => rule.max(6).unique() })]),
  section("hero", "Hero banner", [eyebrow, heading, text("accent", "Italic heading line"), text("description", "Description", "text"), picture, ...legacyImage, ...button]),
  section("value_props", "Benefits strip", [defineField({ name: "items", title: "Benefits", type: "array", validation: rule => rule.min(1).max(4), of: [{ type: "object", fields: [text("title", "Title"), text("text", "Description")], preview: { select: { title: "title" } } }] })]),
  section("intro", "Introduction", [eyebrow, heading, text("body", "Description", "text"), ...button]),
  section("categories", "Shop categories", [eyebrow, heading]),
  section("featured_products", "Product collection", [eyebrow, heading, text("description", "Description", "text"), defineField({ name: "product_handles", title: "Featured products", type: "array", of: [{ type: "string" }], components: { input: ProductPicker }, description: "Search your Medusa catalog, select up to eight products, and arrange their display order.", validation: rule => rule.max(8).unique() })]),
  section("story", "Image & story", [eyebrow, heading, text("accent", "Italic heading line"), text("body", "Description", "text"), picture, ...legacyImage, ...button]),
  section("cta", "Call to action", [eyebrow, heading, ...button]),
  section("rich_text", "Rich text section", [heading, defineField({ name: "body", title: "Content", type: "richText" })]),
  section("image_section", "Full-width image", [picture, ...legacyImage, text("caption", "Caption")]),
  section("faq", "Questions & answers", [heading, defineField({ name: "items", title: "Questions", type: "array", of: [{ type: "object", fields: [text("question", "Question"), text("answer", "Answer", "text")], preview: { select: { title: "question" } } }] })]),
  section("latest_posts", "Latest journal posts", [eyebrow, heading]),
  section("contact_form", "Contact form", [heading]),
]

const reserved = ["account", "cart", "checkout", "store", "products", "categories", "collections", "blog", "rewards", "search", "studio", "api", "order"]
const page = defineType({ name: "page", title: "Page", type: "document", groups: [{ name: "content", title: "Page builder", default: true }, { name: "seo", title: "Search engines" }], fields: [
  defineField({ name: "title", title: "Page name", type: "string", group: "content", validation: rule => rule.required() }),
  defineField({ name: "slug", title: "URL slug", type: "slug", group: "content", options: { source: "title", maxLength: 100 }, description: "Use home for the homepage; about for /about. Privacy, terms, and contact can also be replaced here.", validation: rule => rule.required().custom(value => !value?.current || (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.current) && !reserved.includes(value.current)) || "Use a lowercase slug that is not a reserved store route") }),
  defineField({ name: "sections", title: "Page sections", type: "array", group: "content", description: "Drag section handles to reorder here, or use Presentation to drag sections in the live page preview. Publish when ready.", options: { sortable: true, insertMenu: { filter: true, showIcons: true, groups: [{ name: "shop", title: "Shop", of: ["hero", "categories", "featured_products", "cta"] }, { name: "story", title: "Brand & education", of: ["intro", "value_props", "story", "rich_text", "image_section", "faq"] }, { name: "community", title: "Community", of: ["latest_posts", "customer_reviews", "contact_form"] }] } }, of: sections.map(type => ({ type: type.name })), validation: rule => rule.max(40) }),
  defineField({ name: "seo_title", title: "SEO title", type: "string", group: "seo", validation: rule => rule.max(160) }),
  defineField({ name: "seo_description", title: "SEO description", type: "text", group: "seo", validation: rule => rule.max(300) }),
], preview: { select: { title: "title", slug: "slug.current" }, prepare: ({ title, slug }) => ({ title, subtitle: slug === "home" ? "Homepage" : `/${slug}` }) } })

const post = defineType({ name: "post", title: "Journal post", type: "document", fields: [
  defineField({ name: "title", title: "Title", type: "string", validation: rule => rule.required().max(160) }),
  defineField({ name: "slug", title: "URL slug", type: "slug", options: { source: "title", maxLength: 100 }, validation: rule => rule.required() }),
  text("excerpt", "Excerpt", "text"), picture, ...legacyImage,
  text("author", "Author name"),
  defineField({ name: "published_at", title: "Publication date", type: "datetime", initialValue: () => new Date().toISOString(), validation: rule => rule.required() }),
  defineField({ name: "body", title: "Article", type: "richText", validation: rule => rule.required() }),
  text("seo_title", "SEO title"), text("seo_description", "SEO description", "text"),
], orderings: [{ title: "Newest first", name: "dateDesc", by: [{ field: "published_at", direction: "desc" }] }], preview: { select: { title: "title", subtitle: "author", media: "image" } } })

const settings = defineType({ name: "siteSettings", title: "Site settings", type: "document", fields: [
  defineField({ name: "brand_name", title: "Site name", type: "string", validation: rule => rule.required() }),
  defineField({ name: "logo", title: "Logo", type: "image", description: "Leave empty to use the site name in Playfair" }),
  defineField({ name: "logo_url", title: "Existing logo URL", type: "url", description: "Preserved by migration. Upload a logo above to replace it." }),
  text("contact_heading", "Contact page heading"), text("contact_introduction", "Contact page introduction", "text"),
  defineField({ name: "contact_email", title: "Contact email", type: "string", validation: rule => rule.email() }),
], preview: { prepare: () => ({ title: "Site settings" }) } })

export const schemaTypes = [richText, ...sections, page, post, settings]

