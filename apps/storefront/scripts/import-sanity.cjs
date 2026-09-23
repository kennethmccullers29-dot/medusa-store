const fs = require("node:fs")
const path = require("node:path")
const { createClient } = require("@sanity/client")
require("dotenv").config({ path: ".env.local", quiet: true })
require("dotenv").config({ path: ".env", quiet: true })

async function main() {
  const source = path.resolve(process.argv.slice(2).find(argument => !argument.startsWith("--")) || "../../sanity-export.ndjson")
  const documents = fs.readFileSync(source, "utf8").split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line))
  if (!documents.every(document => typeof document._id === "string" && ["siteSettings", "page", "post"].includes(document._type))) throw new Error("The export contains invalid document types")
  if (new Set(documents.map(document => document._id)).size !== documents.length) throw new Error("The export contains duplicate IDs")
  const dryRun = process.argv.includes("--dry-run")
  if (dryRun) { console.log(`Validated ${documents.length} documents. No Sanity writes made.`); return }
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || !process.env.SANITY_API_WRITE_TOKEN) throw new Error("Set NEXT_PUBLIC_SANITY_PROJECT_ID and a server-only SANITY_API_WRITE_TOKEN before importing")
  const client = createClient({ projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production", token: process.env.SANITY_API_WRITE_TOKEN, apiVersion: "2025-02-19", useCdn: false })
  for (let offset = 0; offset < documents.length; offset += 50) {
    let transaction = client.transaction()
    for (const document of documents.slice(offset, offset + 50)) transaction = transaction.createIfNotExists(document)
    await transaction.commit()
  }
  console.log(`Imported ${documents.length} documents into Sanity. Existing documents were preserved.`)
}
main().catch(error => { console.error(error.message); process.exitCode = 1 })
