import { getStorefrontSettings } from "@lib/data/storefront-settings"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function Hero() {
  const settings = await getStorefrontSettings()
  if (!settings.hero_enabled) return null
  const hasImage = !!settings.hero_image_url
  const buttonClass = `mt-9 inline-flex min-h-12 items-center justify-center gap-5 rounded-sm px-8 py-3 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ${hasImage ? "bg-homestead-cream text-homestead-forest hover:bg-homestead-linen" : "bg-homestead-olive text-white hover:bg-homestead-forest"}`
  const button = <>{settings.hero_button_label}<span aria-hidden="true">→</span></>
  return (
    <section className="relative isolate flex min-h-[65vh] items-center justify-center overflow-hidden border-b border-homestead-border bg-homestead-linen px-6 py-24 md:py-32">
      {hasImage && <>
        <img src={settings.hero_image_url} alt={settings.hero_image_alt} fetchPriority="high" className="absolute inset-0 -z-20 h-full w-full object-cover object-center" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-homestead-forest/65" />
      </>}
      <div aria-hidden="true" className={`pointer-events-none absolute inset-4 border md:inset-6 ${hasImage ? "border-white/25" : "border-homestead-border"}`} />
      <div className="relative mx-auto w-full max-w-3xl text-center">
        {settings.hero_eyebrow && <p className={`mb-6 break-words text-xs font-medium uppercase tracking-[0.25em] ${hasImage ? "text-white" : "text-homestead-olive"}`}>{settings.hero_eyebrow}</p>}
        <h1 className={`break-words font-heading text-5xl font-normal leading-[1.12] tracking-tight md:text-7xl ${hasImage ? "text-white" : "text-homestead-forest"}`}>{settings.hero_title}{settings.hero_accent && <><br /><span className="italic">{settings.hero_accent}</span></>}</h1>
        {settings.hero_description && <p className={`mx-auto mt-7 max-w-md whitespace-pre-line break-words text-base leading-7 ${hasImage ? "text-white" : "text-homestead-muted"}`}>{settings.hero_description}</p>}
        {settings.hero_button_label && settings.hero_button_url && (settings.hero_button_url.startsWith("/") ? <LocalizedClientLink href={settings.hero_button_url} className={buttonClass}>{button}</LocalizedClientLink> : <a href={settings.hero_button_url} className={buttonClass}>{button}</a>)}
      </div>
    </section>
  )
}
