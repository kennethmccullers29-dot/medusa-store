import { z } from "@medusajs/framework/zod"

const safeUrl = (value: string) => {
  if (!value) return true
  if (/[\\\x00-\x20]/.test(value)) return false
  if (value.startsWith("/") && !value.startsWith("//")) return true
  try { return ["http:", "https:"].includes(new URL(value).protocol) } catch { return false }
}
const url = z.string().trim().max(2048).refine(safeUrl, "Use a /path or an http(s) URL.")
export const defaultHomepageSections = [
  { type: "value_props", enabled: true, items: [
    { title: "Thoughtfully chosen", text: "Useful pieces made for everyday living." },
    { title: "Simple by design", text: "Easy to wear, keep, and come back to." },
    { title: "Here for the long haul", text: "A considered collection over constant noise." },
  ] },
  { type: "intro", enabled: true, eyebrow: "The everyday collection", heading: "Good things for slower, softer days.", body: "We collect the pieces that make daily rituals feel considered—comfortable staples, honest materials, and useful things with a little soul.", button_label: "Discover the collection", button_url: "/store" },
  { type: "categories", enabled: true, eyebrow: "Find your favorites", heading: "Shop by category" },
  { type: "featured_products", enabled: true, eyebrow: "Freshly gathered", heading: "Favorites for right now", description: "A few pieces we think deserve a place in your everyday rotation." },
  { type: "story", enabled: true, eyebrow: "Made for the moments between", heading: "Less rushing.", accent: "More noticing.", body: "Morning coffee. A walk with nowhere to be. An afternoon spent making something with your hands. Our collection is designed to feel at home in the parts of life that matter.", button_label: "Shop the story", button_url: "/store", image_url: "", image_alt: "A closer look at our everyday collection" },
  { type: "cta", enabled: true, eyebrow: "Come on in", heading: "There’s always room for one more favorite.", button_label: "Browse all products", button_url: "/store" },
]
const homepageSectionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("value_props"), enabled: z.boolean(), items: z.array(z.object({ title: z.string().trim().min(1).max(80), text: z.string().trim().max(180) })).min(1).max(3) }),
  z.object({ type: z.literal("intro"), enabled: z.boolean(), eyebrow: z.string().trim().max(120), heading: z.string().trim().min(1).max(160), body: z.string().trim().max(700), button_label: z.string().trim().max(60), button_url: url }),
  z.object({ type: z.literal("categories"), enabled: z.boolean(), eyebrow: z.string().trim().max(120), heading: z.string().trim().min(1).max(160) }),
  z.object({ type: z.literal("featured_products"), enabled: z.boolean(), eyebrow: z.string().trim().max(120), heading: z.string().trim().min(1).max(160), description: z.string().trim().max(400) }),
  z.object({ type: z.literal("story"), enabled: z.boolean(), eyebrow: z.string().trim().max(120), heading: z.string().trim().min(1).max(160), accent: z.string().trim().max(120), body: z.string().trim().max(700), button_label: z.string().trim().max(60), button_url: url, image_url: url, image_alt: z.string().trim().max(180) }),
  z.object({ type: z.literal("cta"), enabled: z.boolean(), eyebrow: z.string().trim().max(120), heading: z.string().trim().min(1).max(160), button_label: z.string().trim().max(60), button_url: url }),
])
export const defaultSettings = {
  navigation_links: [{ label: "Journal", url: "/blog", enabled: true }, { label: "Rewards", url: "/rewards", enabled: true }, { label: "Contact", url: "/contact", enabled: true }],
  brand_name: "Medusa Store",
  logo_url: "",
  hero_enabled: true,
  hero_eyebrow: "A slower pace. A little more everyday joy.",
  hero_title: "Make room for",
  hero_accent: "the simple things.",
  hero_description: "Find your next favorite and make the everyday feel a little more like you.",
  hero_button_label: "Explore the shop",
  hero_button_url: "/store",
  hero_image_url: "",
  hero_image_alt: "",
  homepage_sections: defaultHomepageSections,
}
export const settingsSchema = z.object({
  navigation_links: z.array(z.object({ label: z.string().trim().min(1).max(40), url: url.refine(value => !!value, "Provide a link destination."), enabled: z.boolean() })).max(8).default(defaultSettings.navigation_links),
  brand_name: z.string().trim().min(1).max(80),
  logo_url: url,
  hero_enabled: z.boolean(),
  hero_eyebrow: z.string().trim().max(120),
  hero_title: z.string().trim().min(1).max(120),
  hero_accent: z.string().trim().max(120),
  hero_description: z.string().trim().max(500),
  hero_button_label: z.string().trim().max(60),
  hero_button_url: url,
  hero_image_url: url,
  hero_image_alt: z.string().trim().max(180),
  homepage_sections: z.array(homepageSectionSchema).max(6).default(defaultHomepageSections as z.infer<typeof homepageSectionSchema>[]),
}).strict().refine((value) => !!value.hero_button_label === !!value.hero_button_url, {
  message: "Provide both button text and a destination, or leave both blank.",
})
export function readSettings(metadata: Record<string, unknown> | null) {
  const parsed = settingsSchema.safeParse(metadata?.storefront_settings)
  return parsed.success ? parsed.data : defaultSettings
}
