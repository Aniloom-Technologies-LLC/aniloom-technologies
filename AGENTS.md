# Aniloom website

The Astro repository is the implementation source of truth. The companion `../../Aniloom Brand System` folder is the source for approved facts, offers, voice, and website guidance. Do not duplicate its brand book here.

Before writing or reviewing public copy, read the companion project's `AGENTS.md` and `.agents/skills/aniloom-brand-writing/SKILL.md`. For website copy use `.agents/skills/copywriting/SKILL.md` for drafting, then `.agents/skills/copy-editing/SKILL.md` for review. Paths in this paragraph are relative to the companion Brand System folder. Brand facts and explicit user instructions take precedence over generic marketing advice.

Keep prices, package inclusions, timelines, and exclusions aligned with the canonical offers and proof library. Preserve user-approved wording. Never imply that QA includes engineering corrections or that delivery guarantees campaign performance. Generated people must not represent real founders or staff. Keep internal studies outside `public/`.

For information-only requests investigate without modifying files. For authorized site changes, run checks appropriate to the change, then commit and push significant changes. Copy or layout edits need Astro validation, a production build, and relevant visual review; contact behavior changes also need focused interaction checks. Do not use long dashes in new copy.

## Scene composition

The site has one art-directed appearance, not user-selectable light/dark themes. Choose scenes by content purpose: light for reading, comparison, scope, deliverables, demonstrations, and people; dark for immersive product presentation, delivery methods, and closing contact. Do not alternate sections merely for decoration or associate dark with a higher-priced package.

Use the default light `BaseLayout` canvas. Dark-entry exceptions and section assignments are documented in `docs/scene-composition.md`. Use full-width `Scene` wrappers or explicit `surface-dark` bands, with the entire semantic token set scoped together. Never place a light canvas on a constrained content shell as an isolated oversized card. Light canvas is `#F5F5F7`; white is reserved for raised surfaces. Preserve image grading. Header follows the page entry canvas; footer and contact dialog are explicitly dark. Pricing packages remain immediately visible; articles and legal pages retain a continuous light reading canvas. Check both portrait and landscape, scene transitions, navigation, and readable controls after changing composition.
