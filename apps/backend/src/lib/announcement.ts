import { z } from "@medusajs/framework/zod"

export const announcementSchema = z.object({
  enabled: z.boolean(),
  message: z.string().trim().max(240),
  link_label: z.string().trim().max(60),
  link_url: z.string().trim().max(2048).refine((value) => {
    if (!value) return true
    if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) return true
    try { return ["https:", "http:"].includes(new URL(value).protocol) } catch { return false }
  }, "Use a storefront path starting with / or an http(s) URL."),
}).strict().refine((value) => !value.enabled || !!value.message, {
  message: "Add a message before enabling the bar.",
}).refine((value) => !!value.link_label === !!value.link_url, {
  message: "Provide both a link label and URL, or leave both empty.",
})

export const emptyAnnouncement = { enabled: false, message: "", link_label: "", link_url: "" }

export function readAnnouncement(metadata: Record<string, unknown> | null) {
  const result = announcementSchema.safeParse(metadata?.announcement_bar)
  return result.success ? result.data : emptyAnnouncement
}
