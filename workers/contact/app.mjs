const MAX_BYTES = 32768;
const DAY = 86400000;
const WINDOW = 600000;
const ALLOWED_FIELDS = new Set(["email", "project", "topic", "website", "token"]);
const json = (body, status = 200, headers = {}) => Response.json(body, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...headers } });
const origins = (env) => (env.ALLOWED_ORIGINS || "https://aniloom.tech,https://www.aniloom.tech").split(",").map(s => s.trim());
const configured = (env) => Boolean(env.CONTACT_GATE && env.TURNSTILE_SECRET_KEY && env.CONTACT_SITE_KEY && env.RESEND_API_KEY && env.CONTACT_FROM_EMAIL && env.HASH_SECRET) && ![env.CONTACT_SITE_KEY, env.TURNSTILE_SECRET_KEY].some(key => /^(1x|2x|3x)/.test(key));

async function hash(value, secret) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const bytes = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, "0")).join("");
}

async function readBoundedJson(request) {
  if (!request.headers.get("Content-Type")?.startsWith("application/json")) throw new Error("format");
  if (Number(request.headers.get("Content-Length")) > MAX_BYTES) throw new Error("size");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("format");
  const chunks = [];
  let length = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > MAX_BYTES) { await reader.cancel(); throw new Error("size"); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
}

export function validate(body) {
  if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).some(k => !ALLOWED_FIELDS.has(k))) return null;
  if (![body.email, body.project, body.token].every(v => typeof v === "string")) return null;
  if ([body.topic, body.website].some(v => v !== undefined && typeof v !== "string")) return null;
  const email = body.email.trim();
  const project = body.project.trim();
  const topic = (body.topic || "").trim();
  // Validate format, not mailbox ownership. Do not reject disposable or personal email providers.
  if (email.length > 254 || !/^[^\s@<>\x00-\x1f]+@[^\s@<>\x00-\x1f]+\.[^\s@<>\x00-\x1f]+$/.test(email)) return null;
  if (!project || project.length > 5000 || /[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(project)) return null;
  if (topic.length > 160 || /[\x00-\x1f]/.test(topic) || !body.token || body.token.length > 2048) return null;
  return { email, project, topic, token: body.token, website: body.website || "" };
}

export async function handleRequest(request, env, fetcher = fetch) {
  const origin = request.headers.get("Origin");
  if (!origin || !origins(env).includes(origin)) return json({ code: "origin" }, 403);
  const cors = { "Access-Control-Allow-Origin": origin, "Vary": "Origin", "Access-Control-Expose-Headers": "Retry-After" };
  const respond = (body, status = 200, extra = {}) => json(body, status, { ...cors, ...extra });
  const path = new URL(request.url).pathname;
  if (!["/contact", "/config"].includes(path)) return respond({ code: "not_found" }, 404);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { ...cors, "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "600" } });
  if (path === "/config" && request.method === "GET") return respond({ ready: configured(env), siteKey: configured(env) ? env.CONTACT_SITE_KEY : null });
  if (path !== "/contact" || request.method !== "POST") return respond({ code: "method" }, 405, { Allow: path === "/config" ? "GET" : "POST" });
  if (!configured(env)) return respond({ code: "unavailable" }, 503);
  // Only Cloudflare's trusted connecting address is accepted, never a client-supplied forwarding header.
  const ip = request.headers.get("CF-Connecting-IP");
  if (!ip) return respond({ code: "unavailable" }, 503);
  try {
    const gate = env.CONTACT_GATE.get(env.CONTACT_GATE.idFromName("contact-v1"));
    const gateCall = async (action, data) => {
      const response = await gate.fetch(`https://gate/${action}`, { method: "POST", body: JSON.stringify(data) });
      if (!response.ok) throw new Error("gate");
      return response.json();
    };
    // Account-wide storage makes the quota consistent across Worker locations and restarts.
    const ipKey = await hash(`ip:${ip}`, env.HASH_SECRET);
    const attempt = await gateCall("attempt", { ipKey });
    if (!attempt.allowed) return respond({ code: "rate_limit" }, 429, { "Retry-After": String(attempt.retryAfter) });
    let body;
    try { body = await readBoundedJson(request); } catch (error) { return respond({ code: error.message === "size" ? "size" : "invalid" }, error.message === "size" ? 413 : 400); }
    const data = validate(body);
    if (!data) return respond({ code: "invalid" }, 400);
    // Do not report success for a rejected request, including honeypot submissions.
    if (data.website) return respond({ code: "invalid" }, 400);
    const verificationResponse = await fetcher("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST", headers: { "Content-Type": "application/json" }, signal: AbortSignal.timeout(8000),
      body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: data.token, remoteip: ip }),
    });
    if (!verificationResponse.ok) return respond({ code: "verification" }, 400);
    const verification = await verificationResponse.json();
    if (verification.success !== true || verification.action !== "contact" || !origins(env).some(o => new URL(o).hostname === verification.hostname)) return respond({ code: "verification" }, 400);
    // Stable content-derived idempotency prevents duplicates even after a browser timeout or reload.
    const submissionKey = await hash(JSON.stringify([data.email, data.project, data.topic]), env.HASH_SECRET);
    const reservation = await gateCall("reserve", { submissionKey });
    if (reservation.sent) return respond({ accepted: true });
    if (!reservation.allowed) return respond({ code: "rate_limit" }, 429, { "Retry-After": String(reservation.retryAfter) });
    let accepted = false;
    try {
      const response = await fetcher("https://api.resend.com/emails", {
        method: "POST", signal: AbortSignal.timeout(10000),
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": `contact/${submissionKey}` },
        body: JSON.stringify({
          from: env.CONTACT_FROM_EMAIL,
          to: ["support@aniloom.tech"],
          reply_to: data.email,
          subject: data.topic ? `Aniloom inquiry: ${data.topic}` : "Aniloom project inquiry",
          // Plain text prevents user content being interpreted as HTML. Recipient and sender are fixed.
          text: [`Reply email: ${data.email}`, ...(data.topic ? [`Package: ${data.topic}`] : []), "", data.project].join("\n"),
        }),
      });
      const result = await response.json();
      accepted = response.ok && typeof result.id === "string" && result.id.length > 0;
    } catch { /* A retry uses the same provider idempotency key; never claim uncertain delivery. */ }
    await gateCall("complete", { submissionKey, accepted });
    return accepted ? respond({ accepted: true }) : respond({ code: "delivery" }, 502);
  } catch {
    // Fail closed on infrastructure errors. Never log message bodies, email addresses, tokens, or IPs.
    return respond({ code: "unavailable" }, 503);
  }
}

export class GateController {
  constructor(storage, env, now = () => Date.now()) { this.storage = storage; this.env = env; this.now = now; }
  async fetch(request) {
    const data = await request.json();
    const action = new URL(request.url).pathname.slice(1);
    const now = this.now();
    const result = await this.storage.transaction(async storage => {
      if (action === "attempt" && /^[a-f0-9]{64}$/.test(data.ipKey)) {
        const key = `ip:${data.ipKey}`;
        const record = await storage.get(key);
        const times = (record?.times || []).filter(t => t > now - WINDOW);
        if (times.length >= 3) return { allowed: false, retryAfter: Math.max(1, Math.ceil((times[0] + WINDOW - now) / 1000)) };
        times.push(now);
        await storage.put(key, { times, expires: now + WINDOW });
        return { allowed: true };
      }
      if (!["reserve", "complete"].includes(action) || !/^[a-f0-9]{64}$/.test(data.submissionKey)) throw new Error("invalid gate request");
      const key = `submission:${data.submissionKey}`;
      let record = await storage.get(key);
      if (record?.expires <= now) record = null;
      if (action === "complete") {
        if (!record) throw new Error("missing reservation");
        await storage.put(key, { ...record, sent: data.accepted === true, lease: 0 });
        return { saved: true };
      }
      if (record?.sent) return { sent: true };
      if (record?.lease > now) return { allowed: false, retryAfter: Math.ceil((record.lease - now) / 1000) };
      if (!record) {
        const daily = await storage.get("daily");
        const times = (daily?.times || []).filter(t => t > now - DAY);
        const limit = Math.max(1, Number(this.env.DAILY_LIMIT) || 100);
        if (times.length >= limit) return { allowed: false, retryAfter: Math.max(1, Math.ceil((times[0] + DAY - now) / 1000)) };
        times.push(now);
        await storage.put("daily", { times, expires: now + DAY });
        record = { sent: false, expires: now + DAY };
      }
      await storage.put(key, { ...record, lease: now + 60000 });
      return { allowed: true };
    });
    // Remove operational hashes shortly after expiry, including when traffic stops.
    const alarm = await this.storage.getAlarm();
    if (alarm === null) await this.storage.setAlarm(now + WINDOW);
    return json(result);
  }
  async alarm() {
    const now = this.now();
    const entries = await this.storage.list();
    const expired = [...entries].filter(([, value]) => value.expires <= now).map(([key]) => key);
    if (expired.length) await this.storage.delete(expired);
    if (entries.size > expired.length) await this.storage.setAlarm(now + WINDOW);
  }
}
