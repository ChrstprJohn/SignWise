# SignWise PostHog analytics

This folder describes SignWise only. Its implementation is independent of the other apps, even though the public PostHog project is shared. Every SignWise event has `site_name = signwise` and an `environment` property.

- [Implementation and event reference](IMPLEMENTATION.md)
- [Dashboard setup and PostHog AI prompt](DASHBOARD.md)

## Configuration

The public browser configuration is already supplied in `.env.production`:

```dotenv
VITE_POSTHOG_TOKEN=your_public_project_token
VITE_POSTHOG_HOST=https://us.i.posthog.com
```

The checked-in file contains the shared project's actual public ingestion token, not the placeholder above. This token is designed to be embedded in the browser bundle. Never add a PostHog personal API key or the private Gemini API key to this file. The server's `.env` remains ignored and separate.

For development, `.env.local` contains the same browser settings and is Git-ignored. Vite embeds these values at build time. Process environment values override env-file settings; use them to select another project when deploying elsewhere. Restart Vite after changing env files, or rebuild and redeploy for production. With no token, the tracking wrapper is a no-op. To disable an existing configured deployment, build with an empty `VITE_POSTHOG_TOKEN` override.

`pnpm dev` produces `environment = development`; a normal `pnpm build` produces `environment = production`. A custom Vite mode becomes the environment value. Keep local tests out of production dashboards using both event-property filters, not hostname alone.

## Verify production

1. Build and deploy SignWise with its existing server/API setup. Analytics does not configure Gemini or deploy the app.
2. Open the deployed home page, enter the review page, and select a synthetic document. Analyze it only if the server is configured.
3. In PostHog's live events, look for `$pageview`, `review_upload_viewed`, and `document_selected`, with `site_name = signwise` and `environment = production`.
4. Complete a synthetic review and export. Confirm the success, results, and download-start events. Check event properties contain only controlled metadata, not filenames, notes, or report text.
5. Create the dashboard using [DASHBOARD.md](DASHBOARD.md). Zero results may mean no deployed traffic, blocked ingestion, a mismatched token/host, an incorrect date range, or restrictive filters; dashboard creation alone does not prove ingestion.

SDK initialization and capture are best effort: network blocking or analytics failure must not interrupt a review. Approximate geography comes from PostHog's IP-based enrichment. SignWise does not request GPS or browser location permission.

## Verification performed

Lint, the Node test suite, and production build passed. Headless Edge checks on desktop and mobile used mocked Gemini and PostHog endpoints to verify pageviews, masked click capture, selection/removal/rejection, failure and retry, cancellation, success, results recovery after refresh, export, site/environment tags, and opt-out. Sensitive synthetic filenames, notes, clauses, and report text were absent from captured payloads. These checks do not verify delivery to the live PostHog project.

The cancellation check also caught and fixed a button default-action issue that could resubmit immediately after cancelling. The landing-page visit count remains static preview content; it is not connected to PostHog.
