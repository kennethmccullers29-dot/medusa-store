# Stripe Tax in Medusa

The US storefront region has automatic taxes enabled, but currently has no US tax region. Stripe Tax is staged behind `STRIPE_TAX_ENABLED=false` in `medusa-config.ts`. Its provider identifier, once enabled, is `tp_stripe-tax_stripe`.

The provider quotes USD, US, tax-exclusive baskets through Stripe Tax. It sends the complete product and shipping basket even though Medusa asks for product and shipping tax lines separately. On `order.placed`, the subscriber checks that Stripe's calculation total equals the Medusa order total before recording a Stripe Tax transaction. On `order.canceled`, it creates a full reversal. Both transaction calls use stable idempotency keys.

## Before activation

1. Confirm the business's North Carolina sales and use tax registration with the NC Department of Revenue or a qualified tax professional. A Stripe Tax registration does not register the business with a tax authority.
2. In Stripe Tax test mode, complete the business head office address and add a test NC registration. Currently a test calculation returns `stripe_tax_inactive`, so checkout cannot be validated against the account yet.
3. Validate the relevant product tax codes. `txcd_99999999` is the default general tangible goods code; soap, deodorant, bath products, gift cards, and any shipping treatment should be reviewed individually before production. Set `STRIPE_TAX_PRODUCT_CODE` if a different shared code is appropriate.
4. The provider deducts Medusa's allocated product and shipping adjustments before calculating tax. It deliberately rejects inclusive prices, multiple shipping methods, non-USD currency, and non-US shipping. Add support and end-to-end tests for any of those cases the storefront uses before activation. Partial refunds and order edits also require Stripe Tax transaction adjustments before production use.
5. In test mode, set `STRIPE_TAX_ENABLED=true` in the backend's local environment and restart Medusa. Create a US tax region in Admin → Settings → Tax Regions, then select `Stripe Tax` as its tax provider. Keep production disabled until a full checkout, cancel, refund, and reporting reconciliation pass with the business's real tax settings.

The provider will not silently return zero tax on Stripe API failures. It returns no tax lines only while the destination lacks a postal code. Checkout should require a complete shipping address before order placement.

Stripe Tax and Medusa tax regions cover online checkout. A future event POS must use the same tax product mapping and report its own sales and reversals to avoid gaps or duplicate transactions.
