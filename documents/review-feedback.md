# Results feedback preview — 2026-10-09

The feedback banner is currently hidden at the user's request. ResultsPage does not import or render it. The reusable `src/ReviewFeedback.jsx` component and its styles are retained for later; Document overview remains removed.

The feedback banner replaces Document overview at the bottom of the results page. It extends the established warm-stone and ink-navy identity with serif headings, sans-serif fields, brass stars, thin rules, and the existing primary button. The desktop introduction and form sit in two columns; at widths up to 700px they stack, and the preview button fills the form width.

This is a form design and local preview only. Readers choose 1–5 stars, enter a name, and select one of three preset messages or write a custom message. Names allow up to 80 characters; custom messages allow up to 500 and show a character count. Preview feedback becomes available once the rating, a nonblank name, and a nonblank message are present.

Preview feedback displays the chosen rating, trimmed name, and message beneath the form. Editing any field clears the previous preview. Values live only in the mounted component's browser memory: feedback is never sent, saved, published, or added to landing testimonials. The visible form notice explains this limit. The form is excluded from analytics autocapture.

Native radio groups, fieldsets, legends, explicit labels, visible star focus, and a status region support keyboard and assistive-technology use. Rating controls have 44px targets and accessible star-count labels; custom text retains its line breaks in the preview.

Build and lint passed. Desktop and mobile browser interactions passed for preset and custom messages, preview creation and clearing, and keyboard radio-arrow navigation. The 390px mobile check showed no horizontal overflow.

No durable design-system change is needed. This is a surface extension; DESIGN.md, its incumbent tokens, and the brand identity remain the authority for future interfaces.
