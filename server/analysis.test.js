import test from 'node:test';
import assert from 'node:assert/strict';
import { zipSync, strToU8 } from 'fflate';
import { analyzeDocument, prepareDocument, validateReview } from './analysis.js';

const review = () => ({ documentReadable: true, title: 'Lease review', documentType: 'Lease', summary: 'Rent is due monthly.', keyTerms: [], redFlags: [], goodTerms: [], questions: [], limitations: [] });
const provider = (value, finishReason = 'STOP') => Response.json({ candidates: [{ finishReason, content: { parts: [{ text: JSON.stringify(value) }] } }] });
const options = { apiKey: 'TEST_ONLY_SECRET', model: 'gemini-3.8-flash', document: { text: 'Lease: Rent is due monthly.' } };

test('TXT is read as strict UTF-8 and empty/binary/oversized text is rejected', async () => {
  assert.deepEqual(await prepareDocument(new File(['Lease: ₱10,000 per month.'], 'lease.txt')), { text: 'Lease: ₱10,000 per month.' });
  for (const content of ['  ', 'A\0B', Uint8Array.from([255, 255]), 'x'.repeat(100001)]) {
    await assert.rejects(prepareDocument(new File([content], 'lease.txt')), error => [413, 422].includes(error.status));
  }
});

test('DOCX extracts document text, without HTML, and rejects a renamed ZIP', async () => {
  const document = zipSync({
    '[Content_Types].xml': strToU8('<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'),
    'word/document.xml': strToU8('<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Rent is due monthly.</w:t></w:r></w:p></w:body></w:document>'),
  });
  assert.deepEqual(await prepareDocument(new File([document], 'lease.docx')), { text: 'Rent is due monthly.' });
  await assert.rejects(prepareDocument(new File([zipSync({ 'unrelated.txt': strToU8('No agreement') })], 'renamed.docx')), { status: 422 });
});

test('DOCX expansion limits are checked before extraction', async () => {
  const document = zipSync({ 'word/document.xml': new Uint8Array(16 * 1024 * 1024 + 1) });
  await assert.rejects(prepareDocument(new File([document], 'large.docx')), { status: 413 });
});

test('PDF/image type is derived from contents rather than a supplied MIME', async () => {
  for (const [name, signature, mime] of [
    ['lease.pdf', Buffer.from('%PDF-1.7\n'), 'application/pdf'],
    ['photo.jpg', Buffer.from([255, 216, 255, 224]), 'image/jpeg'],
    ['photo.png', Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), 'image/png'],
    ['photo.webp', Buffer.from('RIFF0000WEBP'), 'image/webp'],
  ]) {
    const part = await prepareDocument(new File([signature], name, { type: 'text/html' }));
    assert.equal(part.inline_data.mime_type, mime);
    assert.equal(Buffer.from(part.inline_data.data, 'base64').compare(signature), 0);
    await assert.rejects(prepareDocument(new File(['renamed text'], name)), { status: 422 });
  }
});

test('provider request uses a header-only secret, fixed endpoint and structured schema', async () => {
  const result = await analyzeDocument({ ...options, context: 'I am the tenant.', fetchImpl: async (url, init) => {
    assert.equal(url, 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent');
    assert.ok(!url.includes(options.apiKey));
    assert.equal(init.headers['x-goog-api-key'], options.apiKey);
    const request = JSON.parse(init.body);
    assert.equal(request.generationConfig.responseFormat.text.mimeType, 'APPLICATION_JSON');
    assert.equal(request.contents[0].parts[0].text, options.document.text);
    assert.match(request.systemInstruction.parts[0].text, /UNTRUSTED DATA/);
    assert.ok(!init.body.includes(options.apiKey));
    return provider(review());
  } });
  assert.equal(result.title, 'Lease review');
});

test('malformed, incomplete, excessive and unreadable responses never become reports', async () => {
  const complete = { ...review(), redFlags: [{ title: 'Unclear fee', explanation: 'The fee amount is missing.', severity: 'high', quote: 'A fee applies.', location: 'Section 2' }] };
  assert.equal(validateReview(complete).redFlags[0].severity, 'high');
  assert.throws(() => validateReview({ ...review(), documentReadable: false }), { status: 422 });
  assert.throws(() => validateReview({ ...review(), title: '' }), { status: 502 });
  assert.throws(() => validateReview({ ...review(), limitations: Array(9).fill('Missing context') }), { status: 502 });
  assert.throws(() => validateReview({ ...review(), redFlags: [{ title: 'Bad', severity: 'critical' }] }), { status: 502 });
  assert.throws(() => validateReview({ ...review(), hidden: '<script>' }), { status: 502 });
  await assert.rejects(analyzeDocument({ ...options, fetchImpl: async () => Response.json({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: 'not JSON' }] } }] }) }), { status: 502 });
  await assert.rejects(analyzeDocument({ ...options, fetchImpl: async () => provider(review(), 'MAX_TOKENS') }), { status: 502 });
  await assert.rejects(analyzeDocument({ ...options, fetchImpl: async () => Response.json({ promptFeedback: { blockReason: 'SAFETY' } }) }), { status: 422 });
});

test('provider failures have actionable errors without leaking provider content', async () => {
  for (const [upstream, expected] of [[400, 422], [401, 503], [403, 503], [404, 503], [429, 429], [500, 502]]) {
    await assert.rejects(analyzeDocument({ ...options, fetchImpl: async () => new Response('SECRET_PROVIDER_DETAIL', { status: upstream }) }), error => error.status === expected && !error.message.includes('SECRET_PROVIDER_DETAIL'));
  }
});

test('model cannot inject a different endpoint', async () => {
  await assert.rejects(analyzeDocument({ ...options, model: '../other?key=secret', fetchImpl: () => assert.fail('Must not call provider') }), { status: 503 });
});

test('HTTP 400 configuration and credential errors are not blamed on the document', async () => {
  for (const message of [
    "Invalid value at 'generation_config.response_format.text.mime_type'",
    'Unknown name in responseFormat',
    'API key not valid. Please pass a valid API key.',
    'User location is not supported for the API use.',
    'This API project requires billing.',
  ]) {
    await assert.rejects(analyzeDocument({ ...options, fetchImpl: async () => Response.json({ error: { message: `${message} SECRET_DETAIL` } }, { status: 400 }) }), error => error.status === 503 && !error.message.includes('SECRET_DETAIL'));
  }
  await assert.rejects(analyzeDocument({ ...options, fetchImpl: async () => Response.json({ error: { message: 'The document has no pages.' } }, { status: 400 }) }), error => error.status === 422 && /document/.test(error.message));
});

test('review prioritizes red flags and questions must identify missing or unclear details', async () => {
  const flag = { title: 'A clause', explanation: 'A concrete concern.', quote: 'A clause', location: 'Section 1' };
  const payload = { ...review(), redFlags: ['low', 'high', 'medium'].map(severity => ({ ...flag, severity })), questions: [{ kind: 'missing', question: 'What is the fee amount?', why: 'The termination fee has no amount.' }] };
  const result = await analyzeDocument({ ...options, fetchImpl: async (_url, init) => {
    const request = JSON.parse(init.body);
    assert.match(request.systemInstruction.parts[0].text, /Do not ask to confirm/);
    return provider(payload);
  } });
  assert.deepEqual(result.redFlags.map(item => item.severity), ['high', 'medium', 'low']);
  assert.equal(result.questions[0].kind, 'missing');
  assert.throws(() => validateReview({ ...review(), questions: [{ kind: 'generic', question: 'Anything else?', why: 'Just to be sure.' }] }), { status: 502 });
  assert.throws(() => validateReview({ ...review(), questions: [{ question: 'Anything else?', why: 'Just to be sure.' }] }), { status: 502 });
});
