"use client"

import type { ReactNode } from "react"
import type { SanityDocument } from "@sanity/client"
import { createDataAttribute } from "next-sanity"
import { useOptimistic } from "next-sanity/hooks"

type Section = { _key: string; _type: string; enabled?: boolean }
type PageDocument = SanityDocument<{ sections?: Section[] }>

export default function EditableSections({ documentId, sections: initialSections, blocks }: {
  documentId: string
  sections: Section[]
  blocks: { key: string; content: ReactNode }[]
}) {
  const sections = useOptimistic<Section[], PageDocument>(initialSections, (current, action) => {
    if (action.id.replace(/^drafts\./, "") !== documentId.replace(/^drafts\./, "")) return current
    return action.document.sections || []
  })
  const attribute = createDataAttribute({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
    baseUrl: "/studio",
    id: documentId,
    type: "page",
    path: "sections",
  })

  return <div data-sanity={attribute.toString()} data-sanity-drag-flow="vertical">
    {!sections.length && <p className="content-container py-16 text-center text-homestead-muted">Add your first section in the Page builder tab.</p>}
    {sections.map(section => <div key={section._key} data-sanity={attribute([{ _key: section._key }]).toString()}>
      {section.enabled === false ? <div className="border border-dashed border-homestead-border bg-homestead-linen/50 p-6 text-center text-sm text-homestead-muted">Hidden section · {section._type.replaceAll("_", " ")}</div> : blocks.find(block => block.key === section._key)?.content || <div className="content-container py-10 text-center text-sm text-homestead-muted">Loading section preview…</div>}
    </div>)}
  </div>
}
