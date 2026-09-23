const storefrontUrl = (import.meta.env.VITE_STOREFRONT_URL || "http://localhost:8000").replace(/\/$/, "")

export const studioUrl = `${storefrontUrl}/studio/structure`
