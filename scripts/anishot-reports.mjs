import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { root, endpoint, loadConfiguration } from './anishot-reports-config.mjs';
const { env } = loadConfiguration();
const [command, id] = process.argv.slice(2);
if (!['list', 'get', 'delete'].includes(command) || (command !== 'list' && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || ''))) throw new Error('Usage: node scripts/anishot-reports.mjs list | get REPORT-ID | delete REPORT-ID');
if (!env.ADMIN_TOKEN) throw new Error('Restore the ignored .env.anishot-reports.local operator configuration.');
const response = await fetch(`${endpoint}/admin/reports${command === 'list' ? '' : `/${id}`}`, {
  method: command === 'delete' ? 'DELETE' : 'GET', headers: { Authorization: `Bearer ${env.ADMIN_TOKEN}` }, signal: AbortSignal.timeout(20_000) });
if (!response.ok) throw new Error(`Report service returned ${response.status}.`);
const data = await response.json();
if (command === 'get') {
  const directory = resolve(root, '.local-artifacts/anishot-reports'); mkdirSync(directory, { recursive: true, mode: 0o700 });
  const path = resolve(directory, `${id.toLowerCase()}.json`);
  writeFileSync(path, JSON.stringify(data, null, 2), { mode: 0o600 }); console.log(`Saved private report: ${path}`);
} else console.log(JSON.stringify(data, null, 2));
