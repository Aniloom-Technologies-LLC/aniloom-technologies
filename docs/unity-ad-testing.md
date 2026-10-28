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
Unity deliveries must stay under 5,000,000 bytes. The current TrumpItBonanza
file meets that byte limit; the owner also authorized the earlier oversized
unpacked comparison. Confirm the built sitemap and website pages do not link
to the slot. Hosting verification does not establish Unity uploader acceptance
or correct behavior in the native Ad Testing application.

Unity documents HTTPS on iOS, an accessible `.html` URL, CORS, and a single
inline HTML below 5 MB in its
[Ad Testing instructions](https://docs.unity.com/en-us/user-acquisition/creatives/preview-creative-packs).

## Current upload

- Project: `RealPlay_TrumpItBonanza`
- Variant: `3_click_auto`
- Delivery: Unity, MRAID, both orientations, technical controls disabled
- Original: `../playable-ads/dist/RealPlay_TrumpItBonanza/3_click_auto/unity/index.html`
- Transport: gzip/base122-packed game; visible shared MRAID lifecycle and CTA
- Shared lifecycle/SDK implementation: playable-ads commit `eef8235f`
- Bytes: `4324947`
- SHA-256: `e3932e571b67fa17f93d63fd738c8a082bfab6e2f37895f93a6e2da1e9c612cb`

On 28 October 2026, the owner requested TrumpItBonanza in the same stable slot
for comparison in Unity's native application. This is a byte-for-byte copy of
the existing Unity `3_click_auto` delivery, with no game rebuild or runtime
patch. The visible lifecycle and CTA checks and decoded-script syntax pass.
Native-app behavior and acceptance remain for the owner's test.

## Previous FindTheBall test

The preceding slot contained `BingoBlitz_FindTheBall`, Unity `3_click_auto`,
ordinary inline HTML without gzip, 3,981,051 bytes, SHA-256
`ccac4f5800aed5a2cb7de49adee053ee5922e7fdaf0127a8ad5ac7fc102fe1d6`.
The owner's screenshot reports that this file passes Unity Ads validation.
It recognizes both store URLs and the visible MRAID calls; its remaining
warning is the missing `mraid.js` reference. The screenshot also reports
99 base64 assets, 3.15 MB of base64 data, 2.36 MB of binary assets and
0.64 MB of code. These are app-reported measurements, not campaign acceptance.

The earlier slot contained Piggyfest `3_click_auto`, packed game with visible
shared MRAID lifecycle, 4,587,065 bytes, SHA-256
`576120d6d7641d2d65db5fda535a038d23d18947c4d43ffb4f6e6463c1d26311`.

## Previous comparisons

On 28 October 2026, the owner requested an unpacked version despite the 5 MB
delivery cap, to compare validation in Unity's application. First, the sibling
project's `unpackInlineModule` restored the
original inline JavaScript module and removed its gzip/base122 payload and
decoder. The packed input SHA-256 was
`4a9af841602144277326ec4822d4e5cc8a1b82d05e4ddbc66a1c2fec195fc76a`.
The owner then requested removing the MRAID timeout bypasses and using direct
MRAID calls. That diagnostic HTML explicitly called
`mraid.getState()`, `mraid.addEventListener("ready", ...)`,
`mraid.isViewable()`, and `mraid.addEventListener("viewableChange", ...)`.
It waited without a timeout for ready and, when hidden, for viewability.
The persistent visibility listener still handled pause/resume. The existing
desktop fallback when MRAID was absent was retained.

In that unpacked comparison, only the lifecycle block changed; the surrounding
HTML, game code, assets, and sibling playable-ads repository were unchanged.
The previous unpacked SHA-256 was
`d4e4d353f639e05b17544c8d97e4b58c69dd46af3a059acdfb8d32335a2326f5`.
These are diagnostic changes, not complete release acceptance. They must be
reconciled into the playable delivery source
after the experiment, rather than silently overwritten by a rebuild.

Focused checks executed the actual hosted lifecycle block with simulated MRAID:
no startup after 10 seconds without ready, no startup after 10 seconds without
viewability, false viewability ignored, startup when both conditions hold,
already-ready/visible behavior, listener cleanup, continued visibility updates,
and the existing desktop fallback. The complete inline module passed syntax
validation, and all content outside the lifecycle block matched the prior file.

The owner's subsequent screenshot reports that the unpacked version with direct
calls passes validation, with warnings about size, mraid.js, and the absent Play
Store URL. This is evidence from the app report, not confirmation of gameplay or
campaign acceptance. That unpacked file had SHA-256
`fe8a4be57c6dca77c9923a4699f82c7c484e1202115771acd1d3282f34f5b599`.

At the owner's request, the previous version repacked the game and assets using
the sibling `packInlineModule`. Its working lifecycle function was exposed as
`window.__PLAYABLE_WAIT_FOR_UNITY_START__` in an ordinary head script so its
direct MRAID calls remain visible to validation. The packed module calls that
function with its existing visibility and sizing callbacks. The gate is invoked
at the same point before game creation; it is not an unused validation stub.
No timeout bypasses were restored. All game code and assets outside this
function bridge match the previous unpacked version byte-for-byte after decoding.

Checks executed the actual emitted browser decoder, compared its injected module
with the original module, validated JavaScript syntax, and exercised the visible
gate with the packed module's real wrapper and visibility handlers. Waiting,
listener cleanup, continued visibility changes, and desktop fallback passed.
The owner's next screenshot reported that this packed version passed validation,
with warnings about mraid.js, the absent Play Store URL, and resize detection.
Its SHA-256 was
`3ad4190607232b2485e8171c75cb556577c82dde4e563be7998afe317407b1eb`.

## Previous control: timeouts only

The owner requested a control that removes only the timeout bypasses, without
the direct or visible MRAID-call changes. This version starts from the original
Unity HTML at website commit `61c895d`, unpacks it, and removes only the two
lifecycle timers and their delay arguments. It then repacks the complete module
with the existing `packInlineModule` helper.

The original minified `getState` call, optional chaining, generic ready-event
helper, visibility listener, MRAID store bridge, and full-module packing remain.
There is no visible lifecycle script or `__PLAYABLE_WAIT_FOR_UNITY_START__`
bridge. No gameplay, asset, click-through, or source playable-ads files changed.
Reversing the four timeout-related replacements reproduces the original
unpacked HTML exactly.

Focused checks executed the real browser decoder and the resulting lifecycle
code. Startup remains blocked after 10 seconds without ready and after 10
seconds without viewability, starts when the required events arrive, ignores
false viewability, cleans up temporary listeners, preserves ongoing visibility
updates and the existing desktop fallback. The owner reported that this control
did not pass native-app validation. Its SHA-256 was
`44924e017509cd12cae2a22a6efd3d0a624f7e54584de756c9c942695505383e`.

## Shared implementation and previous Piggyfest upload

The owner requested the same shared implementation for every playable's Unity
and AppLovin delivery. The source project now generates a visible
`data-playable-mraid-lifecycle` script from the actual `waitForMraidStart`
function in `src/framework/platform/deliveryEnvironment.ts`. Both networks use
`mraid-viewable`: ready first, then visibility, without timeout bypasses. The
packed game invokes `window.__PLAYABLE_WAIT_FOR_MRAID__` with the existing
visibility and sizing callbacks. The final-artifact validator checks this script
before unpacking, so hidden MRAID calls cannot satisfy that contract.

The previous Piggyfest website file was a byte-for-byte copy of the strict
Unity `3_click_auto` delivery generated from that shared source, with no
website-only runtime patch.
Source tests cover real/injected gate execution, missing/late ready, hidden
viewability, pause/resume, listener cleanup, desktop fallback, packing and
validation failures. Native-app acceptance remains separate from these source checks.

The shared generator now selects visible lifecycle scripts by the standard
MRAID adapter, including Nefta and Smadex, rather than a Unity/AppLovin list.
All packed profiles also validate their provider click bridge outside the
encoded payload; Moloco keeps its Facebook API without an added MRAID block.
The current source audit covers 120 HTMLs across eight ready projects and five
profiles (Unity, AppLovin, Nefta, Smadex, Moloco), plus 24 Nefta ZIPs. The Unity
Piggyfest file was rebuilt from this generator and is byte-identical to the
previous shared Unity upload, because the added changes affect other profiles
and validation rules. It was copied and deployed here before the FindTheBall replacement above.
