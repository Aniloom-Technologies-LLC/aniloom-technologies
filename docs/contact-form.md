# Contact implementation

## UX contract

Use `Contact` for navigation and `Contact us.` for the page heading. `Contacts` implies an address book or list, not the intended conversation. All project actions are normal `/contact/` links. Package actions preserve the selected package through a bounded `topic` query; personal information never belongs in a URL.

The form is at the top, on a dark focused-action scene. It has only two visible required fields: email and project description. The separate light section below presents selectable `support@aniloom.tech`, a mailto link, and a copy button where supported. No LinkedIn links are approved yet. The page remains reachable without JavaScript; online submission needs JavaScript for spam verification, with direct email as the fallback.

Show pending, success, verification error, rate limit, and unavailable states explicitly. Preserve text on failure and edits made while a request is pending. Confirm success only when the server confirms the provider accepted the message, not when a draft opens or a request starts. Provider acceptance is not proof of final inbox delivery. Do not send automated replies to the submitted address or require an email-confirmation round trip before a first inquiry.

## Architecture and limits

The static Astro website stays on GitHub Pages. `workers/contact/worker.mjs` is a separate Cloudflare Worker with a SQLite-backed Durable Object for atomic, shared quotas and duplicate protection. `/config` returns only availability and the public widget key; `/contact` accepts the inquiry. Missing configuration fails closed.

- Managed Turnstile is verified on the server, including its hostname and `contact` action. A client-side check alone is not protection.
- Only configured website origins are allowed. CORS is an additional boundary, not proof of a human visitor.
- Three attempts per trusted Cloudflare connecting IP per ten minutes, including malformed and verification-failed requests. Shared office networks share this limit. Revisit it using actual inquiry traffic, not assumptions.
- A budget of 100 distinct submission reservations per rolling 24-hour window, shared across IPs. Failed delivery reservations count toward the budget; retries of the same content do not count again. This limits email spend; it is not a guarantee against all distributed abuse or infrastructure costs.
- An invisible honeypot, strict field types, a 32 KiB request limit, a 254-character email limit, a 5,000-character message limit, and a 160-character topic limit.
- Plain-text email with fixed sender and recipient. The customer address is `reply_to`, never the sender. Reject header/control-character injection. Validate email format, not mailbox ownership; do not exclude personal or disposable providers by default.
- Stable content-derived provider idempotency keys and a one-minute reservation lease prevent duplicate deliveries during concurrent requests or uncertain retries. Identical email/message/topic is deduplicated for 24 hours. No client timestamp enters the provider payload.
- HMAC-derived IP and submission identifiers are operational storage, not anonymous analytics. The Durable Object stores no raw message, email, IP, or verification token. IP records expire after ten minutes; submission records expire after 24 hours. Alarms remove expired records at roughly ten-minute intervals.
- No application logging of message bodies or credentials. Cloudflare and the email provider process information according to their own policies; the application storage window is not a provider-wide retention promise. Update the privacy page if providers or storage behavior change.

## Credentials and deployment

Create a Managed Turnstile widget restricted to `aniloom.tech` and `www.aniloom.tech`. Store its public and secret keys in ignored `.env.contact.local`. Never enable arbitrary hostnames or use the always-pass test keys in production.

Create a Resend sending API key and a verified sending domain. `CONTACT_FROM_EMAIL` must be a sender on that verified domain, for example a dedicated inquiry sender. The recipient remains `support@aniloom.tech`. Domain-verification DNS changes need the owner's approval. Do not use a submitted customer email as the sender.

Use these environment names, with real values only in the ignored file:

```dotenv
PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
RESEND_API_KEY=
CONTACT_FROM_EMAIL=
# Optional overrides if the sibling playable-ads deployment token is unsuitable:
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_ACCOUNT_ID=
WRANGLER_BIN=
```

`scripts/contact-deploy.mjs` can reuse the sibling `playable-ads/.env.cloudflare.local` token, account ID, and installed Wrangler without changing that project. A local override takes precedence. Access to Workers does not imply Turnstile permissions; widget API management needs Account > Turnstile > Edit. Use least-privilege tokens. Never print keys, paste them into chat, or commit them.

The script deploys the Worker and uploads secrets through stdin, including the widget's public key for `/config`. It generates `HASH_SECRET` once and preserves it on subsequent deployments. Secret rotation changes deduplication identities, so rotate deliberately. Default service URL is `https://aniloom-contact.aniloom.workers.dev`. An explicit `PUBLIC_CONTACT_ENDPOINT` build variable can select another service; this is a public URL, not a secret.

Activation order:

1. Run `npm run check`, `npm run test:contact`, and `npm run contact:deploy -- --dry-run`.
2. Configure the real widget and verified sender, then run `npm run contact:deploy`.
3. Check `/config` with the production Origin, make a clearly labelled live test inquiry, and confirm receipt at the recipient mailbox. Provider acceptance alone does not complete this check.
4. Build without the local fixture endpoint. Review portrait, landscape, package context, copy email, success, failure, and rate-limit states.
5. Publish the static flow only after these checks. Until credentials and inbox access are available, keep implementation on a feature branch and leave production navigation unchanged.

## Reproducible local checks

`npm run test:contact` uses mock storage and mock provider responses. It covers validation, CORS, trusted IP handling, byte limits, the honeypot, verification action/hostname, fixed recipients, provider errors/timeouts, idempotency, shared quotas, atomic concurrent reservations, and expiry. These tests send no mail.

For browser interaction checks, `scripts/contact-preview.mjs` binds only `127.0.0.1:8788` and allows only Origin `http://127.0.0.1:4331`. It uses Cloudflare's official test widget and mock delivery responses. Start it with `node scripts/contact-preview.mjs`, build with `PUBLIC_CONTACT_ENDPOINT=http://127.0.0.1:8788 npm run build`, then preview on port 4331. Enter `success`, `error`, `rate`, or `unavailable` into the fixture process stdin to select a scenario. It does not call Resend or read production credentials. Never deploy this fixture or the fixture build. Rebuild with `npm run build` afterward.

Verify desktop, 390px and 320px portrait, and short landscape. Check widget fit, field readability, centered submission, keyboard validation, retained errors, persistent success, and package topic navigation. Test blocked widget loading with an email fallback. Save visual review artifacts outside `public/`.

## Provider references

- [Turnstile server validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- [Turnstile widget configuration](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/widget-configurations/)
- [Resend idempotency keys](https://resend.com/docs/dashboard/emails/idempotency-keys)

## Implementation review, 2026-10-05

- 23 server tests passed. Astro reported zero errors, warnings, and hints. The production build and Worker deployment dry run passed. The existing large client-bundle warning remains unrelated to this contact change.
- Browser review covered 1440px desktop, 390px and 320px portrait, and 844px short landscape. Checked native email validation, package topic transfer, copied email, pending button, accepted-message persistence, retained delivery errors, rate-limit recovery, and unavailable-service fallback using local fixtures. No test email was sent.
- The production build was restored without the local fixture URL. The Cloudflare token available in `playable-ads` could read Workers but returned 403 for Turnstile management. Real widget credentials, a verified Resend sender, deployment, and final inbox receipt remain activation gates, not completed checks.
