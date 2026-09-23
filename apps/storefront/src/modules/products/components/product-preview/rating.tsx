export default function PreviewRating({ count, average }: { count: number; average: number }) {
  const rating = Math.max(0, Math.min(5, average))
  return <div className="flex flex-wrap items-center gap-2 text-xs text-homestead-muted">
    <span role="img" aria-label={count ? `${rating.toFixed(1)} out of 5 stars` : "No reviews yet"} className="relative inline-block text-base leading-none tracking-[2px]">
      <span aria-hidden="true" className="text-homestead-border">★★★★★</span>
      <span aria-hidden="true" className="absolute left-0 top-0 overflow-hidden whitespace-nowrap text-homestead-olive" style={{ width: `${rating / 5 * 100}%` }}>★★★★★</span>
    </span>
    <span>{count ? `${rating.toFixed(1)} (${count} ${count === 1 ? "review" : "reviews"})` : "Be the first to review"}</span>
  </div>
}
