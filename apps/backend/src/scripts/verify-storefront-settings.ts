import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { ExecArgs } from "@medusajs/framework/types"
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { updateStoresWorkflow, uploadFilesWorkflow } from "@medusajs/medusa/core-flows"
import { POST, GET as adminGet } from "../api/admin/storefront-settings/route"
import { GET as storeGet } from "../api/store/storefront-settings/route"
import { defaultSettings } from "../lib/storefront-settings"

export default async function verifySettings({ container }: ExecArgs) {
  const service = container.resolve(Modules.STORE)
  const [store] = await service.listStores()
  assert.ok(store)
  const original = store.metadata?.storefront_settings ?? null
  let uploadedId: string | undefined
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
  const html = async () => {
    const response = await fetch("http://localhost:8000/dk")
    assert.equal(response.status, 200)
    return response.text()
  }
  try {
    const sample = { ...defaultSettings, brand_name: "Homestead verification", hero_title: "A new hero heading" }
    assert.equal((await call(POST, { ...sample, logo_url: "javascript:alert(1)" })).status, 400)
    assert.equal((await call(POST, { ...sample, brand_name: "" })).status, 400)
    assert.equal((await call(POST, { ...sample, hero_button_url: "" })).status, 400)
    assert.equal((await call(POST, sample)).status, 200)
    assert.deepEqual((await call(adminGet)).body.settings, sample)
    assert.deepEqual((await call(storeGet)).body.settings, sample)
    const textHtml = await html()
    assert.ok(textHtml.includes(sample.brand_name))
    assert.ok(textHtml.includes(sample.hero_title))
    const { result: files } = await uploadFilesWorkflow(container).run({ input: { files: [{
      filename: "storefront-settings-verification.jpg", mimeType: "image/jpeg", access: "public",
      content: (await readFile("../storefront/src/app/opengraph-image.jpg")).toString("base64"),
    }] } })
    uploadedId = files[0].id
    assert.equal((await fetch(files[0].url)).status, 200)
    const images = { ...sample, logo_url: files[0].url, hero_image_url: files[0].url, hero_image_alt: "Hero verification image" }
    assert.equal((await call(POST, images)).status, 200)
    const imageHtml = await html()
    assert.ok(imageHtml.includes('alt="Hero verification image"'))
    assert.ok(imageHtml.includes('alt="Homestead verification"'))
    await call(POST, { ...sample, hero_enabled: false })
    assert.ok(!(await html()).includes('<h1 class="break-words font-heading'))
    const [updated] = await service.listStores()
    for (const [key, value] of Object.entries(store.metadata ?? {})) {
      if (key !== "storefront_settings") assert.deepEqual(updated.metadata?.[key], value)
    }
    console.log("PASS: validation, persistence, branding, hero, upload serving, image rendering, hiding, metadata preservation")
  } finally {
    await updateStoresWorkflow(container).run({ input: {
      selector: { id: store.id }, update: { metadata: { storefront_settings: original } },
    } })
    if (uploadedId) await container.resolve(Modules.FILE).deleteFiles(uploadedId)
    console.log("Original settings restored; test upload removed")
  }
}
