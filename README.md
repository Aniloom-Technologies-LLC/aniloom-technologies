# Aniloom Technologies Web Experience

Astro-based multi-page marketing site for Aniloom Technologies featuring a cinematic Three.js
landing page, supporting sections, and a content-driven Insights section.

## Stack

- Astro for static routing, layouts, and content collections
- Markdown content in `src/content/blog`
- Static assets served from `public/assets`
- Existing client-side JavaScript for Three.js and interactive utilities

## Pages

- `src/pages/index.astro` — immersive home experience with scroll-driven camera over AI domes
- `src/pages/education.astro` — learning resources overview
- `src/pages/unity-assets.astro` — Unity tooling overview
- `src/pages/world-clock.astro` — live clocks for key collaboration cities
- `src/pages/test-scene.astro` — lightweight Three.js diagnostic scene
- `src/pages/life-weeks.astro` — interactive life calendar
- `src/pages/insights/index.astro` — Insights index for articles
- `src/pages/insights/[slug].astro` — article detail route

## Content Workflow

Add a new Insight by creating a Markdown file in `src/content/blog` with this frontmatter:

```md
---
title: Your article title
description: One-line summary for the listing page
publishDate: 2026-03-19
category: AI Systems
tags:
  - example
  - article
draft: false
---
```

## Commands

- `npm install` — install dependencies
- `npm run dev` — start Astro locally
- `npm run build` — generate the production site in `dist/`
- `ASTRO_TELEMETRY_DISABLED=1 npm run build` — build in restricted environments

## License

This project follows the terms in `LICENSE` (Creative Commons BY-NC-ND 4.0).
