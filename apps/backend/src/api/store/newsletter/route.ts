import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"
import { klaviyoReady, klaviyoStatus } from "../../../lib/klaviyo"
import { subscribeNewsletterWorkflow } from "../../../workflows/subscribe-newsletter"

const schema = z.object({ email: z.string().trim().email().max(254), consent: z.literal(true), website: z.string().max(200).optional() }).strict()
export const GET = async (_req: MedusaRequest, res: MedusaResponse) => {
  res.setHeader("Cache-Control", "no-store")
  res.json({ available: klaviyoReady() && klaviyoStatus().listConfigured })
}
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ message: "Enter a valid email and agree to receive emails." }); return }
  if (parsed.data.website) { res.status(202).json({ accepted: true }); return }
  if (!klaviyoReady() || !klaviyoStatus().listConfigured) { res.status(503).json({ message: "Newsletter signup is temporarily unavailable." }); return }
  try {
    await subscribeNewsletterWorkflow(req.scope).run({ input: { email: parsed.data.email } })
    res.status(202).json({ accepted: true })
  } catch { res.status(502).json({ message: "We couldn’t process your signup. Please try again later." }) }
}
