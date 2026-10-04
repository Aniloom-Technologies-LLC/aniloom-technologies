# AniShot page and download gate

Implementation sources: companion Brand System `brand/anishot-product-brief.md`,
`brand/proof-library.md`, and `website/drafts/anishot/product-page-v0.1.md`.
App release authority: companion AniShot `docs/distribution.md` and
`docs/publishing/release-checklist.md`.

The `/anishot/` page and footer link are publishable. Homepage content and primary
navigation are unchanged. The headline is “Under 100 ms on average on two displays.”
Its asterisk is the sole link to `/anishot/capture-timing/`. All 30 existing samples
are included: mean 85.55 ms, median 82.05 ms. No new measurement was run.
No screenshots were available for public use, so none were
invented. Tool icons are authentic AniShot resources copied from
`Resources/EditorIcons/64/` (pen, arrow, ellipse, text, pixelate, select), owned by
the product project. They identify controls only, not a fabricated screenshot.

## Local staged artifact, not public

- Source: AniShot `dist/AniShot-Screen-Capture-0.8.6-arm64-development.dmg`.
- Website local staging: `.local-artifacts/anishot/` (ignored, outside public).
- Size: 732672 bytes.
- SHA-256: `4f32b14dd7f1010dbb68c0d8fd2d2646964f26709b475d14f1000d225045b494`.
- Version 0.8.6 / build 52; arm64 only; Apple Development signature.
- Not Developer ID signed or notarized. Documented Gatekeeper execution assessment
  rejected (exit 3). Minimum macOS 14 is declared, not acceptance-tested.

Do not add this file to public or activate a download link without a new release
decision. The source project's explicit gate requires public signing/notarization,
minimum-OS/hardware acceptance, clean-machine Gatekeeper checks, finalized
privacy/support/terms, and verified artifact hosting. No OS security controls were
changed and no AniShot code was edited.

Once a verified artifact exists, copy it into the chosen public download location,
verify its hash/size and HTTP response, and update the hero/closing CTA, availability
FAQ, metadata, and this record together. There is currently no public file URL.
