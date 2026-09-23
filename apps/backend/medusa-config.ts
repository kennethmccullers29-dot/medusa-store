import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  plugins: [
    {
      resolve: "@medusajs/loyalty-plugin",
      options: {},
    },
  ],
  admin: {
    backendUrl: process.env.MEDUSA_BACKEND_URL,
    disable: process.env.DISABLE_MEDUSA_ADMIN === "true",
    vite: (config) => ({
      resolve: {
        ...config.resolve,
        // Keep admin dependencies on the backend's React version in this workspace.
        dedupe: [...(config.resolve?.dedupe ?? []), "react", "react-dom"],
      },
    }),
  },
  modules: [
    { resolve: "./src/modules/rewards" },
    ...(process.env.STRIPE_TAX_ENABLED === "true" ? [{
      resolve: "@medusajs/medusa/tax",
      options: {
        providers: [{
          resolve: "./src/modules/stripe-tax",
          id: "stripe",
          options: {
            apiKey: process.env.STRIPE_API_KEY,
            productTaxCode: process.env.STRIPE_TAX_PRODUCT_CODE || "txcd_99999999",
          },
        }],
      },
    }] : []),
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/payment-stripe",
            id: "stripe",
            options: {
              apiKey: process.env.STRIPE_API_KEY,
              webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
              automatic_payment_methods: true,
            },
          },
        ],
      },

    },
    {
      resolve: "./src/modules/product-review",
    },
     {
      resolve: "@medusajs/medusa/fulfillment",
      options: {
        providers: [
          // default provider
          {
            resolve: "@medusajs/medusa/fulfillment-manual",
            id: "manual",
          },
          {
            resolve: "./src/modules/shippo",
            id: "shippo",
            options: {
              api_token: process.env.SHIPPO_API_TOKEN || process.env.SHIPPO_API_KEY,
              from_email: process.env.SHIPPO_FROM_EMAIL,
              parcel_length_cm: Number(process.env.SHIPPO_PARCEL_LENGTH_CM || 25),
              parcel_width_cm: Number(process.env.SHIPPO_PARCEL_WIDTH_CM || 20),
              parcel_height_cm: Number(process.env.SHIPPO_PARCEL_HEIGHT_CM || 10),
            },
          },
        ],
      },
      
    },
    

  ],
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    workerMode: (process.env.MEDUSA_WORKER_MODE || "shared") as "shared" | "server" | "worker",
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    }
  }
})
