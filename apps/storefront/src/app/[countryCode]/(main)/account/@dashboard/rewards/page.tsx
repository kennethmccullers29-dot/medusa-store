import { Metadata } from "next"
import { getRewards } from "@lib/data/rewards"
import { getRegion } from "@lib/data/regions"
import { retrieveCustomer } from "@lib/data/customer"
import { listStoreCreditAccounts } from "@lib/data/store-credit"
import { convertToLocale } from "@lib/util/money"
import Rewards from "@modules/account/components/rewards"
import { redirect } from "next/navigation"

export const metadata: Metadata = { title: "Your rewards" }
export default async function RewardsPage({ params }: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await params
  if (!await retrieveCustomer()) return null
  const [rewards, region, accounts] = await Promise.all([getRewards(), getRegion(countryCode), listStoreCreditAccounts()])
  if (!rewards) redirect(`/${countryCode}/account`)
  return <div className="w-full" data-testid="rewards-page">
    <Rewards initial={rewards} currency={region?.currency_code || "usd"} />
    {!!accounts.length && <section className="mt-10 border-t border-homestead-border pt-8"><h2 className="font-heading text-3xl text-homestead-forest">Store credit</h2><p className="mt-2 text-sm text-homestead-muted">Credit is separate from your loyalty points and can be applied at checkout.</p><div className="mt-5 grid gap-4">{accounts.map(account => <div key={account.id} className="rounded-sm border border-homestead-border p-5"><p className="text-sm text-homestead-muted">Available credit</p><p className="mt-2 font-heading text-3xl text-homestead-forest">{convertToLocale({ amount: account.balance, currency_code: account.currency_code })}</p></div>)}</div></section>}
  </div>
}
