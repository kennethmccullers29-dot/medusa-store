import assert from "node:assert/strict"
import type { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { updateStoresWorkflow } from "@medusajs/medusa/core-flows"
import { readSettings, settingsSchema } from "../lib/storefront-settings"

export default async function verifyNavigation({ container }: ExecArgs) {
  const service = container.resolve(Modules.STORE)
  const [store] = await service.listStores()
  assert.ok(store)
  const original = store.metadata ?? {}
  const settings = readSettings(original)
  const links = [{ label: "Our journal", url: "/blog", enabled: true }, { label: "Hidden navigation check", url: "/contact", enabled: false }, { label: "Contact us", url: "/contact", enabled: true }]
  assert.equal(settingsSchema.safeParse({ ...settings, navigation_links: [{ label: "Bad", url: "javascript:alert(1)", enabled: true }] }).success, false)
  assert.equal(settingsSchema.safeParse({ ...settings, navigation_links: [{ label: "Bad", url: "//example.com", enabled: true }] }).success, false)
  assert.equal(settingsSchema.safeParse({ ...settings, navigation_links: [{ label: "", url: "/blog", enabled: true }] }).success, false)
  assert.equal(settingsSchema.safeParse({ ...settings, navigation_links: Array(9).fill(links[0]) }).success, false)
  assert.equal(settingsSchema.safeParse({ ...settings, navigation_links: [] }).success, true)
  const sample = settingsSchema.parse({ ...settings, navigation_links: links })
  try {
    await updateStoresWorkflow(container).run({ input: { selector: { id: store.id }, update: { metadata: { ...original, storefront_settings: sample } } } })
    const [saved] = await service.listStores()
    assert.deepEqual(readSettings(saved.metadata).navigation_links, links)
    const response = await fetch("http://localhost:8000/us")
    assert.equal(response.status, 200)
    const html = await response.text()
    assert.ok(html.includes("Our journal"))
    assert.ok(html.includes("Contact us"))
    assert.ok(!html.includes(">Hidden navigation check</"))
    console.log("PASS: navigation validation, saved order, storefront links, hidden links, empty list")
  } finally {
    await updateStoresWorkflow(container).run({ input: { selector: { id: store.id }, update: { metadata: { ...original, storefront_settings: original.storefront_settings ?? null } } } })
    console.log("Original storefront settings restored")
  }
}
