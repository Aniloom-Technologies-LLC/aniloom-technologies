// Local UI fixture only. It never imports credentials or sends an email.
import { createServer } from "node:http";
import { createInterface } from "node:readline";

let mode = "success";
createInterface({ input: process.stdin }).on("line", value => {
  if (["success", "error", "rate", "unavailable"].includes(value.trim())) { mode = value.trim(); console.log(`Preview mode: ${mode}`); }
});
const server = createServer(async (req, res) => {
  const origin = req.headers.origin || "";
  if (!/^http:\/\/127\.0\.0\.1:4331$/.test(origin)) { res.writeHead(403).end(); return; }
  const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Expose-Headers": "Retry-After", "Cache-Control": "no-store" };
  if (req.method === "OPTIONS") { res.writeHead(204, headers).end(); return; }
  if (req.url === "/config") { res.writeHead(200, headers).end(JSON.stringify({ ready: mode !== "unavailable", siteKey: "1x00000000000000000000AA" })); return; }
  if (req.url !== "/contact" || req.method !== "POST") { res.writeHead(404, headers).end("{}"); return; }
  let bytes = 0;
  for await (const chunk of req) { bytes += chunk.length; if (bytes > 32768) { res.writeHead(413, headers).end("{}"); return; } }
  await new Promise(resolve => setTimeout(resolve, 700));
  const status = mode === "success" ? 200 : mode === "rate" ? 429 : 502;
  console.log(`LOCAL UI FIXTURE response: ${status}. No email was sent.`);
  res.writeHead(status, { ...headers, ...(mode === "rate" ? { "Retry-After": "2" } : {}) }).end(JSON.stringify(mode === "success" ? { accepted: true } : { code: mode === "rate" ? "rate_limit" : "delivery" }));
});
server.listen(8788, "127.0.0.1", () => console.log("Local contact UI fixture: http://127.0.0.1:8788. Modes on stdin: success, error, rate, unavailable. No real email."));
