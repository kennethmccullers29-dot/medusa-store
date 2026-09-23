import LocalizedClientLink from "@modules/common/components/localized-client-link"

const EmptyCartMessage = () => {
  return (
    <div className="mx-auto mb-12 flex min-h-[420px] max-w-[880px] flex-col items-center justify-center rounded-2xl border border-homestead-border bg-[#f3eef5] px-6 py-14 text-center sm:px-12" data-testid="empty-cart-message">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/80 text-homestead-forest" aria-hidden="true">
        <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" className="h-8 w-8">
          <path d="M7 11h18l-1.3 16H8.3L7 11Z" />
          <path d="M11.5 12V9a4.5 4.5 0 0 1 9 0v3" />
        </svg>
      </div>
      <h2 className="mt-6 font-heading text-3xl text-homestead-ink sm:text-4xl">Your bag is waiting</h2>
      <p className="mt-3 max-w-md text-sm leading-7 text-homestead-muted sm:text-base">
        Find something lovely for your everyday routine, from handmade soap to little moments of calm.
      </p>
      <LocalizedClientLink href="/store" className="mt-8 inline-flex min-h-12 items-center justify-center rounded-md bg-homestead-forest px-8 text-sm font-semibold text-white transition-colors hover:bg-homestead-olive">
        Explore the shop <span className="ml-3" aria-hidden="true">→</span>
      </LocalizedClientLink>
    </div>
  )
}

export default EmptyCartMessage
