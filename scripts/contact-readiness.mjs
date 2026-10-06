// Secret updates can take a few seconds to reach the deployed Worker.
// Never treat an HTTP success or an unrelated widget key as activation readiness.
export async function waitForContactReady(endpoint, siteKey, {
  fetcher = fetch,
  wait = (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  attempts = 6,
  retryMs = 2000,
} = {}) {
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const response = await fetcher(endpoint, {
        headers: { Origin: "https://aniloom.tech" },
        signal: AbortSignal.timeout(4000),
      });
      if (response.ok) {
        const config = await response.json();
        if (config.ready === true && config.siteKey === siteKey && siteKey) return true;
      }
    } catch { /* Retry transient transport, propagation, and response errors without logging credentials. */ }
    if (attempt + 1 < attempts) await wait(retryMs);
  }
  return false;
}
