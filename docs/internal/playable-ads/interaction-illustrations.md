# Playable interaction illustrations

Created 2026-10-02 using the built-in ImageGen tool. Classification: editorial. The user approved separate text-free graphics, a single homepage phone, and a three-step explanation on the detailed Playable Ads page. These are schematic illustrations, not project screenshots or client evidence.

## Composition and output

Reader tasks: recognize the product on the dark homepage; understand the player interaction on the light overview page. All titles, stage numbers, captions, and flow arrows live in HTML/CSS/SVG. The same gameplay asset is reused in the hero and first step. No autoplay, interactive simulation, install claim, or performance claim is added.

Selected production assets:

- `public/assets/images/editorial/playable-play.avif` and `.webp`
- `public/assets/images/editorial/playable-redirect.avif` and `.webp`
- `public/assets/images/editorial/playable-destination.avif` and `.webp`

Each export is 600 x 900 with alpha preserved. The original generation outputs remain private under Codex generated images; they are not runtime dependencies. Only format conversion and proportional downscaling are performed outside ImageGen.

## Prompt set

### Play

Use case: illustration-story. Production website illustration, one isolated phone for Aniloom Playable Ads homepage and first frame of a user journey. The prior three-phone concept is a style reference only. Produce only the left phone as a new standalone illustration with no text.

Single straight-on upright smartphone, cool ink frame, slim gray-blue border, dark #0E1D25 screen, simple 4 by 4 puzzle board with one bright #56D3FF tile. A schematic white finger cursor drags the tile toward a cyan dashed empty slot, with a small dashed gesture arrow inside the screen. Refined flat two-dimensional illustration, crisp shapes, almost no grain. Frame #344854, dark structure #07131A. Entire phone visible, centered on a 2:3 portrait canvas, approximately 88% height. Genuinely transparent outside background and opaque phone screen. No letters, words, numbers, captions, fake text bars, external arrows, other phones, logos, checkmarks, floor, cast shadow, glossy 3D, client identity, or campaign claims.

### Shared edit constraints for the remaining states

Use case: precise-object-edit. First phone is the edit target. Preserve exact phone position, outline, frame shape, camera, palette, 1024 x 1536 portrait framing, and transparent outside margins. Change only the contents inside the phone and illustrated finger cursor. Exactly one entire phone, refined flat schematic illustration, #07131A and #0E1D25 darks, #344854 frame, #56D3FF cyan motif, white cursor, #FFC000 CTA with dark ink icon. Preserve alpha. No glow, cast shadow, other phones, external arrows, text, labels, numbers, captions, brands, client identity, metrics, reviews, install confirmations, or success checkmarks. All written captions will be HTML outside the asset.

### Redirect

Second state is an end card. Replace the puzzle board and drag arrow with a centered 3 by 3 block of cyan tiles in the upper-middle of the screen, echoing the same game. Under it place one wide yellow CTA with a large dark external-link icon and a white finger cursor pressing the button. No fake text bars, letters, or words.

### Destination

Third state is the destination opened. Remove the finger, puzzle board, and gesture arrows. Show a simplified browser destination page: a neutral browser header with a white globe icon and empty address capsule, then the cyan 3 by 3 game motif in a muted hero field and a few broad neutral layout blocks. No installation or purchase action, checkmark, finger, or fake text paragraphs. Keep sparse and deliberately schematic.

## Copy review

Stage labels preserve the user's wording: Play; Click to redirect; Open Ad link. Descriptions explain the interaction, optional CTA decision, and configured store or landing page. The surrounding caption identifies an illustrated user journey. Aniloom's production and QA workflow remains a separate section. Reviewed against the companion Brand Writing, copywriting, and copy-editing instructions for clarity, voice, proof boundaries, and public-field hygiene.

## Implementation review

- Astro validation: 34 files, zero errors, warnings, or hints. Production build: all 19 pages generated; existing large-client-chunk warning unchanged.
- Production homepage reviewed at 1440 x 900, 390 x 844, 320 x 568, 844 x 390, and 568 x 320. Both product actions remain inside the viewport and the next product begins visibly below. No horizontal overflow at these sizes.
- Overview reviewed in desktop, portrait, and landscape. Wide sequence uses three columns; portrait uses one column with downward arrows. Images load with alpha preserved and captions remain real text in the accessibility tree.
- Explore, pricing, and phone/canvas clicks reach their intended pages. The first pricing package begins at 326 px in the 390 x 844 portrait viewport.
- Six final AVIF/WebP exports are approximately 106 KB combined. No new JavaScript, video, or interaction runtime is added.
