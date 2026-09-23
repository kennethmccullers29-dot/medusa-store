"use client"

import { useState } from "react"

export default function Brand({ name, logo, variant = "default" }: { name: string; logo: string; variant?: "default" | "inverse" }) {
  const [failedLogo, setFailedLogo] = useState("")
  if (!logo || failedLogo === logo) return <span className={`block max-w-[40vw] font-heading text-[20px] font-medium leading-[1.1] tracking-tight [overflow-wrap:anywhere] xsmall:text-[24px] md:max-w-[42vw] ${variant === "inverse" ? "text-left text-homestead-cream md:text-[34px]" : "text-center text-homestead-forest md:text-[28px]"}`} title={name}>{name}</span>
  return <img src={logo} alt={name} onError={() => setFailedLogo(logo)} className="h-9 w-auto max-w-[32vw] object-contain md:h-10 md:max-w-56" />
}
