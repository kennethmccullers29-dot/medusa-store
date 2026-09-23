import { z } from "@medusajs/framework/zod"

const safeUrl = (value: string) => !value || (value.startsWith("/") && !value.startsWith("//")) || (() => { try { return ["http:", "https:"].includes(new URL(value).protocol) } catch { return false } })()
const url = z.string().trim().max(2048).refine(safeUrl, "Use a valid image URL.")
export const blogPostSchema = z.object({ id: z.string(), title: z.string().trim().min(1).max(160), slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a lowercase URL slug."), excerpt: z.string().trim().max(400), content: z.string().trim().min(1).max(30000), cover_image_url: url, published: z.boolean(), published_at: z.string() })
export const siteContentSchema = z.object({
  contact: z.object({ heading: z.string().trim().min(1).max(160), introduction: z.string().trim().max(1000), email: z.string().trim().email() }),
  privacy: z.object({ title: z.string().trim().min(1).max(160), content: z.string().trim().min(1).max(30000), updated_at: z.string() }),
  terms: z.object({ title: z.string().trim().min(1).max(160), content: z.string().trim().min(1).max(30000), updated_at: z.string() }),
  blog_posts: z.array(blogPostSchema).max(100),
  contact_messages: z.array(z.object({ id: z.string(), name: z.string(), email: z.string(), subject: z.string(), message: z.string(), created_at: z.string(), status: z.enum(["new", "read"]) })).max(500),
})
const now = new Date().toISOString()
export const defaultSiteContent: z.infer<typeof siteContentSchema> = {
  contact: { heading: "We’d love to hear from you.", introduction: "Have a question about an order, a product, or just want to say hello? Send us a note and we’ll get back to you soon.", email: "hello@example.com" },
  privacy: { title: "Privacy Policy", updated_at: now, content: "Your privacy matters to us. We collect only the information needed to process orders, provide customer service, and improve your shopping experience.\n\nInformation we collect\nWe may collect your name, contact details, shipping and billing information, order history, and information you choose to share with us.\n\nHow we use information\nWe use this information to fulfill orders, communicate with you, prevent fraud, and operate our store.\n\nYour choices\nYou may contact us to request access to, correction of, or deletion of your personal information.\n\nContact\nQuestions about this policy can be sent through our Contact page." },
  terms: { title: "Terms & Conditions", updated_at: now, content: "By using this website, you agree to these terms.\n\nOrders\nAll orders are subject to availability and acceptance. Prices and product details may change without notice.\n\nShipping and returns\nShipping estimates are provided during checkout. Return eligibility and instructions are supplied with your order.\n\nWebsite use\nYou may use this website for lawful personal shopping. Site content may not be copied or redistributed without permission.\n\nQuestions\nPlease contact us if you have questions about these terms." },
  blog_posts: [{ id: "welcome", title: "Welcome to our journal", slug: "welcome-to-our-journal", excerpt: "A place for stories, inspiration, and a closer look at the things we love.", content: "Welcome to our journal.\n\nThis is where we’ll share new arrivals, thoughtful stories, behind-the-scenes notes, and simple ideas for making everyday life feel a little more special.", cover_image_url: "", published: true, published_at: now }],
  contact_messages: [],
}
export function readSiteContent(metadata: Record<string, unknown> | null) { const parsed = siteContentSchema.safeParse(metadata?.site_content); return parsed.success ? parsed.data : defaultSiteContent }
