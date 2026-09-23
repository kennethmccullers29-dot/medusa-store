import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Button, Container, Heading, Input, Label, Switch, Text, Textarea, toast } from "@medusajs/ui"
import { useEffect, useState } from "react"

type Announcement = { enabled: boolean; message: string; link_label: string; link_url: string }

const AnnouncementPage = () => {
  const [value, setValue] = useState<Announcement | null>(null)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setError("")
    try {
      const response = await fetch("/admin/announcement", { credentials: "include" })
      if (!response.ok) throw new Error("Could not load the announcement. Please try again.")
      setValue((await response.json()).announcement)
    } catch (error) { setError((error as Error).message) }
  }
  useEffect(() => { void load() }, [])

  const save = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError("")
    try {
      const response = await fetch("/admin/announcement", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(value),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Could not save the announcement.")
      setValue(data.announcement)
      toast.success("Announcement saved")
    } catch (error) { setError((error as Error).message) }
    finally { setSaving(false) }
  }

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h1">Announcement bar</Heading>
        <Text className="text-ui-fg-subtle">Share a short update at the top of your storefront.</Text>
      </div>
      <div className="px-6 py-6">
        {error && <div role="alert" className="mb-4 text-ui-fg-error">{error}</div>}
        {!value ? <><Text>{error ? "Unable to load settings." : "Loading announcement…"}</Text>{error && <Button onClick={load}>Try again</Button>}</> : (
          <form onSubmit={save} className="flex max-w-2xl flex-col gap-6">
            <fieldset disabled={saving} className="flex flex-col gap-6">
              <div className="flex items-center justify-between gap-4">
                <div><Label htmlFor="announcement-enabled">Show announcement</Label><Text className="text-ui-fg-subtle">Turn off to hide the bar without losing your message.</Text></div>
                <Switch id="announcement-enabled" checked={value.enabled} onCheckedChange={(enabled) => setValue({ ...value, enabled })} />
              </div>
              <div className="flex flex-col gap-2"><Label htmlFor="announcement-message">Message</Label><Textarea id="announcement-message" value={value.message} maxLength={240} required={value.enabled} rows={3} placeholder="A little news worth sharing" onChange={(event) => setValue({ ...value, message: event.target.value })} /><Text className="text-ui-fg-subtle">{value.message.length}/240 characters</Text></div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2"><Label htmlFor="announcement-label">Link label (optional)</Label><Input id="announcement-label" value={value.link_label} maxLength={60} placeholder="Shop now" onChange={(event) => setValue({ ...value, link_label: event.target.value })} /></div>
                <div className="flex flex-col gap-2"><Label htmlFor="announcement-url">Link URL (optional)</Label><Input id="announcement-url" value={value.link_url} maxLength={2048} placeholder="/store" onChange={(event) => setValue({ ...value, link_url: event.target.value })} /></div>
              </div>
              <Text className="text-ui-fg-subtle">Use /store for your shop, or a full https:// address for another website.</Text>
            </fieldset>
            <div className="flex flex-col gap-2"><Label>Preview</Label><div className="rounded-lg bg-neutral-950 px-5 py-3 text-center text-sm text-white"><span className="break-words">{value.message || "Your announcement will appear here"}</span>{value.link_label && <span className="ml-3 inline-block underline underline-offset-4">{value.link_label} →</span>}</div>{!value.enabled && <Text className="text-ui-fg-subtle">The bar is currently hidden from customers.</Text>}</div>
            <div><Button type="submit" isLoading={saving}>Save announcement</Button></div>
          </form>
        )}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({ label: "Announcement bar" })
export default AnnouncementPage
