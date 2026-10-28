# Unity Ad Testing slot

The owner authorized a single public test slot on the existing website:
`https://aniloom.tech/temp-unity/index.html`.

Keep this URL stable. Replace `public/temp-unity/index.html` with the next
self-contained **Unity delivery** HTML, then build, commit and push to `main`.
Do not copy an AppLovin export, a hosted-review export, source files, archives,
or multiple playable projects into this folder. Do not rebuild or change the
game as part of replacing the hosted file.

The slot has no website navigation, portfolio entry, sitemap entry, or wrapper
UI. The root robots.txt disallows crawling `/temp-unity/`; this is not access
control or a guarantee of removal from search results. Anyone with the URL can
load the file, as required by Unity's Ad Testing application.

## Hosting and replacement verification

GitHub Pages serves the exact `.html` path without a redirect and supplies
`Content-Type: text/html; charset=utf-8` and `Access-Control-Allow-Origin: *`.
Pages sets `Cache-Control: max-age=600` and does not support per-path custom
headers. It cannot supply `no-store` or `X-Robots-Tag` here. Allow for up to
10 minutes of caching after replacement, and verify the unmodified stable URL
before testing. A `_headers` file would have no effect on this hosting.

After each deployment, make a public HTTPS GET without following redirects.
Require status 200, the two headers above, a URL still ending in `.html`,
and a SHA-256 matching the intended local Unity file. Record the byte size,
verify `platform: unity`, and check the intended project and variant. Normal
Unity deliveries must stay under 5,000,000 bytes; the owner explicitly authorized
the current oversized, unpacked diagnostic file. Confirm the built sitemap and website pages do not link
to the slot. Hosting verification does not establish Unity uploader acceptance
or correct behavior in the native Ad Testing application.

Unity documents HTTPS on iOS, an accessible `.html` URL, CORS, and a single
inline HTML below 5 MB in its
[Ad Testing instructions](https://docs.unity.com/en-us/user-acquisition/creatives/preview-creative-packs).

## Current upload

- Project: `RealPlay_PiggyfestBonanza`
- Variant: `3_click_auto`
- Delivery: Unity, MRAID, both orientations, technical controls disabled
- Original: `../playable-ads/dist/RealPlay_PiggyfestBonanza/3_click_auto/unity/index.html`
- Transport: unpacked inline JavaScript module and base64 assets
- Bytes: `5803979`
- SHA-256: `fe8a4be57c6dca77c9923a4699f82c7c484e1202115771acd1d3282f34f5b599`

On 28 October 2026, the owner requested an unpacked version despite the 5 MB
delivery cap, to compare validation in Unity's application. First, the sibling
project's `unpackInlineModule` restored the
original inline JavaScript module and removed its gzip/base122 payload and
decoder. The packed input SHA-256 was
`4a9af841602144277326ec4822d4e5cc8a1b82d05e4ddbc66a1c2fec195fc76a`.
The owner then requested removing the MRAID timeout bypasses and using direct
MRAID calls. The hosted diagnostic HTML now explicitly calls
`mraid.getState()`, `mraid.addEventListener("ready", ...)`,
`mraid.isViewable()`, and `mraid.addEventListener("viewableChange", ...)`.
It waits without a timeout for ready and, when hidden, for viewability.
The persistent visibility listener still handles pause/resume. The existing
desktop fallback when MRAID is absent is retained.

Only the lifecycle block of this hosted diagnostic file changed; the surrounding
HTML, game code, assets, and sibling playable-ads repository are unchanged.
The previous unpacked SHA-256 was
`d4e4d353f639e05b17544c8d97e4b58c69dd46af3a059acdfb8d32335a2326f5`.
These are diagnostic changes, not a release-compliant delivery or a confirmed
Unity validation fix. They must be reconciled into the playable delivery source
after the experiment, rather than silently overwritten by a rebuild.

Focused checks executed the actual hosted lifecycle block with simulated MRAID:
no startup after 10 seconds without ready, no startup after 10 seconds without
viewability, false viewability ignored, startup when both conditions hold,
already-ready/visible behavior, listener cleanup, continued visibility updates,
and the existing desktop fallback. The complete inline module passed syntax
validation, and all content outside the lifecycle block matched the prior file.
