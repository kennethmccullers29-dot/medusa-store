import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"
export type StoreCreditAccount = { id: string; code: string; currency_code: string; credits: number; debits: number; balance: number; transactions?: { id: string; amount: number; type: string; note?: string; created_at: string }[] }
export async function listStoreCreditAccounts() { const headers = await getAuthHeaders(); if (!headers || !("authorization" in headers)) return []; return sdk.client.fetch<{ store_credit_accounts: StoreCreditAccount[] }>("/store/store-credit-accounts", { headers, query: { fields: "+transactions.*" }, cache: "no-store" }).then(({ store_credit_accounts }) => store_credit_accounts).catch(() => []) }
