import { resolve4, resolve6 } from 'node:dns/promises';
import { request } from 'node:https';
import { pathToFileURL } from 'node:url';

export const githubIPv4 = ['185.199.108.153', '185.199.109.153', '185.199.110.153', '185.199.111.153'];
export const githubIPv6 = ['2606:50c0:8000::153', '2606:50c0:8001::153', '2606:50c0:8002::153', '2606:50c0:8003::153'];
const minimumCertificateDays = 7;

// No credentials, API writes, form submissions, TLS bypass, or redirect following.
export function probe(url, { ip, method = 'HEAD', headers = {}, requestFn = request } = {}) {
  return new Promise(resolve => {
    const target = new URL(url);
    const req = requestFn(target, {
      method,
      servername: target.hostname,
      rejectUnauthorized: true,
      // A shared agent could reuse a forced-origin connection for a public-DNS check.
      agent: false,
      signal: AbortSignal.timeout(15_000),
      ...(ip ? { lookup: (_host, options, callback) => options.all
        ? callback(null, [{ address: ip, family: 4 }])
        : callback(null, ip, 4) } : {}),
      headers: { 'User-Agent': 'AniloomHostingReadiness/1.0', ...headers },
    }, res => {
      const certificate = res.socket.getPeerCertificate();
      const result = {
        url, ...(ip ? { ip } : {}), status: res.statusCode,
        connectedIP: res.socket.remoteAddress,
        server: res.headers.server, location: res.headers.location,
        cache: res.headers['cf-cache-status'] || res.headers['x-cache'],
        certificateExpires: certificate.valid_to,
        certificateDays: Math.floor((Date.parse(certificate.valid_to) - Date.now()) / 86_400_000),
      };
      const chunks = [];
      let size = 0;
      res.on('data', chunk => {
        size += chunk.length;
        if (size > 2_000_000) { req.destroy(new Error('Response exceeds audit limit')); return; }
        if (method === 'GET') chunks.push(chunk);
      });
      res.on('error', error => resolve({ url, ...(ip ? { ip } : {}), error: error.code || error.message }));
      res.on('end', () => resolve({ ...result, ...(method === 'GET' ? { body: Buffer.concat(chunks).toString('utf8') } : {}) }));
    });
    req.setTimeout(10_000, () => req.destroy(new Error('Request timeout')));
    req.on('error', error => resolve({ url, ...(ip ? { ip } : {}), error: error.code || error.message }));
    req.end();
  });
}

export function assessDirectResults(results) {
  return results.flatMap(result => {
    const label = `${result.ip} ${result.url}`;
    if (result.error) return [`${label}: ${result.error}`];
    const url = new URL(result.url);
    if (url.hostname === 'www.aniloom.tech') {
      if (![301, 308].includes(result.status)) return [`${label}: expected a permanent redirect, got ${result.status}`];
      if (result.location !== `https://aniloom.tech${url.pathname}${url.search}`) return [`${label}: incorrect redirect destination`];
    } else if (result.status !== 200) {
      return [`${label}: expected HTTP 200, got ${result.status}`];
    }
    if (!Number.isFinite(result.certificateDays) || result.certificateDays < minimumCertificateDays) {
      return [`${label}: certificate has fewer than ${minimumCertificateDays} days remaining or expiry is unavailable`];
    }
    return [];
  });
}

export function assetsFromHtml(html) {
  const paths = [...html.matchAll(/(?:src|href)="(\/(?:_astro\/[^"?]+\.(?:css|js)|assets\/images\/[^"?]+\.(?:png|webp|jpg)))"/g)]
    .map(match => match[1]);
  return [...new Set(paths)].slice(0, 8);
}

export async function audit() {
  const dns = await Promise.all(['aniloom.tech', 'www.aniloom.tech'].map(async hostname => {
    const [a, aaaa] = await Promise.all([resolve4(hostname).catch(() => []), resolve6(hostname).catch(() => [])]);
    return { hostname, a, aaaa, directGitHubIPv4: a.length > 0 && a.every(ip => githubIPv4.includes(ip)) };
  }));
  const direct = (await Promise.all(githubIPv4.map(ip => Promise.all([
    '/', '/contact/', '/playable-ads/', '/sitemap.xml', '/robots.txt', '/assets/js/contact-form.js',
  ].map(path => probe(`https://aniloom.tech${path}`, { ip })))))).flat();
  direct.push(...await Promise.all(githubIPv4.map(ip => probe('https://www.aniloom.tech/contact/?topic=playable', { ip }))));
  const home = await probe('https://aniloom.tech/', { ip: githubIPv4[0], method: 'GET' });
  const assetPaths = assetsFromHtml(home.body || '');
  direct.push(...await Promise.all(assetPaths.map(path => probe(`https://aniloom.tech${path}`, { ip: githubIPv4[0] }))));
  const publicSite = await probe('https://aniloom.tech/');
  const contact = await probe('https://aniloom-contact.aniloom.workers.dev/config', {
    method: 'GET', headers: { Origin: 'https://aniloom.tech' },
  });
  let contactReady = false;
  try { contactReady = contact.status === 200 && JSON.parse(contact.body).ready === true; } catch {}
  delete contact.body;
  const demos = await Promise.all(['a', 'b', 'c'].map(letter => probe(`https://magic-thai-ad-${letter}1.aniloom.workers.dev/`)));
  const issues = assessDirectResults(direct);
  if (home.error || home.status !== 200 || !assetPaths.length) issues.push('Could not discover homepage assets from direct GitHub HTML');
  return {
    checkedAt: new Date().toISOString(), dns, publicSite, direct,
    dependencies: { contact: { ...contact, ready: contactReady }, demos },
    directIPv4Ready: issues.length === 0, issues,
    limits: ['DNS answers are public, not a backup of Cloudflare origin records or rules.',
      'Tests run from this machine, not Spanish mobile networks.',
      'IPv6 DNS is inspected; direct IPv6 connectivity is not tested.',
      'Worker and Turnstile reachability abroad needs separate checks; no inquiry is sent.',
      'GitHub certificate provisioning state requires a separate authenticated Pages API check.'],
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await audit();
  console.log(JSON.stringify(result, null, 2));
  if (!result.directIPv4Ready) process.exitCode = 1;
}
