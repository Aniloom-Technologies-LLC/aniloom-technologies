import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
export const root = resolve(import.meta.dirname, '..');
export const local = resolve(root, '.env.anishot-reports.local');
export const endpoint = 'https://anishot-reports.aniloom.workers.dev';
export function loadConfiguration() {
  if (existsSync(local)) process.loadEnvFile(local);
  const playableRoot = resolve(root, '../playable-ads');
  const cloudflareLocal = resolve(playableRoot, '.env.cloudflare.local');
  if (existsSync(cloudflareLocal)) process.loadEnvFile(cloudflareLocal);
  const configPath = resolve(playableRoot, 'cloudflare-deploy.json');
  const config = existsSync(configPath) ? JSON.parse(readFileSync(configPath, 'utf8')) : {};
  return { env: { ...process.env, CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID || config.accountId },
    wrangler: process.env.WRANGLER_BIN || resolve(playableRoot, 'node_modules/.bin/wrangler') };
}
