# Loyalty program

The native Medusa points program uses the storefront's Lavender Vanilla styling. This is a custom program inspired by Smile/Rivo; it does not require an account with either service.

- Public rewards page: `/us/rewards` (or another country prefix).
- Customer dashboard: `/us/account/rewards`.
- Floating Rewards panel: all main storefront pages outside CMS draft preview.
- Medusa Admin: **Rewards**, at `/app/rewards`.

## Defaults

100 joining points, 1 point per currency unit of paid product purchases, 200 annual birthday points, and 500 points for a 10% personal discount. Change the name, amounts, or enabled state in Admin. New settings apply to future awards/redemptions, preserving existing points and codes. Earning uses the order's currency unit, without currency conversion.

Customers explicitly join after creating an account. Purchases placed before joining are excluded. Orders must be fully captured to earn points; authorized/unpaid orders do not earn. Shipping, product tax, and discounts are excluded from the earning subtotal. Partial refunds reduce points proportionally to the refunded order total; cancellations/full refunds reverse them. Balances may be negative after already-redeemed points are refunded.

Birthday eligibility requires the month/day to be saved at least 30 days before the birthday. Awards run during birthday week, once per calendar year. February 29 maps to February 28 in non-leap years. The birthday can be saved once by the customer.

Dashboard visits synchronize paid orders, refunds, and birthday awards. Order events also synchronize points; a background job runs every 15 minutes while the backend is running. There are no email notifications in this version.

Rewards produce customer-restricted Medusa promotions with a campaign usage limit of one. Codes apply only to the currency selected at redemption. Apply at checkout while signed in. Points are debited once per request ID; a pending redemption can be resumed with the same ID after an interruption. Used or unavailable codes are labeled in the dashboard. Points and store credit are separate.

## Verification

From `apps/backend`, on PowerShell:

```powershell
$env:TEST_TYPE = "unit"
npm exec -- jest src/lib/__tests__/rewards.unit.spec.ts --runInBand --forceExit
npm exec -- medusa exec ./src/scripts/check-rewards.ts
```

The workflow check requires an enabled local program and creates then removes a disposable customer, points entries, and promotion. No real payment is made. It verifies award/redemption retries, birthday awards, insufficient balances, customer and currency restrictions, and single-use promotion enforcement. Unit tests cover capture/refund eligibility and birthday date rules.

This version has no referrals, VIP tiers, or points expiry. Multiple backend instances require a shared distributed locking provider; the local setup uses Medusa's in-memory lock.
