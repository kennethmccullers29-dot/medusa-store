# Deploying the store with Coolify

This repository contains two applications. Create separate Coolify applications from the same GitHub repository. Keep the base directory at `/` so npm can use the root workspace lockfile. Do not deploy the root `npm run build` as one application: it builds both apps and the storefront requires a running backend and a production publishable key.

Set up HTTPS domains for the backend and storefront before configuring production URLs. Store credentials only in Coolify environment variables, never in Git. Mark variables needed by a build as **Build Variable**; a changed build variable needs a redeploy.

## 1. Backend and data services

Create persistent PostgreSQL and Redis resources in Coolify. Create an application for the backend with the **Railpack** build pack and these settings:

| Setting | Value |
| --- | --- |
| Base Directory | `/` |
| Install Command | `npm ci` |
| Build Command | `npm run build --workspace=@dtc/backend && cd apps/backend/.medusa/server && npm install --omit=dev` |
| Start Command | `cd apps/backend/.medusa/server && npx medusa db:migrate && npm run start` |
| Ports Exposes | `9000` |
| Static site | Off |

Set `NODE_ENV=production`, `HOST=0.0.0.0`, `PORT=9000`, `DATABASE_URL`, `REDIS_URL`, random `JWT_SECRET` and `COOKIE_SECRET`, `MEDUSA_WORKER_MODE=shared`, and `DISABLE_MEDUSA_ADMIN=false`. Set `MEDUSA_BACKEND_URL` and `ADMIN_CORS` to the public backend origin; set `STORE_CORS` to the public storefront origin; set `AUTH_CORS` to both origins separated by a comma. Set `VITE_STOREFRONT_URL` to the public storefront origin for links to Sanity Studio in Medusa Admin. Make `MEDUSA_BACKEND_URL` and `VITE_STOREFRONT_URL` available during the build. Add the payment, shipping, and other integration variables from `apps/backend/.env.template` only as needed for the production account; do not copy local test credentials blindly.

Deploy the backend and confirm `https://<backend-domain>/health` responds before building the storefront. Log into `https://<backend-domain>/app`, then create a publishable API key under **Settings → Publishable API Keys** and assign the storefront's sales channel. A key from the local database will not work with a new production database.

For higher traffic, deploy a second backend instance in worker mode with the same database and Redis, `MEDUSA_WORKER_MODE=worker` and `DISABLE_MEDUSA_ADMIN=true`, while setting the server instance to `MEDUSA_WORKER_MODE=server`. Do not run two shared-mode instances together.

## 2. Storefront

Create another Railpack application from this same repository:

| Setting | Value |
| --- | --- |
| Base Directory | `/` |
| Install Command | `npm ci` |
| Build Command | `npm run build --workspace=@dtc/storefront` |
| Start Command | `npm run start --workspace=@dtc/storefront` |
| Ports Exposes | `8000` |
| Static site | Off |

Set `NEXT_PUBLIC_MEDUSA_BACKEND_URL` to the public backend origin and `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` to the **production** key. Both must be Build Variables because Next.js reads them while building pages. Set `NEXT_PUBLIC_BASE_URL` and `NEXT_PUBLIC_STOREFRONT_URL` to the public storefront origin. Add `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, and `NEXT_PUBLIC_STRIPE_KEY` if those features are enabled. Keep `SANITY_API_READ_TOKEN` server-only; do not use it as a `NEXT_PUBLIC_` variable. The backend must be reachable from the Coolify build container because Next.js pre-renders catalog pages.

Check a product page, cart, checkout, Admin login, and Sanity Studio after deployment. Configure persistent object storage for product and customer-uploaded files before taking live orders; the development file provider does not preserve uploads across container replacement.

## Current build failure

The first failed Coolify deployment ran the root `npm run build`. That started both workspaces, and the storefront stopped at `Missing required environment variables: NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`. Separating the apps and deploying the backend first removes this ordering problem.
