---
name: SignWise
description: Matte stone and ink navy for clear document understanding.
colors:
  primary: "#233244"
  primary-dark: "#162231"
  surface: "#f3f0e9"
  ink: "#202b38"
  muted: "#68665f"
  rule: "#d9d4ca"
  surface-alt: "#e9e5dd"
  terra: "#97533d"
  brass: "#8b7348"
typography:
  display:
    fontFamily: "EB Garamond Variable, Georgia, serif"
    fontSize: "clamp(60px, 5.8vw, 84px)"
    fontWeight: 500
    lineHeight: 1.07
    letterSpacing: "-0.025em"
  body:
    fontFamily: "DM Sans Variable, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.7
  navigation:
    fontFamily: "DM Sans Variable, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    letterSpacing: "0.11em"
  button:
    fontFamily: "DM Sans Variable, sans-serif"
    fontSize: "14px"
    fontWeight: 500
rounded:
  control: "2px"
spacing:
  control-gap: "12px"
  caption-gap: "14px"
  content-gap: "24px"
  grid-gap: "28px"
  section-padding: "56px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0 22px"
  button-primary-hover:
    backgroundColor: "{colors.primary-dark}"
  button-light:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary-dark}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0 22px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0 22px"
---

# Design System: SignWise

## Overview

The established world is a restrained legal stationery setting: matte stone, ivory paper, navy ink, and small brass details. Elegant serif headings give the content a professional character; plain sans-serif copy keeps it approachable for everyday document readers.

Photography carries tactile depth through limestone, paper, navy stationery, and natural daylight. The current transparent wordmark pairs lighter serif lettering with one small pen nib at the left. Its asset and generation provenance are recorded in documents/assets.md. Page composition belongs in documents/landing-page.md.

**Key Characteristics:**

- Matte materials and warm neutrals.
- Generous space with clear, thin dividers.
- Serif headings and readable sans-serif supporting copy.
- Restrained controls and consistent stationery photographs.

## Colors

The frontmatter records the exact palette extracted from src/styles.css.

### Primary

- **Ink navy:** primary actions, identity, and coverage icons.
- **Deep navy:** action hover state and the photographic hero's dark foundation.

### Secondary

- **Antique brass:** numbered steps and the small identity detail.
- **Terracotta:** the red-flags coverage icon.

### Neutral

- **Warm stone:** page background and solid navigation surface.
- **Pale stone:** local file-selection area and quiet hover fills.
- **Dark ink:** readable main text.
- **Muted stone:** supporting copy and default navigation text.
- **Stone rule:** section dividers, disclosures, and field boundaries.

## Typography

**Display Font:** EB Garamond Variable, with Georgia and serif fallbacks.
**Body Font:** DM Sans Variable, with a sans-serif fallback.

Display headings use the frontmatter's regular-to-medium serif role. At the tablet breakpoint the landing display becomes (70px), then (57px) on mobile and a responsive (41–56px) on narrow phones. Landing body copy is (17–18px); the narrow-phone hero uses (16px). Supporting review-page copy uses (14–16px). Main process titles use medium-weight sans serif (18px), while coverage titles use medium-weight serif (28px).

Navigation uses the frontmatter's label role with uppercase presentation. Hero, process, coverage, Testimonials, and FAQ headings share the display scale and line height (1.07); the narrow-phone hero adjusts its line height to (1.1). Review-page headings use a quieter scale (36–50px), regular weight (400), and line height (1.1).

## Layout

The shared shell caps content at (1240px), with desktop gutters totaling (96px), tablet gutters totaling (64px), and mobile gutters totaling (40px). The observed responsive thresholds are (1050px), (760px), and (520px). Desktop information grids use three columns and collapse to one at the mobile threshold. Section padding usually moves from (56px) to (48px) on mobile. Content remains in natural flow and may grow beyond minimum heights.

The sticky header has an exact height of (91px desktop), (86px at widths up to 760px), and (81px at widths up to 520px). Its masthead fills that height. Smooth section navigation uses this same height as the scroll offset, keeping the selected section flush beneath the header. Landing viewport sizing is recorded in documents/landing-page.md.

The dedicated review workspace caps at (850px). Its narrower measure supports document selection and status. Landing section heights, reader-review placement, and content order are surface decisions recorded in documents/landing-page.md.

## Elevation & Depth

Depth comes from photographic light, dark hero overlays, and tonal surfaces. The How it works section uses white studio stationery imagery with subtle contact shadows baked into the assets, on a matching white section without card borders or CSS shadows. Its step numerals use 26px DM Sans tabular figures at the top-left of each image. Borders elsewhere remain thin; the header becomes a solid warm-stone plane when scrolled or expanded. State transitions generally last (180ms); file drag-state transitions last (160ms). The hero arrives with a small vertical movement over (700ms). Section anchors scroll smoothly with sticky-header offsets. Reduced-motion settings remove animations and transitions; moving reader reviews become a static wrapped list.

## Shapes

Controls have almost-square corners using the frontmatter's control radius. Photographs and information regions are rectangular. Fine rules organize content without enclosing coverage in cards. Testimonial cards use square stone surfaces on pale stone. Lucide icons use restrained strokes. Scrollbars are thin, warm gray on stone; WebKit tracks are (6px) and thumbs are fully rounded.

## Components

### Buttons

Compact, restrained actions use the frontmatter's three existing variants and a minimum height of (50px). Primary hover darkens navy; light hover moves to a slightly darker stone; outline hover uses pale stone. Disabled controls reduce opacity to (0.65). Visible keyboard focus uses a brass outline (3px) with an offset of (5px).

### Navigation

The sticky masthead pairs the current pen-nib wordmark with uppercase section links. The image displays at (184px) desktop and (156px) mobile. On the landing page, the initial transparent header overlays the hero and filters the mark to ivory. It becomes solid stone after scrolling beyond (24px) or opening the mobile menu. The review-page header is solid. Mobile uses a labeled (44px) hamburger control with expanded state, link-selection dismissal, and Escape dismissal returning focus to the button. Anchor offsets account for the sticky header.

### Disclosures

Native details/summary controls have thin horizontal rules, medium-weight sans-serif questions, and plus/minus indicators. Questions use (22px desktop; 20px mobile), with minimum row heights of (88px desktop; 80px mobile). Answers use (17px) muted body copy with a maximum measure of (68ch). The disclosure group caps at (1040px) within the shared shell. The landing FAQ keeps four disclosures.

### File selection

The local selection region uses a dashed stone boundary and pale-stone fill. A drag state changes the boundary to navy and the fill to warm stone. The file input overlays its visible control; focus-within gives that control a navy outline (2px), offset (4px). File removal uses a (44px) target. Status and error text stay legible alongside icons.

### Testimonial cards

Illustrative review cards use warm-stone fills, brass stars, sans-serif quotes, and compact names on a pale-stone section. Card widths are (340px desktop; 290px mobile), with padding of (28px desktop; 24px mobile). The landing marquee's movement, accessible duplication, pause control, and static fallback are recorded in documents/landing-page.md.

## Do's and Don'ts

- **Do** inherit the matte stone/navy palette and serif/sans pairing when extending the site.
- **Do** keep photographs consistent in paper, limestone, stationery, and natural light.
- **Do** preserve semantic landmarks, visible focus, labeled inputs, keyboard disclosures, and reduced-motion behavior.
- **Do** use the active v2 pen-nib wordmark for the header.
- **Don't** reintroduce the inactive underline wordmark or the earlier green photography into current surfaces.
- **Do** keep coverage open on desktop; mobile uses the user-requested pale-stone containers.

## Latest landing refinements

Navigation contains Home, How it works, What we do, Testimonials, and FAQs. All landing links, including the wordmark, scroll within the current document; reduced motion uses immediate scrolling. The hamburger threshold is 1000px, separate from the 760px content-layout threshold. What we do keeps three ruled desktop columns, but mobile uses centered pale-stone containers with icons beside the titles and centered descriptions. Category titles are action phrases: Spot red flags, Explain good terms, Suggest questions. Testimonials shares the exact common section minimum and padding rule with process, coverage, and FAQ. Cards have minimum heights of 260px desktop and 248px mobile; subtitles use 17px and names 16px. The hero action is Check my document.

Current follow-up overrides: the footer's warm-ivory surface (--color-surface: #f3f0e9) fills process, coverage, FAQ, and mobile coverage panels. Process uses isolated studio images with multiply blending to merge their white backgrounds into the section, and 26px numbers at their top-left. FAQ heading is left aligned; its rows share the full 1240px shell maximum. Testimonials blends ivory to pale stone over 72px at the top and bottom. Its carousel has subtle 3px blur with masked horizontal edge fades, omitted in the static reduced-motion view. Its subtitle is removed. A compact navy closing CTA after FAQ uses the existing light button and serif heading, stacking on mobile. Footer keeps copyright and Made by .dcd only.

## Document review extension — 2026-10-06

The review page retains its 850px measure and 36–50px serif title. A 44px Back to home link sits above the title. The pale-stone drop zone is followed by an optional 1,000-character context textarea with a warm-ivory background, clear labels, and inherited focus treatment. An explicit navy Analyze action sits beside the upload disclosure on desktop; actions stack at 700px and below.

Results use a small uppercase eyebrow, a serif report title, a pale-stone summary, thin ruled key-term/finding rows, restrained textual priority labels, and quoted source excerpts with a narrow stone left rule. Mobile terms, heading actions, and priority labels stack. No safety gauge or invented legal score is shown. Loading uses a small spinner with a reduced-motion fallback; results receive focus with sticky-header-aware scroll spacing. Empty, setup, cancellation, failure, and retry states share the existing typography and muted/ink colors.

## Dedicated report surface — 2026-10-06

Results retain the 850px review measure and warm ivory background. A quiet toolbar puts Back to upload left and Save review right. The 36–50px serif title is followed by wrapped filename/type metadata and a three-link ruled section navigation. Section headings use 32px serif (29px mobile); finding titles use 18px sans (17px mobile). Concern priority appears in a restrained 12px label with text, never color alone. Findings use thin horizontal rules, 16px readable explanation text, and optional native clause disclosures. Follow-up rows distinguish missing details and unclear wording. An optional pale-stone overview contains summary/key terms/limits. Controls have 44px targets. Mobile priority labels wrap beneath titles, and secondary overview terms stack.
