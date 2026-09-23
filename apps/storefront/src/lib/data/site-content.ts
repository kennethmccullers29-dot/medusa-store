import { sdk } from "@lib/config"
import type { PortableTextBlock } from "@portabletext/types"
import { sanityConfigured } from "../../sanity/client"
import { getCmsPost, getCmsPosts } from "../../sanity/data"

export type BlogPost = { id: string; title: string; slug: string; excerpt: string; content: string; cover_image_url: string; published: boolean; published_at: string; body?: PortableTextBlock[]; author?: string; image_alt?: string; seo_title?: string; seo_description?: string }
export type SiteContent = { contact: { heading: string; introduction: string; email: string }; privacy: { title: string; content: string; updated_at: string }; terms: { title: string; content: string; updated_at: string }; blog_posts: BlogPost[] }
export async function getSiteContent(): Promise<SiteContent> { return sdk.client.fetch<{ content: SiteContent }>("/store/content", { cache: "no-store" }).then(({ content }) => content) }

function mapPost(post: NonNullable<Awaited<ReturnType<typeof getCmsPost>>>): BlogPost {
  return { id: post._id, title: post.title, slug: post.slug, excerpt: post.excerpt || "", content: "", cover_image_url: post.image_url || "", published: true, published_at: post.published_at, body: post.body, author: post.author, image_alt: post.image_alt, seo_title: post.seo_title, seo_description: post.seo_description }
}
export async function getBlogPosts(): Promise<BlogPost[]> {
  if (sanityConfigured) return (await getCmsPosts()).map(mapPost)
  return (await getSiteContent()).blog_posts.filter(post => post.published)
}
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  if (sanityConfigured) { const post = await getCmsPost(slug); return post ? mapPost(post) : null }
  return (await getBlogPosts()).find(post => post.slug === slug) || null
}
