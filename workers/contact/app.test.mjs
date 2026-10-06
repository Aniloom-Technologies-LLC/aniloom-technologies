import test from "node:test";
import assert from "node:assert/strict";
import { GateController, handleRequest, validate } from "./app.mjs";

class MemoryStorage {
  map = new Map(); alarmAt = null; lock = Promise.resolve();
  async get(key) { return structuredClone(this.map.get(key)); }
  async put(key, value) { this.map.set(key, structuredClone(value)); }
  async list() { return new Map(this.map); }
  async delete(keys) { for (const key of keys) this.map.delete(key); }
  async getAlarm() { return this.alarmAt; }
  async setAlarm(time) { this.alarmAt = time; }
  async transaction(fn) { const previous = this.lock; let release; this.lock = new Promise(r => { release = r; }); await previous; try { return await fn(this); } finally { release(); } }
}

const input = (extra = {}) => ({ email: "customer@example.com", project: "Please review our release candidate.", topic: "Release Confidence Check", website: "", token: "test-token", ...extra });
function setup(extra = {}) {
  let time = 1000000;
  const env = { TURNSTILE_SECRET_KEY: "fixture-secret", CONTACT_SITE_KEY: "fixture-site-key", RESEND_API_KEY: "fixture-resend-key", CONTACT_FROM_EMAIL: "Aniloom <contact@example.com>", HASH_SECRET: "fixture-hash-secret", DAILY_LIMIT: "100", ...extra };
  const storage = new MemoryStorage();
  const gate = new GateController(storage, env, () => time);
  env.CONTACT_GATE = { idFromName: () => "gate", get: () => ({ fetch: (url, init) => gate.fetch(new Request(url, init)) }) };
  let mailCalls = 0;
  const mailHeaders = [];
  const mailPayloads = [];
  let mode = "success";
  let verification = { success: true, hostname: "aniloom.tech", action: "contact" };
  const fetcher = async (url, init) => {
    if (url.includes("siteverify")) return Response.json(verification);
    mailCalls++;
    mailHeaders.push(init.headers);
    mailPayloads.push(JSON.parse(init.body));
    if (mode === "timeout") throw new Error("timeout");
    if (mode === "error") return Response.json({ message: "unavailable" }, { status: 500 });
    if (mode === "missing-id") return Response.json({});
    return Response.json({ id: "fixture-mail-id" });
  };
  const request = (body = input(), { origin = "https://aniloom.tech", ip = "192.0.2.1", method = "POST", path = "/contact", headers = {} } = {}) => new Request(`https://worker${path}`, { method, headers: { Origin: origin, "CF-Connecting-IP": ip, "Content-Type": "application/json", ...headers }, ...(method === "POST" ? { body: typeof body === "string" ? body : JSON.stringify(body) } : {}) });
  return { env, storage, gate, request, fetcher, send: (body, options) => handleRequest(request(body, options), env, fetcher), calls: () => mailCalls, mailHeaders, mailPayloads, mode: v => { mode = v; }, verification: v => { verification = v; }, advance: ms => { time += ms; } };
}

test("server-side field validation and header injection rejection", () => {
  assert.ok(validate(input()));
  for (const bad of [null, [], input({ email: "not-an-email" }), input({ email: "a@b.com\r\nBcc:spam@example.com" }), input({ project: " " }), input({ project: "x".repeat(5001) }), input({ topic: "bad\nsubject" }), input({ token: "" }), input({ extra: "unexpected" })]) assert.equal(validate(bad), null);
});
test("accepts personal and disposable-looking addresses", () => {
  assert.ok(validate(input({ email: "buyer+project@gmail.com" })));
  assert.ok(validate(input({ email: "buyer@temporary.example" })));
});
test("configuration fails closed without sending secrets", async () => {
  const s = setup({ RESEND_API_KEY: "" });
  const response = await s.send(undefined, { method: "GET", path: "/config" });
  assert.deepEqual(await response.json(), { ready: false, siteKey: null });
  assert.equal((await s.send()).status, 503);
  assert.equal(s.calls(), 0);
});
test("configuration returns only a public key", async () => {
  const s = setup();
  assert.deepEqual(await (await s.send(undefined, { method: "GET", path: "/config" })).json(), { ready: true, siteKey: "fixture-site-key" });
});
test("production service rejects Turnstile dummy site and secret keys", async () => {
  for (const extra of [{ CONTACT_SITE_KEY: "1x00000000000000000000AA" }, { TURNSTILE_SECRET_KEY: "1x0000000000000000000000000000000AA" }]) {
    const s = setup(extra);
    assert.deepEqual(await (await s.send(undefined, { method: "GET", path: "/config" })).json(), { ready: false, siteKey: null });
    assert.equal((await s.send()).status, 503);
    assert.equal(s.calls(), 0);
  }
});
test("rejects other origins, missing origin, missing trusted IP and unsupported methods", async () => {
  const s = setup();
  assert.equal((await s.send(undefined, { origin: "https://attacker.example" })).status, 403);
  assert.equal((await handleRequest(new Request("https://worker/contact"), s.env, s.fetcher)).status, 403);
  assert.equal((await s.send(undefined, { ip: "" })).status, 503);
  assert.equal((await s.send(undefined, { method: "GET" })).status, 405);
  assert.equal(s.calls(), 0);
});
test("CORS preflight is restricted and exposes Retry-After", async () => {
  const s = setup();
  const response = await s.send(undefined, { method: "OPTIONS" });
  assert.equal(response.status, 204);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), "https://aniloom.tech");
  assert.equal(response.headers.get("Access-Control-Expose-Headers"), "Retry-After");
});
test("rejects malformed JSON and unsupported encoding", async () => {
  const s = setup();
  assert.equal((await s.send("{")).status, 400);
  assert.equal((await s.send(input(), { headers: { "Content-Type": "text/plain" } })).status, 400);
});
test("enforces actual streamed body size even without Content-Length", async () => {
  const s = setup();
  assert.equal((await s.send("x".repeat(33000))).status, 413);
  assert.equal(s.calls(), 0);
});
test("honeypot rejection is not reported as success", async () => {
  const s = setup();
  const response = await s.send(input({ website: "bot.example" }));
  assert.equal(response.status, 400);
  assert.notEqual((await response.json()).accepted, true);
  assert.equal(s.calls(), 0);
});
for (const verification of [{ success: false }, { success: true, hostname: "evil.example", action: "contact" }, { success: true, hostname: "aniloom.tech", action: "login" }]) {
  test(`rejects invalid Turnstile result ${JSON.stringify(verification)}`, async () => {
    const s = setup(); s.verification(verification);
    assert.equal((await s.send()).status, 400); assert.equal(s.calls(), 0);
  });
}
test("successful send uses fixed recipient, reply-to, plain text and idempotency", async () => {
  const s = setup();
  const response = await s.send(input({ project: "<script>not executable</script>" }));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).accepted, true);
  const payload = s.mailPayloads[0];
  assert.deepEqual(payload.to, ["support@aniloom.tech"]);
  assert.equal(payload.reply_to, "customer@example.com");
  assert.equal(payload.html, undefined);
  assert.match(s.mailHeaders[0]["Idempotency-Key"], /^contact\/[a-f0-9]{64}$/);
});
test("duplicate content is acknowledged without another email", async () => {
  const s = setup(); await s.send();
  const response = await s.send(input({ token: "another-token" }));
  assert.equal((await response.json()).accepted, true); assert.equal(s.calls(), 1);
});
for (const mode of ["error", "timeout", "missing-id"]) {
  test(`provider ${mode} cannot produce a false success`, async () => {
    const s = setup(); s.mode(mode);
    const response = await s.send();
    assert.equal(response.status, 502); assert.notEqual((await response.json()).accepted, true);
    s.mode("success");
    assert.equal((await s.send(input({ token: "new-token" }))).status, 200);
    assert.equal(s.mailHeaders[0]["Idempotency-Key"], s.mailHeaders[1]["Idempotency-Key"]);
    assert.deepEqual(s.mailPayloads[0], s.mailPayloads[1]);
  });
}
test("fourth attempt from the same IP is throttled before verification", async () => {
  const s = setup();
  for (let i = 0; i < 3; i++) await s.send(input({ website: "bot" }));
  const response = await s.send(); assert.equal(response.status, 429);
  assert.equal(response.headers.get("Retry-After"), "600");
  s.advance(600001); assert.equal((await s.send()).status, 200);
});
test("daily budget is shared across IPs and survives controller recreation", async () => {
  const s = setup({ DAILY_LIMIT: "1" }); await s.send();
  const recreated = new GateController(s.storage, s.env, () => 1000000);
  s.env.CONTACT_GATE.get = () => ({ fetch: (url, init) => recreated.fetch(new Request(url, init)) });
  assert.equal((await s.send(input({ project: "A different inquiry" }), { ip: "192.0.2.2" })).status, 429);
  assert.equal(s.calls(), 1);
});
test("reservation lease prevents concurrent duplicate sends", async () => {
  const s = setup(); const submissionKey = "a".repeat(64);
  const reserve = () => s.gate.fetch(new Request("https://gate/reserve", { method: "POST", body: JSON.stringify({ submissionKey }) })).then(r => r.json());
  const values = await Promise.all([reserve(), reserve()]);
  assert.equal(values.filter(v => v.allowed).length, 1);
  assert.equal(values.find(v => !v.allowed).retryAfter, 60);
});
test("daily budget is a sliding window, not a reset-at-boundary burst", async () => {
  const s = setup({ DAILY_LIMIT: "2" });
  const day = 86400000;
  await s.send(input({ project: "First" }));
  s.advance(day / 2);
  await s.send(input({ project: "Second" }), { ip: "192.0.2.2" });
  assert.equal((await s.send(input({ project: "Third" }), { ip: "192.0.2.3" })).status, 429);
  s.advance(day / 2 + 1);
  assert.equal((await s.send(input({ project: "Third" }), { ip: "192.0.2.3" })).status, 200);
  const rejected = await s.send(input({ project: "Fourth" }), { ip: "192.0.2.4" });
  assert.equal(rejected.status, 429);
  assert.equal(rejected.headers.get("Retry-After"), "43200");
  assert.equal(s.calls(), 3);
});
test("expired operational records are removed without retaining messages", async () => {
  const s = setup(); await s.send(); assert.ok(s.storage.map.size >= 3);
  for (const [key, value] of s.storage.map) { assert.doesNotMatch(key, /customer|192\.0/); assert.doesNotMatch(JSON.stringify(value), /customer|review our/); }
  s.advance(86400001); await s.gate.alarm(); assert.equal(s.storage.map.size, 0);
});
