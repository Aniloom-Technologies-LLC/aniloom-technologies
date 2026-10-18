import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parse, TEXT_NODE } from 'ultrahtml';
import { querySelector, querySelectorAll } from 'ultrahtml/selector';
import config from '../astro.config.mjs';

// Read-only public GETs. Never contacts Workers, submits forms, or changes DNS.
// A local network check does not establish reachability from real crawler IPs.
const dist = new URL('../dist/', import.meta.url);
const text = (node) => node?.type === TEXT_NODE ? node.value : (node?.children ?? []).map(text).join('');
const locations = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const graph = (page) => JSON.parse(text(querySelector(page, 'script[type="application/ld+json"]')));
const blocked = /noindex|none|nosnippet|max-snippet\s*:\s*0\b/i;

async function get(route, type) {
  const url = new URL(route, config.site);
  assert.equal(url.origin, new URL(config.site).origin, 'Only the website origin may be checked');
  const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(15000) });
  assert.equal(response.status, 200, `${url}: HTTP ${response.status}`);
  assert.ok(response.headers.get('content-type')?.includes(type), `${url}: unexpected Content-Type`);
  assert.doesNotMatch(response.headers.get('x-robots-tag') ?? '', blocked, `${url}: X-Robots-Tag`);
  return response.text();
}

try {
  const robots = await get('/robots.txt', 'text/plain');
  assert.equal(robots.trim(), (await readFile(new URL('robots.txt', dist), 'utf8')).trim(), 'Live robots differs from build');
  const urls = locations(await get('/sitemap.xml', 'xml'));
  assert.deepEqual(urls.sort(), locations(await readFile(new URL('sitemap.xml', dist), 'utf8')).sort(), 'Live sitemap differs from build');
  for (const url of urls) {
    const route = new URL(url).pathname;
    const page = parse(await get(route, 'text/html'));
    const local = parse(await readFile(new URL(`${route.slice(1)}index.html`, dist), 'utf8'));
    assert.equal(querySelectorAll(page, 'link[rel="canonical"]').length, 1, route);
    assert.equal(querySelector(page, 'link[rel="canonical"]').attributes.href, url, route);
    for (const meta of querySelectorAll(page, 'meta')) {
      const name = meta.attributes.name?.toLowerCase() ?? '';
      if (name === 'robots' || name.endsWith('bot')) assert.doesNotMatch(meta.attributes.content ?? '', blocked, route);
      assert.notEqual(meta.attributes['http-equiv']?.toLowerCase(), 'refresh', route);
    }
    assert.equal(querySelectorAll(page, 'h1').length, 1, route);
    assert.equal(text(querySelector(page, 'h1')), text(querySelector(local, 'h1')), `${route}: live heading differs`);
    assert.deepEqual(graph(page), graph(local), `${route}: live structured data differs from build`);
    console.log(`PASS ${route} (200, canonical, indexability, heading, JSON-LD)`);
  }
  console.log(`PASS robots.txt, sitemap.xml and ${urls.length} pages at ${new Date().toISOString()}`);
  console.log('This verifies public responses from this network, not indexing, rankings, crawler-IP access, contact delivery or demo availability.');
} catch (error) {
  console.error(`FAIL ${error.message}`);
  process.exitCode = 1;
}
