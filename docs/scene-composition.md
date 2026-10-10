# Website scene composition

Implementation map, established 2026-10-02 and updated 2026-10-09. Canonical palette and cross-channel brand guidance live in the companion Aniloom Brand System, not here.

## Content roles

Light is the reading and evaluation canvas: understand the offer, compare prices, inspect work, check scope and exclusions, and meet the people. Dark is a focused presentation or emphasis passage: introduce the creative product, explain how delivery is managed, or invite the next action. These are composition roles, not two themes or claims about quality. Background changes mark a change in the reader's task, not every new heading.

## Route map

| Page or family | Entry and reading canvas | Dark passages |
| --- | --- | --- |
| Home | Dark Playable Ads, light Release Testing; light capabilities with decorative worktable/dog image and Notes; full-bleed mountain closing image | Playable Ads, compact company presentation, AI/delivery process, footer |
| Playable Ads overview | Dark product introduction; light playable demos, platforms, creative production, interaction explanation, responsive/provider checks, and FAQ | Introduction, four-step delivery workflow, closing contact/footer |
| Quality Engineering | Light introduction, choices, deliverables | Practice standards, closing contact/footer |
| Playable Ads pricing | Light local navigation, immediately visible packages, compact commercial note, FAQ | Compact production-planning method after the catalog, closing contact/footer |
| Quality Engineering pricing | Continuous light package comparison, scope, exclusions, and commercial terms | Closing contact/footer |
| Capabilities | Light introduction, expertise | Closing contact/footer |
| About | Dark compact founder introduction; full-width editorial panorama followed by light leadership | Founder introduction, closing contact/footer |
| How We Work | Light introduction, engagement models and entry points | Delivery process, closing contact/footer |
| Notes index and articles | Continuous light reading canvas | Footer only |
| Privacy and terms | Continuous light reading canvas | Footer only |
| AniShot | Light product introduction, workflow, tools, export inspection, settings, availability, FAQ, and compact benchmark disclosure | Frozen-screen explanation, local-processing responsibility, closing product action/footer |
| Contact | Dark focused form; light direct-email reading and copying section below | Form entry and footer |
| Support | Minimal standalone light email utility | None; no global header or footer |

## Implementation invariants

- Owner-approved October 8 revision: the first two product scenes remain unchanged. The company presentation contains the approved managed-delivery statement instead of a second standalone statement scene. Capabilities use the approved decorative worktable/dog image without captions or team claims. The dark delivery band introduces AI as a conditional efficiency tool, with human responsibility and no invented examples or speed metrics. Notes lead into a thin full-bleed mountain image and the existing dark footer/contact invitation. Founder biographies remain on About. AI text uses ordinary semantic text roles, not a gold accent.
- `BaseLayout` defaults to `appearance="light"`; home, Playable Ads overview, and Contact explicitly enter dark.
- The appearance prop controls initial canvas, navigation, and browser theme color. It is page art direction, not a preference, toggle, saved setting, or OS-theme response.
- `Scene.astro` groups related content into a full-width canvas; `section-shell` constrains only the inner content. Keep consecutive reading sections together.
- A scene is a semantic chapter, not one section per heading. Keep package comparisons, detailed scope, FAQ, people, and long reading light. A compact delivery method or product-responsibility passage may form a dark chapter between light chapters; do not split the package catalog or turn the privacy policy dark.
- Explicit dark scopes are required on the homepage Playable Ads scene, method bands, closing callouts, footer, and the Contact form scene, even when the current ancestor is dark. This prevents future inherited token mismatches.
- Swap background, raised surfaces, text tiers, lines, links, focus, gradients, and interaction roles together. Yellow decisions retain dark ink in either scene.
- Light canvas is `#F5F5F7`, not white. White belongs to raised package/input surfaces. Dark base is `#07131A`, with `#0E1D25` emphasis bands and `#1B303A` raised surfaces.
- Images and embedded playables keep their own grading. Their palette does not decide the surrounding reading canvas.
- The fixed global header matches the page entry canvas and stays stable across section transitions. The footer and Contact form use the dark scope. Contact is an intentional focused-action page, not a new theme; its direct-email section returns to the light reading canvas.
- Closing callouts are full-width passages with shell-aligned content, not rounded container cards. Cards remain useful for bounded selectable packages or actual embedded products, not for every text block.
- Preserve the two centered homepage product actions, and preserve package cards in the initial pricing viewport. Color composition must not reintroduce an introductory pricing screen.

## Product illustration sequences

- Updated 2026-10-03: the homepage presents three text-free illustrations with two SVG arrows above each centered product title, description, and two actions. Playable Ads stays on plain dark ink; Release Testing stays on plain light `#F5F5F7`. Do not place artwork behind the copy or add numbered captions to the homepage.
- The Playable Ads overview explains the player's journey on the light reading canvas: play, choose the CTA, open the configured destination. This is separate from Aniloom's delivery and QA workflow.
- Use three independent text-free phone assets. Stage headings, numbers, descriptions, and connections belong to HTML/CSS/SVG, not the raster images. Keep the sequence borderless rather than wrapping each stage in a rounded card.
- Homepage sequences stay horizontal in portrait and landscape, with a compact media height in short landscape to keep both actions and the next product visible. Detailed service sequences show three columns on wide layouts and stack vertically with readable captions and downward connections in narrow portrait layouts.
- Release Testing uses the same schematic product across three assets: partly hidden bugs, a magnifying glass revealing a bug, and the product with sparkle stars. The last state is a metaphor for corrected and retested changes, not a defect-free guarantee. Homepage copy identifies the client's team as correction owner. Detailed captions explicitly cover intake, findings with evidence and coverage gaps, development-team fixes, Aniloom retest, and remaining risks. Engineering corrections are outside testing scope.
- Treat these assets as schematic editorial explanation, not product screenshots or evidence. Future GIF/video can replace the media slot without removing the HTML explanation; preserve a static fallback and reduced-motion support.

## Review checklist

Inspect desktop, mobile portrait, and mobile landscape. Review each page family at entry, a light/dark boundary, and the closing action. Check text/link/focus roles, mobile menus, contact navigation and submission states, content width, and first-view pricing. Articles and legal reading must not acquire decorative scene interruptions. Run Astro validation and production build for layout changes.

## Site-wide composition audit, October 9, 2026

Audited all 18 current content pages and the five legacy redirect documents.
The route map above is the current assignment; dated records below describe
earlier revisions, not alternative templates.

- Home and About retain their approved composition. The first homepage product
  now has an explicit dark token scope, matching the explicit light scope of
  Release Testing without changing its appearance.
- Playable Pricing keeps all three packages and the commercial note together
  on light. Production planning becomes a full-width dark method passage;
  questions return to light before the existing dark contact invitation.
- AniShot keeps actual tool screenshots, export choices, settings, FAQ, and
  availability on light. The concise local-processing passage becomes a dark
  responsibility chapter. The separate privacy policy remains continuously light.
- Playable overview, Quality Engineering, its pricing, Capabilities, and How We
  Work already distinguish evaluation from method or closing action. Their
  existing assignments are retained. Notes index and all three articles, website
  privacy, terms, and AniShot privacy stay light until the footer. Contact retains
  dark form -> light direct email -> dark footer. Support stays a standalone
  light utility. Legacy redirects add no presentation scenes.

Public wording, package scope, prices, assets, and interactions are unchanged.
Astro check reports zero errors, warnings, and hints; production build passes.
A built-HTML audit verifies entry canvases, explicit dark footers, uninterrupted
article/legal reading, new scene boundaries, light package catalogs, and 438
internal page links/anchors. Browser review in desktop, portrait, and landscape
is pending: the Mac is locked and browser control is unavailable. This revision
must complete visual review before publication; build success is not visual QA.

## Playable consolidation, October 6, 2026

- The playable section has two content pages: `/playable-ads/` and `/playable-ads/pricing/`. Overview includes the Magic Thai demos, full-cycle creative production, four delivery steps, responsive/provider checks, delivery, and practical FAQ. Pricing contains the development package, creative/adaptation add-ons, inputs, delivery, and commercial terms. Owner direction on October 7 removes standalone existing-playable QA from this section and keeps all prices and package limits on Pricing.
- Legacy development, QA, workflow, demonstration, and readiness routes use Astro static redirects to the corresponding page anchors. GitHub Pages serves the generated HTML redirects, not server-side HTTP 301 responses. Keep these legacy destinations out of the sitemap and internal navigation.
- The ad-network carousel loops in both directions and advances one item every four seconds while visible. Preserve its existing palette and controls. Pause automatic movement on hover, keyboard focus, hidden tabs, and reduced-motion preferences; keep the explicit pause/resume control and arrow-key navigation. Duplicate items used for looping remain hidden from assistive technology.
- Each demo is a single accessible anchor: the screenshot, title, description, and visible `Try it` action all open the same game in a new tab. Keep the action immediately below the screenshot.
- Stable card anchors are `#magic-thai-a`, `#magic-thai-b`, and `#magic-thai-c`. The game URL receives an encoded `returnUrl` pointing to its card. Use the canonical HTTPS overview URL so public games accept the destination even when opened from a local website preview. The final in-game CTA implementation belongs to the companion playable-ads project.
- Demo cards reuse the existing neutral borders and restrained hover lift. Returned cards use a brief `:target` surface highlight and header-safe scroll spacing, without a persistent selection ring. Keep the standard keyboard-focus indicator and disable movement/highlight animation for reduced motion. Inspect desktop, portrait, and landscape, including keyboard card activation and the pricing link.

Validation: Astro check reports zero errors, warnings, and hints; the production build passes. Reviewed the overview and package navigation at desktop, 390px and 320px portrait, and 844px landscape without horizontal overflow. Screenshot and keyboard activation open the same demo URL in a new tab; return links use each game's canonical anchor. The built-site audit resolves internal links and anchors across all HTML pages and checks the five redirect documents. The companion playable-ads chat reports public Magic Thai A/B/C updates at commit `b7d1f14`, with allowlisted return URLs and provider exports excluding the demonstration redirect.

Publication review found browsers reusing the old unversioned public stylesheet with the new demo markup. `BaseLayout` now imports `src/styles/global.css`; Astro emits a fingerprinted `/_astro/` stylesheet for cache-safe releases. Validation and build passed after this change, and the built overview, pricing, contact, and homepage all reference the emitted file. The Magic Thai A live browser check completed the game and opened `https://aniloom.tech/playable-ads/#magic-thai-a` in a new tab without resetting the finished game.

## Finished-playable positioning, October 7, 2026

Overview introduces the finished creative and educates the buyer; it has no package cards, prices, or base-package counts. Checks belong to production and delivery, with no standalone third-party playable QA offer. Pricing now presents owner-approved Adapted Playable from $799 and Custom Playable from $4,499, without standalone QA or separate priced adaptation cards. Related capability and workflow links describe production. Legacy QA/readiness routes now land on the overview's `#verification` section.

Provider evidence and claim boundaries are recorded in `docs/internal/playable-ads/platform-support.md`. Resolution checks cover iPhone/iPad sizes and 9:22 / 22:9 extremes, not an implied physical-device lab. A Cloudflare Workers browser link is a demo delivery artifact, separate from final provider upload files. Selected provider tools check their own requirements and do not establish universal acceptance.

Revision validation: Astro check reports zero errors, warnings, and hints; production build passes. Reviewed overview and pricing on desktop, 390px portrait, and 844px landscape. Overview has zero prices or package cards. All 68 built-site links into playable routes resolve, including anchors; both legacy QA redirects point to verification. Checked the Overview-to-Pricing interaction. Copy reviewed with brand-writing, copywriting, and the seven copy-editing sweeps; retained approved prices and separated complete production capabilities from base-package inclusions.


## Playable packages, October 7, 2026

The two-package catalog uses the existing light scene, raised white surfaces, neutral borders, and semantic palette. Custom Playable is wider and taller with a more central position on wide layouts; Adapted Playable is slightly lower and remains readable and actionable. Narrow portrait stacks Adapted then Custom without offsets. Do not color-code the premium tier or add a selection ring.

Both packages include all currently supported public network builds as a bonus. Custom includes three visual skins total of one approved mechanic, bounded art production, Spine 2D and custom animation sequences. Detailed scope, asset/audio sourcing, usage rights, schedules, revisions, and commercial terms belong on Pricing. Overview has no prices/package counts; a short individually scoped advertising/marketing campaign note can appear on both pages. Private volume incentives stay off the public site. Canonical owner-approved commercial facts live in the companion Brand System.

Validation for the two-package revision: Astro check passes with zero diagnostics; production build passes. Pricing reviewed at desktop, 390px and 320px portrait, and 844px landscape without horizontal overflow. Custom is wider/taller on horizontal layouts; portrait preserves the package order. Native Q&A opens by pointer and closes with Enter. The built-site audit checks 418 internal page links with no missing anchors. Copy was drafted and reviewed through the Aniloom brand-writing, copywriting, and copy-editing workflow.


## Playable delivery illustrations, October 7, 2026

The orientation explanation spans the delivery grid above six schematic device
illustrations: phone 9:16 / 16:9, tablet 3:4 / 4:3, and long phone 9:22 / 22:9.
These are representative screen proportions, not exact specifications of every
iPhone/iPad or evidence of physical-device testing. Match the established dark
schematic device, blue-grey rim, cyan tiles, and light reading canvas. Keep the
strip borderless; stack its figures to preserve readable labels on small screens.
The owner explicitly requests ratio labels inside these six images, an exception
to the normal text-free illustration rule. Keep device/orientation captions and
accessible explanations in HTML as well.

The remaining delivery blocks retain scene tokens and neutral grid borders.
Provider validation links to the existing `#platforms` carousel. Demo delivery
uses the locally hosted official Cloudflare logo, without implying endorsement.


The six final assets were generated in the owner-selected graphics chat
`01a0e4f8-d8ed-7833-87a3-bbd8efbe3bb8`. Production uses transparent 1024px
square WebP assets. PNG masters and the generation/limitations manifest remain
in `docs/internal/playable-ads/device-illustrations/`, outside the public build.
These are editorial illustrations; ratio labels are exact text while generated
screen geometry is approximate.

Validation: Astro check passes with zero errors, warnings, or hints; production
build passes. Reviewed desktop, 390px and 320px portrait, and 844px landscape
without horizontal overflow. All six device images load; ratios also appear in
HTML captions. Platform navigation reaches `#platforms` by pointer and Enter.
The built overview has no missing image files or broken local anchors. Source
PNGs and the internal generation manifest are excluded from the public build.


## Three playable packages, October 7, 2026

Current owner direction adds Micro Playable for a single action on supplied
static art. The delegated price choice is implemented as Starting at $299.
Adapted remains $799; Custom remains $4,499 and visibly lists more production
scope than Adapted, including its essentials and bounded custom extensions.

Wide layout keeps Adapted first, the largest Custom card in the center, and the
smaller Micro card last. Reading and keyboard order match the visual order.
Tablet layouts retain the two main cards and put Micro below; portrait stacks
all cards without offsets. Keep all three light, with the established semantic
palette and neutral borders. Every card ends with a concise Best for statement
and inquiry link. All three include the supported-network build bonus. Update
FAQ, metadata, and canonical Brand System facts with the Micro boundary. Keep
private volume incentives off the site.

Validation: Astro check reports zero diagnostics and the production build passes.
Reviewed the three cards at the desktop viewport, 390px and 320px portrait, and
844px landscape with no horizontal overflow. Custom has 13 scope points against
Adapted's eight and remains wider and taller in the desktop layout. All three
inquiry links carry their package topic; the Micro link opens the contact page.
The Micro FAQ opens using Enter. Copy review checks scope, buyer fit, asset
licensing, starting prices, and conditional timelines without performance claims.


## Individual cooperation terms, October 7, 2026

The owner confirms that payment schedules are agreed individually; advance
payment and 50/50 are possible arrangements, not universal requirements. Brand
System offers, proof, voice, website guidance, and maintained pricing drafts carry
this direction. Public cooperation copy begins with the client's goal and value.

Playable Pricing removes the large Commercial terms scene. A compact note below
the cards explains starting prices, USD/tax treatment, and individual scope,
quote, and payment agreement. The art/audio cost questions remain in the FAQ.
Campaign management stays visible in the closing dark contact scene, using its
scoped readable tokens. Quality Engineering's existing terms grid uses one
individual payment-schedule explanation rather than fixed advance-payment rules.

Validation: Astro check reports zero diagnostics and the production build passes.
Reviewed the compact note, FAQ-to-contact transition, and campaign text on
desktop and 390px portrait; the closing scene also fits 844px landscape without
horizontal overflow. Quality Engineering's revised grid is readable on desktop
and portrait. Built Playable Pricing has no Commercial terms section or fixed
advance-payment rule; both pricing pages reflect individually agreed schedules.


## Equal entry-package widths, October 7, 2026

Owner direction: Micro and Adapted use equal widths. On wide screens they flank
the wider central Custom card; on tablets Micro uses the same first-column
width as Adapted, below the main pair. Portrait retains full-width stacked cards.
Astro validation and production build pass. Visual review at 1280px desktop,
844px landscape, and 390px portrait confirms equal widths without horizontal
overflow.

## About composition, October 9, 2026

Owner-approved: combine the introduction and founding story into one compact dark entry. Follow with an edge-to-edge collaboration panorama without border or rounded corners, immediately before the light leadership chapter. Keep its editorial caption below the image, never text over the image or a documentary team claim. Retain the dark closing invitation. About explicitly enters dark so header, browser theme color, and semantic roles agree. This supersedes the earlier light About entry in the site-wide scene audit.
