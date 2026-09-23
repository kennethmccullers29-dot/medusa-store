import { defineConfig } from "sanity"
import { structureTool } from "sanity/structure"
import { presentationTool } from "sanity/presentation"
import { schemaTypes } from "./schema"

export default defineConfig({
  name: "storefront", title: "Storefront CMS", basePath: "/studio",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "unconfigured",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  plugins: [structureTool({ structure: S => S.list().title("Website").items([
    S.listItem().title("Site settings").child(S.document().schemaType("siteSettings").documentId("site-settings")),
    S.listItem().title("Homepage").child(S.document().schemaType("page").documentId("homepage")),
    S.documentTypeListItem("page").title("Pages"),
    S.documentTypeListItem("post").title("Journal / Blog"),
  ]) }), presentationTool({ previewUrl: { origin: process.env.NEXT_PUBLIC_STOREFRONT_URL || "http://localhost:8000", preview: `/${process.env.NEXT_PUBLIC_DEFAULT_REGION || "dk"}`, draftMode: { enable: "/api/draft-mode/enable" } }, resolve: { locations: {
    page: { select: { title: "title", slug: "slug.current" }, resolve: document => ({ locations: document?.slug ? [{ title: document.title || "Page", href: `/${process.env.NEXT_PUBLIC_DEFAULT_REGION || "dk"}${document.slug === "home" ? "" : `/${document.slug}`}` }] : [] }) },
    post: { select: { title: "title", slug: "slug.current" }, resolve: document => ({ locations: document?.slug ? [{ title: document.title || "Article", href: `/${process.env.NEXT_PUBLIC_DEFAULT_REGION || "dk"}/blog/${document.slug}` }] : [] }) },
  } } })],
  schema: { types: schemaTypes },
})
