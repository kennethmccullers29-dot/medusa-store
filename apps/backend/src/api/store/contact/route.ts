import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"
import { updateStoresWorkflow } from "@medusajs/medusa/core-flows"
import { randomUUID } from "node:crypto"
import { readSiteContent } from "../../../lib/site-content"

const schema = z.object({ name: z.string().trim().min(2).max(100), email: z.string().trim().email(), subject: z.string().trim().min(2).max(160), message: z.string().trim().min(10).max(5000) })
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ message: "Please complete every field with valid information." }); return }
  const [store] = await req.scope.resolve(Modules.STORE).listStores()
  if (!store) { res.status(404).json({ message: "Store not found." }); return }
  const content = readSiteContent(store.metadata ?? null)
  content.contact_messages = [{ id: randomUUID(), ...parsed.data, status: "new" as const, created_at: new Date().toISOString() }, ...content.contact_messages].slice(0, 500)
  await updateStoresWorkflow(req.scope).run({ input: { selector: { id: store.id }, update: { metadata: { ...store.metadata, site_content: content } } } })
  res.status(201).json({ message: "Thanks! Your message has been received." })
}
