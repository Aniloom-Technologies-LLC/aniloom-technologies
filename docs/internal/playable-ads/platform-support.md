# Public platform names

Reviewed October 3, 2026 against the companion `playable-ads` repository's
`scripts/delivery.mjs` platformProfiles and `docs/PROVIDERS.md` output matrix.

The website lists provider-specific packaging capabilities, not customers,
partners, certifications, successful campaign uploads, or performance results.
Names use site typography with locally hosted marks for editorial identification.

| Public name | Delivery profile | Package |
| --- | --- | --- |
| AppLovin | applovin | HTML / MRAID |
| Google Ads | google | Responsive ZIP / ExitApi |
| Unity Ads | unity | index.html / MRAID |
| Meta | facebook | ZIP / FbPlayableAd |
| TikTok | tiktok | Responsive ZIP with config |
| Pangle | pangle | Responsive ZIP with config |
| Mintegral | mintegral | Matching-name ZIP / install bridge |
| Liftoff | liftoff | ZIP / MRAID |
| Moloco | moloco | HTML / FbPlayableAd |
| ironSource Exchange | ironsource2025 | Raw HTML/JS MRAID tag |

Bigabid, Nefta, Snapchat, Smadex, and Vungle are intentionally omitted because
their profiles have `requiresExternalValidation: true`. The internal `common`
profile is not a customer platform. This selection does not establish external
acceptance for any listed provider. Recheck account requirements and provider
preview behavior for each project. Provider specifications were reviewed in the
source project on September 27, 2026.

Platform selection and additional packages must follow the agreed scope and
canonical offer, not imply that all listed networks are included in base pricing.

`PlayablePlatforms.astro` owns both the looping carousel and the compact
homepage introduction. It advances one item every four seconds while visible, with pause/resume, hover/focus pausing, and reduced-motion support. Looping copies are hidden from assistive technology. There are no external logo requests at runtime. Icon sources and repeatable imports are in
`scripts/fetch-platform-icons.mjs`. Reviewed October 3, 2026. AppLovin, Google,
Meta, Pangle, Mintegral, Liftoff, and Moloco use assets linked from official sites.
Unity uses the Simple Icons v16 mark (CC0 collection, trademark rights retained).
TikTok uses AdManage's platform asset collection; ironSource uses CompaniesLogo's
icon for the named legacy Exchange target. These are not evidence of endorsement.
SVG marks are rasterized to 96px PNG without changing colors or geometry. Pangle
retains its official ICO. White icon wells preserve black marks on the dark home
scene without recoloring. Empty alt text avoids repeating the adjacent visible name.


## Production checks and delivery, October 7, 2026

Owner direction positions Playable Ads as the finished creative, with checks embedded in production. Standalone third-party playable testing is omitted from both playable pages. Overview describes capabilities; Pricing defines the commercial base scope. This direction supersedes the earlier public development-versus-QA split while retaining approved development and relevant add-on prices.

Verified against companion `../playable-ads/docs/PROVIDERS.md` (Manual playable validators), `docs/PLAYABLE_WORKFLOW.md` (responsive and final-artifact checks), and `docs/CLOUDFLARE_HOSTING.md`:

- AppLovin Playable Preview: https://p.applov.in/playablePreview?create=1, single HTML / MRAID.
- Google Ads HTML5 Validator: https://h5validator.appspot.com/adwords/asset, responsive ZIP / ExitApi.
- Liftoff Creative Validator: https://app.liftoff.io/creatives/validator, ZIP / MRAID.
- Mintegral/Mindworks Playable Testing: https://www.playturbo.com/review, matching-name ZIP/folder/HTML / install bridge. Playturbo review is Mintegral-specific, not universal.
- Responsive checks include iPhone/iPad screen resolutions, 9:22 portrait and 22:9 landscape extremes, state transitions, orientation changes, CTA and the agreed destination. Do not imply physical-device evidence from resolution checks.
- Cloudflare Workers hosts an index.html demo accessible through a shareable browser link. Provider packages remain distinct upload artifacts. Do not claim every browser is compatible.

All four preview/validator URLs were rechecked during this website revision. AppLovin's public tool explicitly distinguishes browser preview from real-device behavior and campaign execution. Claim only checks for agreed target networks, not that all listed packages are included or that the tools guarantee every delivery variant or campaign acceptance.
