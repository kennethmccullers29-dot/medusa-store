import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Button, Container, Heading, Input, Label, Switch, Text, toast } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { sdk } from "../../lib/sdk"
import { studioUrl } from "../../lib/storefront-url"

type NavigationLink = { label: string; url: string; enabled: boolean }
type Settings = { navigation_links: NavigationLink[]; [key: string]: unknown }

const NavigationPage = () => {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setError("")
    try {
      const result = await sdk.client.fetch<{ settings: Settings }>("/admin/storefront-settings")
      setSettings(result.settings)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load navigation.")
    }
  }
  useEffect(() => { void load() }, [])

  const updateLinks = (navigation_links: NavigationLink[]) =>
    setSettings((current) => current && { ...current, navigation_links })
  const updateLink = (index: number, patch: Partial<NavigationLink>) => {
    if (!settings) return
    updateLinks(settings.navigation_links.map((link, i) => i === index ? { ...link, ...patch } : link))
  }
  const moveLink = (index: number, direction: -1 | 1) => {
    if (!settings) return
    const links = [...settings.navigation_links]
    const target = index + direction
    if (target < 0 || target >= links.length) return
    const [link] = links.splice(index, 1)
    links.splice(target, 0, link)
    updateLinks(links)
  }
  const save = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!settings) return
    setSaving(true)
    setError("")
    try {
      // Preserve legacy settings used as a fallback when Sanity is unavailable.
      const result = await sdk.client.fetch<{ settings: Settings }>("/admin/storefront-settings", {
        method: "POST",
        body: settings,
      })
      setSettings(result.settings)
      toast.success("Navigation saved")
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save navigation.")
    } finally {
      setSaving(false)
    }
  }

  return <Container className="p-0">
    <div className="border-b px-6 py-4">
      <Heading level="h1">Navigation</Heading>
      <Text className="mt-1 text-ui-fg-subtle">Choose the links that appear beside Home and Shop in the storefront header.</Text>
    </div>
    <div className="grid max-w-3xl gap-6 px-6 py-6">
      <div className="rounded-lg border bg-ui-bg-subtle p-5">
        <Heading level="h2">Editing the website?</Heading>
        <Text className="mt-2 text-ui-fg-subtle">Use Sanity Studio for the site name, logo, homepage, pages, journal, and shipping information. Create a page there, then add its path to the navigation here.</Text>
        <a className="mt-3 inline-block font-medium underline" href={studioUrl} target="_blank" rel="noopener noreferrer">Open Sanity Studio</a>
      </div>
      {error && <Text className="text-ui-fg-error" role="alert">{error}</Text>}
      {!settings ? <div><Text>{error ? "Navigation unavailable." : "Loading navigation…"}</Text>{error && <Button className="mt-3" onClick={load}>Try again</Button>}</div> :
        <form onSubmit={save} className="grid gap-5">
          <Text className="text-ui-fg-subtle">Use a site path such as /about-us, /blog, or /shipping-returns, or a full https:// URL. You can add up to eight links.</Text>
          {settings.navigation_links.map((link, index) => <div key={index} className="grid gap-4 rounded-lg border p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2"><Label htmlFor={`nav-label-${index}`}>Link text</Label><Input id={`nav-label-${index}`} value={link.label} required maxLength={40} onChange={(event) => updateLink(index, { label: event.target.value })} /></div>
              <div className="grid gap-2"><Label htmlFor={`nav-url-${index}`}>Destination</Label><Input id={`nav-url-${index}`} value={link.url} required maxLength={2048} onChange={(event) => updateLink(index, { url: event.target.value })} /></div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Label htmlFor={`nav-enabled-${index}`}>Show link</Label><Switch id={`nav-enabled-${index}`} checked={link.enabled} onCheckedChange={(enabled) => updateLink(index, { enabled })} />
              <Button type="button" variant="secondary" size="small" disabled={index === 0} onClick={() => moveLink(index, -1)}>Move up</Button>
              <Button type="button" variant="secondary" size="small" disabled={index === settings.navigation_links.length - 1} onClick={() => moveLink(index, 1)}>Move down</Button>
              <Button type="button" variant="secondary" size="small" onClick={() => updateLinks(settings.navigation_links.filter((_, i) => i !== index))}>Remove</Button>
            </div>
          </div>)}
          <div className="flex gap-3">
            <Button type="button" variant="secondary" disabled={settings.navigation_links.length >= 8} onClick={() => updateLinks([...settings.navigation_links, { label: "", url: "", enabled: true }])}>Add link</Button>
            <Button type="submit" isLoading={saving}>Save navigation</Button>
          </div>
        </form>}
    </div>
  </Container>
}

export const config = defineRouteConfig({ label: "Navigation" })
export default NavigationPage
