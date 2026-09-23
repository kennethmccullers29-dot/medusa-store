# Admin analytics

Open **Analytics** in the Medusa Admin sidebar, or visit http://localhost:9000/app/analytics. This authenticated dashboard reads Medusa orders and payments; no third-party analytics service is required.

Select a currency and a date range (up to 366 days), or use Today / 7 / 30 / 90 days. The comparison uses the immediately preceding period with the same number of calendar days. All date boundaries are UTC. Refresh retrieves live data.

## Metric definitions

- **Order sales:** order totals after discounts, including shipping and taxes, less recorded refunds. Includes unpaid orders.
- **Net collected:** captured payments less recorded refunds.
- **Orders:** placed orders excluding draft and canceled orders.
- **Average order value:** order sales divided by eligible order count.
- **Units ordered:** quantities ordered, before returns.
- **Refunded amount:** refunds recorded against eligible orders.
- **Top products:** product line totals after discounts, including tax, before refunds. Variants are grouped by product; deleted products retain the order's title.
- **Returning customer share:** unique customers with a non-draft, non-canceled order before the selected period, in any currency, divided by unique known customers ordering in the selected currency/period. Orders without a customer ID are excluded from customer counts.

Every figure excludes draft and canceled orders. Captures and refunds are attributed to the order's placement date. A later capture or refund therefore changes the original order's reporting period; this is an order-cohort report, not a transaction-date accounting report. Currencies are never combined or converted.

Traffic, sessions, attribution, conversion funnels, and acquisition costs are not available from order data alone. They require a separate storefront tracking integration. The dashboard explicitly indicates that traffic tracking is not configured.

## Verification

From `apps/backend`, on PowerShell:

```powershell
$env:TEST_TYPE = "unit"
npm exec -- jest src/lib/__tests__/analytics.unit.spec.ts --runInBand --forceExit
npm exec -- medusa exec ./src/scripts/check-analytics.ts
```

Unit tests cover currencies, canceled/draft orders, payments and refunds, empty stores, UTC boundaries, previous-period alignment, product grouping, and customer counts. The read-only workflow check reconciles daily sales and order counts with the summary against the local backend. Source reads are paginated, so figures aren't limited to the admin's first page of orders.
