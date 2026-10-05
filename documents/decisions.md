# SignWise — product, design, and implementation decisions

Recorded on 2026-10-05, before implementation.

## Scope

Build the SignWise landing page and a frontend demonstration. SignWise will eventually accept documents, files, and camera photos and use Gemini Flash to explain red flags, favorable terms, pros, cons, and suggested questions before signing. This phase has no backend, authentication, actual document extraction, or model calls.

## Stack

Use the user's SchedSnap stack as a reference: React with JavaScript, Vite, Tailwind CSS through its Vite plugin, Lucide icons, and locally hosted fonts. Node >=22.12.0. Use only dependencies needed for this phase; omit Gemini SDK, analytics, routing, HTTP clients, GSAP, schema tooling, and Vercel CLI until a feature requires them. Verify available package versions rather than copying version numbers blindly. Track a package-manager lockfile with the project.

## Audience and language

Confirmed audience: everyday people reviewing leases, employment offers, and agreements. Write in clear, reassuring language. Describe AI assistance as a future capability. Sample findings must be identified as illustrative and must never be derived from or attributed to a selected user file.

Confirmed workflow: build directly in code with generated photography.

## Visual direction

Professional law-firm character expressed with warm ivory, forest green, editorial serif headlines, clean sans-serif body type, generous whitespace, understated thin rules, and daylight document photography. Prefer a human, approachable feel over courtroom clichés. No fabricated customer logos, testimonials, certifications, usage metrics, guaranteed accuracy, pricing, or privacy claims for a future service.

The verified UI/UX Pro Max search returned Trust & Authority + Conversion, accessible interaction patterns, and a serif/sans legal font pairing. Apply its hierarchy and accessibility guidance; translate its navy/gold suggestion to the chosen forest/ivory palette. The Impeccable context launcher could not run because its engine is not installed; its new-work and craft-floor references are read directly. The user already requested a conventional professional law-firm direction, which governs the visual work.

## Page structure

1. Compact navigation and prominent review action.
2. Split hero: clear value proposition, review action, sample action, generated document photograph, and an illustrative finding.
3. Familiar agreement categories without invented endorsements.
4. Three meaningful review outputs: risks, favorable terms, and questions to ask.
5. A three-step upload → understand → decide explanation and local upload/photo preview.
6. Expandable FAQ covering current functionality, file support, and appropriate use.
7. Final invitation and a concise footer.

## Interaction behavior

- Navigation scrolls to actual page sections; mobile navigation expands with accessible state.
- Sample action opens a visible inline sample review with risk, favorable terms, and suggested questions. It never pretends to analyze a selected file.
- Upload uses a file input plus keyboard-accessible drop zone. Camera input uses image capture on supported devices.
- Accept PDF, DOCX, TXT, JPEG, PNG, and WebP; maximum 10 MB. Show clear validation and removable local file state.
- Selected files remain in browser memory. No network upload or persistence. No simulated scan or fabricated file-specific results.
- FAQ uses semantic disclosure elements. All buttons and links have functional outcomes.

## Accessibility and responsive behavior

Semantic landmarks, skip link, decorative icon hiding, visible focus, 44px control targets, readable contrast, status announcements, reduced motion support, and no horizontal overflow. Preserve content order on mobile and use local fonts to avoid third-party requests on page load.

## Assets and verification

Generate project photography with the built-in Imagegen tool. Save final assets under public/images and record exact prompts and provenance in documents/assets.md. Inspect desktop and mobile in one bounded browser review, fix material issues together, and confirm once. Run build, lint, and meaningful file-validation tests. Run servers in the foreground and stop their exact processes at the end.

## Future work

Gemini Flash must be integrated through a server endpoint so credentials are never shipped in the browser. Document extraction, jurisdiction/context, uncertainty handling, privacy/retention policy, accounts, limits, and pricing remain undecided. Obtain real evidence before making trust or performance claims.
