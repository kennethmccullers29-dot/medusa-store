"use client"

import { useEffect, useState } from "react"
import { set, type ArrayOfPrimitivesInputProps } from "sanity"
import { Button, Card, Flex, Stack, Text, TextInput } from "@sanity/ui"

type Product = { id: string; title: string; handle: string; thumbnail: string | null }
type Catalog = { products: Product[]; count: number }

export default function ProductPicker({ value: rawValue = [], onChange, readOnly }: ArrayOfPrimitivesInputProps) {
  const value = rawValue.filter((item): item is string => typeof item === "string")
  const [query, setQuery] = useState("")
  const [offset, setOffset] = useState(0)
  const [catalog, setCatalog] = useState<Catalog>({ products: [], count: 0 })
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [retry, setRetry] = useState(0)
  const selection = JSON.stringify(value)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError("")
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: query, offset: String(offset) })
        const response = await fetch(`/api/cms/products?${params}`, { signal: controller.signal })
        if (!response.ok) throw new Error("Could not load products. Check that the Medusa backend is running, then try again.")
        const result: Catalog = await response.json()
        if (!controller.signal.aborted) setCatalog(result)
      } catch (error) {
        if (!controller.signal.aborted) setError((error as Error).message)
      } finally { if (!controller.signal.aborted) setLoading(false) }
    }, 250)
    return () => { clearTimeout(timer); controller.abort() }
  }, [query, offset, retry])

  useEffect(() => {
    const handles: string[] = JSON.parse(selection)
    if (!handles.length) { setSelectedProducts([]); return }
    const controller = new AbortController()
    const params = new URLSearchParams()
    handles.forEach(handle => params.append("handle", handle))
    void fetch(`/api/cms/products?${params}`, { signal: controller.signal }).then(async response => {
      if (!response.ok) return
      const result: Catalog = await response.json()
      if (!controller.signal.aborted) setSelectedProducts(result.products)
    }).catch(() => {})
    return () => controller.abort()
  }, [selection, retry])

  const move = (index: number, direction: -1 | 1) => {
    const next = [...value]
    const product = next.splice(index, 1)[0]
    next.splice(index + direction, 0, product)
    onChange(set(next))
  }
  const thumbnail = (product?: Product) => product?.thumbnail ? <img src={product.thumbnail} alt="" style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 4 }} /> : <div aria-hidden="true" style={{ width: 48, height: 48, background: "#eee8f5", borderRadius: 4, flexShrink: 0 }} />

  return <Stack space={4}>
    <Text size={1} muted>{value.length}/8 selected. Leave empty to show recent products.</Text>
    {!!value.length && <Stack space={2}>{value.map((handle, index) => {
      const product = selectedProducts.find(item => item.handle === handle) || catalog.products.find(item => item.handle === handle)
      const title = product?.title || handle
      return <Card key={`${handle}-${index}`} padding={3} border radius={2}><Flex align="center" gap={3} wrap="wrap">{thumbnail(product)}<Flex flex={1}><Text size={1} weight="medium">{title}</Text></Flex><Button mode="ghost" text="↑" aria-label={`Move ${title} up`} disabled={readOnly || index === 0} onClick={() => move(index, -1)} /><Button mode="ghost" text="↓" aria-label={`Move ${title} down`} disabled={readOnly || index === value.length - 1} onClick={() => move(index, 1)} /><Button mode="ghost" text="Remove" disabled={readOnly} onClick={() => onChange(set(value.filter((_, i) => i !== index)))} /></Flex></Card>
    })}</Stack>}
    <TextInput aria-label="Search Medusa products" placeholder="Search products by name…" value={query} onChange={event => { setQuery(event.currentTarget.value); setOffset(0) }} />
    {loading ? <Text size={1} muted>Loading products…</Text> : error ? <Stack space={3}><Text size={1}>{error}</Text><Button text="Try again" mode="ghost" onClick={() => setRetry(current => current + 1)} /></Stack> : <Stack space={2}>
      {!catalog.products.length && <Text size={1} muted>No products found. Try a different name.</Text>}
      {catalog.products.map(product => <Card key={product.id} padding={3} border radius={2}><Flex align="center" gap={3}>{thumbnail(product)}<Flex flex={1}><Text size={1}>{product.title}</Text></Flex><Button text={value.includes(product.handle) ? "Selected" : "Add"} mode="ghost" disabled={readOnly || value.includes(product.handle) || value.length >= 8} onClick={() => onChange(set([...value, product.handle]))} /></Flex></Card>)}
      <Flex gap={3} align="center"><Button text="Previous" mode="ghost" disabled={offset === 0} onClick={() => setOffset(current => Math.max(0, current - 12))} /><Text size={1} muted>{catalog.count} products</Text><Button text="Next" mode="ghost" disabled={offset + 12 >= catalog.count} onClick={() => setOffset(current => current + 12)} /></Flex>
    </Stack>}
  </Stack>
}
