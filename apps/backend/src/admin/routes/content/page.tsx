import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Button, Container, Heading, StatusBadge, Text, toast } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { sdk } from "../../lib/sdk"
import { studioUrl } from "../../lib/storefront-url"

type Message = {
  id: string
  name: string
  email: string
  subject: string
  message: string
  created_at: string
  status: "new" | "read"
}
type SiteContent = { contact_messages: Message[]; [key: string]: unknown }

const ContactMessagesPage = () => {
  const [content, setContent] = useState<SiteContent | null>(null)
  const [error, setError] = useState("")
  const [updating, setUpdating] = useState("")

  const load = async () => {
    setError("")
    try {
      const result = await sdk.client.fetch<{ content: SiteContent }>("/admin/content")
      setContent(result.content)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load messages.")
    }
  }
  useEffect(() => { void load() }, [])

  const markRead = async (id: string) => {
    if (!content) return
    setUpdating(id)
    setError("")
    try {
      // The existing endpoint stores the full content record; keep every other field intact.
      const next = {
        ...content,
        contact_messages: content.contact_messages.map((message) =>
          message.id === id ? { ...message, status: "read" as const } : message
        ),
      }
      const result = await sdk.client.fetch<{ content: SiteContent }>("/admin/content", {
        method: "POST",
        body: next,
      })
      setContent(result.content)
      toast.success("Message marked as read")
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update message.")
    } finally {
      setUpdating("")
    }
  }

  const messages = [...(content?.contact_messages ?? [])].sort((a, b) => b.created_at.localeCompare(a.created_at))
  const newCount = messages.filter((message) => message.status === "new").length

  return <Container className="p-0">
    <div className="border-b px-6 py-4">
      <Heading level="h1">Contact messages</Heading>
      <Text className="mt-1 text-ui-fg-subtle">Messages sent through the storefront contact form{content ? ` · ${newCount} new` : ""}.</Text>
    </div>
    <div className="grid max-w-4xl gap-5 px-6 py-6">
      <div className="rounded-lg border bg-ui-bg-subtle p-5">
        <Text>To edit the contact page, journal, privacy and terms pages, or other website content, use Sanity Studio.</Text>
        <a className="mt-2 inline-block font-medium underline" href={studioUrl} target="_blank" rel="noopener noreferrer">Open Sanity Studio</a>
      </div>
      {error && <Text role="alert" className="text-ui-fg-error">{error}</Text>}
      {!content ? <div><Text>{error ? "Messages unavailable." : "Loading messages…"}</Text>{error && <Button className="mt-3" onClick={load}>Try again</Button>}</div>
        : messages.length === 0 ? <Text className="text-ui-fg-subtle">No contact messages yet.</Text>
          : messages.map((message) => <article key={message.id} className="rounded-lg border p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-3"><Heading level="h2">{message.subject}</Heading><StatusBadge color={message.status === "new" ? "orange" : "grey"}>{message.status === "new" ? "New" : "Read"}</StatusBadge></div>
                <Text className="mt-1 text-ui-fg-subtle">{message.name} · <a className="underline" href={`mailto:${message.email}`}>{message.email}</a></Text>
              </div>
              <Text className="text-ui-fg-muted">{new Date(message.created_at).toLocaleString()}</Text>
            </div>
            <Text className="mt-4 whitespace-pre-line">{message.message}</Text>
            {message.status === "new" && <Button className="mt-4" variant="secondary" size="small" isLoading={updating === message.id} onClick={() => markRead(message.id)}>Mark as read</Button>}
          </article>)}
    </div>
  </Container>
}

export const config = defineRouteConfig({ label: "Contact messages" })
export default ContactMessagesPage
