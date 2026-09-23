# Shippo fulfillment provider

This replaces ShipStation in the fulfillment provider configuration. Manual fulfillment remains available. Existing ShipStation shipping options must be replaced in Admin; changing the provider configuration does not convert them.

## Setup

1. Get a test API token from Shippo's API settings and set `SHIPPO_API_TOKEN` in the backend `.env`. `SHIPPO_API_KEY` is also accepted. Do not put tokens in source control.
2. Set `SHIPPO_PARCEL_LENGTH_CM`, `SHIPPO_PARCEL_WIDTH_CM`, and `SHIPPO_PARCEL_HEIGHT_CM` to your actual package dimensions. The starter defaults are 25 × 20 × 10 cm. This provider uses one box per fulfillment.
3. Set positive product variant weights in grams, and complete the stock location address, including phone and state where required by the carrier.
   If checkout rates do not appear, run `npm exec medusa -- exec src/scripts/diagnose-shippo.ts` from `apps/backend`. It reports published variant IDs without weights, the configured shipping options, and stock-location address completeness without printing addresses or API keys.
4. Restart the backend after changing environment settings.
5. In Admin Settings → Locations & Shipping, enable Shippo on the stock location. Create a calculated shipping option in the appropriate service zone, choose Shippo, and choose the carrier/service from the fulfillment options. Remove or disable old ShipStation options that are no longer used.
6. Try checkout with a domestic destination and the same currency supported by the carrier rates. Rates in other currencies are rejected rather than silently converted.
7. Creating a fulfillment purchases a 4 × 6 PDF label and saves tracking information. Start with a test token. A live token purchases real labels.

## Behavior and limits

Rate requests create Shippo shipment objects but do not purchase labels. Validation saves the carrier/service, shipment ID, and variant weights. Fulfillment requests a new quote for the quantities being shipped, which supports partial fulfillment. Rate totals use Shippo's rate amount; Medusa applies shipping taxes separately.

Domestic outbound shipping only. International customs declarations, return labels, tracking webhooks, packing algorithms, and currency conversion are not implemented. Checkout and label pricing can differ when carrier rates change. Configure the box dimensions for your actual packaging and keep weights current.

Cancellation requests a Shippo label refund. A queued refund means the request was submitted, not that the carrier has approved it. Monitor final refund status in Shippo.

If a label request times out or remains queued, check its transaction in Shippo before retrying. Automatic retries across failed Medusa workflows are not deduplicated; a successful Shippo purchase followed by a Medusa failure can otherwise lead to duplicate labels.

## References

- https://docs.goshippo.com/api-reference/carrier-accounts/list-all-carrier-accounts
- https://docs.goshippo.com/api-reference/shipments/create-a-new-shipment
- https://docs.goshippo.com/api-reference/transactions/create-a-shipping-label

## Verification

From `apps/backend` in PowerShell:

```powershell
$env:TEST_TYPE = "unit"
npm exec -- jest src/modules/shippo/__tests__/provider.unit.spec.ts --runInBand --forceExit
npm exec -- tsc --noEmit
npm exec -- eslint src/modules/shippo --config ../../eslint.config.ts
```

Set SHIPPO_FROM_EMAIL to your real sender email before creating labels. Run node scripts/check-shippo.cjs from apps/backend for an API smoke test; it requires a test token and uses sample addresses and a sample sender email.
