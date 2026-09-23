import { Metadata } from "next"
import { getRewardsSettings } from "@lib/data/rewards"
import { retrieveCustomer } from "@lib/data/customer"
import { getRegion } from "@lib/data/regions"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"

export const metadata: Metadata = { title: "Rewards club", description: "Join our rewards club. Earn points when you shop, celebrate your birthday, and redeem a little treat." }
export default async function RewardsPage({ params }: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await params
  const [settings, customer, region] = await Promise.all([getRewardsSettings(), retrieveCustomer(), getRegion(countryCode)])
  const unit = convertToLocale({ amount: 1, currency_code: region?.currency_code || "usd" })
  const benefits = [
    { title: "Make yourself at home", points: `${settings.signup_points} welcome points`, body: "Create an account, then join the club from your rewards dashboard." },
    { title: "Find your favorites", points: `${settings.points_per_unit} point${settings.points_per_unit === 1 ? "" : "s"} per ${unit}`, body: "Earn points on paid product purchases after joining. Taxes, shipping, and discounts are excluded." },
    { title: "Let’s celebrate you", points: `${settings.birthday_points} birthday points`, body: "Save your month and day at least 30 days before your birthday. A little gift arrives every year." },
  ]
  const questions = [
    { q: "When do my points arrive?", a: "Points are earned after an order is fully paid. Your dashboard refreshes the balance when you visit; background updates also run every 15 minutes." },
    { q: "How do I use my reward?", a: "Redeem points for a discount code in your rewards dashboard. Stay signed in and apply the code at checkout in the currency you selected. Each code is for your account and can be used once." },
    { q: "What happens if I return something?", a: "Refunds and cancellations adjust purchase points. If you already spent those points, future earnings first make up any negative balance." },
    { q: "How do birthday gifts work?", a: "Save your birthday once, at least 30 days in advance. We award the points during your birthday week. February 29 birthdays are celebrated on February 28 in non-leap years. Contact us if your date needs a correction." },
    { q: "Do points expire?", a: "Points currently have no expiry. You can see your points and activity in your account." },
  ]
  return <main className="bg-homestead-cream">
    <section className="relative overflow-hidden bg-homestead-linen px-6 py-24 text-center md:py-32"><div aria-hidden="true" className="absolute -right-20 -top-20 h-80 w-80 rounded-full border-[40px] border-homestead-olive/10" /><p className="text-xs uppercase tracking-[0.25em] text-homestead-olive">A little thank-you, just for you</p><h1 className="relative mx-auto mt-5 max-w-3xl font-heading text-5xl text-homestead-forest md:text-7xl">{settings.name}</h1><p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-homestead-muted">Your everyday favorites, with a little extra joy. Join our community and let good things come back around.</p>{settings.enabled ? <LocalizedClientLink href={customer ? "/account/rewards" : "/account"} className="mt-8 inline-flex rounded-sm bg-homestead-forest px-8 py-4 text-sm font-medium text-homestead-cream">{customer ? "Visit your rewards" : "Join the club"} →</LocalizedClientLink> : <p className="mt-8 text-homestead-forest">Our rewards program is currently paused.</p>}<p className="mt-4 text-xs text-homestead-muted">Free to join. Made for you.</p></section>
    <section className="content-container py-20"><h2 className="text-center font-heading text-4xl text-homestead-forest">Little moments. Lovely rewards.</h2><div className="mt-12 grid gap-6 md:grid-cols-3">{benefits.map((item, index) => <article key={item.title} className="rounded-sm border border-homestead-border p-8"><p className="font-heading text-4xl italic text-homestead-olive/60">0{index + 1}</p><h3 className="mt-6 font-heading text-2xl text-homestead-forest">{item.title}</h3><p className="mt-3 font-semibold text-homestead-olive">{item.points}</p><p className="mt-4 leading-7 text-homestead-muted">{item.body}</p></article>)}</div></section>
    <section className="bg-homestead-forest px-6 py-20 text-center text-homestead-cream"><p className="text-xs uppercase tracking-[0.2em]">Your next little treat</p><h2 className="mt-5 font-heading text-5xl">{settings.redemption_points} points. {settings.discount_percent}% off.</h2><p className="mx-auto mt-5 max-w-lg leading-7 text-homestead-cream/80">Turn your points into a personal discount code for your next order. Redeem in your account, then apply it at checkout.</p><LocalizedClientLink href="/account/rewards" className="mt-8 inline-flex rounded-sm bg-homestead-cream px-8 py-4 text-sm text-homestead-forest">Discover your rewards →</LocalizedClientLink></section>
    <section className="content-container max-w-3xl py-20"><h2 className="mb-7 font-heading text-4xl text-homestead-forest">Good to know</h2>{questions.map(item => <details key={item.q} className="border-b border-homestead-border py-5"><summary className="cursor-pointer font-heading text-xl text-homestead-forest">{item.q}</summary><p className="mt-4 leading-7 text-homestead-muted">{item.a}</p></details>)}</section>
  </main>
}
