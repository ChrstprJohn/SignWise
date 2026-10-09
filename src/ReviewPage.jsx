import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft, ArrowUpRight, Camera, CircleAlert, FileCheck2,
  LoaderCircle, X,
} from 'lucide-react';
import { FILE_ACCEPT, formatFileSize, validateFile } from './file-validation.js';
import './review.css';
import { trackEvent } from './analytics.js';
import { fileProperties, reviewCounts } from './analytics-metadata.js';

function trackAttempt(attempt, event, properties = {}) {
  if (!attempt || attempt.finished) return;
  attempt.finished = true;
  trackEvent(event, { ...attempt.properties, duration_ms: Math.round(performance.now() - attempt.started), ...properties });
}

function DocumentPicker({ onComplete, onInvalidate }) {
  const inputRef = useRef(null);
  const photoRef = useRef(null);
  const dragCounter = useRef(0);
  const requestRef = useRef(null);
  const jobRef = useRef(0);
  const attemptRef = useRef(null);

  const [file, setFile] = useState(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);

  const [connection, setConnection] = useState('checking');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    async function checkConnection() {
      try {
        const response = await fetch('/api/status', { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(5000)]) });
        const body = await response.json();
        if (!response.ok || typeof body.configured !== 'boolean') throw new Error('Unavailable');
        if (!controller.signal.aborted) setConnection(body.configured ? 'ready' : 'unconfigured');
      } catch { if (!controller.signal.aborted) setConnection('unavailable'); }
    }
    checkConnection();
    const timer = setInterval(checkConnection, 15_000);
    return () => { clearInterval(timer); controller.abort(); requestRef.current?.abort(); trackAttempt(attemptRef.current, 'document_review_cancelled', { reason: 'navigation' }); jobRef.current += 1; };
  }, []);



  function cancelReview(event) {
    // The button becomes a submit button during this click's state update.
    event.preventDefault();
    trackAttempt(attemptRef.current, 'document_review_cancelled', { reason: 'user' });
    jobRef.current += 1;
    requestRef.current?.abort();
    requestRef.current = null;
    setBusy(false);
    setStatus('Review cancelled. Your file is still selected.');
  }

  function chooseFiles(files, photoOnly = false, source = 'file_picker') {
    if (busy || !files?.length) return;
    if (files.length > 1) { setError('Choose one file at a time.'); trackEvent('document_selection_rejected', { source, reason: 'multiple_files' }); return; }
    const nextFile = files[0];
    const nextError = validateFile(nextFile, { photoOnly });
    setError(nextError);
    if (!nextError) { setFile(nextFile); onInvalidate(); setStatus(`${nextFile.name} selected.`); trackEvent('document_selected', { ...fileProperties(nextFile), source }); }
    else trackEvent('document_selection_rejected', { ...fileProperties(nextFile), source, reason: 'file_validation' });
  }

  function clearFile() {
    trackEvent('document_removed', fileProperties(file));
    setFile(null); setAcceptedTerms(false); setError(''); onInvalidate(); setStatus('Document removed.');
    inputRef.current.value = ''; photoRef.current.value = ''; requestAnimationFrame(() => inputRef.current?.focus());
  }

  async function analyze(event) {
    event.preventDefault();
    if (requestRef.current || busy) return;
    if (!acceptedTerms) { setError('Accept the Terms of Service before analyzing your document.'); return; }
    const validationError = validateFile(file);
    if (validationError) { setError(validationError); trackEvent('document_review_blocked', { ...fileProperties(file), reason: 'file_validation' }); return; }
    const job = ++jobRef.current;
    const controller = new AbortController();
    requestRef.current = controller;
    const attempt = { properties: { ...fileProperties(file), context_provided: false }, started: performance.now(), finished: false };
    attemptRef.current = attempt;
    trackEvent('document_review_started', attempt.properties);
    setBusy(true); setError(''); onInvalidate(); setStatus('Reviewing your document. This may take a minute.');
    const form = new FormData();
    form.append('document', file);
    const timeout = setTimeout(() => controller.abort('timeout'), 150_000);
    let httpStatus = 0;
    try {
      const response = await fetch('/api/analyze', { method: 'POST', body: form, signal: controller.signal });
      httpStatus = response.status;
      const body = await response.json().catch(() => null);
      if (!response.ok || !body?.review) throw new Error(body?.error || 'The review service is unavailable. Please try again.');
      if (job !== jobRef.current) return;
      trackAttempt(attempt, 'document_review_succeeded', reviewCounts(body.review));
      onComplete({ review: body.review, filename: file.name, analytics: attempt.properties }); setStatus('Your document review is ready.');
    } catch (error) {
      if (job !== jobRef.current) return;
      trackAttempt(attempt, 'document_review_failed', { http_status: httpStatus, error_type: controller.signal.aborted ? 'timeout' : error instanceof TypeError ? 'network' : httpStatus >= 400 ? 'server_error' : 'invalid_response' });
      setError(controller.signal.aborted ? 'The review took too long. Try again, or upload a shorter document.' : error instanceof TypeError ? 'Could not connect. Check your connection and try again.' : error.message);
      setStatus('Review could not be completed. Your file is still selected.');
    } finally {
      clearTimeout(timeout);
      if (job === jobRef.current) { setBusy(false); requestRef.current = null; }
    }
  }

  return <>
    <form aria-label="Review a document" className={`rp-picker${file ? ' rp-picker-selected' : ''}`} onSubmit={analyze}>
      <div
        className={`rp-drop-zone${dragging ? ' rp-is-dragging' : ''}${file ? ' rp-has-file' : ''}`}
        onDragEnter={(event) => { event.preventDefault(); if (!busy) { dragCounter.current += 1; setDragging(true); } }}
        onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = busy ? 'none' : 'copy'; }}
        onDragLeave={(event) => { event.preventDefault(); dragCounter.current = Math.max(0, dragCounter.current - 1); if (!dragCounter.current) setDragging(false); }}
        onDrop={(event) => { event.preventDefault(); setDragging(false); dragCounter.current = 0; chooseFiles(event.dataTransfer.files, false, 'drop'); }}
      >
        {file && <div className="rp-selected-file">
          <FileCheck2 className="rp-file-icon" size={30} strokeWidth={1.5} aria-hidden="true" />
          <div className="rp-file-details"><h2 title={file.name}>{file.name}</h2><p>{formatFileSize(file.size)} · {busy ? 'Being reviewed' : 'Ready to review'}</p></div>
          <button className="rp-remove-file" type="button" disabled={busy} onClick={clearFile} aria-label={`Remove ${file.name}`}><X size={20} strokeWidth={1.6} aria-hidden="true" /></button>
        </div>}
        <div className="rp-empty-file" aria-hidden={Boolean(file)}><h2>Upload your document</h2><p className="rp-desktop-hint">Or drag and drop it here.</p></div>
        <div className="rp-picker-actions" inert={Boolean(file)} aria-hidden={Boolean(file)}>
          <label className={`button button-${file ? 'outline' : 'primary'} rp-file-control${busy ? ' rp-disabled' : ''}`}>
            <input ref={inputRef} type="file" accept={FILE_ACCEPT} disabled={busy} aria-label={file ? 'Choose a different file' : 'Choose a file'} aria-describedby="rp-file-help rp-upload-error" aria-invalid={Boolean(error)} onChange={(event) => chooseFiles(event.target.files)} onClick={(event) => { event.target.value = ''; }} />
            <span>{file ? 'Change file' : 'Choose a file'}</span><ArrowUpRight size={17} strokeWidth={1.6} aria-hidden="true" />
          </label>
          <label className={`button button-outline rp-file-control${busy ? ' rp-disabled' : ''}`}>
            <input ref={photoRef} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" disabled={busy} aria-label="Take or choose a photo" aria-describedby="rp-file-help rp-upload-error" aria-invalid={Boolean(error)} onChange={(event) => chooseFiles(event.target.files, true, 'camera')} onClick={(event) => { event.target.value = ''; }} />
            <Camera size={18} strokeWidth={1.6} aria-hidden="true" /><span>Take a photo</span>
          </label>
        </div>
        <p id="rp-file-help" className="rp-file-help" aria-hidden={Boolean(file)}>PDF, DOCX, TXT, JPG, PNG, WebP · <span>Up to 10 MB</span></p>
      </div>
      {!file && <p className="rp-terms-preview">Before uploading, read our <a className="text-link" href="/terms/" target="_blank" rel="noopener">Terms of Service<span className="rp-screen-reader"> (opens in a new tab)</span></a> and <a className="text-link" href="/privacy/" target="_blank" rel="noopener">Privacy Policy<span className="rp-screen-reader"> (opens in a new tab)</span></a>.</p>}
      <p id="rp-upload-error" className="rp-upload-error" role="alert" hidden={!error}><CircleAlert size={17} strokeWidth={1.6} aria-hidden="true" />{error}</p>
      {file && connection !== 'ready' && <p className="rp-connection" role="status">{connection === 'checking' ? 'Connecting to Google Gemini…' : connection === 'unconfigured' ? 'Analysis isn’t available yet. You can still choose a file.' : 'Couldn’t connect to the analysis service. Try again shortly.'}</p>}
      {file && <div className="rp-analysis-row">
        <div className="rp-terms-consent">
          <input id="rp-accept-terms" type="checkbox" checked={acceptedTerms} disabled={busy} onChange={(event) => setAcceptedTerms(event.target.checked)} required />
          <label htmlFor="rp-accept-terms">I accept the <a className="text-link" href="/terms/" target="_blank" rel="noopener">Terms of Service<span className="rp-screen-reader"> (opens in a new tab)</span></a>.</label>
        </div>
        <div className="rp-analyze-actions">
          {busy ? <button className="button button-outline" type="button" onClick={cancelReview}>Cancel review<X size={16} aria-hidden="true" /></button> : <button className="button button-primary" type="submit" disabled={!acceptedTerms || connection === 'checking' || connection === 'unconfigured'}>Analyze document<ArrowUpRight size={17} aria-hidden="true" /></button>}
        </div>
      </div>}
      {busy && <div className="rp-progress" aria-hidden="true"><LoaderCircle size={19} className="rp-spinner" />Google Gemini is analyzing your document…</div>}
      <span className="rp-screen-reader" role="status">{status}</span>
    </form>

  </>;
}

export default function ReviewPage({ hidden, onComplete, onInvalidate }) {
  const headingRef = useRef(null);
  useEffect(() => {
    if (hidden) return;
    headingRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [hidden]);
  return <main id={hidden ? undefined : 'main'} className="review-page" tabIndex={-1} hidden={hidden}>
    <div className="shell rp-workspace">
      <a href="/#home" className="rp-back"><ArrowLeft size={17} strokeWidth={1.6} aria-hidden="true" />Back to home</a>
      <div className="rp-page-heading"><h1 ref={headingRef} tabIndex={-1}>Review your document.</h1></div>
      <DocumentPicker onComplete={onComplete} onInvalidate={onInvalidate} />
    </div>
  </main>;
}

