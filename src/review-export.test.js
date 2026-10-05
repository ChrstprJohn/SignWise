import test from 'node:test';
import assert from 'node:assert/strict';
import { formatReviewText } from './review-export.js';

test('saved review keeps the requested reading order and question context', () => {
  const output = formatReviewText({ filename: 'lease.pdf', review: {
    title: 'Lease review', summary: 'A monthly rental agreement.', keyTerms: [{ name: 'Rent', value: '15000 pesos', source: 'Section 1' }],
    redFlags: [{ title: 'Undefined fee', explanation: 'The amount is not stated.', severity: 'high', quote: 'A fee applies.', location: 'Section 2' }],
    goodTerms: [{ title: 'Deposit return deadline', explanation: 'Return is due within 30 days.', quote: 'Within 30 days.', location: 'Section 3' }],
    questions: [{ kind: 'missing', question: 'What is the fee amount?', why: 'The clause gives no amount.' }, { kind: 'unclear', question: 'Does notice run from receipt?', why: 'The start date is undefined.' }], limitations: [],
  } });
  assert.ok(output.indexOf('RED FLAGS') < output.indexOf('GOOD TERMS'));
  assert.ok(output.indexOf('GOOD TERMS') < output.indexOf('FOLLOW-UP QUESTIONS'));
  assert.ok(output.indexOf('FOLLOW-UP QUESTIONS') < output.indexOf('DOCUMENT OVERVIEW'));
  assert.match(output, /Missing detail: What is the fee amount/);
  assert.match(output, /Unclear wording: Does notice run from receipt/);
  assert.match(output, /Clause: A fee applies/);
  assert.match(output, /Document: lease.pdf/);
});
