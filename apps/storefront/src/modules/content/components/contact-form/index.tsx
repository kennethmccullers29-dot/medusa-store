"use client"
import { submitContact, ContactState } from "@lib/data/contact-action"
import { useActionState } from "react"

export default function ContactForm() {
  const [state, action, pending] = useActionState(submitContact, null as ContactState)
  if (state?.success) return <div role="status" className="rounded-sm border border-homestead-border bg-white p-8 text-center"><p className="font-heading text-3xl text-homestead-forest">Message received</p><p className="mt-2 text-homestead-muted">{state.message}</p></div>
  const input = "h-12 rounded-sm border border-homestead-border bg-white px-4 outline-none focus:border-homestead-olive"
  return <form action={action} className="grid gap-5 rounded-sm border border-homestead-border bg-homestead-linen/40 p-6 md:p-8"><div className="grid gap-5 sm:grid-cols-2"><label className="grid gap-2 text-sm font-medium">Name<input name="name" required minLength={2} maxLength={100} className={input} /></label><label className="grid gap-2 text-sm font-medium">Email<input name="email" type="email" required className={input} /></label></div><label className="grid gap-2 text-sm font-medium">Subject<input name="subject" required minLength={2} maxLength={160} className={input} /></label><label className="grid gap-2 text-sm font-medium">Message<textarea name="message" required minLength={10} maxLength={5000} rows={7} className="rounded-sm border border-homestead-border bg-white px-4 py-3 outline-none focus:border-homestead-olive" /></label>{state && <p role="alert" className="text-sm text-red-700">{state.message}</p>}<button disabled={pending} className="min-h-12 rounded-sm bg-homestead-olive px-7 py-3 text-sm font-semibold text-white hover:bg-homestead-forest disabled:opacity-60">{pending ? "Sending…" : "Send message"}</button></form>
}
