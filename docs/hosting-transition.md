# GitHub Pages direct delivery

The website already deploys to GitHub Pages through `.github/workflows/deploy.yml`. This transition removes Cloudflare's HTTP proxy for `aniloom.tech` and `www.aniloom.tech`, while retaining Cloudflare DNS, the domain, URLs, deployment workflow, and separate Workers. It does not restore blocked contact submissions or playable demos by itself.

## Readiness on 10 October 2026

- GitHub Pages API: custom domain `aniloom.tech`, workflow builds, HTTPS enforcement enabled. Deployment `38018346534` completed successfully for `39c5980` on `main`.
- GitHub repository API access includes administrator permissions. Authenticated Pages reads succeed through the existing local Git credential. A request to preserve the already-enabled HTTPS enforcement was rejected with HTTP 404, "The certificate has not finished being issued"; the follow-up read confirmed that the existing settings were unchanged. Certificate provisioning must be resolved before retrying that setting.
- GitHub certificate provisioning reports `bad_authz`: "The ACME authorization is in a bad state. We need to start over." The API reports certificate expiry on **15 October 2026**, with only `aniloom.tech` in its domain list. A working current certificate is not proof of working renewal.
- At 21:24 UTC, all 32 direct page and asset checks returned HTTP 200, with actual connection addresses matching the intended GitHub IPv4 endpoints. All four direct `www` checks failed hostname verification. Never bypass TLS validation to treat this as ready.
- A separate direct-origin check of all 15 URLs in the published sitemap returned HTTP 200 for every URL. The eight focused hosting tests passed; the live readiness gate remains failed because of certificate lifetime and `www` hostname validation.
- GitHub's DNS health API identifies both names as Cloudflare-proxied and `is_https_eligible: false`. This is a concrete configuration problem for issuance; the exact cause of the previous ACME failure is not established.
- Both available Cloudflare credentials can list the zone, but listing its DNS records returns HTTP 403. The current underlying origin records and proxy rules cannot be exported through those credentials. Public DNS is not a replacement for that backup.
- No DNS, Pages settings, Workers, or production website files were changed during preparation. No inquiry was submitted.
- The public Cloudflare connection returned HTTP 200 with a certificate expiring on 1 January 2027. The contact `/config` request with the approved Origin returned `ready: true`, and all three demo HEAD requests returned HTTP 200 from this machine. These local responses do not override the earlier Spanish blocking results.

## Current public DNS baseline

Nameservers remain `grant.ns.cloudflare.com` and `venus.ns.cloudflare.com`.

| Name | Type | Public answer | TTL |
| --- | --- | --- | --- |
| `aniloom.tech` | A | `104.21.20.48`, `172.67.191.89` | 300 seconds |
| `aniloom.tech` | AAAA | `2606:4700:3030::6815:1430`, `2606:4700:3034::ac43:bf59` | 300 seconds |
| `www.aniloom.tech` | A | `104.21.20.48`, `172.67.191.89` | 300 seconds |
| `www.aniloom.tech` | AAAA | `2606:4700:3030::6815:1430`, `2606:4700:3034::ac43:bf59` | 300 seconds |

These are proxy answers, not the origin values stored in Cloudflare. Do not copy these addresses into origin records for rollback. `www` redirects to `https://aniloom.tech/` through Cloudflare; plain HTTP also redirects to HTTPS.

## Owner steps in Cloudflare

Open the `aniloom.tech` zone in Cloudflare, then **DNS > Records**.

1. Before changing anything, export the DNS records through the records page's export option and save screenshots of the `@` and `www` rows, their proxy states, redirect rules, and SSL/TLS encryption mode. Retain this backup privately. Do not paste credentials into chat.
2. Change only the website records for `@` and `www` to the target table below. Edit existing matching records rather than creating duplicates. Replace conflicting website A, AAAA, or CNAME records for these exact names, not records elsewhere in the zone.
3. Set **every** website A/AAAA record for `@`, and the `www` CNAME, to **DNS only** (gray cloud). One remaining proxied A/AAAA record on the same name keeps that name proxied. Use a short TTL such as 300 seconds during transition.
4. Keep nameservers, MX, mail-related TXT/CNAME records, `notify`, domain verification, Workers, and other subdomains unchanged. Do not turn off Cloudflare Universal SSL or delete proxy rules; preserving them helps rollback.
5. Notify the operator after saving so GitHub DNS health, certificate issuance, `www`, and regional availability can be rechecked. This is the actual cutover, not a harmless preflight. Plan for a possible temporary `www` HTTPS problem until the replacement certificate is issued.

| Type | Name | Content | Proxy |
| --- | --- | --- | --- |
| A | `@` | `185.199.108.153` | DNS only |
| A | `@` | `185.199.109.153` | DNS only |
| A | `@` | `185.199.110.153` | DNS only |
| A | `@` | `185.199.111.153` | DNS only |
| AAAA | `@` | `2606:50c0:8000::153` | DNS only |
| AAAA | `@` | `2606:50c0:8001::153` | DNS only |
| AAAA | `@` | `2606:50c0:8002::153` | DNS only |
| AAAA | `@` | `2606:50c0:8003::153` | DNS only |
| CNAME | `www` | `aniloom-technologies-llc.github.io` | DNS only |

IPv6 can be omitted intentionally, but must not retain old or incorrect website AAAA records. Keeping GitHub's four AAAA records supports IPv6 visitors. The CNAME points to the organization hostname, without the repository name or a URL scheme.

## GitHub steps after DNS changes

The operator has authenticated Pages reads and an administrator repository role. GitHub currently rejects the HTTPS-setting request because issuance is unfinished, rather than reporting a permission error. The corresponding panel is [repository Settings > Pages](https://github.com/Aniloom-Technologies-LLC/aniloom-technologies/settings/pages).

1. Keep Custom domain `aniloom.tech`, Source **GitHub Actions**, and **Enforce HTTPS** enabled. No `public/CNAME` file is required for this workflow deployment.
2. Recheck the Pages DNS health API after public DNS exposes GitHub addresses. Check certificate provisioning and the actual certificate served by each GitHub IPv4 endpoint, not only the browser connection through Cloudflare.
3. If `bad_authz` persists after correct DNS propagation, GitHub documents removing and re-adding the custom domain to restart provisioning. Do this only in a coordinated recovery window: removing the domain can temporarily interrupt routing, including behind Cloudflare. Do not perform this reset while DNS still points at the blocked proxy or remove HTTPS enforcement as a workaround.
4. Require a replacement certificate covering both the apex and `www`, permanent `www` redirects that preserve paths and query strings, and HTTP-to-HTTPS redirects. Issuance may take time; the Enforce HTTPS option can take up to 24 hours to become available after domain configuration.
5. Confirm organization-level domain verification under **Organization Settings > Pages**. The Pages API's `protected_domain_state` was null, and the conventional challenge TXT lookup returned no answer. Do not interpret these checks as proof that the domain is verified. If needed, the owner can add GitHub's generated TXT record in Cloudflare; its value must come from GitHub, not be invented.

## Checks and acceptance

Run `npm run test:hosting` for the readiness evaluator tests and `npm run check:hosting` for read-only live checks. The live command sends HTTPS HEAD requests and public GET requests only. It reads no credentials, changes no service, sends no mail, and never disables TLS validation. Exit status 1 means direct delivery still has a blocker, not that the public proxied site is necessarily down.

The command inspects public A/AAAA answers, tests the four GitHub IPv4 endpoints, checks important routes and homepage assets, verifies a path/query-preserving `www` redirect, and reports certificate lifetime. Certificates with fewer than seven days remaining fail the readiness gate. Public contact readiness and demo responses are reported separately and do not establish their availability abroad.

Before accepting the transition, also verify:

- GitHub's authenticated API no longer reports a broken certificate issuance state.
- Root and `www` HTTPS work without warnings; HTTP redirects correctly; IPv6 connectivity works from an IPv6-enabled network.
- Browser navigation, contact failure fallback, downloaded files, CSS, JavaScript, images, sitemap, and robots responses remain correct.
- Remote network tests cover the previously affected Spanish consumer networks and at least one other region. A local check cannot establish global availability.
- Any authorized end-to-end contact test confirms recipient delivery separately from an HTTP response. No test inquiry is part of this preparation.

## Services that remain on Cloudflare

| Service | Location | Consequence |
| --- | --- | --- |
| Contact submissions | `aniloom-contact.aniloom.workers.dev` | Independent of the website's proxy setting. Prior Spanish probes showed timeouts or an ISP blocking page; direct website delivery does not fix this. |
| Contact spam verification | `challenges.cloudflare.com` | Turnstile supports websites without Cloudflare CDN, but its reachability still needs regional testing. |
| Playable demos | `magic-thai-ad-a1`, `magic-thai-ad-b1`, `magic-thai-ad-c1` under `aniloom.workers.dev` | Separate Worker hosting remains unchanged and may be affected by IP blocking. |
| AniShot private report service | Separate Worker deployment | Not migrated or reconfigured by website DNS changes. |
| Email delivery | Resend sender under `notify.aniloom.tech`, recipient `support@aniloom.tech` | Keep its authentication records and existing mailbox routing unchanged. |

Keep the existing direct email option available. Reliable form and demo access in blocked networks requires a separate hosting or delivery decision, not merely a new hostname on Cloudflare.

## Rollback

Restore the saved origin records and proxy state for `@` and `www` only. If only proxy state changed and origins already matched the target, switching those rows back to **Proxied** is sufficient. Do not restore public Cloudflare IP answers as origin content, change mail records, remove the GitHub custom domain, or disable Universal SSL.

After DNS propagation, verify Cloudflare HTTPS, expected redirects, cache behavior, and normal navigation. Keep direct GitHub HTTPS valid even while Cloudflare is enabled: encryption modes that validate the origin certificate need it, and future rollback to direct delivery depends on it. Switching the website proxy does not require moving the separate contact backend back and forth.

## Hosting limits

GitHub Pages limits include a 1 GB published site and a soft 100 GB monthly bandwidth limit. Its terms restrict use as free hosting for online businesses, commercial transactions, and SaaS. The site's marketing role does not constitute a GitHub approval of its use; keep this restriction in the long-term hosting decision. A Cloudflare proxy does not remove the underlying GitHub terms.

## References

- [GitHub custom domains and DNS targets](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [GitHub HTTPS and certificate provisioning](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)
- [GitHub custom domain troubleshooting](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/troubleshooting-custom-domains-and-github-pages)
- [GitHub Pages REST API](https://docs.github.com/en/rest/pages/pages)
- [GitHub domain verification](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages)
- [Cloudflare proxy status and TTL](https://developers.cloudflare.com/dns/proxy-status/)
- [Turnstile without Cloudflare CDN](https://developers.cloudflare.com/turnstile/)
- [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
