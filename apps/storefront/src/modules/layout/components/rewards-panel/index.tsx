"use client"

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react"
import { useState } from "react"
import { getRewards, RewardsSettings, RewardsSummary } from "@lib/data/rewards"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function RewardsPanel({ settings, signedIn }: { settings: RewardsSettings; signedIn: boolean }) {
  const [open, setOpen] = useState(false)
  const [summary, setSummary] = useState<RewardsSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  async function show() {
    setOpen(true)
    if (!signedIn) return
    setLoading(true)
    setError("")
    try {
      const rewards = await getRewards()
      setSummary(rewards)
      if (!rewards) setError("Your session has expired. Sign in again to view your points.")
    }
    catch { setError("We couldn’t load your balance. Visit your account to try again.") }
    finally { setLoading(false) }
  }
  if (!settings.enabled) return null
  const remaining = Math.max(0, settings.redemption_points - (summary?.available_points || 0))
  return <>
    <button onClick={show} aria-label="Open rewards panel" className="fixed bottom-5 right-5 z-40 flex min-h-12 items-center gap-2 rounded-full border border-homestead-cream/30 bg-homestead-forest px-5 py-3 text-sm font-medium text-homestead-cream shadow-lg transition hover:bg-homestead-olive"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 10h16v10H4zM3 6h18v4H3zM12 6v14"/><path d="M12 6H8.5A2.5 2.5 0 1 1 11 3.5L12 6Zm0 0h3.5A2.5 2.5 0 1 0 13 3.5L12 6Z"/></svg>Rewards</button>
    <Dialog open={open} onClose={setOpen} className="relative z-[70]"><div className="fixed inset-0 bg-homestead-ink/30" /><div className="fixed inset-0 flex items-end justify-end p-3 sm:p-6"><DialogPanel className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-lg bg-homestead-cream shadow-xl"><header className="relative bg-homestead-linen p-7"><button aria-label="Close rewards panel" className="absolute right-3 top-3 h-10 w-10 text-xl text-homestead-forest" onClick={() => setOpen(false)}>×</button><p className="text-xs uppercase tracking-widest text-homestead-olive">Welcome home</p><DialogTitle className="mt-3 pr-5 font-heading text-3xl text-homestead-forest">{settings.name}</DialogTitle><p className="mt-3 text-sm leading-6 text-homestead-muted">A little more joy in every everyday favorite.</p></header><div className="space-y-6 p-7">{loading ? <p role="status">Loading your points…</p> : summary?.member ? <div><p className="text-sm text-homestead-muted">Your available points</p><p className="mt-1 font-heading text-5xl text-homestead-forest">{summary.available_points.toLocaleString()}</p><p className="mt-3 text-sm text-homestead-muted">{remaining ? `${remaining} points to your next reward` : "You have a reward ready to redeem"}</p></div> : <div><h3 className="font-heading text-2xl text-homestead-forest">You’re invited.</h3><p className="mt-2 text-sm leading-6 text-homestead-muted">Join for free and receive {settings.signup_points} welcome points.</p></div>}{error && <p role="alert" className="text-sm text-red-700">{error}</p>}<div className="divide-y divide-homestead-border border-y border-homestead-border text-sm"><p className="flex justify-between gap-3 py-4"><span>Welcome to the club</span><strong>{settings.signup_points} pts</strong></p><p className="flex justify-between gap-3 py-4"><span>Your birthday gift</span><strong>{settings.birthday_points} pts</strong></p><p className="flex justify-between gap-3 py-4"><span>{settings.discount_percent}% off reward</span><strong>{settings.redemption_points} pts</strong></p></div><LocalizedClientLink href={signedIn ? "/account/rewards" : "/account"} onClick={() => setOpen(false)} className="block rounded-sm bg-homestead-forest px-5 py-3 text-center text-sm text-homestead-cream">{summary?.member ? "View & redeem rewards" : signedIn ? "Join the club" : "Sign in / create an account"}</LocalizedClientLink><LocalizedClientLink href="/rewards" onClick={() => setOpen(false)} className="block text-center text-xs text-homestead-olive underline">Explore the rewards club</LocalizedClientLink></div></DialogPanel></div></Dialog>
  </>
}
