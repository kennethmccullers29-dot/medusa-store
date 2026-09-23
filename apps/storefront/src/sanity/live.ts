import "server-only"
import { defineLive } from "next-sanity/live"
import { sanityClient } from "./client"

export const { sanityFetch, SanityLive } = defineLive({
  client: sanityClient,
  serverToken: process.env.SANITY_API_READ_TOKEN,
})
