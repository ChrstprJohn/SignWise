# AI review verification — 2026-10-06

The original local-only review scope is superseded by the user's request for a back link and real AI integration.

- pnpm lint: passed.
- pnpm build: passed; the built client contains no GEMINI_API_KEY, x-goog-api-key header, provider URL, or test credential markers.
- pnpm test: 19 passed. Includes TXT/DOCX extraction, archive expansion caps, PDF/image signatures, structured/provider error handling, configured status without credential disclosure, origin and upload checks, missing-key guard, timeout, upstream cancellation, and existing picker boundaries.
- Native built server: /review/ and /api/status both returned 200. Temporary foreground server stopped afterward.
- Desktop browser: Back to home is above the title; link returns to /#home. Synthetic report displayed summary, key terms, concerns, helpful clauses, excerpts, questions, and limitations. Focus moved to the report title. File removal cleared the report and refocused the picker.
- Mobile browser at 390px: upload and results layouts checked; no horizontal overflow, single-column terms, stacked report controls and finding priorities. Viewport reset afterward.
- Temporary synthetic QA server stopped and its script removed. No mock route or test provider is included in the app's runtime configuration.
- Saving the report invoked the download action, but the in-app browser did not report a download event. Plain-text export code is present; completion in a normal browser remains to be checked.
- Actual local status currently reports configured=false. A live provider check is pending the user's API key. Do not describe the stubbed QA output as real Gemini output.
- Main foreground preview remains running at the user's request; extra QA/built-server processes were stopped.

Proof: .impeccable/review/ai-review-desktop-2026-10-06.jpg, ai-results-desktop-qa-2026-10-06.jpg, ai-results-mobile-qa-2026-10-06.jpg. QA report images are explicitly synthetic.

## Live PDF fix — 2026-10-06

The user supplied a key and selected gemini-3.1-flash-lite. The live API rejected generationConfig.responseFormat.text.mimeType='application/json' with INVALID_ARGUMENT: that REST field requires the APPLICATION_JSON enum. Corrected the enum according to the API reference (https://ai.google.dev/api/generate-content#TextResponseFormat). The earlier all-400 document error concealed this configuration issue; HTTP 400 handling now distinguishes request format, invalid key, project location, billing, and document input errors without returning provider payloads.

Verification: live synthetic agreement text succeeded. A genuine one-page synthetic rental-agreement PDF was submitted through the running /api/analyze endpoint and returned HTTP 200, Rental Agreement, four key terms, and one concern. No personal document was used for these checks. All 20 tests passed, including a regression for the REST enum and configuration-error classification. Lint and production build passed. The user's existing model/key settings were preserved. The main preview remains available for retrying the original upload.

## Dedicated results route — 2026-10-06

- Results now open at /review/results/ after successful analysis. Live synthetic review produced 2 red flags, 2 good terms, and 2 gap-specific questions (missing fee amount; unclear repair timeline).
- Desktop and 375px mobile browser QA: correct section order, no horizontal overflow, collapsed overview by default, optional source excerpt disclosure, and heading focus. Browser back retained file/context; forward restored the report without another AI call. The optional overview expanded correctly.
- Direct results navigation or refresh without an in-memory report shows a recovery action. Upload content stays mounted but hidden during results, and only the visible main receives the skip-link target.
- Automated tests cover sorted red-flag priority, typed missing/unclear questions, and exported report order. Build produces the third HTML entry for results.
- Temporary QA screenshots are ignored by Git. API keys, build artifacts, dependency directories, and temporary fixtures also remain excluded. The user's GitHub remote is configured for the requested initial commit/push.
- Proof: .impeccable/review/results-page-desktop-2026-10-06.jpg and results-page-mobile-2026-10-06.jpg. These show live AI output for synthetic test content, not a personal document.
