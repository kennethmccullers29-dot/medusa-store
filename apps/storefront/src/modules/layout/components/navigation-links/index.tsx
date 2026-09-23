"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export type NavigationLink = { label: string; url: string; enabled: boolean }
export function NavbarLink({ link, className, onClick }: { link: NavigationLink; className?: string; onClick?: () => void }) {
  if (link.url.startsWith("/") && !link.url.startsWith("//")) return <LocalizedClientLink href={link.url} className={className} onClick={onClick} title={link.label}>{link.label}</LocalizedClientLink>
  if (!/^https?:\/\//i.test(link.url)) return null
  return <a href={link.url} className={className} onClick={onClick} title={link.label}>{link.label}</a>
}
export default function NavigationLinks({ links }: { links: NavigationLink[] }) {
  const visible = links.filter(link => link.enabled)
  return <>
    {visible.map((link, index) => <li key={index}><NavbarLink link={link} className="block py-2 transition-colors hover:text-homestead-olive focus-visible:outline-offset-4" /></li>)}
  </>
}
