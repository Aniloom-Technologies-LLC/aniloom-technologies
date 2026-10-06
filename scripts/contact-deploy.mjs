import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { randomBytes } from "node:crypto";
import { waitForContactReady } from "./contact-readiness.mjs";

const root = resolve(import.meta.dirname, "..");
const local = resolve(root, ".env.contact.local");
const playableRoot = resolve(root, "../playable-ads");
if (existsSync(local)) process.loadEnvFile(local);
if (existsSync(resolve(playableRoot, ".env.cloudflare.local"))) process.loadEnvFile(resolve(playableRoot, ".env.cloudflare.local"));
const accountConfig = resolve(playableRoot, "cloudflare-deploy.json");
const config = existsSync(accountConfig) ? JSON.parse(readFileSync(accountConfig, "utf8")) : {};
const env = { ...process.env, CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID || config.accountId };
const wrangler = process.env.WRANGLER_BIN || resolve(playableRoot, "node_modules/.bin/wrangler");
const dryRun = process.argv.includes("--dry-run");
const required = ["CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID", "PUBLIC_TURNSTILE_SITE_KEY", "TURNSTILE_SECRET_KEY", "RESEND_API_KEY", "CONTACT_FROM_EMAIL"];
const missing = required.filter(k => !env[k]);
if (!dryRun && missing.length) throw new Error(`Missing configuration: ${missing.join(", ")}. Use the ignored .env.contact.local.`);
if (!dryRun && [env.PUBLIC_TURNSTILE_SITE_KEY, env.TURNSTILE_SECRET_KEY].some(key => /^(1x|2x|3x)/.test(key))) throw new Error("Refusing to deploy a Turnstile test key.");
if (!dryRun && !/^[^\r\n]+@[^\s<>]+\.[^\s<>]+>?$/.test(env.CONTACT_FROM_EMAIL)) throw new Error("CONTACT_FROM_EMAIL must be a verified sending address.");
function run(args, input) {
  const result = spawnSync(wrangler, ["--config", "workers/contact/wrangler.jsonc", ...args], { cwd: root, env, input, encoding: "utf8", stdio: input === undefined ? "inherit" : ["pipe", "ignore", "pipe"] });
  if (result.status !== 0) throw new Error(`Cloudflare command failed (${args[0]}). Check permissions; no secrets are printed.`);
}
if (dryRun) { run(["deploy", "--dry-run"]); } else {
  // Existing stored hash secret is preserved to keep idempotency stable between deployments.
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/workers/scripts/aniloom-contact/secrets`, { headers: { Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}` } });
  const listing = await response.json();
  if (!response.ok && response.status !== 404 && !listing.errors?.some(e => e.code === 10007)) throw new Error("Cannot inspect Worker secret names safely.");
  const hasHash = Array.isArray(listing.result) && listing.result.some(s => s.name === "HASH_SECRET");
  run(["deploy"]);
  for (const [key, value] of Object.entries({ CONTACT_SITE_KEY: env.PUBLIC_TURNSTILE_SITE_KEY, TURNSTILE_SECRET_KEY: env.TURNSTILE_SECRET_KEY, RESEND_API_KEY: env.RESEND_API_KEY, CONTACT_FROM_EMAIL: env.CONTACT_FROM_EMAIL, ...(!hasHash ? { HASH_SECRET: env.HASH_SECRET || randomBytes(32).toString("hex") } : {}) })) run(["secret", "put", key], value);
  if (!await waitForContactReady("https://aniloom-contact.aniloom.workers.dev/config", env.PUBLIC_TURNSTILE_SITE_KEY)) throw new Error("Worker deployed but not ready. Do not publish the website yet.");
  console.log("Contact Worker ready. Complete an end-to-end inbox check before publishing the website.");
}
