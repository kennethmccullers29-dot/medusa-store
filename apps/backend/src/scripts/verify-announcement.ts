import assert from "node:assert/strict"
import { ExecArgs } from "@medusajs/framework/types"
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { updateStoresWorkflow } from "@medusajs/medusa/core-flows"
import { POST, GET as adminGet } from "../api/admin/announcement/route"
import { GET as storeGet } from "../api/store/announcement/route"

// Run against the local development store; original settings are restored in finally.
export default async function verifyAnnouncement({ container }: ExecArgs) {
  const service = container.resolve(Modules.STORE)
  const [store] = await service.listStores()
  assert.ok(store, "A store must exist")
  const original = store.metadata?.announcement_bar ?? null
  const call = async (handler: typeof POST, body?: unknown) => {
    const result = { status: 200, body: {} as any }
    const response = {
      status(code: number) { result.status = code; return this },
      json(data: unknown) { result.body = data; return this },
      setHeader() { return this },
    }
    await handler({ scope: container, body } as MedusaRequest, response as unknown as MedusaResponse)
    return result
  }
  const sample = { enabled: true, message: "Announcement verification", link_label: "Shop now", link_url: "/store" }
  try {
    assert.equal((await call(POST, { ...sample, link_url: "javascript:alert(1)" })).status, 400)
    assert.equal((await call(POST, { ...sample, message: " " })).status, 400)
    assert.equal((await call(POST, { ...sample, link_label: "" })).status, 400)
    assert.equal((await call(POST, sample)).status, 200)
    assert.deepEqual((await call(adminGet)).body.announcement, sample)
    assert.deepEqual((await call(storeGet)).body.announcement, sample)
    const response = await fetch("http://localhost:8000/dk")
    assert.equal(response.status, 200)
    const html = await response.text()
    assert.ok(html.includes('aria-label="Store announcement"'))
    assert.ok(html.includes(sample.message))
    assert.ok(html.includes('href="/dk/store"'))
    await call(POST, { ...sample, enabled: false })
    assert.equal((await call(storeGet)).body.announcement, null)
    assert.equal((await call(adminGet)).body.announcement.message, sample.message)
    const hiddenHtml = await (await fetch("http://localhost:8000/dk")).text()
    assert.ok(!hiddenHtml.includes('aria-label="Store announcement"'))
    const [updated] = await service.listStores()
    for (const [key, value] of Object.entries(store.metadata ?? {})) {
      if (key !== "announcement_bar") assert.deepEqual(updated.metadata?.[key], value)
    }
    console.log("PASS: validation, save/read, visibility, localized link, storefront rendering, and metadata preservation")
  } finally {
    await updateStoresWorkflow(container).run({ input: {
      selector: { id: store.id }, update: { metadata: { announcement_bar: original } },
    } })
    console.log("Original announcement restored")
  }
}
