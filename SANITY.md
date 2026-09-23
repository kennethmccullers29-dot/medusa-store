# Sanity CMS

The Studio lives at http://localhost:8000/studio. It includes a section-based page builder, the journal/blog, branding, rich text, uploaded images, SEO fields, and draft preview. Commerce, reviews, loyalty, and contact submissions remain in Medusa.

## Connect a project

1. Create a Sanity project at https://www.sanity.io/manage with a **public** dataset named `production`.
2. Add these variables to `apps/storefront/.env.local` (keep the existing Medusa variables):

   ```dotenv
   NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
   NEXT_PUBLIC_SANITY_DATASET=production
   NEXT_PUBLIC_STOREFRONT_URL=http://localhost:8000
   SANITY_API_READ_TOKEN=your_viewer_token
   ```

   Create a Viewer token under the project's API settings for server-side draft preview. Do not give tokens a `NEXT_PUBLIC_` prefix.
3. Add `http://localhost:8000` to the project's API CORS origins with credentials enabled. Add your storefront's real origin when deploying, and update `NEXT_PUBLIC_STOREFRONT_URL`.
4. Restart the storefront, open `/studio`, and sign in with your Sanity account.

## Move existing content

Run from the repository root while the backend database is available:

```sh
npm run cms:export
npm run cms:check
```

This exports existing homepage sections, branding, contact information, privacy/terms, and blog posts into `sanity-export.ndjson`. It excludes customer data and contact submissions. Unpublished posts remain drafts. Review the export before importing.

Temporarily add `SANITY_API_WRITE_TOKEN` to `apps/storefront/.env.local`, using a Sanity Editor token, then run:

```sh
npm run cms:import
```

The importer creates missing documents and preserves existing Sanity documents on repeat runs. Remove the write token after importing. Existing image URLs are preserved; you can replace them with uploads in Studio.

## Editing

- **Customer reviews:** add this section from the Community menu. Customize its heading and introduction, choose up to six approved Medusa reviews, and arrange their order. Empty selections use the latest three approved reviews. Unapproved or deleted selections are omitted. Empty sections stay hidden on the published storefront and show guidance in draft preview. Customer names use last initials, and published products have links back to their product pages.

- **Homepage:** add, drag to reorder, hide, and publish sections. Product collections can use Medusa product handles; categories and prices come from Medusa.
- **Featured products:** Product collection sections include a searchable Medusa product picker with thumbnails. Select up to eight products and use the arrows to set their display order. Existing selections are preserved. Leave the selection empty to display recent products. The picker lists products published to the storefront's sales channel.
- **Drag-and-drop preview:** open Presentation, navigate to your page, and enable Edit. Drag a section's overlay to a new position. Sections reorder immediately in preview and save to the draft; Publish makes the layout public. Hidden sections appear as placeholders in draft preview so they can still be arranged. The section menu groups shop, brand/education, and community blocks. Desktop mouse/trackpad dragging is supported; use the section list on touch devices.
- **Pages:** create a page with a slug such as `about` to serve `/dk/about`. Use `home` for the homepage. Existing `contact`, `privacy`, and `terms` routes can be edited here. Country prefixes follow the storefront's regions.
- **Journal / Blog:** edit Portable Text articles, cover images, authors, excerpts, publication dates, and SEO. Future-dated posts remain hidden from published views.
- **Site settings:** change the site name or upload a logo.
- **Presentation:** view changes before publishing. Draft preview needs the read token above. The preview banner lets you return to published content.

Until a project ID is configured, the storefront uses the existing Medusa content. After connection, Sanity owns the blog and branding. Pages without a matching Sanity document retain their legacy fallback where one exists. Medusa's Content screen retains contact submissions and labels its legacy editors accordingly.

The default preview country is `dk`; set `NEXT_PUBLIC_DEFAULT_REGION` if your default market changes. Deploy the embedded Studio with the storefront; no separate Studio host is needed.
