import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { klaviyoReady, klaviyoRequest, klaviyoStatus } from "../../../lib/klaviyo"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const status = klaviyoStatus()
  res.setHeader("Cache-Control", "no-store")
  if (req.query.verify !== "true") { res.json(status); return }
  if (!klaviyoReady() || !status.listConfigured) { res.status(400).json({ ...status, message: "Set KLAVIYO_ENABLED, KLAVIYO_PRIVATE_API_KEY, and KLAVIYO_LIST_ID in the backend environment." }); return }
  try {
    const response = await klaviyoRequest(`lists/${encodeURIComponent(process.env.KLAVIYO_LIST_ID!)}/`)
    const data = await response.json()
    res.json({ ...status, verified: true, listName: data.data?.attributes?.name })
  } catch (error) { res.status(502).json({ ...status, message: (error as Error).message }) }
}
