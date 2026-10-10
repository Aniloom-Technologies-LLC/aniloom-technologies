import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { assessDirectResults, assetsFromHtml, githubIPv4, probe } from './hosting-check.mjs';

const healthy = { url: 'https://aniloom.tech/', ip: githubIPv4[0], status: 200, certificateDays: 30 };

test('accepts an origin with valid HTTPS and enough certificate lifetime', () => {
  assert.deepEqual(assessDirectResults([healthy]), []);
});
test('does not accept TLS errors as readiness', () => {
  assert.equal(assessDirectResults([{ ...healthy, error: 'ERR_TLS_CERT_ALTNAME_INVALID' }]).length, 1);
});
test('does not accept error pages with non-200 status', () => {
  assert.equal(assessDirectResults([{ ...healthy, status: 404 }]).length, 1);
});
test('blocks certificates expiring soon or missing expiry', () => {
  for (const certificateDays of [0, 5, 6, undefined, NaN]) {
    assert.equal(assessDirectResults([{ ...healthy, certificateDays }]).length, 1);
  }
  assert.deepEqual(assessDirectResults([{ ...healthy, certificateDays: 7 }]), []);
});
test('accepts permanent www redirects preserving path and query', () => {
  for (const status of [301, 308]) {
    assert.deepEqual(assessDirectResults([{ ...healthy, status,
      url: 'https://www.aniloom.tech/contact/?topic=playable',
      location: 'https://aniloom.tech/contact/?topic=playable' }]), []);
  }
});
test('rejects temporary, off-site, dropped-query and non-HTTPS www redirects', () => {
  const redirect = { ...healthy, status: 301, url: 'https://www.aniloom.tech/contact/?topic=playable' };
  for (const location of ['https://example.com/', 'https://aniloom.tech/contact/', 'http://aniloom.tech/contact/?topic=playable']) {
    assert.equal(assessDirectResults([{ ...redirect, location }]).length, 1);
  }
  assert.equal(assessDirectResults([{ ...redirect, status: 302, location: 'https://aniloom.tech/contact/?topic=playable' }]).length, 1);
});
test('discovers bounded same-site assets, excludes external URLs and duplicates', () => {
  const html = '<link href="/_astro/global.hash.css"><img src="/assets/images/dog.webp">' +
    '<img src="/assets/images/dog.webp"><img src="https://example.com/image.jpg">';
  assert.deepEqual(assetsFromHtml(html), ['/_astro/global.hash.css', '/assets/images/dog.webp']);
  assert.equal(assetsFromHtml(Array.from({ length: 20 }, (_, i) => `<img src="/assets/images/${i}.webp">`).join('')).length, 8);
});

test('probe sends the request, pins the endpoint, validates TLS and isolates connections', async () => {
  let ended = false;
  const requestFn = (url, options, callback) => {
    assert.equal(url.hostname, 'aniloom.tech');
    assert.equal(options.servername, 'aniloom.tech');
    assert.equal(options.rejectUnauthorized, true);
    assert.equal(options.agent, false);
    assert.equal(options.method, 'GET');
    assert.equal(options.headers.Origin, 'https://aniloom.tech');
    options.lookup(url.hostname, { all: true }, (_error, result) => assert.deepEqual(result, [{ address: githubIPv4[2], family: 4 }]));
    const req = new EventEmitter();
    req.setTimeout = () => {};
    req.end = () => {
      ended = true;
      const res = new EventEmitter();
      res.statusCode = 200;
      res.headers = { server: 'GitHub.com' };
      res.socket = { remoteAddress: githubIPv4[2], getPeerCertificate: () => ({ valid_to: 'Oct 15 11:07:54 2026 GMT' }) };
      callback(res);
      res.emit('data', Buffer.from('response'));
      res.emit('end');
    };
    return req;
  };
  const result = await probe('https://aniloom.tech/', { ip: githubIPv4[2], method: 'GET', headers: { Origin: 'https://aniloom.tech' }, requestFn });
  assert.equal(ended, true);
  assert.equal(result.status, 200);
  assert.equal(result.connectedIP, githubIPv4[2]);
  assert.equal(result.body, 'response');
});
