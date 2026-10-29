# Magic Thai public proof assets

Status: approved production evidence for the Magic Thai demonstration section in `/playable-ads/#demonstrations`.

## Permission and claim boundary

- Permission source: user-confirmed in the canonical Aniloom Brand System on 2026-09-29.
- Public description: Aniloom public demonstration series.
- Allowed claim: the three production builds exist, can be inspected directly, and show the visible interaction state captured in each asset.
- Excluded claims: client or publisher identity, campaign relationship, external adoption, metrics, performance or conversion outcome, advertising-platform acceptance, complete release disposition, and individual code authorship.
- Confidentiality review: no confidential playable name, path, visual, link, or client context is present.

## Capture records

| Public asset | Source | Capture date | Viewport and state | Classification | SHA-256 |
| --- | --- | --- | --- | --- | --- |
| `magic-thai-a-build-interaction.webp` | `https://magic-thai-ad-a1.aniloom.workers.dev/` | 2026-09-29 | 390×844 portrait, opening build-and-place state after loading | `proof` | `be1dc4f1d74e6213391b7a87997ffb173c0c64cc23756f2340b7301dec8a34e7` |
| `magic-thai-b-swipe-collection.webp` | `https://magic-thai-ad-b1.aniloom.workers.dev/` | 2026-09-29 | 390×844 portrait, opening swipe instruction state after loading | `proof` | `f421a57534cd0dc7107e5b3ffd78d5539d5d3cfd976fd86de0ce5a9bd7bfb761` |
| `magic-thai-c-tap-match-trays.webp` | `https://magic-thai-ad-c1.aniloom.workers.dev/` | 2026-09-29 | 390×844 portrait, opening tap-and-match instruction state after loading | `proof` | `f4cb0d7483e3772398a25fbf66ec0356bfbbb0d5227845e04b1f2a17b16295d6` |

## Capture method and edits

- Source: direct public production URLs.
- Browser capture: Chromium DevTools Protocol `Page.captureScreenshot`.
- Output: WebP, quality 90, 390×844 pixels.
- Cropping or generative edits: none.
- Privacy review: no personal data or private account information is visible.
- Third-party context: publication permission covers these public demonstration builds according to the canonical Brand System record.

## Development-environment follow-up

A separate non-confidential Magic Thai A development-build capture of the Layout Tool remains a private follow-up. Do not add a public block, asset, filename, caption, or route until the local source, visible content, permission, build reference, and `Development environment` caption have been reviewed and recorded here.

## Updated website posters, 2026-10-29

Owner-requested public demos now mount directly in the website. New versioned A/B
posters show the current builder/village and collect/spin scenes. C retains its
existing capture. These records supersede the A/B posters above in the live UI;
permission and claim boundaries remain unchanged.

| Public asset | Source | Capture date | Viewport and state | Classification | SHA-256 |
| --- | --- | --- | --- | --- | --- |
| `magic-thai-a-builder-village-20261029.webp` | `https://magic-thai-ad-a1.aniloom.workers.dev/` | 2026-10-29 | 390×844 portrait, builder introduction and five unbuilt sites | `proof` | `ef12b9fb80c94b651c911ba3a9f7f8c56542b8837282f5dc83efdebdcec0db53` |
| `magic-thai-b-collect-spin-20261029.webp` | `https://magic-thai-ad-b1.aniloom.workers.dev/` | 2026-10-29 | 390×844 output, native embedded collect/spin game with 16/20 coins | `proof` | `67371c738ccb6445b607fc8d12c31d79f60974fdb1635ebbc382cbf09a923d45` |

Captured through the Codex browser screenshot API. A is the complete 390×844
standalone preview; B is the game viewport cropped from the native embedded
page overlay (618×1336), resized to 390×844. Both use WebP quality 90. No
generative edits were made. Neither capture contains personal data.

## Pending local art review, 2026-10-29

The animated-builder candidate uses `magic-thai-a-animated-builder-review-20261029.webp`, captured from the local
website-demo dev server at http://127.0.0.1:5192/ with a 390×844 viewport.
State: intro finished, idle character, five unbuilt sites, continuous field.
The screenshot was encoded to WebP quality 90 without cropping or generative
edits. SHA-256: `042d65d32cee594dfc8c1e33df3d95fc6dce78992eb9d4b02e8d44b89f7fd654`. Source implementation: playable-ads
branch codex/magic-thai-builder-polish. The user requested the new character
animation and website controls; visual approval and publication remain pending.
This record does not extend the approved-publication status above to this
candidate. Existing public claim boundaries remain unchanged.
