import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { updateStoresWorkflow } from "@medusajs/medusa/core-flows"
import { readSettings, settingsSchema } from "../../../lib/storefront-settings"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const [store] = await req.scope.resolve(Modules.STORE).listStores()
  res.json({ settings: readSettings(store?.metadata ?? null) })
}
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = settingsSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues.map((issue) => issue.message).join(" ") })
    return
  }
  const [store] = await req.scope.resolve(Modules.STORE).listStores()
  if (!store) { res.status(404).json({ message: "Store not found." }); return }
  await updateStoresWorkflow(req.scope).run({ input: {
    selector: { id: store.id }, update: { metadata: { ...store.metadata, storefront_settings: parsed.data } },
  } })
  res.json({ settings: parsed.data })
}
