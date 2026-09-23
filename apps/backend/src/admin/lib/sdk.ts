import Medusa from "@medusajs/js-sdk"

export const sdk = new Medusa({
  baseUrl: "http://localhost:9000",
  debug: import.meta.env.NODE_ENV === "development",
  auth: {
    type: "session",
  },
})