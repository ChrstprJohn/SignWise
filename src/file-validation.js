export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const FILE_ACCEPT = '.pdf,.docx,.txt,.jpg,.jpeg,.png,.webp';
const supported = new Set(['pdf', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'webp']);
const photoTypes = new Set(['jpg', 'jpeg', 'png', 'webp']);

export function validateFile(file, { photoOnly = false } = {}) {
  if (!file) return 'Choose a document or photo to continue.';
  const extension = file.name?.split('.').pop().toLowerCase();
  if (!file.name?.includes('.') || !supported.has(extension)) {
    return 'This file format is not supported. Choose a PDF, DOCX, TXT, JPG, PNG, or WebP file.';
  }
  if (photoOnly && !photoTypes.has(extension)) {
    return 'Choose a JPG, PNG, or WebP photo, or use Upload a document for other files.';
  }
  if (file.size === 0) return 'This file is empty. Choose a file with content.';
  if (!Number.isFinite(file.size) || file.size < 0) return 'This file could not be read. Try choosing it again.';
  if (file.size > MAX_FILE_BYTES) return 'This file is too large. Choose a file smaller than 10 MB.';
  return '';
}

export function formatFileSize(bytes) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.ceil(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
