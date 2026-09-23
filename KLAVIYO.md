# Klaviyo setup

1. In Klaviyo, create an **email list** under Audience → Lists & segments. Keep double opt-in enabled if you want confirmation emails.
2. Create a private API key with Events: Write, Profiles: Write, Lists: Read/Write, and Subscriptions: Write permissions.
3. Store the private key and list ID locally in `apps/backend/.env`: `KLAVIYO_PRIVATE_API_KEY`, `KLAVIYO_LIST_ID`, and `KLAVIYO_ENABLED=true`. Never use a `NEXT_PUBLIC_` variable for the private key.
4. Restart the Medusa backend. Open **Klaviyo** in Medusa Admin and choose **Check connection**. The footer newsletter form appears once the configuration is enabled and both settings exist.
5. Submit your own email and complete the list’s confirmation process. Check the profile and list in Klaviyo before enabling signup flows.

New account and order events send Created Account, Placed Order, Ordered Product, and Cancelled Order metrics. Event IDs stay stable when deliveries are retried. Prices use Medusa’s currency amounts directly, and include the currency code. Existing customers/orders are not backfilled. Purchases and account creation never grant newsletter consent.

Subscription requests are asynchronous; acceptance does not guarantee a confirmed subscription. Configure welcome and post-purchase flows inside Klaviyo. Browser tracking, abandoned-checkout events, historical imports, and campaign sending are not part of this integration. No events leave the backend while `KLAVIYO_ENABLED` is false. For production, apply a shared rate limit to the public newsletter endpoint at your gateway.

API references: [Subscriptions](https://developers.klaviyo.com/en/reference/bulk_subscribe_profiles), [Events](https://developers.klaviyo.com/en/reference/create_event).
