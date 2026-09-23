import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { readSettings } from "../../../lib/storefront-settings"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const [store] = await req.scope.resolve(Modules.STORE).listStores()
  res.setHeader("Cache-Control", "no-store")
  res.json({ settings: readSettings(store?.metadata ?? null) })
}

