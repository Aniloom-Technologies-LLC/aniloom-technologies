# Website scene composition

Implementation map, established 2026-10-02. Canonical palette and cross-channel brand guidance live in the companion Aniloom Brand System, not here.

## Content roles

Light is the reading and evaluation canvas: understand the offer, compare prices, inspect work, check scope and exclusions, and meet the people. Dark is a focused presentation or emphasis passage: introduce the creative product, explain how delivery is managed, or invite the next action. These are composition roles, not two themes or claims about quality. Background changes mark a change in the reader's task, not every new heading.

## Route map

| Page or family | Entry and reading canvas | Dark passages |
| --- | --- | --- |
| Home | Dark Playable Ads, light Release Testing; light statement/capabilities and people/notes | Playable Ads, company presentation, delivery process, footer |
| Playable Ads overview | Dark product introduction; light playable demos, platforms, development/QA scopes, interaction explanation, and FAQ | Introduction, four-step delivery workflow, closing contact/footer |
| Quality Engineering | Light introduction, choices, deliverables | Practice standards, closing contact/footer |
| Both pricing catalogs | Light local navigation, immediately visible packages, add-ons, commercial terms; playable pricing also contains readiness inputs, reports, and exclusions | Closing contact/footer |
| Capabilities and About | Light introduction, expertise, people | Closing contact/footer |
| How We Work | Light introduction, engagement models and entry points | Delivery process, closing contact/footer |
| Notes index and articles | Continuous light reading canvas | Footer only |
| Privacy and terms | Continuous light reading canvas | Footer only |
| AniShot | Light product introduction, workflow, tools, availability, FAQ, and compact benchmark disclosure | Frozen-screen explanation, closing product action/footer |
| Contact | Dark focused form; light direct-email reading and copying section below | Form entry and footer |

## Implementation invariants

- `BaseLayout` defaults to `appearance="light"`; home, Playable Ads overview, and Contact explicitly enter dark.
- The appearance prop controls initial canvas, navigation, and browser theme color. It is page art direction, not a preference, toggle, saved setting, or OS-theme response.
- `Scene.astro` groups related content into a full-width canvas; `section-shell` constrains only the inner content. Keep consecutive reading sections together.
- Explicit dark scopes are required on method bands, closing callouts, footer, and the Contact form scene, even when the current ancestor is dark. This prevents future inherited token mismatches.
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

## Playable consolidation, October 6, 2026

- The playable section has two content pages: `/playable-ads/` and `/playable-ads/pricing/`. Overview includes the Magic Thai demos, both service scopes, four delivery steps, and practical FAQ. Pricing includes the full readiness-package context.
- Legacy development, QA, workflow, demonstration, and readiness routes use Astro static redirects to the corresponding page anchors. GitHub Pages serves the generated HTML redirects, not server-side HTTP 301 responses. Keep these legacy destinations out of the sitemap and internal navigation.
- Each demo is a single accessible anchor: the screenshot, title, description, and visible `Try it` action all open the same game in a new tab. Keep the action immediately below the screenshot.
- Stable card anchors are `#magic-thai-a`, `#magic-thai-b`, and `#magic-thai-c`. The game URL receives an encoded `returnUrl` pointing to its card. Use the canonical HTTPS overview URL so public games accept the destination even when opened from a local website preview. The final in-game CTA implementation belongs to the companion playable-ads project.
- Demo cards reuse the existing neutral borders and restrained hover lift. Returned cards use a brief `:target` surface highlight and header-safe scroll spacing, without a persistent selection ring. Keep the standard keyboard-focus indicator and disable movement/highlight animation for reduced motion. Inspect desktop, portrait, and landscape, including keyboard card activation and both package shortcuts.

Validation: Astro check reports zero errors, warnings, and hints; the production build passes. Reviewed the overview and package navigation at desktop, 390px and 320px portrait, and 844px landscape without horizontal overflow. Screenshot and keyboard activation open the same demo URL in a new tab; return links use each game's canonical anchor. The built-site audit resolves internal links and anchors across all HTML pages and checks the five redirect documents. The companion playable-ads chat reports public Magic Thai A/B/C updates at commit `b7d1f14`, with allowlisted return URLs and provider exports excluding the demonstration redirect.

Publication review found browsers reusing the old unversioned public stylesheet with the new demo markup. `BaseLayout` now imports `src/styles/global.css`; Astro emits a fingerprinted `/_astro/` stylesheet for cache-safe releases. Validation and build passed after this change, and the built overview, pricing, contact, and homepage all reference the emitted file. The Magic Thai A live browser check completed the game and opened `https://aniloom.tech/playable-ads/#magic-thai-a` in a new tab without resetting the finished game.
