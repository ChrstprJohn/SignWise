# SignWise

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

JavaScript, React, Vite, and Tailwind CSS. A native Node server now connects to Gemini Flash. The user's 2026-10-06 request supersedes the earlier frontend-only phase.

## Product Purpose

Help everyday readers understand leases, employment offers, and agreements before signing: summarize key terms, identify potential concerns and helpful clauses, and suggest specific questions.

## Users and Operating Context

People upload a PDF, DOCX, text file, or document photo. The dedicated /review/ page lets them select a file, optionally describe their role or concerns, explicitly request AI analysis, and read or download the results. A back link above the title returns home. The landing page contains Home, How it works, What we do, Testimonials, and upload FAQs.

## Capabilities and Constraints

Gemini is called only from the server. The user supplies GEMINI_API_KEY in a Git-ignored .env file. A key-ready implementation is available; live provider access must be verified after a valid key is added. Never expose credentials through VITE_ variables, client code, logs, or URL parameters.

Supported files are PDF, DOCX, TXT, JPG, PNG, and WebP up to 10 MB. DOCX and TXT become plain text, capped at 100,000 characters. Images and PDFs use Gemini's native document processing. Camera capture depends on device support. Loading, cancel, retry, selection replacement, removal, and text report download are included.

Selecting a file keeps it in browser memory. Choosing Analyze sends its contents through SignWise to Google Gemini. SignWise does not persist files or reports. Google handling depends on the API plan and settings. No account system, database, public deployment, or per-user billing controls are included. The production server binds locally; public deployment needs its own access and usage controls.

Reports use plain language, retain source excerpts when available, disclose missing context, and avoid unsupported safety scores, enforceability claims, or signing recommendations. AI can miss details or generate incorrect citations. Check the original; the output supports document understanding, not legal advice. No invented sample report is shown in the product.

## Brand Commitments

Clean, professional, law-firm-inspired UI. Warm stone and ivory surfaces, ink navy, restrained brass and terracotta. EB Garamond Variable headings and DM Sans body. Existing pen-nib wordmark, stationery imagery, compact mobile navigation, and footer credit Made by .dcd are preserved. The review workspace stays within the established 850px measure.

## Evidence on Hand

No verified customer testimonials or analytics. The landing page retains a 15k+ preview statistic and four fictional reader reviews, with visible annotations removed at the user's earlier request. These are not real customer evidence. Backend tests use synthetic documents and a stubbed provider. Browser QA uses a temporary isolated synthetic endpoint; no mock reports ship in the app.

## Product Principles

- Explain document terms in plain language.
- Make sending a document an explicit action.
- Show concerns alongside helpful terms and actionable next questions.
- Disclose missing information and model limitations.
- Keep service credentials server-side and current functionality truthful.

## Latest results-flow refinement — 2026-10-06

A completed live review opens its own /review/results/ page. Red flags precede good terms and specific follow-up questions about missing or unclear details. Optional clause disclosures and Document overview keep secondary information out of the main reading flow. The report and selected file remain in memory across upload/results navigation, with clear recovery after refresh. Live Gemini has been verified using synthetic documents; the existing server key and chosen model remain unchanged.
