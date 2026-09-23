import "server-only"
import { cache } from "react"
import { draftMode } from "next/headers"
import type { PortableTextBlock } from "@portabletext/types"
import { sanityConfigured } from "./client"
import { sanityFetch } from "./live"

export type CmsSection = {
  _key: string; _type: string; enabled?: boolean
  eyebrow?: string; heading?: string; accent?: string; description?: string
  body?: string | PortableTextBlock[]
  button_label?: string; button_url?: string
  image_url?: string; image_alt?: string; caption?: string
  product_handles?: string[]
  review_ids?: string[]
  items?: { _key: string; title?: string; text?: string; question?: string; answer?: string }[]
}
export type CmsPage = { _id: string; title: string; slug: string; seo_title?: string; seo_description?: string; sections?: CmsSection[] }
export type CmsPost = { _id: string; title: string; slug: string; excerpt?: string; body?: PortableTextBlock[]; image_url?: string; image_alt?: string; author?: string; published_at: string; seo_title?: string; seo_description?: string }
export type CmsSettings = { brand_name?: string; logo_url?: string; contact_heading?: string; contact_introduction?: string; contact_email?: string }

const sectionsProjection = `sections[]{..., "image_url": coalesce(image.asset->url,image_url), "image_alt": coalesce(image.alt,image_alt), "body": select(_type == "rich_text" => body[]{..., asset->{_id,url}}, body)}`
const postProjection = `{_id,title,"slug":slug.current,excerpt,body[]{...,asset->{_id,url}},"image_url":coalesce(image.asset->url,image_url),"image_alt":coalesce(image.alt,image_alt),author,published_at,seo_title,seo_description}`

export const getCmsPage = cache(async (slug: string): Promise<CmsPage | null> => {
  if (!sanityConfigured) return null
  const { data } = await sanityFetch({ query: `*[_type == "page" && slug.current == $slug][0]{_id,title,"slug":slug.current,seo_title,seo_description,${sectionsProjection}}`, params: { slug } })
  return data as CmsPage | null
})
export const getCmsSettings = cache(async (): Promise<CmsSettings | null> => {
  if (!sanityConfigured) return null
  const { data } = await sanityFetch({ query: `*[_type == "siteSettings" && _id == "site-settings"][0]{brand_name,"logo_url":coalesce(logo.asset->url,logo_url),contact_heading,contact_introduction,contact_email}` })
  return data as CmsSettings | null
})
export async function getCmsPosts(): Promise<CmsPost[]> {
  if (!sanityConfigured) return []
  const { data } = await sanityFetch({ query: `*[_type == "post" && defined(slug.current) && ($preview || published_at <= now())] | order(published_at desc) ${postProjection}`, params: { preview: (await draftMode()).isEnabled } })
  return data as CmsPost[]
}
export async function getCmsPost(slug: string): Promise<CmsPost | null> {
  if (!sanityConfigured) return null
  const { data } = await sanityFetch({ query: `*[_type == "post" && slug.current == $slug && ($preview || published_at <= now())][0]${postProjection}`, params: { slug, preview: (await draftMode()).isEnabled } })
  return data as CmsPost | null
}
