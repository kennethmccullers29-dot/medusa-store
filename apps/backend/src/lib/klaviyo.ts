export const klaviyoStatus = () => ({ enabled: process.env.KLAVIYO_ENABLED === "true", keyConfigured: !!process.env.KLAVIYO_PRIVATE_API_KEY, listConfigured: !!process.env.KLAVIYO_LIST_ID })
export const klaviyoReady = () => { const status = klaviyoStatus(); return status.enabled && status.keyConfigured }

export async function klaviyoRequest(path: string, body?: unknown, fetcher: typeof fetch = fetch) {
  if (!klaviyoReady()) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Klaviyo is not configured.")
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetcher(`https://a.klaviyo.com/api/${path}`, {
      method: body ? "POST" : "GET",
      headers: { Authorization: `Klaviyo-API-Key ${process.env.KLAVIYO_PRIVATE_API_KEY}`, revision: "2026-07-15", accept: "application/vnd.api+json", "Content-Type": "application/vnd.api+json" },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(10000),
    })
    if (response.ok) return response
    if ((response.status === 429 || response.status >= 500) && attempt < 2) {
      const delay = Math.min(5, Math.max(1, Number(response.headers.get("Retry-After")) || attempt + 1))
      await new Promise(resolve => setTimeout(resolve, delay * 1000))
      continue
    }
    throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, `Klaviyo request failed (${response.status}). Check API scopes and connection settings.`)
  }
  throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, "Klaviyo request failed.")
}

export function subscriptionPayload(email: string, listId: string) {
  return { data: { type: "profile-subscription-bulk-create-job", attributes: { custom_source: "Storefront newsletter", profiles: { data: [{ type: "profile", attributes: { email, subscriptions: { email: { marketing: { consent: "SUBSCRIBED" } } } } }] } }, relationships: { list: { data: { type: "list", id: listId } } } } }
}
export function eventPayload(input: { name: string; uniqueId: string; email: string; properties: Record<string, unknown>; time?: string; value?: number; currency?: string; firstName?: string; lastName?: string }) {
  return { data: { type: "event", attributes: { unique_id: input.uniqueId, ...(input.time ? { time: input.time } : {}), ...(input.value !== undefined ? { value: input.value, value_currency: input.currency?.toUpperCase() } : {}), properties: input.properties, metric: { data: { type: "metric", attributes: { name: input.name } } }, profile: { data: { type: "profile", attributes: { email: input.email, ...(input.firstName ? { first_name: input.firstName } : {}), ...(input.lastName ? { last_name: input.lastName } : {}) } } } } } }
}
import { MedusaError } from "@medusajs/framework/utils"
