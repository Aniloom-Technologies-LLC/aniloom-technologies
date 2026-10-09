import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { endpoint, loadConfiguration } from './anishot-reports-config.mjs';
const { env } = loadConfiguration();
if (!env.ADMIN_TOKEN) throw new Error('Missing private operator configuration.');
// Synthetic only: never reads the native app journal, preferences, crash files or user identity.
const data = { schema: 2, reportID: randomUUID(), installationID: randomUUID(), createdAt: new Date().toISOString(), comment: 'Synthetic service verification',
  environment: { version: '0.17.0', macOS: '14.0.0', architecture: 'arm64', translated: false, screenAccess: true, displayCount: 1,
    panelPercent: 100, reduceRetina: true, saveFormat: 'png', journalEnabled: true, journalWriteFailed: false }, events: [], counts: {} };
const headers = { Authorization: `Bearer ${env.ADMIN_TOKEN}` };
const url = `${endpoint}/admin/reports/${data.reportID}`;
let saved = false;
try {
  for (const status of [201, 200]) {
    const response = await fetch(`${endpoint}/v1/reports`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), signal: AbortSignal.timeout(20_000) });
    assert.equal(response.status, status); saved = true;
    assert.deepEqual(await response.json(), { accepted: true, reportID: data.reportID });
  }
  assert.equal((await fetch(url)).status, 401);
  const response = await fetch(url, { headers }); assert.equal(response.status, 200); assert.deepEqual(await response.json(), data);
} finally {
  if (saved) { const response = await fetch(url, { method: 'DELETE', headers }); assert.equal(response.status, 200); }
}
assert.equal((await fetch(url, { headers })).status, 404);
console.log('Synthetic live check passed: save, idempotent retry, private retrieval and deletion. No real user logs uploaded.');
