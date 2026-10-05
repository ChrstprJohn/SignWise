import test from 'node:test';
import assert from 'node:assert/strict';
import { fileProperties, reviewCounts } from './analytics-metadata.js';

test('file analytics expose controlled formats and sizes without names, MIME or contents', () => {
  const sensitive = { name: 'Private Client Contract.JPG', size: 1024, type: 'PRIVATE_MIME', contents: 'PRIVATE_TEXT' };
  assert.deepEqual(fileProperties(sensitive), { file_type: 'jpeg', file_size_bytes: 1024 });
  assert.deepEqual(fileProperties({ name: 'client.PRIVATE_EXTENSION', size: -1 }), { file_type: 'other', file_size_bytes: 0 });
  assert.deepEqual(fileProperties(null), { file_type: 'other', file_size_bytes: 0 });
});

test('review analytics retain only numeric counts, never findings or document classifications', () => {
  assert.deepEqual(reviewCounts({ title: 'PRIVATE_TITLE', documentType: 'PRIVATE_CLASSIFICATION', summary: 'PRIVATE_SUMMARY',
    redFlags: [{ title: 'PRIVATE_CLAUSE' }], goodTerms: [{ quote: 'PRIVATE_QUOTE' }], questions: [{ question: 'PRIVATE_QUESTION' }, {}],
  }), { red_flag_count: 1, good_term_count: 1, question_count: 2 });
  assert.deepEqual(reviewCounts(null), { red_flag_count: 0, good_term_count: 0, question_count: 0 });
});
