import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text } from "@medusajs/ui"
import { Link } from "react-router-dom"

const studio = "http://localhost:8000/studio/structure"
const CmsPage = () => <Container className="p-0">
  <div className="border-b px-6 py-4">
    <Heading level="h1">Website content</Heading>
    <Text className="mt-1 text-ui-fg-subtle">Sanity Studio is the editor for the storefront&apos;s pages and editorial content.</Text>
  </div>
  <div className="grid max-w-3xl gap-6 px-6 py-6">
    <div className="rounded-lg border bg-ui-bg-subtle p-5">
      <Heading level="h2">Edit in Sanity</Heading>
      <Text className="mt-2 text-ui-fg-subtle">Manage the homepage, page sections, journal posts, site name, logo, contact information, and policy pages in Sanity Studio. Publish a page to make it live.</Text>
      <a href={studio} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block font-medium underline">Open Sanity Studio</a>
    </div>
    <div className="rounded-lg border p-5">
      <Heading level="h2">Pages to review</Heading>
      <Text className="mt-2 text-ui-fg-subtle">Create or update pages with the slugs <strong>privacy</strong>, <strong>terms</strong>, and <strong>shipping-returns</strong>. Shipping and returns currently uses neutral fallback copy because your final return rules are undecided. Generic starter privacy and terms text is no longer shown to shoppers; those pages need your reviewed policy content before launch.</Text>
    </div>
    <div className="rounded-lg border p-5">
      <Heading level="h2">Edit in Medusa</Heading>
      <Text className="mt-2 text-ui-fg-subtle">Products, orders, reviews, rewards, and customer messages stay in Medusa Admin. The header link list is managed here so it can point to any published Sanity page.</Text>
      <div className="mt-4 flex flex-wrap gap-5"><Link to="/storefront-settings" className="font-medium underline">Edit navigation links</Link><Link to="/content" className="font-medium underline">View contact messages</Link></div>
    </div>
  </div>
</Container>

export default CmsPage
export const config = defineRouteConfig({ label: "Website content" })
