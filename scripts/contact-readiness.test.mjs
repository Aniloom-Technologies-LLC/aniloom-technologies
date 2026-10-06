import test from "node:test";
import assert from "node:assert/strict";
import { waitForContactReady } from "./contact-readiness.mjs";

const endpoint = "https://worker.example/config";
const siteKey = "fixture-public-key";

test("readiness requires the configured public widget key and production Origin", async () => {
  let calls = 0;
  assert.equal(await waitForContactReady(endpoint, siteKey, {
    fetcher: async (url, options) => {
      calls++;
      assert.equal(url, endpoint);
      assert.equal(options.headers.Origin, "https://aniloom.tech");
      assert.ok(options.signal instanceof AbortSignal);
      return Response.json({ ready: true, siteKey });
    },
    wait: async () => assert.fail("No wait needed after readiness"),
  }), true);
  assert.equal(calls, 1);
});

test("readiness waits for secret propagation instead of failing the deployment immediately", async () => {
  let calls = 0;
  const waits = [];
  assert.equal(await waitForContactReady(endpoint, siteKey, {
    fetcher: async () => Response.json(++calls === 1 ? { ready: false, siteKey: null } : { ready: true, siteKey }),
    wait: async ms => waits.push(ms),
  }), true);
  assert.equal(calls, 2);
  assert.deepEqual(waits, [2000]);
});

test("transient network and malformed response failures are retried without claiming readiness", async () => {
  let calls = 0;
  assert.equal(await waitForContactReady(endpoint, siteKey, {
    fetcher: async () => {
      calls++;
      if (calls === 1) throw new Error("Network failure");
      if (calls === 2) return new Response("Not JSON");
      return Response.json({ ready: true, siteKey });
    },
    wait: async () => {},
    attempts: 3,
  }), true);
  assert.equal(calls, 3);
});

test("wrong keys, failed HTTP responses, and non-boolean readiness fail closed", async () => {
  for (const [body, status] of [
    [{ ready: true, siteKey: "another-key" }, 200],
    [{ ready: "true", siteKey }, 200],
    [{ ready: true, siteKey }, 503],
    [{ ready: true }, 200],
  ]) {
    let calls = 0;
    let waits = 0;
    assert.equal(await waitForContactReady(endpoint, siteKey, {
      fetcher: async () => { calls++; return Response.json(body, { status }); },
      wait: async () => { waits++; },
      attempts: 3,
    }), false);
    assert.equal(calls, 3);
    assert.equal(waits, 2);
  }
});
