# AniShot private report service

Product scope, user disclosure and distribution status belong to [AniShot diagnostics](../../../Aniloom%20Projects/AniShot/docs/local-diagnostics.md) and [distribution](../../../Aniloom%20Projects/AniShot/docs/distribution.md). This repository owns only service implementation and operations.

## Deployment

Worker: `anishot-reports`. HTTPS base: `https://anishot-reports.aniloom.workers.dev`. One SQLite Durable Object binding `REPORT_INBOX` implements the private inbox. This is separate from the contact form, Turnstile and Resend. No report is automatically emailed.

```sh
npm run test:anishot-reports
npm run anishot-reports:deploy -- --dry-run
npm run anishot-reports:deploy
node scripts/anishot-reports-smoke.mjs
```

The deploy command loads existing Cloudflare credentials from the sibling playable-ads project's ignored configuration. On first deployment it creates random `ADMIN_TOKEN` and `HASH_SECRET` in ignored `.env.anishot-reports.local` with mode 0600. It pipes secrets to Wrangler without printing them. Existing deployed secrets are preserved; an operator configuration is required before redeployment. Securely back up that local file outside the repository. Do not copy its contents into app resources, website assets, chat output or Git. `WRANGLER_BIN` can select a local Wrangler installation.

The first deployment can take longer to propagate after secret installation. A readiness failure does not mean an inbox has been removed: verify GET `/health` returns 200 with `ready: true` before retrying. The synthetic smoke command never opens the native journal, preferences or crash files. It checks save, identical retry, unauthenticated denial, private retrieval and deletion.

## Read or delete received reports

Run from this website repository with the ignored operator configuration present:

```sh
node scripts/anishot-reports.mjs list
node scripts/anishot-reports.mjs get REPORT-ID
node scripts/anishot-reports.mjs delete REPORT-ID
```

List returns report IDs, server reception timestamps and byte counts. Get writes the private JSON with mode 0600 under ignored `.local-artifacts/anishot-reports`. Reports may include personal information deliberately written in comments. Keep downloaded copies private and delete them when no longer needed; service retention cannot delete a separately downloaded copy. A report ID shown by the app can locate a deletion request. No email is collected in this workflow, so the installation ID cannot be used to contact its sender.

The public endpoint permits POST only and has no embedded client secret. Administrative reads/deletions require the private Bearer token. Never add CORS access, public report URLs or operator keys to the app. The installation UUID is a pseudonymous grouping field, not authentication.

## Storage, protection and retention

`app.mjs` accepts a strict schema-2 allowlist and recomputes action counts. Uploads are limited to 1 MiB, 2,000 events and 5,000 Unicode scalar values in comments. Ordinary browser Origin headers and encoded bodies are rejected. Unknown fields, arbitrary diagnostic strings and raw crash files are rejected. Output receipts identify a durably stored report; storage failure cannot be reported as success. Same-ID identical requests return the existing receipt; changed content conflicts.

Active storage keeps the latest 100 reports for at most 30 days. Cleanup runs on requests and hourly alarms. SQLite point-in-time recovery can retain deleted states for another 30 days. Exported operator copies have separate retention. Cloudflare infrastructure processes network metadata; code never logs raw IPs, bodies or secrets and Worker observability is disabled. IP addresses are keyed-hashed for ten-minute request counters.

Limits: five attempts per IP hash per ten minutes, three new reports per installation per hour, 100 new reports per rolling day and 1,000 total attempts per daily window. These are initial testing limits, not a claim of unlimited support capacity. Rate limits return 429 and Retry-After. Failed or rate-limited submissions remain unsent in the app until the user retries. There is no transmission on app launch, idle or capture.

Inspect Cloudflare account access periodically. The operator token can be rotated deliberately through Wrangler and the local operator file; it is never required by app submission. Keep the hash secret stable across normal deploys. Disabling either required secret makes readiness/submission unavailable.

## Verification, October 9, 2026

Six Node SQLite tests passed: strict schemas/comments, private access/delete and idempotency, invalid-attempt/body limits, installation quotas/30-day cleanup, storage failure, daily ceiling/latest-100 retention. Wrangler dry-run passed. Deployment and synthetic live save/retry/private-get/delete succeeded. The first automatic readiness probe timed out during initial secret propagation; a subsequent normal health request returned ready and the full live smoke check passed. A separate synthetic request through the production Swift HTTPS sender received a matching saved receipt and was privately retrieved/deleted. No real user history was uploaded.

The native app source owns HTTP receipt handling, UI tests and signing evidence. Deploying this service does not publish a new app DMG or change the current website download.
