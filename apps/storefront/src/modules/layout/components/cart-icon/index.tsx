export default function CartIcon({ count }: { count: number }) {
  return (
    <span className="relative inline-flex h-11 w-11 items-center justify-center" aria-hidden="true">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 7h14l1 14H4L5 7Z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </svg>
      <span data-testid="nav-cart-count" className="absolute right-0 top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-homestead-olive px-1 text-[10px] font-semibold leading-none text-white">
        {count > 99 ? "99+" : count}
      </span>
    </span>
  )
}
