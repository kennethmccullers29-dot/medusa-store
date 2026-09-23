"use client"

import { NextStudio } from "next-sanity/studio"
import config from "../../../sanity/config"

export default function StudioPage() {
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) return <main className="mx-auto max-w-2xl px-6 py-20"><p className="text-xs uppercase tracking-widest text-homestead-olive">Storefront CMS</p><h1 className="mt-4 font-heading text-4xl text-homestead-forest">Connect your Sanity project</h1><p className="mt-5 leading-7">The page builder and journal editor are ready. Create a Sanity project and dataset, then add NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET to the storefront environment and restart it.</p><a href="https://www.sanity.io/manage" className="mt-6 inline-block rounded-sm bg-homestead-olive px-6 py-3 text-white">Open Sanity project settings</a><p className="mt-5 text-sm leading-6 text-homestead-muted">Add http://localhost:8000 as a CORS origin with credentials enabled. See SANITY.md in the project for migration and preview setup.</p></main>
  return <NextStudio config={config} />
}
