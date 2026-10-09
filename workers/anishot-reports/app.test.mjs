import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { InboxController, handleRequest, validate } from './app.mjs';
export function fixture(extra = {}) {
  return { schema: 2, reportID: randomUUID(), installationID: randomUUID(), createdAt: new Date().toISOString(), comment: '',
    environment: { version: '0.17.0', macOS: '14.0.0', architecture: 'arm64', translated: false, screenAccess: true, displayCount: 1,
      panelPercent: 100, reduceRetina: true, saveFormat: 'png', journalEnabled: true, journalWriteFailed: false },
    events: [{ date: new Date().toISOString(), launch: randomUUID(), version: '0.17.0', action: 'captureRequested', details: { source: 'hotkey' } }],
    counts: { captureRequested: 1 }, ...extra };
}
class Storage {
  db = new DatabaseSync(':memory:'); alarmAt = null;
  sql = { exec: (query, ...params) => {
    const statement = this.db.prepare(query); const rows = statement.all(...params);
    return { toArray: () => rows };
  } };
  transactionSync(fn) { this.db.exec('BEGIN'); try { const result = fn(); this.db.exec('COMMIT'); return result; } catch (e) { this.db.exec('ROLLBACK'); throw e; } }
  async getAlarm() { return this.alarmAt; }
  async setAlarm(time) { this.alarmAt = time; }
}
function setup() {
  let time = Date.now(); const storage = new Storage(); const inbox = new InboxController(storage, () => time);
  const env = { ADMIN_TOKEN: 'operator-fixture', HASH_SECRET: 'hash-fixture', REPORT_INBOX: { idFromName: () => 'inbox', get: () => ({ fetch: request => inbox.fetch(request) }) } };
  const req = (data, extra = {}) => new Request('https://worker/v1/reports', { method: 'POST', headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '192.0.2.1', ...extra }, body: JSON.stringify(data) });
  return { env, storage, inbox, req, advance: ms => { time += ms; } };
}
test('strict typed reports allow empty comments and exclude raw or identifying fields', () => {
  assert.ok(validate(fixture())); assert.ok(validate(fixture({ comment: 'Optional note' })));
  for (const change of [{ email: 'user@example.com' }, { schema: 1 }, { installationID: 'machine-serial' }, { screenshot: 'pixels' }, { comment: 'x'.repeat(5001) }, { events: [], counts: { captureRequested: 1 } }]) assert.equal(validate(fixture(change)), null);
  const value = fixture(); value.events[0].details.text = 'private text'; assert.equal(validate(value), null);
  delete value.events[0].details.text; value.environment.computerName = 'private'; assert.equal(validate(value), null);
});
test('stores exactly once, private retrieval, deletion and conflicting retries', async () => {
  const s = setup(); const data = fixture();
  let response = await handleRequest(s.req(data), s.env); assert.equal(response.status, 201); assert.equal((await response.json()).reportID, data.reportID);
  response = await handleRequest(s.req(data), s.env); assert.equal(response.status, 200);
  assert.equal(s.storage.sql.exec('SELECT count(*) AS n FROM reports').toArray()[0].n, 1);
  const url = `https://worker/admin/reports/${data.reportID}`;
  assert.equal((await handleRequest(new Request(url), s.env)).status, 401);
  response = await handleRequest(new Request(url, { headers: { Authorization: 'Bearer operator-fixture' } }), s.env);
  assert.deepEqual(await response.json(), data);
  assert.equal((await handleRequest(s.req({ ...data, comment: 'different' }), s.env)).status, 409);
  assert.equal((await handleRequest(new Request(url, { method: 'DELETE', headers: { Authorization: 'Bearer operator-fixture' } }), s.env)).status, 200);
});
test('invalid attempts consume rate budget and body streaming is bounded', async () => {
  const s = setup();
  for (let i = 0; i < 5; i++) assert.equal((await handleRequest(s.req({ invalid: true }), s.env)).status, 400);
  assert.equal((await handleRequest(s.req(fixture()), s.env)).status, 429);
  s.advance(600_001);
  assert.equal((await handleRequest(new Request('https://worker/v1/reports', { method: 'POST', headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '192.0.2.1' }, body: 'x'.repeat(1_048_577) }), s.env)).status, 413);
  assert.equal((await handleRequest(s.req(fixture(), { Origin: 'https://unexpected.example' }), s.env)).status, 400);
  assert.equal((await handleRequest(s.req(fixture()), { ...s.env, ADMIN_TOKEN: '' })).status, 503);
});
test('per-installation quotas and retention use server time, including clean alarms', async () => {
  const s = setup(); const installationID = randomUUID();
  for (let i = 0; i < 3; i++) assert.equal((await handleRequest(s.req(fixture({ installationID })), s.env)).status, 201);
  assert.equal((await handleRequest(s.req(fixture({ installationID })), s.env)).status, 429);
  s.advance(30 * 86_400_000 + 1); await s.inbox.alarm();
  assert.equal(s.storage.sql.exec('SELECT count(*) AS n FROM reports').toArray()[0].n, 0);
  assert.equal(s.storage.sql.exec('SELECT count(*) AS n FROM limits').toArray()[0].n, 0);
});
test('storage errors cannot acknowledge an unsaved report', async () => {
  const s = setup(); s.env.REPORT_INBOX.get = () => ({ fetch: () => { throw new Error('private infrastructure detail'); } });
  const response = await handleRequest(s.req(fixture()), s.env); assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { code: 'unavailable' });
});
test('the inbox retains only the latest 100 reports and enforces the daily ceiling', async () => {
  const s = setup();
  const store = async data => s.inbox.fetch(new Request('https://inbox/store', { method: 'POST', body: JSON.stringify(data) }));
  const first = fixture(); assert.equal((await store(first)).status, 201);
  for (let i = 1; i < 100; i++) { s.advance(1); assert.equal((await store(fixture())).status, 201); }
  assert.equal((await store(fixture())).status, 429);
  s.advance(86_400_001); assert.equal((await store(fixture())).status, 201);
  assert.equal(s.storage.sql.exec('SELECT count(*) AS n FROM reports').toArray()[0].n, 100);
  assert.equal(s.storage.sql.exec('SELECT id FROM reports WHERE id = ?', first.reportID).toArray().length, 0);
  const response = await handleRequest(new Request('https://worker/admin/invalid/' + randomUUID(), { headers: { Authorization: 'Bearer operator-fixture' } }), s.env);
  assert.equal(response.status, 404);
});
