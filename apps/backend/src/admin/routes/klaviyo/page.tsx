import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Button, Container, Heading, Text } from "@medusajs/ui"
import { useEffect, useState } from "react"

type Status = { enabled: boolean; keyConfigured: boolean; listConfigured: boolean; verified?: boolean; listName?: string; message?: string }
const KlaviyoPage = () => {
  const [status, setStatus] = useState<Status | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const load = async (verify = false) => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch(`/admin/klaviyo${verify ? "?verify=true" : ""}`, { credentials: "include" })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Could not load Klaviyo settings.")
      setStatus(data)
    } catch (error) { setError((error as Error).message) }
    finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [])
  return <Container><Heading level="h1">Klaviyo</Heading><Text className="mt-2 text-ui-fg-subtle">Email signup and customer/order events for your store.</Text>{error && <Text role="alert" className="mt-4 text-ui-fg-error">{error}</Text>}{status && <div className="my-6 grid gap-3"><Text>Integration: {status.enabled ? "Enabled" : "Disabled"}</Text><Text>Private API key: {status.keyConfigured ? "Configured" : "Missing"}</Text><Text>Newsletter list: {status.listConfigured ? "Configured" : "Missing"}</Text>{status.verified && <Text>Connection verified · {status.listName}</Text>}</div>}<Button variant="secondary" isLoading={loading} onClick={() => { void load(true) }}>Check connection</Button><div className="mt-8 grid max-w-2xl gap-3 border-t pt-6"><Heading level="h2">Connect your account</Heading><Text>Create an email list in Klaviyo, then configure KLAVIYO_PRIVATE_API_KEY and KLAVIYO_LIST_ID in the backend environment. Set KLAVIYO_ENABLED=true and restart the backend.</Text><Text>The key needs Events Write, Profiles Write, Lists Read/Write, and Subscriptions Write permissions.</Text><Text>Supported events: Created Account, Placed Order, Ordered Product, and Cancelled Order. Account creation and purchases do not subscribe customers to marketing emails.</Text><Text>Newsletter signup respects your list’s opt-in settings. Enable double opt-in in Klaviyo if you want email confirmation.</Text></div></Container>
}
export const config = defineRouteConfig({ label: "Klaviyo" })
export default KlaviyoPage
