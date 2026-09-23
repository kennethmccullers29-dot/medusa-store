import { defineEnableDraftMode } from "next-sanity/draft-mode"
import { sanityClient, sanityConfigured } from "../../../../sanity/client"

export async function GET(request: Request) {
  if (!sanityConfigured || !process.env.SANITY_API_READ_TOKEN) return Response.json({ message: "Configure Sanity and a server-only Viewer token to enable draft preview" }, { status: 503 })
  return defineEnableDraftMode({ client: sanityClient.withConfig({ token: process.env.SANITY_API_READ_TOKEN }) }).GET(request)
}
