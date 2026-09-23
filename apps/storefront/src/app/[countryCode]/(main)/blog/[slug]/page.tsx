import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getBlogPost } from "@lib/data/site-content"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import RichText from "@modules/content/components/rich-text"

type Props = { params: Promise<{ slug: string }> }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getBlogPost((await params).slug)
  return post ? { title: post.seo_title || post.title, description: post.seo_description || post.excerpt, openGraph: { title: post.title, type: "article", images: post.cover_image_url ? [post.cover_image_url] : [] } } : { title: "Article not found" }
}
export default async function ArticlePage({ params }: Props) {
  const post = await getBlogPost((await params).slug)
  if (!post) notFound()
  return <main className="bg-homestead-cream"><article><header className="content-container max-w-4xl py-16 text-center md:py-24"><LocalizedClientLink href="/blog" className="text-xs uppercase tracking-widest text-homestead-olive">← The Journal</LocalizedClientLink><h1 className="mt-6 font-heading text-5xl leading-tight text-homestead-forest md:text-7xl">{post.title}</h1><p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-homestead-muted">{post.excerpt}</p><p className="mt-5 text-sm text-homestead-muted">{post.author && <span>By {post.author} · </span>}<time>{new Date(post.published_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</time></p></header>{post.cover_image_url && <div className="content-container max-w-6xl"><img src={post.cover_image_url} alt={post.image_alt || ""} className="max-h-[680px] w-full rounded-sm object-cover" /></div>}<div className="content-container max-w-3xl py-14 md:py-20">{post.body ? <RichText value={post.body} /> : <div className="whitespace-pre-line text-lg leading-9 text-homestead-ink">{post.content}</div>}</div></article></main>
}
