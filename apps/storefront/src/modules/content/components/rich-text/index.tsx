import { PortableText } from "@portabletext/react"
import type { PortableTextBlock } from "@portabletext/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export function safeContentLink(href: unknown): href is string {
  if (typeof href !== "string") return false
  if (href.startsWith("/") && !href.startsWith("//")) return true
  try { return ["https:", "http:", "mailto:"].includes(new URL(href).protocol) } catch { return false }
}
export default function RichText({ value }: { value: PortableTextBlock[] }) {
  return <div className="space-y-6 text-base leading-8 text-homestead-ink"><PortableText value={value} components={{
    block: {
      h2: ({ children }) => <h2 className="pt-5 font-heading text-3xl leading-tight text-homestead-forest">{children}</h2>,
      h3: ({ children }) => <h3 className="pt-3 font-heading text-2xl text-homestead-forest">{children}</h3>,
      blockquote: ({ children }) => <blockquote className="border-l-2 border-homestead-olive pl-6 font-heading text-2xl italic text-homestead-forest">{children}</blockquote>,
    },
    list: { bullet: ({ children }) => <ul className="list-disc space-y-2 pl-6">{children}</ul>, number: ({ children }) => <ol className="list-decimal space-y-2 pl-6">{children}</ol> },
    marks: { link: ({ value, children }) => safeContentLink(value?.href) ? value.href.startsWith("/") ? <LocalizedClientLink href={value.href} className="text-homestead-olive underline underline-offset-4">{children}</LocalizedClientLink> : <a href={value.href} className="text-homestead-olive underline underline-offset-4">{children}</a> : <>{children}</> },
    types: { image: ({ value }) => value.asset?.url ? <figure><img src={value.asset.url} alt={value.alt || ""} className="w-full rounded-sm" />{value.caption && <figcaption className="mt-2 text-sm text-homestead-muted">{value.caption}</figcaption>}</figure> : null },
  }} /></div>
}
