import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createApiMiddleware } from './api.js';

const result = { documentReadable: true, title: 'Test lease', documentType: 'Lease', summary: 'Rent is due monthly.', keyTerms: [{ name: 'Rent', value: 'Monthly', source: '' }], redFlags: [], goodTerms: [], questions: [], limitations: [] };
const configured = () => ({ apiKey: 'TEST_ONLY_KEY', model: 'gemini-3.8-flash' });
const reply = () => Response.json({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(result) }] } }] });
function upload(content = 'Lease: Rent is due monthly.', name = 'lease.txt') {
  const form = new FormData(); form.append('document', new File([content], name)); return form;
}
async function withApi(settings, callback) {
  const api = createApiMiddleware(settings);
  const server = createServer((req, res) => api(req, res, () => { res.writeHead(404); res.end(); }));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  try { await callback(url); }
  finally { await new Promise(resolve => server.close(resolve)); }
}

test('missing key is reported without upload processing or a provider call; status contains no secret', async () => {
  await withApi({ getConfig: () => ({ apiKey: '', model: 'gemini-3.8-flash' }), fetchImpl: () => assert.fail('Provider must not be called') }, async url => {
    assert.deepEqual(await (await fetch(`${url}/api/status`)).json(), { configured: false, provider: 'Gemini' });
    const response = await fetch(`${url}/api/analyze`, { method: 'POST', body: upload() });
    assert.equal(response.status, 503); assert.match((await response.json()).error, /GEMINI_API_KEY/);
  });
});

test('multipart upload passes actual extracted text and returns only a validated report', async () => {
  await withApi({ getConfig: configured, fetchImpl: async (_url, init) => {
    const body = JSON.parse(init.body);
    assert.equal(body.contents[0].parts[0].text, 'Lease: Rent is due monthly.');
    assert.match(body.contents[0].parts[1].text, /Tenant/); return reply();
  } }, async url => {
    const status = await (await fetch(`${url}/api/status`)).text(); assert.ok(!status.includes('TEST_ONLY_KEY'));
    const form = upload(); form.append('context', 'Tenant');
    const response = await fetch(`${url}/api/analyze`, { method: 'POST', headers: { Origin: url }, body: form });
    assert.equal(response.status, 200); assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await response.json(), { review: result });
  });
});

test('cross-origin requests and malformed/oversized uploads are rejected before AI', async () => {
  await withApi({ getConfig: configured, fetchImpl: () => assert.fail('Must not call provider') }, async url => {
    for (const headers of [{ Origin: 'https://foreign.example' }, { 'Sec-Fetch-Site': 'cross-site' }]) {
      assert.equal((await fetch(`${url}/api/analyze`, { method: 'POST', body: upload(), headers })).status, 403);
    }
    assert.equal((await fetch(`${url}/api/analyze`, { method: 'POST', body: '{}' })).status, 415);
    assert.equal((await fetch(`${url}/api/analyze`, { method: 'GET' })).status, 405);
    assert.equal((await fetch(`${url}/api/analyze`, { method: 'POST', body: upload('a'.repeat(10 * 1024 * 1024 + 1)) })).status, 413);
    const form = upload(); form.append('document', new File(['another'], 'other.txt'));
    assert.equal((await fetch(`${url}/api/analyze`, { method: 'POST', body: form })).status, 400);
    const context = upload(); context.append('context', 'x'.repeat(1001));
    assert.equal((await fetch(`${url}/api/analyze`, { method: 'POST', body: context })).status, 400);
    assert.equal((await fetch(`${url}/api/analyze`, { method: 'POST', body: upload('fake image', 'photo.png') })).status, 422);
  });
});

test('timeout cancels the upstream request and returns a retryable message', async () => {
  let aborted = false;
  await withApi({ getConfig: configured, timeoutMs: 50, fetchImpl: async (_url, { signal }) => {
    return new Promise((_resolve, reject) => signal.addEventListener('abort', () => { aborted = true; reject(signal.reason); }, { once: true }));
  } }, async url => {
    const response = await fetch(`${url}/api/analyze`, { method: 'POST', body: upload() });
    assert.equal(response.status, 504); assert.match((await response.json()).error, /too long/);
    assert.equal(aborted, true);
  });
});

test('browser cancellation aborts upstream; capacity is released for the next request', async () => {
  let announceStarted;
  const started = new Promise(resolve => { announceStarted = resolve; });
  let announceCancelled;
  const cancelled = new Promise(resolve => { announceCancelled = resolve; });
  let calls = 0;
  await withApi({ getConfig: configured, fetchImpl: async (_url, { signal }) => {
    calls += 1;
    if (calls > 1) return reply();
    announceStarted();
    return new Promise((_resolve, reject) => signal.addEventListener('abort', () => { announceCancelled(); reject(signal.reason); }, { once: true }));
  } }, async url => {
    const controller = new AbortController();
    const request = fetch(`${url}/api/analyze`, { method: 'POST', body: upload(), signal: controller.signal });
    const rejection = assert.rejects(request, { name: 'AbortError' });
    await started; controller.abort(); await rejection; await cancelled;
    assert.equal((await fetch(`${url}/api/analyze`, { method: 'POST', body: upload() })).status, 200);
  });
});
