import { existsSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { endpoint, root, local, loadConfiguration } from './anishot-reports-config.mjs';
const { env, wrangler } = loadConfiguration();
const dryRun = process.argv.includes('--dry-run');
function run(args, input) {
  const result = spawnSync(wrangler, ['--config', 'workers/anishot-reports/wrangler.jsonc', ...args], {
    cwd: root, env, input, encoding: 'utf8', stdio: input === undefined ? 'inherit' : ['pipe', 'ignore', 'pipe'] });
  if (result.status !== 0) throw new Error(`Cloudflare command failed (${args[0]}). Check account permissions; secrets are not printed.`);
}
if (dryRun) { run(['deploy', '--dry-run']); } else {
  if (!env.CLOUDFLARE_ACCOUNT_ID || !env.CLOUDFLARE_API_TOKEN) throw new Error('Missing Cloudflare account configuration.');
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/workers/scripts/anishot-reports/secrets`, { headers: { Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}` } });
  const listing = await response.json();
  const absent = response.status === 404 || listing.errors?.some(e => e.code === 10007);
  if (!response.ok && !absent) throw new Error('Cannot inspect Worker secret names safely.');
  const names = new Set(Array.isArray(listing.result) ? listing.result.map(s => s.name) : []);
  // Never silently rotate credentials of an existing private inbox.
  if (names.has('ADMIN_TOKEN') && !env.ADMIN_TOKEN) throw new Error('Restore the private operator configuration before deploying.');
  if (!existsSync(local)) {
    if (names.has('ADMIN_TOKEN') || names.has('HASH_SECRET')) throw new Error('Existing inbox detected. Restore its ignored operator configuration.');
    env.ADMIN_TOKEN ||= randomBytes(32).toString('hex'); env.HASH_SECRET ||= randomBytes(32).toString('hex');
    writeFileSync(local, `ADMIN_TOKEN=${env.ADMIN_TOKEN}\nHASH_SECRET=${env.HASH_SECRET}\n`, { flag: 'wx', mode: 0o600 });
  }
  for (const key of ['ADMIN_TOKEN', 'HASH_SECRET']) if (!names.has(key) && !env[key]) throw new Error(`Missing private ${key} configuration.`);
  run(['deploy']);
  for (const key of ['ADMIN_TOKEN', 'HASH_SECRET']) if (!names.has(key)) run(['secret', 'put', key], env[key]);
  let ready = false;
  for (let attempt = 0; attempt < 20; attempt++) {
    const reply = await fetch(`${endpoint}/health`, { signal: AbortSignal.timeout(10_000) }).catch(() => null);
    if (reply?.ok && (await reply.json()).ready === true) { ready = true; break; }
    await new Promise(resolve => setTimeout(resolve, 3_000));
  }
  if (!ready) throw new Error('Worker deployed but readiness was not confirmed.');
  console.log('AniShot private report service ready. Run the synthetic smoke check before shipping the app.');
}
