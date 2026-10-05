import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { resolve } from 'node:path';
import { MAX_FILE_BYTES } from '../src/file-validation.js';
import { analyzeDocument, prepareDocument, ReviewError } from './analysis.js';

const ROOT = resolve(import.meta.dirname, '..');
const MAX_REQUEST_BYTES = MAX_FILE_BYTES + 64 * 1024;

export function readConfig() {
  let env = {};
  try { env = parseEnv(readFileSync(resolve(ROOT, '.env'), 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw new ReviewError(503, 'The server configuration could not be read. Check the .env file.'); }
  const apiKey = (process.env.GEMINI_API_KEY ?? env.GEMINI_API_KEY ?? '').trim();
  return { apiKey, model: (process.env.GEMINI_MODEL ?? env.GEMINI_MODEL ?? 'gemini-3.8-flash').trim() };
}

function send(res, status, body) {
  if (res.destroyed || res.writableEnded) return;
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(JSON.stringify(body));
}

async function readUpload(req) {
  if (!/^multipart\/form-data;\s*boundary=/i.test(req.headers['content-type'] || '')) throw new ReviewError(415, 'Send a document using the upload form.');
  if (Number(req.headers['content-length']) > MAX_REQUEST_BYTES) throw new ReviewError(413, 'This file is too large. Choose a file up to 10 MB.');
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_REQUEST_BYTES) throw new ReviewError(413, 'This file is too large. Choose a file up to 10 MB.');
    chunks.push(chunk);
  }
  let form;
  try {
    form = await new Request('http://localhost/api/analyze', {
      method: 'POST', headers: { 'Content-Type': req.headers['content-type'] }, body: Buffer.concat(chunks),
    }).formData();
  } catch { throw new ReviewError(400, 'The upload could not be read. Select your file and try again.'); }
  const files = form.getAll('document');
  if (files.length !== 1 || typeof files[0]?.arrayBuffer !== 'function') throw new ReviewError(400, 'Choose one document to review.');
  if ([...form.keys()].some(key => !['document', 'context'].includes(key)) || form.getAll('context').length > 1) throw new ReviewError(400, 'The upload contains unexpected fields. Please try again.');
  const context = form.get('context') ?? '';
  if (typeof context !== 'string' || context.length > 1000) throw new ReviewError(400, 'Keep your review context under 1,000 characters.');
  return { file: files[0], context: context.trim() };
}

export function createApiMiddleware({ getConfig = readConfig, fetchImpl = fetch, timeoutMs = 120_000 } = {}) {
  let active = 0;
  return async function reviewApi(req, res, next) {
    const path = req.url.split('?')[0];
    if (!path.startsWith('/api/')) return next();
    if (!['/api/status', '/api/analyze'].includes(path)) return send(res, 404, { error: 'Endpoint not found.' });
    let config;
    try { config = getConfig(); }
    catch (error) { return send(res, error.status || 503, { error: 'The server configuration could not be read. Check the .env file.' }); }
    if (path === '/api/status') {
      return req.method === 'GET' ? send(res, 200, { configured: Boolean(config.apiKey), provider: 'Gemini' }) : send(res, 405, { error: 'Use GET for connection status.' });
    }
    if (req.method !== 'POST') return send(res, 405, { error: 'Use the upload form to analyze a document.' });
    // Browser requests must originate from this app. No cross-origin upload access.
    const origin = req.headers.origin;
    let sameOrigin = !origin;
    try { if (origin) sameOrigin = new URL(origin).host === req.headers.host; } catch { sameOrigin = false; }
    if (!sameOrigin || req.headers['sec-fetch-site'] === 'cross-site') return send(res, 403, { error: 'Open the upload form on this site to continue.' });
    if (!config.apiKey) return send(res, 503, { error: 'AI analysis is not configured yet. Add GEMINI_API_KEY to the server’s .env file, then try again.' });
    if (active >= 2) return send(res, 429, { error: 'Two documents are already being reviewed. Please try again in a moment.' });
    active += 1;
    const controller = new AbortController();
    let timedOut = false;
    const cancel = () => { if (!res.writableFinished) controller.abort(); };
    req.once('aborted', cancel);
    res.once('close', cancel);
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
    try {
      const { file, context } = await readUpload(req);
      const document = await prepareDocument(file);
      controller.signal.throwIfAborted();
      const review = await analyzeDocument({ document, context, ...config, signal: controller.signal, fetchImpl });
      send(res, 200, { review });
    } catch (error) {
      if (timedOut) send(res, 504, { error: 'The review took too long. Try again, or upload a shorter document.' });
      else if (!controller.signal.aborted) send(res, error instanceof ReviewError ? error.status : 502, {
        error: error instanceof ReviewError ? error.message : 'The review could not be completed. Please try again.',
      });
    } finally {
      clearTimeout(timer);
      req.off('aborted', cancel);
      res.off('close', cancel);
      active -= 1;
    }
  };
}

export function reviewApiPlugin() {
  return { name: 'signwise-review-api',
    configureServer(server) { server.middlewares.use(createApiMiddleware()); },
    configurePreviewServer(server) { server.middlewares.use(createApiMiddleware()); },
  };
}
