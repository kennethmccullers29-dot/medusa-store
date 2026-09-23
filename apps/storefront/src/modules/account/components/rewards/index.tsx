"use client"

import { useRef, useState } from "react"
import { RewardsSummary, updateRewards } from "@lib/data/rewards"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const buttonClass = "inline-flex min-h-11 items-center justify-center rounded-sm bg-homestead-olive px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-homestead-forest disabled:cursor-not-allowed disabled:opacity-50"

export default function Rewards({ initial, currency }: { initial: RewardsSummary; currency: string }) {
  const [rewards, setRewards] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const requestId = useRef<string | null>(null)
  const settings = rewards.settings
  const remaining = Math.max(0, settings.redemption_points - rewards.available_points)
  const progress = Math.min(100, rewards.available_points / settings.redemption_points * 100)
  async function act(body: Parameters<typeof updateRewards>[0]) {
    setBusy(true); setError(""); setMessage("")
    try {
      const result = await updateRewards(body)
      if (result.error || !result.rewards) { setError(result.error || "Please try again"); return }
      setRewards(result.rewards)
      setMessage(body.action === "join" ? "Welcome to the club! Your joining points are ready." : body.action === "birthday" ? "Your birthday is saved. We look forward to celebrating with you." : "Your discount code is ready below.")
      if (body.action === "redeem") requestId.current = null
    } finally { setBusy(false) }
  }
  function redeem(id?: string) {
    requestId.current = id || requestId.current || crypto.randomUUID()
    return act({ action: "redeem", redemption: { request_id: requestId.current, currency_code: currency } })
  }
  async function copy(code: string) {
    try { await navigator.clipboard.writeText(code); setMessage("Discount code copied") }
    catch { setMessage("Select and copy the discount code below") }
  }
  return <div className="space-y-8" data-testid="rewards-dashboard">
    <div><p className="text-xs font-medium uppercase tracking-[0.2em] text-homestead-olive">A little more everyday joy</p><h1 className="mt-3 font-heading text-4xl text-homestead-forest">{settings.name}</h1><p className="mt-3 max-w-xl leading-7 text-homestead-muted">Good things come back around. Earn points, find your next favorite, and let us celebrate your birthday.</p></div>
    <div role="status" aria-live="polite">{message && <p className="rounded-sm bg-homestead-linen p-4 text-sm text-homestead-forest">{message}</p>}</div>
    {error && <p role="alert" className="rounded-sm border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
    {!settings.enabled && <p className="rounded-sm border border-homestead-border p-4 text-sm">The program is currently paused. Your points and existing rewards are kept safe.</p>}
    {!rewards.member ? <section className="rounded-sm border border-homestead-border bg-homestead-linen p-8"><p className="text-xs uppercase tracking-widest text-homestead-olive">You’re invited</p><h2 className="mt-3 font-heading text-3xl text-homestead-forest">Make yourself at home.</h2><p className="mt-3 max-w-lg leading-7 text-homestead-muted">Join for free and start with {settings.signup_points} welcome points. Your customer account becomes your home for rewards.</p><button disabled={busy || !settings.enabled} className={`${buttonClass} mt-6`} onClick={() => act({ action: "join" })}>{busy ? "Joining…" : `Join & earn ${settings.signup_points} points`}</button></section> : <>
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-sm bg-homestead-forest p-7 text-homestead-cream"><p className="text-sm text-homestead-cream/80">Your available points</p><p className="mt-2 font-heading text-6xl">{rewards.available_points.toLocaleString()}</p><p className="mt-3 text-sm text-homestead-cream/75">{rewards.lifetime_points.toLocaleString()} points earned · Member since {new Date(rewards.member.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</p>{rewards.balance < 0 && <p className="mt-3 text-sm">A refund adjusted your balance to {rewards.balance}. New points will first make up the difference.</p>}</section>
        <section className="rounded-sm border border-homestead-border bg-homestead-linen/60 p-7"><p className="text-xs uppercase tracking-widest text-homestead-olive">Your next little treat</p><h2 className="mt-3 font-heading text-3xl text-homestead-forest">{settings.discount_percent}% off your next order</h2><p className="mt-2 text-sm text-homestead-muted">{settings.redemption_points} points · One use · {currency.toUpperCase()} orders</p><div role="progressbar" aria-label="Points toward your next reward" aria-valuemin={0} aria-valuemax={settings.redemption_points} aria-valuenow={Math.min(settings.redemption_points, rewards.available_points)} className="mt-5 h-2 overflow-hidden rounded-full bg-homestead-border"><div className="h-full bg-homestead-olive" style={{ width: `${progress}%` }} /></div><p className="mt-2 text-sm text-homestead-muted">{remaining ? `${remaining} more points to your reward` : "Your reward is ready to redeem"}</p><button className={`${buttonClass} mt-5`} disabled={busy || !!remaining || !settings.enabled} onClick={() => redeem()}>{busy ? "Working…" : "Redeem reward"}</button></section>
      </div>
      <section><h2 className="font-heading text-3xl text-homestead-forest">Ways to earn</h2><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-sm border border-homestead-border p-5"><p className="text-2xl text-homestead-olive">✦</p><h3 className="mt-3 font-heading text-xl">Make yourself at home</h3><p className="mt-2 text-sm text-homestead-muted">{settings.signup_points} points for joining, once per customer.</p></div><div className="rounded-sm border border-homestead-border p-5"><p className="text-2xl text-homestead-olive">♡</p><h3 className="mt-3 font-heading text-xl">Find your favorites</h3><p className="mt-2 text-sm text-homestead-muted">{settings.points_per_unit} point{settings.points_per_unit === 1 ? "" : "s"} per currency unit on paid product purchases after joining.</p></div><div className="rounded-sm border border-homestead-border p-5"><p className="text-2xl text-homestead-olive">✧</p><h3 className="mt-3 font-heading text-xl">A birthday little treat</h3><p className="mt-2 text-sm text-homestead-muted">{settings.birthday_points} points every year on your birthday.</p></div></div></section>
      <section className="rounded-sm border border-homestead-border bg-homestead-linen/40 p-6"><h2 className="font-heading text-2xl text-homestead-forest">Let’s celebrate you.</h2><p className="mt-2 text-sm leading-6 text-homestead-muted">Save your birthday at least 30 days before it arrives to receive your annual points. We only need the month and day.</p>{rewards.member.birthday_month ? <p className="mt-4 font-heading text-xl text-homestead-forest">Your birthday: {months[rewards.member.birthday_month - 1]} {rewards.member.birthday_day}</p> : <form className="mt-5 flex flex-wrap items-end gap-4" onSubmit={event => { event.preventDefault(); const form = new FormData(event.currentTarget); void act({ action: "birthday", birthday: { month: Number(form.get("month")), day: Number(form.get("day")) } }) }}><label className="grid gap-2 text-sm">Month<select required name="month" defaultValue="" className="min-h-11 rounded-sm border border-homestead-border bg-homestead-cream px-3"><option value="" disabled>Choose month</option>{months.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}</select></label><label className="grid gap-2 text-sm">Day<input required type="number" name="day" min={1} max={31} className="min-h-11 w-24 rounded-sm border border-homestead-border bg-homestead-cream px-3" /></label><button className={buttonClass} disabled={busy}>Save birthday</button></form>}<p className="mt-3 text-xs text-homestead-muted">Your birthday can be saved once. <LocalizedClientLink href="/contact" className="underline">Contact us</LocalizedClientLink> if you need a correction.</p></section>
      {!!rewards.redemptions.length && <section><h2 className="font-heading text-3xl text-homestead-forest">Your discount rewards</h2><div className="mt-4 grid gap-4">{rewards.redemptions.map(reward => <div key={reward.id} className="flex flex-wrap items-center justify-between gap-4 rounded-sm border border-homestead-border p-5"><div><p className="font-heading text-xl">{reward.discount_percent}% off · {reward.currency_code.toUpperCase()}</p>{reward.status === "ready" ? <code className="mt-2 block break-all text-sm">{reward.code}</code> : <p className="mt-2 text-sm text-homestead-muted">Your reward is being prepared. Resume to finish without spending points twice.</p>}<p className="mt-2 text-xs text-homestead-muted">{reward.used ? "Used on a previous order." : reward.available === false ? "This reward is no longer available." : "For your account only. Apply at checkout; each code can be used once."}</p></div><button disabled={busy || reward.used || reward.available === false} className="min-h-11 rounded-sm border border-homestead-border px-4 text-sm disabled:opacity-50" onClick={() => reward.status === "ready" ? copy(reward.code) : redeem(reward.request_id.split(":").pop())}>{reward.used ? "Used" : reward.available === false ? "Unavailable" : reward.status === "ready" ? "Copy code" : "Resume reward"}</button></div>)}</div></section>}
      <section><h2 className="font-heading text-3xl text-homestead-forest">Your points story</h2>{rewards.activity.length ? <ul className="mt-4 divide-y divide-homestead-border">{rewards.activity.map(activity => <li key={activity.id} className="flex items-center justify-between gap-4 py-4"><div><p className="text-sm">{activity.note}</p><p className="mt-1 text-xs text-homestead-muted">{new Date(activity.created_at).toLocaleDateString()}</p></div><span className="shrink-0 font-medium text-homestead-forest">{activity.points > 0 ? "+" : ""}{activity.points} points</span></li>)}</ul> : <p className="mt-3 text-sm text-homestead-muted">Your first points are on their way.</p>}</section>
    </>}
    <p className="border-t border-homestead-border pt-5 text-xs leading-6 text-homestead-muted">Purchase points are rounded down and exclude shipping, taxes, and discounts. Paid orders earn points; refunds and cancellations adjust them. <LocalizedClientLink href="/store" className="underline">Explore the shop</LocalizedClientLink>.</p>
  </div>
}

