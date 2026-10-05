import test from 'node:test';
import assert from 'node:assert/strict';
import { validateFile, MAX_FILE_BYTES, formatFileSize } from './file-validation.js';

test('accepts all supported document and image formats, including uppercase extensions', () => {
  for (const ext of ['pdf', 'DOCX', 'txt', 'jpg', 'jpeg', 'png', 'webp']) {
    assert.equal(validateFile({ name: `agreement.${ext}`, size: 100 }), '');
  }
});
test('rejects unsupported formats and extensionless files', () => {
  for (const name of ['contract.exe', 'contract.pdf.exe', 'pdf']) assert.match(validateFile({ name, size: 100 }), /not supported/);
});
test('enforces the ten-megabyte boundary', () => {
  assert.equal(validateFile({ name: 'contract.pdf', size: MAX_FILE_BYTES }), '');
  assert.match(validateFile({ name: 'contract.pdf', size: MAX_FILE_BYTES + 1 }), /too large/);
});
test('rejects an empty, missing, or unreadable file', () => {
  assert.match(validateFile(null), /Choose/);
  assert.match(validateFile({ name: 'a.pdf', size: 0 }), /empty/);
  for (const size of [undefined, NaN, -1]) assert.match(validateFile({ name: 'a.pdf', size }), /could not be read/);
});
test('photo picker accepts photos and rejects documents', () => {
  assert.equal(validateFile({ name: 'photo.jpg', size: 100 }, { photoOnly: true }), '');
  assert.match(validateFile({ name: 'contract.pdf', size: 100 }, { photoOnly: true }), /photo/);
});
test('formats small and large file sizes for display', () => {
  assert.equal(formatFileSize(100), '1 KB');
  assert.equal(formatFileSize(2048), '2 KB');
  assert.equal(formatFileSize(1.5 * 1024 * 1024), '1.5 MB');
});
