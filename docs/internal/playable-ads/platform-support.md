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

`PlayablePlatforms.astro` owns both the complete manual carousel and the compact
homepage introduction. No autoplay, duplicated items, or external logo requests
at runtime. Icon sources and repeatable imports are in
`scripts/fetch-platform-icons.mjs`. Reviewed October 3, 2026. AppLovin, Google,
Meta, Pangle, Mintegral, Liftoff, and Moloco use assets linked from official sites.
Unity uses the Simple Icons v16 mark (CC0 collection, trademark rights retained).
TikTok uses AdManage's platform asset collection; ironSource uses CompaniesLogo's
icon for the named legacy Exchange target. These are not evidence of endorsement.
SVG marks are rasterized to 96px PNG without changing colors or geometry. Pangle
retains its official ICO. White icon wells preserve black marks on the dark home
scene without recoloring. Empty alt text avoids repeating the adjacent visible name.
