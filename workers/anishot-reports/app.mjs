const MAX_BYTES = 1_048_576;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const actions = new Set('launch previousLaunchUnfinished quit displaysChanged captureRequested captureBusy permissionMissing captureReady captureFailed captureError capturePhase captureClosed selectionCreated selectionMoved selectionResized selectionCleared toolSelected layerSelected layerCreated layerEdited layerMoved layerResized layerDeleted layerReordered textEditingStarted textCommitted textCancelled sizeChanged colorChanged undo redo copyRequested copySucceeded copyFailed saveRequested saveSucceeded saveCancelled saveFailed shareRequested shareSucceeded shareCancelled shortcutChanged shortcutFailed permissionRequested'.split(' '));
const phases = new Set('hotkey_handler_entered shortcut_validation permission_check capture_task_started capture_method_direct_rect capture_method_filtered_parallel capture_metadata_cached capture_metadata_preparation display_image_available all_images_available overlay_draw_started overlay_first_draw overlay_window_prepared all_overlay_windows_prepared application_activation_requested selection_input_configured overlay_display_submitted all_overlay_displays_submitted application_active_confirmed overlay_key_confirmed canvas_focus_confirmed selection_input_ready overlay_event_loop_resumed'.split(' '));
const object = x => x !== null && typeof x === 'object' && !Array.isArray(x);
const keys = (x, allowed) => object(x) && Object.keys(x).every(k => allowed.includes(k));
const integer = (x, low, high) => Number.isSafeInteger(x) && x >= low && x <= high;
const date = x => typeof x === 'string' && x.length <= 35 && /^\d{4}-\d{2}-\d{2}T/.test(x) && Number.isFinite(Date.parse(x));
const version = x => typeof x === 'string' && (x === 'development' || /^\d{1,4}(\.\d{1,4}){1,3}$/.test(x));
const optional = (x, key, check) => !(key in x) || check(x[key]);
const json = (body, status = 200, extra = {}) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...extra } });

function details(x) {
  const limits = { tool: [0, 9], size: [1, 99], layers: [0, 100_000], width: [0, 100_000], height: [0, 100_000], displays: [0, 64], displayIndex: [0, 63], errorCode: [-Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER] };
  if (!keys(x, [...Object.keys(limits), 'durationMS', 'offsetMS', 'phase', 'source', 'errorKind'])) return false;
  for (const [key, [low, high]] of Object.entries(limits)) if (!optional(x, key, v => integer(v, low, high))) return false;
  return ['durationMS', 'offsetMS'].every(key => optional(x, key, v => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 86_400_000)) &&
    optional(x, 'phase', v => phases.has(v)) && optional(x, 'source', v => ['hotkey', 'menuBar', 'preview', 'other'].includes(v)) &&
    optional(x, 'errorKind', v => ['capture', 'encoding', 'cocoa', 'screenCaptureKit', 'hotkey', 'other'].includes(v));
}
export function validate(x) {
  if (!keys(x, ['schema', 'reportID', 'installationID', 'createdAt', 'comment', 'environment', 'events', 'counts']) || x.schema !== 2 ||
      !UUID.test(x.reportID) || !UUID.test(x.installationID) || !date(x.createdAt) || typeof x.comment !== 'string' ||
      Array.from(x.comment).length > 5_000 || new TextEncoder().encode(x.comment).byteLength > 20_000) return null;
  const e = x.environment;
  if (!keys(e, ['version', 'macOS', 'architecture', 'hardwareModel', 'translated', 'screenAccess', 'displayCount', 'panelPercent', 'reduceRetina', 'saveFormat', 'journalEnabled', 'journalWriteFailed']) ||
      !version(e.version) || !version(e.macOS) || !['arm64', 'x86_64'].includes(e.architecture) ||
      !optional(e, 'hardwareModel', v => typeof v === 'string' && /^[A-Za-z0-9,]{1,64}$/.test(v)) ||
      !['translated', 'screenAccess', 'reduceRetina', 'journalEnabled', 'journalWriteFailed'].every(k => typeof e[k] === 'boolean') ||
      !integer(e.displayCount, 0, 64) || !integer(e.panelPercent, 50, 150) || !['png', 'jpg'].includes(e.saveFormat)) return null;
  if (!Array.isArray(x.events) || x.events.length > 2_000) return null;
  const counts = {};
  for (const event of x.events) {
    if (!keys(event, ['date', 'launch', 'version', 'action', 'details']) || !date(event.date) || !UUID.test(event.launch) ||
        !version(event.version) || !actions.has(event.action) || !details(event.details)) return null;
    counts[event.action] = (counts[event.action] || 0) + 1;
  }
  if (!object(x.counts) || Object.keys(x.counts).length !== Object.keys(counts).length ||
      !Object.keys(x.counts).every(k => actions.has(k) && x.counts[k] === counts[k])) return null;
  return { ...x, reportID: x.reportID.toLowerCase(), installationID: x.installationID.toLowerCase() };
}
async function limitedBody(request) {
  if (Number(request.headers.get('Content-Length')) > MAX_BYTES) throw new Error('size');
  const reader = request.body?.getReader(); if (!reader) throw new Error('body');
  const pieces = []; let size = 0;
  while (true) {
    const { value, done } = await reader.read(); if (done) break;
    size += value.length; if (size > MAX_BYTES) { await reader.cancel(); throw new Error('size'); }
    pieces.push(value);
  }
  const data = new Uint8Array(size); let offset = 0;
  for (const piece of pieces) { data.set(piece, offset); offset += piece.length; }
  return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(data));
}
async function hashIP(ip, secret) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const bytes = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(ip)));
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}
export async function handleRequest(request, env) {
  const url = new URL(request.url);
  const ready = Boolean(env.REPORT_INBOX && env.HASH_SECRET && env.ADMIN_TOKEN);
  if (url.pathname === '/health' && request.method === 'GET') return json({ ready, schema: 2 }, ready ? 200 : 503);
  if (!ready) return json({ code: 'unavailable' }, 503);
  const inbox = env.REPORT_INBOX.get(env.REPORT_INBOX.idFromName('private-inbox-v1'));
  try {
    if (url.pathname.startsWith('/admin/')) {
      if (request.headers.get('Authorization') !== `Bearer ${env.ADMIN_TOKEN}`) return json({ code: 'unauthorized' }, 401);
      if (!['GET', 'DELETE'].includes(request.method)) return json({ code: 'method' }, 405);
      const suffix = url.pathname.slice('/admin/reports'.length);
      if (!['/admin/reports', '/admin/reports/'].includes(url.pathname) && !(url.pathname.startsWith('/admin/reports/') && UUID.test(suffix.slice(1)))) return json({ code: 'not_found' }, 404);
      return inbox.fetch(new Request(`https://inbox${url.pathname}`, { method: request.method }));
    }
    if (url.pathname !== '/v1/reports' || request.method !== 'POST') return json({ code: 'not_found' }, 404);
    // Browser origins and cookies are not an authentication mechanism for this native API.
    if (request.headers.has('Origin') || request.headers.has('Content-Encoding') ||
        !/^application\/json(?:;|$)/i.test(request.headers.get('Content-Type') || '')) return json({ code: 'invalid' }, 400);
    const ip = request.headers.get('CF-Connecting-IP'); if (!ip) return json({ code: 'unavailable' }, 503);
    const attempt = await inbox.fetch(new Request('https://inbox/attempt', { method: 'POST', body: JSON.stringify({ key: await hashIP(ip, env.HASH_SECRET) }) }));
    if (!attempt.ok) return attempt;
    let value;
    try { value = validate(await limitedBody(request)); } catch (error) { return json({ code: error.message === 'size' ? 'size' : 'invalid' }, error.message === 'size' ? 413 : 400); }
    if (!value) return json({ code: 'invalid' }, 400);
    return inbox.fetch(new Request('https://inbox/store', { method: 'POST', body: JSON.stringify(value) }));
  } catch { return json({ code: 'unavailable' }, 503); } // Never log request bodies, IPs or secrets.
}

export class InboxController {
  constructor(storage, now = () => Date.now()) {
    this.storage = storage; this.now = now; this.sql = storage.sql;
    this.sql.exec('CREATE TABLE IF NOT EXISTS reports (id TEXT PRIMARY KEY, installation TEXT NOT NULL, created INTEGER NOT NULL, bytes INTEGER NOT NULL, payload TEXT NOT NULL)');
    this.sql.exec('CREATE TABLE IF NOT EXISTS limits (key TEXT PRIMARY KEY, until INTEGER NOT NULL, count INTEGER NOT NULL)');
  }
  prune() {
    const now = this.now();
    this.sql.exec('DELETE FROM reports WHERE created < ?', now - 30 * 86_400_000);
    this.sql.exec('DELETE FROM limits WHERE until <= ?', now);
  }
  limit(key, maximum, duration) {
    const row = this.sql.exec('SELECT count, until FROM limits WHERE key = ?', key).toArray()[0];
    if (row && row.until > this.now() && row.count >= maximum) return Math.max(1, Math.ceil((row.until - this.now()) / 1000));
    const count = row && row.until > this.now() ? row.count + 1 : 1;
    const until = row && row.until > this.now() ? row.until : this.now() + duration;
    this.sql.exec('INSERT OR REPLACE INTO limits (key, until, count) VALUES (?, ?, ?)', key, until, count);
    return 0;
  }
  async fetch(request) {
    const url = new URL(request.url); this.prune();
    if (url.pathname.startsWith('/admin/reports')) {
      const id = url.pathname.split('/')[3];
      if (!id && request.method === 'GET') return json({ reports: this.sql.exec('SELECT id, created, bytes FROM reports ORDER BY created DESC LIMIT 100').toArray() });
      if (!UUID.test(id || '')) return json({ code: 'not_found' }, 404);
      if (request.method === 'DELETE') { this.sql.exec('DELETE FROM reports WHERE id = ?', id.toLowerCase()); return json({ deleted: true }); }
      const row = this.sql.exec('SELECT payload FROM reports WHERE id = ?', id.toLowerCase()).toArray()[0];
      return row ? new Response(row.payload, { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }) : json({ code: 'not_found' }, 404);
    }
    const data = await request.json(); let result;
    this.storage.transactionSync(() => {
      if (url.pathname === '/attempt') {
        if (!/^[0-9a-f]{64}$/.test(data.key || '')) { result = json({ code: 'invalid' }, 400); return; }
        // Bound both accepted submissions and malformed/abusive traffic.
        const global = this.limit('global-attempts', 1_000, 86_400_000);
        const local = global ? 0 : this.limit(`ip:${data.key}`, 5, 600_000);
        const retry = global || local;
        result = retry ? json({ code: 'rate_limit' }, 429, { 'Retry-After': String(retry) }) : json({ allowed: true });
        return;
      }
      if (url.pathname !== '/store') { result = json({ code: 'not_found' }, 404); return; }
      const value = validate(data); if (!value) { result = json({ code: 'invalid' }, 400); return; }
      const payload = JSON.stringify(value);
      const previous = this.sql.exec('SELECT payload FROM reports WHERE id = ?', value.reportID).toArray()[0];
      if (previous) {
        result = previous.payload === payload ? json({ accepted: true, reportID: value.reportID }) : json({ code: 'conflict' }, 409); return;
      }
      const daily = this.sql.exec('SELECT count(*) AS n FROM reports WHERE created >= ?', this.now() - 86_400_000).toArray()[0].n;
      const hourly = this.sql.exec('SELECT count(*) AS n FROM reports WHERE installation = ? AND created >= ?', value.installationID, this.now() - 3_600_000).toArray()[0].n;
      if (daily >= 100 || hourly >= 3) { result = json({ code: 'rate_limit' }, 429, { 'Retry-After': '3600' }); return; }
      this.sql.exec('INSERT INTO reports (id, installation, created, bytes, payload) VALUES (?, ?, ?, ?, ?)', value.reportID, value.installationID, this.now(), new TextEncoder().encode(payload).byteLength, payload);
      this.sql.exec('DELETE FROM reports WHERE id NOT IN (SELECT id FROM reports ORDER BY created DESC, rowid DESC LIMIT 100)');
      result = json({ accepted: true, reportID: value.reportID }, 201);
    });
    if (await this.storage.getAlarm() === null) await this.storage.setAlarm(this.now() + 3_600_000);
    return result;
  }
  async alarm() {
    this.prune();
    const rows = this.sql.exec('SELECT (SELECT count(*) FROM reports) + (SELECT count(*) FROM limits) AS n').toArray()[0].n;
    if (rows) await this.storage.setAlarm(this.now() + 3_600_000);
  }
}
