import { createClient } from "next-sanity"

export const sanityConfigured = !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "unconfigured",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2025-02-19",
  useCdn: false,
  stega: { studioUrl: "/studio" },
})
