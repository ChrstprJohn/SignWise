# SignWise

A React + JavaScript + Vite document-understanding app with a server-side Gemini Flash review service. The latest AI integration supersedes the original frontend-only phase.

## Add the API key

A blank, Git-ignored `.env` file is ready in the project root. Set:

```dotenv
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-3.8-flash
```

Get your own key from [Google AI Studio](https://aistudio.google.com/apikey). Never prefix the key with `VITE_`, put it in React code, or commit `.env`. Existing environment variables take precedence over `.env`.

The model default follows Google's current [Gemini model documentation](https://ai.google.dev/gemini-api/docs/models). If your project cannot access it, set `GEMINI_MODEL` to a supported Flash model. Requests use Google's [structured-output API](https://ai.google.dev/gemini-api/docs/generate-content/structured-output).

## Run locally

Requires Node >=22.12.0 and pnpm.

```sh
pnpm install
pnpm dev --host 127.0.0.1
```

Open `http://127.0.0.1:5173/review/`. Select a file, optionally describe your role or concerns, then choose **Analyze document**. The review page checks key configuration every 15 seconds. Vite also restarts when `.env` changes; reselect your file after a reload. Configuration status checks that a key is present; the actual analysis validates access and quota.

```sh
pnpm lint
pnpm test
pnpm build
```

To serve the built app **with its API**, run:

```sh
pnpm start
```

The built server binds to `127.0.0.1:5173`, with an optional `PORT` environment setting. `pnpm preview --host 127.0.0.1` also includes the API for local checks. Stop foreground servers with Ctrl+C. Static-only hosting cannot run document analysis; this local setup has no authentication, per-user quota, or public deployment configuration.

## Review flow

- Back to home appears above the review title.
- PDF, DOCX, TXT, JPG, PNG, and WebP are supported up to 10 MB. Camera capture depends on device support.
- Analysis is explicit. Selecting a file alone never uploads it.
- PDF and photos go to Gemini as inline file data. DOCX is extracted to plain text using Mammoth; TXT must be UTF-8. Extracted text is limited to 100,000 characters. DOCX archive expansion is checked before extraction.
- Results contain a summary, key terms, potential concerns with reading priority, helpful terms, source excerpts when available, suggested questions, and limitations. Save review downloads plain text.
- Loading, cancel, errors, retry, file replacement, and removal are supported. Cancellation aborts the upstream request; processing already performed by Google may still count toward usage.
- The API validates upload types, multipart size, and the result structure; blocks cross-origin uploads; limits concurrent reviews to two; and times out after two minutes. It does not log document contents, keys, or provider error payloads.
- Files and reports stay in memory, with no database or upload directory. Reloading clears the browser's selected file and review. A downloaded review remains on your device.

Choosing Analyze sends document contents through the local server to Google Gemini. Google's retention and use depend on your API plan and settings. See [Gemini API terms](https://ai.google.dev/gemini-api/terms). AI can miss details, and source citations are model-generated; check them against the original document. This app supports understanding and does not determine legal enforceability.

## Verification

Tests use synthetic documents and a stubbed provider, with no external AI calls. They cover extraction, size/type checks, secret handling, structured responses, provider failures, cancellation, timeout, and upload boundaries. A live Gemini review remains to be verified after a valid key is supplied.

## PostHog analytics

SignWise uses `posthog-js` for pageviews, masked clicks, and the document-review funnel. Every event is tagged `site_name = signwise` and the Vite `environment`. Production public browser config is included in `.env.production`; keep the private Gemini key in the ignored server `.env`. Tracking excludes filenames, document contents, user notes, and AI report text. Session replay is disabled; geography is approximate IP-based enrichment only.

See the independent [SignWise PostHog documentation](documents/posthog/README.md) for setup, implementation, event properties, verification, and the [PostHog AI dashboard prompt](documents/posthog/DASHBOARD.md). Metadata privacy is covered by focused unit tests; desktop/mobile browser checks also verified cancellation, export, opt-out, and masked payloads against mocked services.

## Visual context

The landing page keeps the existing matte warm-ivory, ink-navy, serif/sans design, compact mobile navigation, process imagery, mobile coverage containers, testimonial edge fades, FAQ layout, and closing review CTA. FAQs now explain the real upload behavior. The 15k+ visit statistic and reader testimonials remain unverified preview content inherited from the previous design.

Project history and asset provenance are in `documents/`. Current product and visual context are in PRODUCT.md and DESIGN.md. The latest review implementation is described in [Review page](documents/review-page.md).

Live connection follow-up (2026-10-06): Gemini analysis has now been verified with the user's configured gemini-3.1-flash-lite model using synthetic text and a genuine synthetic PDF. The REST responseFormat.text.mimeType field uses APPLICATION_JSON, as specified by the API reference. Configuration errors no longer appear as unreadable-document failures.

## Dedicated results page — 2026-10-06

Successful analysis now opens `/review/results/`. The reading order is **Red flags → Good terms → Follow-up questions**. Source excerpts and the document overview use optional disclosures to keep the default view concise. Questions specifically address material missing details or unclear wording; the AI is instructed to preserve original currencies and avoid filler. Results, upload file, and context remain in memory for back/forward navigation. Refreshing clears this state and shows an upload recovery action. No report content is put in the URL or browser storage.
