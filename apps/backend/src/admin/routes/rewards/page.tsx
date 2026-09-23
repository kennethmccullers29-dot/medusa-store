import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Button, Container, Heading, Input, Label, Switch, Text, toast } from "@medusajs/ui"
import { useEffect, useState } from "react"

type Settings = { name: string; enabled: boolean; signup_points: number; points_per_unit: number; birthday_points: number; redemption_points: number; discount_percent: number }
type Member = { id: string; customer_id: string; balance: number; lifetime_points: number; birthday_month: number | null; birthday_day: number | null; created_at: string }
const fields: { key: Exclude<keyof Settings, "name" | "enabled">; label: string; min: number; max: number }[] = [
  { key: "signup_points", label: "Joining points", min: 0, max: 100000 },
  { key: "points_per_unit", label: "Points per currency unit spent", min: 0, max: 100 },
  { key: "birthday_points", label: "Birthday points", min: 0, max: 100000 },
  { key: "redemption_points", label: "Points required for a reward", min: 1, max: 1000000 },
  { key: "discount_percent", label: "Reward discount (%)", min: 1, max: 100 },
]
const RewardsPage = () => {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [count, setCount] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  useEffect(() => { fetch("/admin/rewards", { credentials: "include" }).then(async response => { const data = await response.json(); if (!response.ok) throw new Error(data.message || "Could not load rewards"); return data }).then(data => { setSettings(data.settings); setMembers(data.members); setCount(data.count) }).catch(error => setError(error.message)) }, [])
  const save = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError("")
    try {
      const response = await fetch("/admin/rewards", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Could not save rewards")
      setSettings(data.settings)
      toast.success("Rewards settings saved")
    } catch (error) { setError((error as Error).message) }
    finally { setSaving(false) }
  }
  return <Container><Heading level="h1">Loyalty & rewards</Heading><Text className="mt-2 text-ui-fg-subtle">Your points program, customer memberships, and birthday rewards. Store credit is managed separately.</Text>{error && <Text role="alert" className="mt-4 text-ui-fg-error">{error}</Text>}{settings ? <form onSubmit={save} className="mt-8 grid max-w-2xl gap-5"><div className="grid gap-2"><Label htmlFor="program-name">Program name</Label><Input id="program-name" required maxLength={80} value={settings.name} onChange={event => setSettings({ ...settings, name: event.target.value })} /></div><div className="flex items-center gap-3"><Switch id="rewards-enabled" checked={settings.enabled} onCheckedChange={enabled => setSettings({ ...settings, enabled })} /><Label htmlFor="rewards-enabled">Enable earning and redemption</Label></div><div className="grid gap-5 sm:grid-cols-2">{fields.map(field => <div key={field.key} className="grid gap-2"><Label htmlFor={field.key}>{field.label}</Label><Input id={field.key} required type="number" min={field.min} max={field.max} step={1} value={settings[field.key]} onChange={event => setSettings({ ...settings, [field.key]: Number(event.target.value) })} /></div>)}</div><Text className="text-ui-fg-subtle">Changes apply to future awards and redemptions. Existing points and issued discount codes are preserved. Pausing stops new awards and redemptions; existing codes remain usable.</Text><Button type="submit" isLoading={saving} className="justify-self-start">Save program</Button></form> : !error && <Text className="mt-6">Loading rewards…</Text>}<section className="mt-10 border-t pt-7"><Heading level="h2">Members ({count})</Heading><Text className="mt-2 text-ui-fg-subtle">Latest 50 memberships. Balances include refunds and redeemed points.</Text><div className="mt-5 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="p-3">Customer</th><th className="p-3">Points</th><th className="p-3">Earned</th><th className="p-3">Birthday</th><th className="p-3">Joined</th></tr></thead><tbody>{members.map(member => <tr key={member.id} className="border-b"><td className="p-3"><a className="text-ui-fg-interactive" href={`/app/customers/${member.customer_id}`}>{member.customer_id}</a></td><td className="p-3">{member.balance}</td><td className="p-3">{member.lifetime_points}</td><td className="p-3">{member.birthday_month ? `${member.birthday_month}/${member.birthday_day}` : "Not saved"}</td><td className="p-3">{new Date(member.created_at).toLocaleDateString()}</td></tr>)}</tbody></table>{!members.length && <Text className="py-6 text-ui-fg-subtle">Customers will appear here when they join the club.</Text>}</div></section></Container>
}
export const config = defineRouteConfig({ label: "Rewards" })
export default RewardsPage
