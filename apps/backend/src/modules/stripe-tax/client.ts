import { MedusaError } from "@medusajs/framework/utils"

type StripeError = { error?: { message?: string; code?: string } }

export type StripeTaxCalculation = {
  id: string
  amount_total: number
  currency: string
  line_items: { data: { reference: string; amount: number; amount_tax: number }[]; has_more: boolean }
  shipping_cost?: { amount: number; amount_tax: number } | null
}

export class StripeTaxClient {
  constructor(private readonly apiKey: string) {}

  async get<T>(path: string): Promise<T> {
    if (!this.apiKey.startsWith("sk_")) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Stripe Tax requires a Stripe secret API key")
    let response: Response
    try {
      response = await fetch(`https://api.stripe.com/v1/tax/${path}`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
        signal: AbortSignal.timeout(10000),
      })
    } catch {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Stripe Tax is unavailable; its calculation could not be checked")
    }
    const result = (await response.json()) as T & StripeError
    if (!response.ok) throw new MedusaError(MedusaError.Types.INVALID_DATA, `Stripe Tax: ${result.error?.message || result.error?.code || `HTTP ${response.status}`}`)
    return result
  }

  async post<T>(path: string, body: URLSearchParams, idempotencyKey?: string): Promise<T> {
    if (!this.apiKey.startsWith("sk_")) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Stripe Tax requires a Stripe secret API key")

    let response: Response
    try {
      response = await fetch(`https://api.stripe.com/v1/tax/${path}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
          ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
        },
        body,
        signal: AbortSignal.timeout(10000),
      })
    } catch {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Stripe Tax is unavailable; tax could not be calculated")
    }

    const result = (await response.json()) as T & StripeError
    if (!response.ok) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, `Stripe Tax: ${result.error?.message || result.error?.code || `HTTP ${response.status}`}`)
    }
    return result
  }
}
