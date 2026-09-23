import { MedusaError } from "@medusajs/framework/utils"

export type ShippoRate = {
  object_id: string
  amount: string
  currency: string
  carrier_account: string
  servicelevel: { token: string; name: string }
}
export type ShippoAddress = {
  name: string
  street1: string
  street2?: string
  city: string
  state?: string
  zip: string
  country: string
  phone?: string
  email?: string
}
export type ShippoParcel = {
  weight: string
  mass_unit: "g"
  length: string
  width: string
  height: string
  distance_unit: "cm"
}
export type ShippoShipment = {
  object_id: string
  address_from: ShippoAddress
  address_to: ShippoAddress
  parcels: ShippoParcel[]
  rates: ShippoRate[]
}
export type ShippoTransaction = {
  object_id: string
  status: string
  label_url: string
  tracking_number?: string
  tracking_url_provider?: string
}
export type ShippoCarrier = {
  object_id: string
  active: boolean
  carrier: string
  carrier_name?: string
  service_levels: { name: string; token: string }[]
}

export default class ShippoClient {
  constructor(private token: string) {}

  async request<T>(path: string, body?: unknown): Promise<T> {
    if (!this.token) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Set SHIPPO_API_TOKEN in the backend environment to use Shippo")
    }
    let response: Response
    try {
      response = await fetch(`https://api.goshippo.com${path}`, {
        method: body === undefined ? "GET" : "POST",
        headers: {
          Authorization: `ShippoToken ${this.token}`,
          "Content-Type": "application/json",
          "SHIPPO-API-VERSION": "2018-02-08",
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(30000),
      })
    } catch {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Shippo could not be reached. For a label request, check Shippo before retrying to avoid buying a duplicate label")
    }
    if (!response.ok) {
      const hint = response.status === 401 || response.status === 403
        ? "Check your Shippo API token and account access"
        : "Check the shipping addresses, parcel details, and Shippo account"
      throw new MedusaError(MedusaError.Types.INVALID_DATA, `Shippo request failed (HTTP ${response.status}). ${hint}`)
    }
    try {
      return await response.json() as T
    } catch {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Shippo returned an invalid response")
    }
  }

  async carriers(): Promise<ShippoCarrier[]> {
    const carriers: ShippoCarrier[] = []
    for (let page = 1; page <= 100; page++) {
      const result = await this.request<{ results: ShippoCarrier[]; next: string | null }>(`/carrier_accounts/?service_levels=true&results=100&page=${page}`)
      carriers.push(...result.results)
      if (!result.next) return carriers
    }
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Too many Shippo carrier accounts to load")
  }
}
