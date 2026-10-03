# Release Testing illustration sequence

Created: 2026-10-03
Classification: editorial, not documentary or proof.
Generation mode: built-in ImageGen with actual transparency. Each state is a separate image; stage 2 and stage 3 edit stage 1 to preserve product identity.

## Direction and claim boundary

Reader task: understand a scoped testing cycle. Light canvas on homepage and overview. User requested the same product with hidden bugs, a magnifying glass revealing a bug, and a sparkling corrected product. Public copy identifies development-team correction ownership and Aniloom retest, coverage gaps, and remaining risks. Sparkles do not claim all bugs are removed or that engineering fixes are included in testing.

The homepage shows a horizontal three-image sequence above the title with SVG connections and no image-baked captions. The overview repeats it with HTML stage headings and descriptions. Narrow overview layouts stack vertically. This replaces the old background scene in these two placements; the older asset remains the social preview.

## Publication assets

- `public/assets/images/editorial/release-hidden-bugs.avif` and `.webp`
- `public/assets/images/editorial/release-bug-found.avif` and `.webp`
- `public/assets/images/editorial/release-retested.avif` and `.webp`

All exports: 600 x 600, alpha preserved, metadata stripped during conversion. Original PNGs remain under Codex generated_images; production has no dependency on those originals.

Original PNG filenames under `/Users/inokentii/.codex/generated_images/01a0e4fd-b50d-7743-89a3-ebffa69fc8d6/`:

- Hidden bugs: `exec-24d71691-d9c5-4c59-8750-2456a1bf9bba.png`
- Bug found: `exec-bbc8fac8-5666-490d-9b4c-a459485a12ba.png`
- Retested: `exec-34327e39-a138-4320-a6ab-b7f024c8431c.png`

## Verification

- Astro validation: 38 files, no errors, warnings, or hints.
- Production build: 19 pages, passing; existing large JavaScript chunk warning unchanged.
- Homepage reviewed at 1440 x 900, 390 x 844, 320 x 568, 844 x 390, and 568 x 320. Three images, two arrows, and two centered actions per product; no horizontal overflow. The first product's actions fit and the next product remains partly visible.
- Quality Engineering explanation reviewed in desktop, portrait, and landscape. Portrait uses downward arrows between readable captions. Copy identifies corrections as development-team work and preserves the testing boundary.
- Playable overview retains all three images and the approved Play, Click to redirect, and Open Ad link headings.
- Both AVIF and WebP exports contain alpha ranging from 0 to 255. All six new publication files total 81,339 bytes.

## Final prompt set

### Stage 1

```text
Use case: stylized-concept
Asset type: text-free editorial website illustration, first of three release-testing stages.
Primary request: a new software product with subtle hidden bugs, represented as one simple front-facing app window. Square composition, generous transparent margins. The window occupies about 75% width and 65% height in the same centered position planned for all three stages.
Style: crisp flat editorial illustration matching the restrained two-dimensional geometry and dark ink outlines of the reference phone. No real screenshot. A pale cool-neutral window with dark ink frame and header, a small cyan square motif and a few neutral abstract content blocks. Two small beetle-shaped bugs are partly hidden behind the content blocks, discoverable but not dominating. Bugs have antennae and six short legs, no scary realism.
Palette: ink #15202A, outline #344854, pale #E9EEF2, cyan #56D3FF, small yellow #FFC000 accents. Strong readable outline on a light #F5F5F7 website canvas. Actual transparent background outside the object, no floor or backdrop.
Constraints: no text, letters, numbers, captions, arrows, logos, watermark, shield, checkmark, glossy 3D, glow, fake metrics, people or photographic textures. One isolated product illustration, not a composite sequence.
```

### Stage 2

```text
Use case: precise-object-edit
Asset: second text-free release-testing illustration.
Image 1 is the edit target. Preserve exactly the app window's shape, size, position, dark frame/header, cyan square and neutral block layout, same flat editorial style, same square canvas and truly transparent outer background. Add a large simple dark-ink magnifying glass in front of the upper-right bug. Its circular lens reveals one clearly visible enlarged yellow-and-ink beetle, with antennae and six legs. Use a pale cyan lens interior, dark outline, short diagonal handle. The lens should be the clear focal point while the underlying product remains recognizable. No extra products or scenes. No text, letters, numbers, connecting arrows, checkmarks, shields, logos, watermark, people, glossy 3D or glow.
```

### Stage 3

```text
Use case: precise-object-edit
Asset: third text-free release-testing illustration.
Image 1 is the edit target. Preserve exactly the app window's shape, size, position, dark frame/header, cyan square and neutral content-block layout, same flat editorial style, same square canvas and truly transparent outer background. Remove only the two bugs, completing the neutral areas naturally. Add three crisp small four-point sparkle stars around the upper edges of the same product, yellow and cyan fills with dark ink outlines. This is a visual metaphor for corrected and retested changes, not a certification or guarantee. The same product should look clean and cared for, not magically replaced. No magnifying glass, shield, seal, checkmark, confetti, arrows, text, letters, numbers, logos, watermark, people, glossy 3D or glow.
```
