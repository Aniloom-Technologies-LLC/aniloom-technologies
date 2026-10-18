# Search discovery and AI reading

The public HTML is the source for readers and search systems. This work improves discovery and entity clarity; it cannot guarantee crawling, indexing, citations, recommendations, or campaign outcomes. Keep the website on GitHub Pages with Cloudflare DNS only. Contact, Turnstile, playable demos, and private AniShot reports are separate services.

## Implementation

- `src/pages/sitemap.xml.ts` lists 17 public content pages, including Contact and AniShot's public privacy policy. It adds published Notes from the content collection. Keep the explicit catalog: `test:search` compares it with every generated HTML page and fails on omissions or unexpected additions.
- `/support/` stays an unlisted email utility. Five legacy playable routes stay outside the sitemap and internal navigation. Astro generates HTML redirects on GitHub Pages, not HTTP 301 responses. Draft Notes stay outside both build and sitemap.
- Sitemap dates are omitted. Build time, filesystem copy time, and shared-layout commits are not reliable content-modification dates. Add `lastmod` only with a maintained source reflecting meaningful content changes.
- Existing self canonicals, readable server-rendered text, navigation, and the wildcard allow policy in `public/robots.txt` are preserved. Training policy is unchanged.
- The shared JSON-LD graph connects each WebPage to the WebSite and Organization. `Aniloom` is the alternate name of `Aniloom Technologies`. About, Contact, and Notes use the appropriate page types. The two service overviews identify Playable Ads and Quality Engineering as services provided by Aniloom. Service descriptions reuse existing page metadata; articles retain their real dates and connect to their page entity.
- No price, review, rating, partnership, award, founder-date, device-lab, or performance claims were added. Pricing and package scope remain on the approved pages. Service markup is semantic description, not a special AI ranking feature or a promise of Google rich results.
- No `llms.txt`, duplicate Markdown site, new HTML navigator, or sitemap index was added. The small site already exposes useful content and navigation in HTML. There is no demonstrated reader that needs another representation; an additional manually maintained summary could drift. Reconsider only for a concrete integration, preferably generated from existing public sources.

## Crawl controls: verified official guidance

Reviewed October 17, 2026, America/Los_Angeles (October 18 UTC for the HTTP audit).

| System | Search or user reading | Other control |
| --- | --- | --- |
| OpenAI | `OAI-SearchBot` is for ChatGPT search. `ChatGPT-User` retrieves pages for some user actions and does not control search inclusion; robots rules may not apply to user-initiated actions. | `GPTBot` controls crawling for potential model training independently. |
| Anthropic | `Claude-SearchBot` supports search; `Claude-User` fetches content for users. Anthropic documents respect for robots.txt. | `ClaudeBot` collects potential training material. |
| Google | Googlebot governs Google Search, including AI Overviews and AI Mode. Existing SEO, indexability, and snippet eligibility matter. | `Google-Extended` controls both future Gemini training and grounding in Gemini Apps and the documented Vertex AI use cases. It has no separate HTTP User-Agent and does not control Google Search inclusion or ranking. |

The existing wildcard allow permits these crawlers without adding special groups. Search access and training permissions are different decisions. Do not describe Google-Extended as training-only, or change it merely to improve Google Search.

Sources: [OpenAI crawlers](https://developers.openai.com/api/docs/bots), [Anthropic crawlers](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler), [Google AI features](https://developers.google.com/search/docs/appearance/ai-features), [Google-Extended](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers#google-extended). Google's [AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) explicitly says Search ignores llms.txt for visibility/ranking and requires no special AI markup.

## October 17 baseline and repeat observation

The preceding diagnostic session reported robots.txt 200 text/plain, sitemap.xml 200 application/xml with 15 URLs, and 200 for all 15 pages. It found titles, descriptions, self canonicals, one h1, and Organization/WebSite JSON-LD on those pages and Contact, with Article on Notes. No noindex response was reported. Requests using browser, OAI-SearchBot, and ChatGPT-User strings returned the same content from that machine. Those requests did not originate from verified crawler IPs.

This implementation session directly rechecked sitemap.xml: HTTP 200 application/xml from GitHub.com, 15 URLs before deployment, Last-Modified October 15, 2026 03:03:29 GMT. Contact and AniShot privacy were missing despite being public linked content. Source inspection found no Google or Bing HTML verification tokens. Absence of a file or meta token does not prove the property is unverified; DNS verification or another owner account may exist.

The available AI web retrieval tool now reads the current About page at `https://aniloom.tech/about/`: h1 `The people behind Aniloom.`, the six current profiles, and Contact links. This improves on the earlier cached response with `Technology is the capability. People give it direction.` The current homepage and playable overview are also readable. Opening robots.txt and sitemap.xml in that web tool still returns a generic internal/not-accessible error with no diagnostic HTTP status; direct HTTP 200 is separate evidence. Do not infer a hosting block or Content-Type fault from that error.

Search queries `site:aniloom.tech "playable"` and `"Aniloom" playable ads` returned the homepage and playable overview in the available search tool. Results also included a stale `/unity-assets/` entry and unrelated similarly named entities. This is a sample of one search tool's results, not a rank measurement or proof of recommendations in ChatGPT, Claude, or Gemini. No direct Claude or Gemini answer evaluation was performed.

Search Console and Bing Webmaster Tools account checks were attempted in the available browser; both origin-access gates were denied. No authenticated console data was read or changed, and no sitemap or indexing request was submitted. No relevant dedicated console connector was available in the exposed tool catalog. Existing account ownership, indexing reports, and DNS verification remain unverified.

## Checks before publication

Use the Node version configured in `.github/workflows/deploy.yml` (22.19 or a compatible newer version).

```sh
npm ci
npm run check
npm run build
npm run test:search
```

`test:search` reads `dist/`, makes no network requests, and checks sitemap completeness, crawl policy, canonical URLs, indexability/snippet restrictions, unique metadata, h1 and HTML text, connected JSON-LD, internal links and anchors, homepage reachability, drafts, and legacy redirects. Deployment runs it after the production build and before artifact upload. The utility exclusion is explicit so accidentally adding noindex to an ordinary page cannot silently remove it from the audit.

After a successful Pages deployment, run:

```sh
npm run check:search:live
```

This sends public GETs only and compares robots, sitemap, headings, canonicals and JSON-LD with the current local build. It rejects redirects, failed status codes, unexpected content types and indexability-blocking headers/meta. Run from the intended production revision, with a fresh build. It fails if production still serves the older sitemap or metadata, which can also happen temporarily during cache propagation. It neither submits an inquiry nor tests Worker, Turnstile, demo, physical-device, or regional access.

## Implementation validation, October 18, 2026

Astro validation passed with zero errors, warnings, and hints. The production build passed, with the existing client-chunk-size warning. All seven search checks passed across 17 catalog pages and five redirect documents. A source comparison with the production base confirmed unchanged body markup, styles, copy, and interactions in the shared layout and all five annotated pages; no visual composition changed. Browser account access was unavailable as recorded above. No contact message was sent.

Before deployment, the live-check command correctly failed on the two sitemap entries missing from production. This established that it distinguishes the local result from an older live build. Run it again after the successful Pages deployment to confirm publication.

## Owner console steps after publication

1. Open the existing `aniloom.tech` property in [Search Console](https://search.google.com/search-console). If unavailable, use the existing owner account or its official verification flow; obtain any DNS token from Google and keep website DNS records in DNS-only mode.
2. In Sitemaps, submit `https://aniloom.tech/sitemap.xml` and record its processing status, last read, and discovered URL count. In URL Inspection, inspect `/`, `/playable-ads/`, `/playable-ads/pricing/`, `/about/`, and `/contact/`. Compare the indexed and live versions, selected canonical, fetch status, and crawl date. Request indexing after a successful live check where appropriate. See [Google's instructions](https://support.google.com/webmasters/answer/10351509) and [inspection limitations](https://support.google.com/webmasters/answer/9012289/).
3. Open the existing site in [Bing Webmaster Tools](https://www.bing.com/webmasters/). In Sitemaps, submit the same full sitemap URL and inspect processing details. Use URL Inspection for the same priority pages. See [Bing's sitemap instructions](https://www.bing.com/webmasters/help/sitemaps-3b5cf6ed). Do not create another account or reconnect/import properties merely because this agent could not inspect the current account.
4. Save dated evidence privately: property, sitemap status, inspected URL, indexed canonical, last crawl, exclusions and applicable performance reports. Never publish verification credentials, account data, or private customer queries in this repository.

Sitemap submission and indexing requests are hints. They do not guarantee inclusion, ranking, or AI citations. No paid service, advertising, mass external publication, or scheduled automation is part of this implementation.

## Repeat-audit protocol

Suggested manual checkpoints: about 7-14 days after production publication and console submission, then around 4 weeks. These are observation windows, not indexing deadlines. No calendar task or automation has been created.

1. Record date/time/timezone, production commit and successful Pages run, and run the local and live checks above. Distinguish actual HTTP status from a retrieval tool's generic error. Record verified crawler IPs only if real logs or provider diagnostics establish them.
2. In a fresh conversation in each of ChatGPT, Claude and Gemini with web search enabled, first test direct reading: “Read https://aniloom.tech/about/ and quote the main heading. Who leads the company?” Then ask what Aniloom delivers from `/playable-ads/`, what the pricing page includes, what the demos prove, and how to contact the company. Save exact prompts, model/product, citations, and answers.
3. Check facts against current public pages: Aniloom Technologies is the software company; playable production delivers a finished creative; packages and starting prices belong to Pricing; network-specific packaging and resolution checks have agreed scope; public Magic Thai demos do not establish client campaign results or network acceptance; QA retests after the development team's corrections; inquiries go to Contact. Compare the current About heading with the obsolete baseline marker. Check current AniShot release claims against its product page, not this audit record.
4. Separately test search discovery without supplying the domain: “I need a high-quality HTML5 playable ad with source handoff and network-specific files. Which providers should I consider, and why?” Repeat with a relevant network and a product-appropriate budget. Then run branded queries such as “Aniloom playable ads”. Record whether Aniloom appears and which URLs support each claim. A direct URL read is not evidence of spontaneous discovery or recommendation.
5. Compare Google/Bing console evidence and qualified inquiries over comparable periods. Account for small samples, location, language, model/version changes, and variable results. Do not infer traffic or conversions from isolated AI answers.
6. Correct identifiable stale or false facts in their canonical public sources. If content is accurate but absent from answers, investigate indexing and actual access evidence before creating new pages or rewriting approved copy.

Keep future evidence in dated internal notes. Do not copy brand briefs, product documentation, private logs, or confidential playable examples into `public/`.
