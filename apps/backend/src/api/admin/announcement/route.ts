import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { updateStoresWorkflow } from "@medusajs/medusa/core-flows"
import { announcementSchema, readAnnouncement } from "../../../lib/announcement"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const [store] = await req.scope.resolve(Modules.STORE).listStores()
  res.json({ announcement: readAnnouncement(store?.metadata ?? null) })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = announcementSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues.map((issue) => issue.message).join(" ") })
    return
  }
  const [store] = await req.scope.resolve(Modules.STORE).listStores()
  if (!store) {
    res.status(404).json({ message: "Store not found." })
    return
  }
  await updateStoresWorkflow(req.scope).run({
    input: {
      selector: { id: store.id },
      update: { metadata: { ...store.metadata, announcement_bar: parsed.data } },
    },
  })
  res.json({ announcement: parsed.data })
}
