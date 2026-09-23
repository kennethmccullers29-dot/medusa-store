import { sdk } from "@lib/config"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type Announcement = { enabled: boolean; message: string; link_label: string; link_url: string }

export default async function AnnouncementBar() {
  let announcement: Announcement | null
  try {
    const data = await sdk.client.fetch<{ announcement: Announcement | null }>("/store/announcement", { cache: "no-store" })
    announcement = data.announcement
  } catch {
    return null
  }
  if (!announcement?.enabled || !announcement.message) return null

  const linkClass = "inline-block font-medium underline underline-offset-4 hover:text-neutral-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
  return (
    <aside aria-label="Store announcement" className="bg-homestead-forest px-4 py-3 text-center text-sm leading-5 text-white">
      <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <p className="min-w-0 break-words">{announcement.message}</p>
        {announcement.link_url && announcement.link_label && (
          announcement.link_url.startsWith("/") ? (
            <LocalizedClientLink href={announcement.link_url} className={linkClass}>{announcement.link_label} <span aria-hidden="true">→</span></LocalizedClientLink>
          ) : (
            <a href={announcement.link_url} className={linkClass}>{announcement.link_label} <span aria-hidden="true">→</span></a>
          )
        )}
      </div>
    </aside>
  )
}
