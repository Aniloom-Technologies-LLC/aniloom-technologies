import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import { unescape } from 'html-escaper';
import test from 'node:test';
import { parse, TEXT_NODE } from 'ultrahtml';
import { querySelector, querySelectorAll } from 'ultrahtml/selector';
import config from '../astro.config.mjs';

// Inspect the shipped HTML, not only source templates. No network or submissions.
const dist = new URL('../dist/', import.meta.url);
const origin = config.site;
const absolute = (route) => new URL(route, origin).href;
const text = (node) => node?.type === TEXT_NODE ? node.value : (node?.children ?? []).map(text).join('');
const select = (node, selector) => querySelector(node, selector);
const selectAll = (node, selector) => querySelectorAll(node, selector);
const files = await readdir(dist, { recursive: true });
const pages = new Map(await Promise.all(files.filter((file) => file.endsWith('.html')).map(async (file) => {
  const route = `/${file.replace(/index\.html$/, '')}`;
  return [route, parse(await readFile(new URL(file, dist), 'utf8'))];
})));
const xml = await readFile(new URL('sitemap.xml', dist), 'utf8');
const locations = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const sitemap = new Set(locations);
const redirects = config.redirects;
// Support and the raw Unity test slot are intentionally unlisted utilities.
const unlisted = new Set(['/support/', '/temp-unity/']);
const contentPages = [...pages].filter(([route]) => !unlisted.has(route) && !(route in redirects));
const graphs = new Map(contentPages.map(([route, page]) => {
  const data = JSON.parse(text(select(page, 'script[type="application/ld+json"]')));
  return [route, new Map(data['@graph'].map((entity) => [entity['@id'], entity]))];
}));

test('robots excludes the Unity test slot and points to the production sitemap', async () => {
  const robots = await readFile(new URL('robots.txt', dist), 'utf8');
  assert.equal(robots.replace(/\r/g, '').trim(), `User-agent: *\nAllow: /\nDisallow: /temp-unity/\n\nSitemap: ${absolute('/sitemap.xml')}`);
});

test('Unity test slot contains one delivery HTML and stays outside website discovery', async () => {
  assert.deepEqual(files.filter((file) => file.startsWith('temp-unity/')), ['temp-unity/index.html']);
  const html = await readFile(new URL('temp-unity/index.html', dist), 'utf8');
  const delivery = JSON.parse(html.match(/window\.__PLAYABLE_DELIVERY__=(.*?);/)?.[1] ?? 'null');
  assert.equal(delivery?.platform, 'unity');
  assert.equal(delivery?.technicalControls, false);
  // This diagnostic slot may host owner-authorized files above Unity's delivery cap.
  // Network size compliance is checked during delivery, not website discovery.
  assert.ok(!locations.some((location) => new URL(location).pathname.startsWith('/temp-unity/')));
  for (const [route, page] of pages) {
    if (route === '/temp-unity/') continue;
    for (const link of selectAll(page, 'a[href]')) {
      const url = new URL(link.attributes.href, absolute(route));
      if (url.origin === new URL(origin).origin) {
        assert.ok(!url.pathname.startsWith('/temp-unity/'), `Test slot must stay unlisted: ${route} -> ${url.pathname}`);
      }
    }
  }
});

test('sitemap covers every public content page, without duplicates, redirects or utility routes', () => {
  assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
  assert.match(xml, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
  assert.equal(locations.length, sitemap.size, 'Duplicate sitemap URLs');
  assert.ok(sitemap.size > 0, 'Empty sitemap');
  assert.deepEqual([...sitemap].sort(), contentPages.map(([route]) => absolute(route)).sort());
  assert.ok(sitemap.has(absolute('/contact/')));
  assert.ok(sitemap.has(absolute('/anishot/privacy-policy/')));
  assert.doesNotMatch(xml, /<(lastmod|changefreq|priority)>/, 'Add dates only with a reliable content-change source');
});

test('public HTML has unique metadata, self canonicals, readable content and valid connected JSON-LD', () => {
  const titles = new Set();
  const descriptions = new Set();
  for (const [route, page] of contentPages) {
    const url = absolute(route);
    assert.equal(select(page, 'html')?.attributes.lang, 'en', route);
    assert.equal(selectAll(page, 'title').length, 1, route);
    const title = unescape(text(select(page, 'title'))).trim();
    const descriptionNodes = selectAll(page, 'meta[name="description"]');
    assert.equal(descriptionNodes.length, 1, route);
    const description = unescape(descriptionNodes[0].attributes.content);
    assert.ok(title && description, `Missing metadata: ${route}`);
    assert.ok(!titles.has(title), `Duplicate title: ${route}`);
    assert.ok(!descriptions.has(description), `Duplicate description: ${route}`);
    titles.add(title);
    descriptions.add(description);
    const canonicals = selectAll(page, 'link[rel="canonical"]');
    assert.equal(canonicals.length, 1, route);
    assert.equal(canonicals[0].attributes.href, url, route);
    assert.equal(select(page, 'meta[property="og:url"]')?.attributes.content, url, route);
    assert.equal(selectAll(page, 'h1').length, 1, route);
    assert.ok(text(select(page, 'h1')).trim(), `Empty h1: ${route}`);
    assert.ok(text(select(page, 'main')).trim().length > 80, `Missing server-rendered content: ${route}`);
    for (const meta of selectAll(page, 'meta')) {
      const name = meta.attributes.name?.toLowerCase();
      if (name === 'robots' || /bot$/.test(name ?? '')) {
        assert.doesNotMatch(meta.attributes.content ?? '', /noindex|none|nofollow|nosnippet|max-snippet\s*:\s*0\b/i, route);
      }
      assert.notEqual(meta.attributes['http-equiv']?.toLowerCase(), 'refresh', route);
    }
    const scripts = selectAll(page, 'script[type="application/ld+json"]');
    assert.equal(scripts.length, 1, route);
    const data = JSON.parse(text(scripts[0]));
    assert.equal(data['@context'], 'https://schema.org');
    const graph = new Map(data['@graph'].map((entity) => [entity['@id'], entity]));
    assert.equal(graph.size, data['@graph'].length, `Duplicate schema IDs: ${route}`);
    const org = graph.get(absolute('/#organization'));
    assert.equal(org?.name, 'Aniloom Technologies', route);
    assert.equal(org?.alternateName, 'Aniloom', route);
    assert.equal(graph.get(absolute('/#website'))?.publisher['@id'], org['@id']);
    const webpage = graph.get(`${url}#webpage`);
    assert.equal(webpage?.url, url, route);
    assert.equal(webpage?.name, title, route);
    assert.equal(webpage?.description, description, route);
    assert.equal(webpage?.isPartOf['@id'], absolute('/#website'), route);
    if (webpage.mainEntity) assert.ok(graph.has(webpage.mainEntity['@id']), route);
    const article = graph.get(`${url}#article`);
    if (article) {
      assert.equal(article.mainEntityOfPage['@id'], webpage['@id']);
      assert.ok(Number.isFinite(Date.parse(article.datePublished)), route);
      if (article.dateModified) assert.ok(Date.parse(article.dateModified) >= Date.parse(article.datePublished), route);
    }
  }
});

test('service and company pages identify their actual entities', () => {
  for (const [route, name] of [['/playable-ads/', 'Playable Ads'], ['/quality-engineering/', 'Quality Engineering & Testing']]) {
    const graph = graphs.get(route);
    const service = graph.get(`${absolute(route)}#service`);
    assert.equal(service?.['@type'], 'Service', route);
    assert.equal(service?.name, name, route);
    assert.equal(service?.provider['@id'], absolute('/#organization'), route);
    assert.equal(service?.mainEntityOfPage['@id'], `${absolute(route)}#webpage`, route);
    assert.equal(service?.description, graph.get(`${absolute(route)}#webpage`).description);
    assert.equal(service?.offers, undefined, 'Pricing belongs to the pricing page');
    assert.equal(service?.aggregateRating, undefined);
  }
  assert.equal(graphs.get('/about/').get(`${absolute('/about/')}#webpage`)['@type'], 'AboutPage');
  assert.equal(graphs.get('/contact/').get(`${absolute('/contact/')}#webpage`)['@type'], 'ContactPage');
});

test('internal links and anchors resolve, and every sitemap page is reachable from home', async () => {
  const edges = new Map();
  for (const [route, page] of contentPages) {
    const links = new Set();
    for (const link of selectAll(page, 'a[href]')) {
      const url = new URL(link.attributes.href, absolute(route));
      if (url.origin !== new URL(origin).origin) continue;
      assert.ok(!(url.pathname in redirects), `Internal link uses a legacy redirect: ${route} -> ${url.pathname}`);
      assert.ok(!unlisted.has(url.pathname), `Utility must stay unlisted: ${route} -> ${url.pathname}`);
      const target = pages.get(url.pathname);
      if (target) {
        links.add(url.pathname);
        if (url.hash) {
          const id = decodeURIComponent(url.hash.slice(1));
          assert.ok(selectAll(target, '[id]').some((node) => node.attributes.id === id), `Broken anchor: ${route} -> ${url.href}`);
        }
      } else {
        const file = decodeURIComponent(url.pathname).replace(/^\//, '');
        assert.ok(!file.split('/').includes('..'), 'Invalid local path');
        await assert.doesNotReject(access(new URL(file, dist)), `Broken internal link: ${route} -> ${url.href}`);
      }
    }
    edges.set(route, links);
  }
  const reached = new Set(['/']);
  for (const route of reached) for (const destination of edges.get(route) ?? []) reached.add(destination);
  for (const [route] of contentPages) assert.ok(reached.has(route), `Orphan page: ${route}`);
});

test('draft articles stay out of the build and sitemap', async () => {
  const source = new URL('../src/content/blog/', import.meta.url);
  for (const file of await readdir(source, { recursive: true })) {
    if (!/\.mdx?$/.test(file)) continue;
    const markdown = await readFile(new URL(file, source), 'utf8');
    const frontmatter = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/u)?.[1] ?? '';
    if (!/^draft:\s*true\s*(?:#.*)?$/m.test(frontmatter)) continue;
    const route = `/insights/${file.replace(/\.mdx?$/, '')}/`;
    assert.ok(!pages.has(route), `Published draft: ${route}`);
    assert.ok(!sitemap.has(absolute(route)), `Draft in sitemap: ${route}`);
  }
});

test('legacy routes remain canonical redirects outside the sitemap', () => {
  for (const [route, target] of Object.entries(redirects)) {
    const page = pages.get(route);
    assert.ok(page, `Missing redirect: ${route}`);
    assert.ok(selectAll(page, 'meta').some((node) => node.attributes['http-equiv']?.toLowerCase() === 'refresh'), route);
    assert.equal(select(page, 'link[rel="canonical"]')?.attributes.href, absolute(target), route);
    assert.ok(!sitemap.has(absolute(route)), route);
  }
});
