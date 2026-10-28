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
and a SHA-256 matching the intended local Unity file. Check that the file is
under 5,000,000 bytes, identifies `platform: unity`, and embeds the intended
project and variant. Confirm the built sitemap and website pages do not link
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
- Bytes: `4594806`
- SHA-256: `4a9af841602144277326ec4822d4e5cc8a1b82d05e4ddbc66a1c2fec195fc76a`

The packed gzip/base122 delivery is copied byte-for-byte. The existing Unity
uploader's `window.top` error and MRAID warning are not resolved by this upload;
this slot exists to test that existing file in Unity's application.
