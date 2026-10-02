# Website scene composition

Implementation map, established 2026-10-02. Canonical palette and cross-channel brand guidance live in the companion Aniloom Brand System, not here.

## Content roles

Light is the reading and evaluation canvas: understand the offer, compare prices, inspect work, check scope and exclusions, and meet the people. Dark is a focused presentation or emphasis passage: introduce the creative product, explain how delivery is managed, or invite the next action. These are composition roles, not two themes or claims about quality. Background changes mark a change in the reader's task, not every new heading.

## Route map

| Page or family | Entry and reading canvas | Dark passages |
| --- | --- | --- |
| Home | Dark Playable Ads, light Release Testing; light statement/capabilities and people/notes | Playable Ads, company presentation, delivery process, footer |
| Playable Ads overview | Dark product introduction/artwork; light path selection and deliverables/demonstration link | Introduction, method, closing contact/footer |
| Playable Ads development | Dark introduction; light scope and handoff/example links | Introduction, delivery method, closing contact/footer |
| Quality Engineering | Light introduction, choices, deliverables | Practice standards, closing contact/footer |
| Playable QA and release readiness | Light introduction, review scope, links | Review method and practice standards, closing contact/footer |
| Playable readiness package | Light introduction, package, deliverables, exclusions | Review method, closing contact/footer |
| Both pricing catalogs | Light local navigation, immediately visible packages, add-ons, commercial terms | Closing contact/footer |
| Capabilities and About | Light introduction, expertise, people | Closing contact/footer |
| How We Work | Light introduction, engagement models and entry points | Delivery process, closing contact/footer |
| Playable workflow | Light introduction and workflow steps | Review checkpoint, closing contact/footer |
| Playable demonstrations | Light context, actual demos, scope and links | Quality questions, closing contact/footer |
| Notes index and articles | Continuous light reading canvas | Footer only |
| Privacy and terms | Continuous light reading canvas | Footer only |

## Implementation invariants

- `BaseLayout` defaults to `appearance="light"`; only home, Playable Ads overview, and Playable Ads development explicitly enter dark.
- The appearance prop controls initial canvas, navigation, and browser theme color. It is page art direction, not a preference, toggle, saved setting, or OS-theme response.
- `Scene.astro` groups related content into a full-width canvas; `section-shell` constrains only the inner content. Keep consecutive reading sections together.
- Explicit `surface-dark` scopes are required on method bands, closing callouts, footer, and contact dialog, even when the current ancestor is dark. This prevents future inherited token mismatches.
- Swap background, raised surfaces, text tiers, lines, links, focus, gradients, and interaction roles together. Yellow decisions retain dark ink in either scene.
- Light canvas is `#F5F5F7`, not white. White belongs to raised package/input surfaces. Dark base is `#07131A`, with `#0E1D25` emphasis bands and `#1B303A` raised surfaces.
- Images and embedded playables keep their own grading. Their palette does not decide the surrounding reading canvas.
- The fixed global header matches the page entry canvas and stays stable across section transitions. The footer and contact dialog always use the dark scope. A dark dialog is an intentional action surface, not a new theme.
- Closing callouts are full-width passages with shell-aligned content, not rounded container cards. Cards remain useful for bounded selectable packages or actual embedded products, not for every text block.
- Preserve the two centered homepage product actions, and preserve package cards in the initial pricing viewport. Color composition must not reintroduce an introductory pricing screen.

## Review checklist

Inspect desktop, mobile portrait, and mobile landscape. Review each page family at entry, a light/dark boundary, and the closing action. Check text/link/focus roles, mobile menus, contact opening/closing, content width, and first-view pricing. Articles and legal reading must not acquire decorative scene interruptions. Run Astro validation and production build for layout changes.
