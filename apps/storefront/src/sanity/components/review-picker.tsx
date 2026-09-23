"use client"

import { useEffect, useState } from "react"
import { set, type ArrayOfPrimitivesInputProps } from "sanity"
import { Button, Card, Flex, Stack, Text } from "@sanity/ui"
import type { FeaturedReview, FeaturedReviews } from "@lib/data/featured-reviews"

export default function ReviewPicker({ value: rawValue = [], onChange, readOnly }: ArrayOfPrimitivesInputProps) {
  const value = rawValue.filter((item): item is string => typeof item === "string")
  const [offset, setOffset] = useState(0)
  const [data, setData] = useState<FeaturedReviews>({ reviews: [], count: 0 })
  const [selected, setSelected] = useState<FeaturedReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [retry, setRetry] = useState(0)
  const selection = value.join(",")
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError("")
    void fetch(`/api/cms/reviews?offset=${offset}`, { signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error("Could not load reviews. Please try again.")
      const result: FeaturedReviews = await response.json()
      if (!controller.signal.aborted) setData(result)
    }).catch(error => { if (!controller.signal.aborted) setError((error as Error).message) }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [offset, retry])
  useEffect(() => {
    if (!selection) { setSelected([]); return }
    const controller = new AbortController()
    void fetch(`/api/cms/reviews?ids=${encodeURIComponent(selection)}`, { signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error("Could not load selected reviews.")
      const result: FeaturedReviews = await response.json()
      if (!controller.signal.aborted) setSelected(result.reviews)
    }).catch(error => { if (!controller.signal.aborted) setError((error as Error).message) })
    return () => controller.abort()
  }, [selection, retry])
  const move = (index: number, direction: -1 | 1) => {
    const next = [...value]
    const review = next.splice(index, 1)[0]
    next.splice(index + direction, 0, review)
    onChange(set(next))
  }
  return <Stack space={4}><Text size={1} muted>{value.length}/6 selected. Only approved reviews appear. Leave empty to show the latest three.</Text>
    {value.map((id, index) => { const review = selected.find(item => item.id === id) || data.reviews.find(item => item.id === id); return <Card key={id} padding={3} border radius={2}><Stack space={3}><Text size={1} weight="medium">{review ? `${review.author} · ${review.rating}/5 · ${review.product?.title || "Customer review"}` : "Review unavailable or no longer approved"}</Text>{review && <Text size={1}>{review.title || review.content.slice(0, 160)}</Text>}<Flex gap={2} wrap="wrap"><Button text="↑" aria-label="Move review up" disabled={readOnly || index === 0} mode="ghost" onClick={() => move(index, -1)} /><Button text="↓" aria-label="Move review down" disabled={readOnly || index === value.length - 1} mode="ghost" onClick={() => move(index, 1)} /><Button text="Remove" mode="ghost" disabled={readOnly} onClick={() => onChange(set(value.filter(item => item !== id)))} /></Flex></Stack></Card> })}
    {loading ? <Text size={1} muted>Loading approved reviews…</Text> : error ? <Stack space={3}><Text size={1}>{error}</Text><Button text="Try again" onClick={() => setRetry(current => current + 1)} /></Stack> : <Stack space={3}>{!data.reviews.length && <Text size={1} muted>No approved reviews yet. Approve customer reviews in Medusa Admin → Reviews to feature them here.</Text>}{data.reviews.map(review => <Card key={review.id} padding={3} border radius={2}><Stack space={3}><Text size={1} weight="medium">{review.author} · {review.rating}/5 · {review.product?.title || "Customer review"}</Text><Text size={1}>{review.title || review.content.slice(0, 180)}</Text><Button text={value.includes(review.id) ? "Selected" : "Add review"} mode="ghost" disabled={readOnly || value.includes(review.id) || value.length >= 6} onClick={() => onChange(set([...value, review.id]))} /></Stack></Card>)}<Flex gap={3}><Button text="Previous" mode="ghost" disabled={!offset} onClick={() => setOffset(current => Math.max(0, current - 12))} /><Button text="Next" mode="ghost" disabled={offset + 12 >= data.count} onClick={() => setOffset(current => current + 12)} /></Flex></Stack>}
  </Stack>
}
