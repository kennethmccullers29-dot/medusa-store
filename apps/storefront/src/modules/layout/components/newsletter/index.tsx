"use client"

import { useActionState } from "react"
import { subscribeNewsletter } from "@lib/data/newsletter"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function Newsletter() {
  const [state, action, pending] = useActionState(subscribeNewsletter, { message: "", success: false })
  return (
    <section aria-labelledby="newsletter-heading" className="mt-8 border-t border-white/15 pt-6">
        <h3 id="newsletter-heading" className="font-heading text-xl text-homestead-cream">Keep in touch</h3>
        <p className="mt-2 text-sm leading-6 text-white/65">New scents, shop news, and little treats.</p>
        <form action={action} className="mt-4 space-y-3">
          <label htmlFor="newsletter-email" className="sr-only">Email address</label>
          <div className="flex rounded-sm border border-white/30 focus-within:border-homestead-cream focus-within:ring-1 focus-within:ring-homestead-cream"><input id="newsletter-email" name="email" type="email" autoComplete="email" maxLength={254} required disabled={pending || state.success} placeholder="Your email address" className="min-h-11 min-w-0 flex-1 rounded-l-sm bg-transparent px-3 text-sm text-white placeholder:text-white/50 focus:outline-none disabled:opacity-60" /><button disabled={pending || state.success} className="shrink-0 rounded-r-sm bg-homestead-cream px-4 text-sm font-semibold text-homestead-forest transition-colors hover:bg-homestead-linen focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-homestead-cream disabled:opacity-60">{pending ? "Joining…" : state.success ? "Thanks!" : "Join"}</button></div>
          <div hidden aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
          <label className="flex items-start gap-2 text-xs leading-5 text-white/65"><input name="consent" type="checkbox" required disabled={pending || state.success} className="mt-1 accent-homestead-cream" /><span>Send me news and offers. Unsubscribe anytime. <LocalizedClientLink href="/privacy" className="underline underline-offset-2 hover:text-white">Privacy policy</LocalizedClientLink>.</span></label>
          <p role="status" aria-live="polite" className={state.message ? "text-xs leading-5 text-homestead-cream" : "sr-only"}>{state.message}</p>
        </form>
    </section>
  )
}
