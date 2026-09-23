import { cache } from "react"
import { sdk } from "@lib/config"
import { getCmsSettings } from "../../sanity/data"

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
  homepage_sections: [
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
  ] as HomepageSection[],
}
export type HomepageSection =
  | { type: "value_props"; enabled: boolean; items: { title: string; text: string }[] }
  | { type: "intro"; enabled: boolean; eyebrow: string; heading: string; body: string; button_label: string; button_url: string }
  | { type: "categories"; enabled: boolean; eyebrow: string; heading: string }
  | { type: "featured_products"; enabled: boolean; eyebrow: string; heading: string; description: string }
  | { type: "story"; enabled: boolean; eyebrow: string; heading: string; accent: string; body: string; button_label: string; button_url: string; image_url: string; image_alt: string }
  | { type: "cta"; enabled: boolean; eyebrow: string; heading: string; button_label: string; button_url: string }
export type StorefrontSettings = typeof defaultSettings
export const getStorefrontSettings = cache(async (): Promise<StorefrontSettings> => {
  const cms = await getCmsSettings()
  const brand = cms ? { brand_name: cms.brand_name || defaultSettings.brand_name, logo_url: cms.logo_url || "" } : {}
  try {
    const { settings } = await sdk.client.fetch<{ settings: StorefrontSettings }>("/store/storefront-settings", { cache: "no-store" })
    return { ...defaultSettings, ...settings, ...brand }
  } catch { return { ...defaultSettings, ...brand } }
})
