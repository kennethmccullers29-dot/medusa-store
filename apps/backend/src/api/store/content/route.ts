import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { readSiteContent } from "../../../lib/site-content"

export async function GET(req: MedusaRequest, res: MedusaResponse) { const [store] = await req.scope.resolve(Modules.STORE).listStores(); const { contact_messages: _, ...content } = readSiteContent(store?.metadata ?? null); res.setHeader("Cache-Control", "no-store"); res.json({ content }) }
