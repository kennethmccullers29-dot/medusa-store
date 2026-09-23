import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const isStarterPolicy = (content: string) =>
  content.startsWith("Your privacy matters to us. We collect only the information needed") ||
  content.startsWith("By using this website, you agree to these terms.")

export function PolicyPending({ title }: { title: string }) {
  return <main className="bg-homestead-cream">
    <header className="border-b border-homestead-border px-6 py-16 text-center md:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-homestead-olive">Store information</p>
      <h1 className="mt-3 font-heading text-5xl text-homestead-forest md:text-7xl">{title}</h1>
    </header>
    <div className="content-container max-w-3xl space-y-5 py-14 text-base leading-8 text-homestead-ink md:py-20">
      <p>This page is being updated. Please contact us with any questions before placing an order.</p>
      <LocalizedClientLink href="/contact" className="font-semibold underline underline-offset-4">Contact us</LocalizedClientLink>
    </div>
  </main>
}

export default function LegalPage({ title, content, updatedAt }: { title: string; content: string; updatedAt: string }) { return <main className="bg-homestead-cream"><header className="border-b border-homestead-border px-6 py-16 text-center md:py-24"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-homestead-olive">Store information</p><h1 className="mt-3 font-heading text-5xl text-homestead-forest md:text-7xl">{title}</h1><p className="mt-4 text-sm text-homestead-muted">Last updated {new Date(updatedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</p></header><article className="content-container max-w-3xl whitespace-pre-line py-14 text-base leading-8 text-homestead-ink md:py-20">{content}</article></main> }
