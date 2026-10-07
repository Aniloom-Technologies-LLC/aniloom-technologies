# Aniloom website

The Astro repository is the implementation source of truth. The companion `../../Aniloom Brand System` folder is the source for approved facts, offers, voice, and website guidance. Do not duplicate its brand book here.

AniShot is an exception for product facts: read `../../Aniloom Projects/AniShot/docs/product.md`, `docs/content/website-copy.md`, and `docs/distribution.md` in that project. AniShot owns product documentation, evidence, copy inputs, and release status. Keep only implemented pages/assets and source pointers here, not a second product brief. The owner authorized the labelled development download for testing; this is not notarized release acceptance.

Before writing or reviewing public copy, read the companion project's `AGENTS.md` and `.agents/skills/aniloom-brand-writing/SKILL.md`. For website copy use `.agents/skills/copywriting/SKILL.md` for drafting, then `.agents/skills/copy-editing/SKILL.md` for review. Paths in this paragraph are relative to the companion Brand System folder. Brand facts and explicit user instructions take precedence over generic marketing advice.

Keep prices, package inclusions, timelines, and exclusions aligned with the canonical offers and proof library. Preserve user-approved wording. Never imply that QA includes engineering corrections or that delivery guarantees campaign performance. Generated people must not represent real founders or staff. Keep internal studies outside `public/`.

For information-only requests investigate without modifying files. For authorized site changes, run checks appropriate to the change, then commit and push significant changes. Copy or layout edits need Astro validation, a production build, and relevant visual review; contact behavior changes also need focused interaction checks. Do not use long dashes in new copy.

## Playable Ads positioning

The Playable Ads pages sell a finished playable creative. Overview explains the player experience, examples, full production process, responsive checks, and delivery. Keep prices, package limits, timelines, and add-on costs on Pricing. Do not advertise standalone testing of third-party playables on these pages or frame testing as a second playable product. Verification and technical corrections within the agreed production scope support delivery of our own playable.

For provider formats, preview/validation tools, responsive coverage, and hosted demos, verify the companion `../playable-ads/docs/PROVIDERS.md`, `docs/PLAYABLE_WORKFLOW.md`, and `docs/CLOUDFLARE_HOSTING.md`. Distinguish resolution checks from physical-device testing, agreed network packages from every supported network, and platform previews from campaign acceptance. Preserve the approved commercial scope and starting prices unless the owner changes them.

## Scene composition

Preserve the established website style and approved brand palette in every change. Reuse the scene-scoped semantic tokens in `src/styles/global.css` and existing component patterns for surfaces, borders, typography, spacing, hover, and keyboard focus. A brand color alone does not make a new visual treatment appropriate. Do not introduce new colors, heavy outlines, glows, or selection treatments without an explicit design request. Interactive demo cards should follow the existing neutral-border and restrained hover treatment; returning to a demo anchor may use a brief, subtle surface highlight, never a persistent selection ring. Preserve the established accessible keyboard-focus indicator and reduced-motion behavior.

The site has one art-directed appearance, not user-selectable light/dark themes. Choose scenes by content purpose: light for reading, comparison, scope, deliverables, demonstrations, and people; dark for immersive product presentation, delivery methods, and closing contact. Do not alternate sections merely for decoration or associate dark with a higher-priced package.

Use the default light `BaseLayout` canvas. Dark-entry exceptions and section assignments are documented in `docs/scene-composition.md`. Use full-width `Scene` wrappers or explicit `surface-dark` bands, with the entire semantic token set scoped together. Never place a light canvas on a constrained content shell as an isolated oversized card. Light canvas is `#F5F5F7`; white is reserved for raised surfaces. Preserve image grading. Header follows the page entry canvas; footer and contact form scene are explicitly dark. Pricing packages remain immediately visible; articles and legal pages retain a continuous light reading canvas. Check both portrait and landscape, scene transitions, navigation, and readable controls after changing composition.

## Contact behavior

Use ordinary links to `/contact/` for project inquiries, not a modal or prefilled email draft. Package links may pass a bounded `topic` query, never personal details. The contact page has required email and project description fields, then a separate light direct-email section. Keep LinkedIn links absent until approved. See `docs/contact-form.md` for service setup, security limits, testing, and activation. Never claim success without server confirmation, discard a failed message, publish secrets or test Turnstile keys, or deploy the static contact flow before the live service is verified.

Keep explanatory illustration labels in HTML and directional connections in CSS/SVG, separate from raster assets. Homepage Playable Ads and Release Testing scenes present compact three-image sequences above the product title; detailed service pages repeat the sequence with HTML explanations. Release Testing's sparkling product represents retested changes after the development team's corrections, never included engineering fixes or a defect-free guarantee. Follow `docs/scene-composition.md` for composition and future motion replacement.
