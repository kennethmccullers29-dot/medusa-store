import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { readAnnouncement } from "../../../lib/announcement"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const [store] = await req.scope.resolve(Modules.STORE).listStores()
  const announcement = readAnnouncement(store?.metadata ?? null)
  res.setHeader("Cache-Control", "no-store")
  res.json({ announcement: announcement.enabled ? announcement : null })
}
