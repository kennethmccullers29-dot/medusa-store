# Stripe checkout

The storefront uses Stripe's Payment Element. Medusa creates the Payment Intent,
and Stripe handles the payment fields and any required authentication. Stripe
must be enabled as a payment provider in each Medusa region where it is offered.

For local testing, put a Stripe **test** secret key in
`apps/backend/.env` as `STRIPE_API_KEY`, and its matching **test** publishable
key in `apps/storefront/.env.local` as `NEXT_PUBLIC_STRIPE_KEY`. Restart both
development servers after changing these values. Never put a secret key in a
`NEXT_PUBLIC_` variable or commit either `.env` file.

For webhook-driven payment updates, create a Stripe webhook endpoint pointing
to `https://YOUR_BACKEND_HOST/hooks/payment/stripe_stripe`. Subscribe it to
`payment_intent.amount_capturable_updated`, `payment_intent.succeeded`,
`payment_intent.payment_failed`, and `payment_intent.partially_funded`. Set the
endpoint's signing secret as `STRIPE_WEBHOOK_SECRET` in the backend environment,
then restart the backend. Use a Stripe CLI forwarded webhook and its temporary
signing secret for local webhook testing.

Before taking live payments, replace both test keys with matching live keys,
configure the live webhook endpoint and signing secret, and complete Stripe
account activation. Test the full checkout and a webhook-delivered order before
opening live checkout.
