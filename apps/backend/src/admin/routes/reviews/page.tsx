import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChatBubbleLeftRight } from "@medusajs/icons"
import { Button, Container, Heading, StatusBadge, Text, toast } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { Link } from "react-router-dom"
import { sdk } from "../../lib/sdk"

type Review = {
  id: string
  title?: string
  content: string
  rating: number
  first_name: string
  last_name: string
  product_id: string
  status: "pending" | "approved" | "rejected"
  created_at: string
  product?: { title?: string }
}

const statusColor = (status: Review["status"]) =>
  status === "approved" ? "green" : status === "rejected" ? "red" : "grey"

const ReviewsPage = () => {
  const [page, setPage] = useState(0)
  const [updating, setUpdating] = useState("")
  const limit = 15
  const { data, isLoading, error, refetch } = useQuery<{
    reviews: Review[]; count: number; limit: number; offset: number
  }>({
    queryKey: ["reviews", page],
    queryFn: () => sdk.client.fetch("/admin/reviews", {
      query: { offset: page * limit, limit, order: "-created_at" },
    }),
  })

  const moderate = async (review: Review, status: Review["status"]) => {
    setUpdating(review.id)
    try {
      await sdk.client.fetch(`/admin/reviews/${review.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: { status },
      })
      toast.success(status === "approved" ? "Review published" : "Review rejected")
      await refetch()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update the review")
    } finally {
      setUpdating("")
    }
  }

  const reviews = data?.reviews ?? []
  const pages = Math.max(1, Math.ceil((data?.count ?? 0) / limit))
  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div><Heading level="h1">Product reviews</Heading><Text className="text-ui-fg-subtle">Approve customer feedback before it appears in the storefront.</Text></div>
        <StatusBadge color="grey">{data?.count ?? 0} total</StatusBadge>
      </div>
      <div className="grid gap-4 p-6">
        {isLoading && <Text>Loading reviews…</Text>}
        {error && <div role="alert" className="text-ui-fg-error">Could not load reviews. Refresh and try again.</div>}
        {!isLoading && !reviews.length && <div className="rounded-lg border border-dashed p-10 text-center"><Heading level="h2">No reviews yet</Heading><Text className="mt-2 text-ui-fg-subtle">New customer reviews will appear here for moderation.</Text></div>}
        {reviews.map((review) => (
          <article key={review.id} className="rounded-lg border bg-ui-bg-base p-5 shadow-elevation-card-rest">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-3"><span aria-label={`${review.rating} out of 5 stars`} className="text-ui-fg-interactive">{"★".repeat(review.rating)}<span className="text-ui-fg-disabled">{"★".repeat(5 - review.rating)}</span></span><StatusBadge color={statusColor(review.status)}>{review.status}</StatusBadge></div>
                <Heading level="h2" className="mt-3">{review.title || "Customer review"}</Heading>
                <Text className="mt-1 text-ui-fg-subtle">{review.first_name} {review.last_name} · {new Date(review.created_at).toLocaleDateString()}</Text>
              </div>
              <Link to={`/products/${review.product_id}`} className="text-ui-fg-interactive hover:underline">{review.product?.title || "View product"}</Link>
            </div>
            <Text className="mt-4 whitespace-pre-line">{review.content}</Text>
            <div className="mt-5 flex gap-2">
              {review.status !== "approved" && <Button size="small" isLoading={updating === review.id} onClick={() => moderate(review, "approved")}>Approve</Button>}
              {review.status !== "rejected" && <Button size="small" variant="secondary" disabled={!!updating} onClick={() => moderate(review, "rejected")}>Reject</Button>}
            </div>
          </article>
        ))}
        {pages > 1 && <div className="flex items-center justify-between pt-2"><Button size="small" variant="secondary" disabled={page === 0} onClick={() => setPage((value) => value - 1)}>Previous</Button><Text>Page {page + 1} of {pages}</Text><Button size="small" variant="secondary" disabled={page + 1 >= pages} onClick={() => setPage((value) => value + 1)}>Next</Button></div>}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({ label: "Reviews", icon: ChatBubbleLeftRight })
export default ReviewsPage

