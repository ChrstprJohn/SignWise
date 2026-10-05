import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft, ArrowUpRight, Camera, CircleAlert, FileCheck2,
  LoaderCircle, LockKeyhole, Upload, X,
} from 'lucide-react';
import { FILE_ACCEPT, formatFileSize, validateFile } from './file-validation.js';
import './review.css';

function DocumentPicker({ onComplete, onInvalidate }) {
  const inputRef = useRef(null);
  const photoRef = useRef(null);
  const dragCounter = useRef(0);
  const requestRef = useRef(null);
  const jobRef = useRef(0);

  const [file, setFile] = useState(null);
  const [context, setContext] = useState('');
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
    return () => { clearInterval(timer); controller.abort(); requestRef.current?.abort(); jobRef.current += 1; };
  }, []);



  function cancelReview() {
    jobRef.current += 1;
    requestRef.current?.abort();
    requestRef.current = null;
    setBusy(false);
    setStatus('Review cancelled. Your file is still selected.');
  }

  function chooseFiles(files, photoOnly = false) {
    if (busy || !files?.length) return;
    if (files.length > 1) { setError('Choose one file at a time.'); return; }
    const nextFile = files[0];
    const nextError = validateFile(nextFile, { photoOnly });
    setError(nextError);
    if (!nextError) { setFile(nextFile); onInvalidate(); setStatus(`${nextFile.name} selected.`); }
  }

  function clearFile() {
    setFile(null); setError(''); onInvalidate(); setStatus('Document removed.');
    inputRef.current.value = ''; photoRef.current.value = ''; inputRef.current.focus();
  }

  async function analyze(event) {
    event.preventDefault();
    if (requestRef.current || busy) return;
    const validationError = validateFile(file);
    if (validationError) { setError(validationError); return; }
    const job = ++jobRef.current;
    const controller = new AbortController();
    requestRef.current = controller;
    setBusy(true); setError(''); onInvalidate(); setStatus('Reviewing your document. This may take a minute.');
    const form = new FormData();
    form.append('document', file); form.append('context', context.trim());
    const timeout = setTimeout(() => controller.abort('timeout'), 150_000);
    try {
      const response = await fetch('/api/analyze', { method: 'POST', body: form, signal: controller.signal });
      const body = await response.json().catch(() => null);
      if (!response.ok || !body?.review) throw new Error(body?.error || 'The review service is unavailable. Please try again.');
      if (job !== jobRef.current) return;
      onComplete({ review: body.review, filename: file.name }); setStatus('Your document review is ready.');
    } catch (error) {
      if (job !== jobRef.current) return;
      setError(controller.signal.aborted ? 'The review took too long. Try again, or upload a shorter document.' : error instanceof TypeError ? 'Could not connect. Check your connection and try again.' : error.message);
      setStatus('Review could not be completed. Your file is still selected.');
    } finally {
      clearTimeout(timeout);
      if (job === jobRef.current) { setBusy(false); requestRef.current = null; }
    }
  }

  return <>
    <form aria-label="Review a document" className="rp-picker" onSubmit={analyze}>
      <div
        className={`rp-drop-zone${dragging ? ' rp-is-dragging' : ''}${file ? ' rp-has-file' : ''}`}
        onDragEnter={(event) => { event.preventDefault(); if (!busy) { dragCounter.current += 1; setDragging(true); } }}
        onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = busy ? 'none' : 'copy'; }}
        onDragLeave={(event) => { event.preventDefault(); dragCounter.current = Math.max(0, dragCounter.current - 1); if (!dragCounter.current) setDragging(false); }}
        onDrop={(event) => { event.preventDefault(); setDragging(false); dragCounter.current = 0; chooseFiles(event.dataTransfer.files); }}
      >
        {file ? <div className="rp-selected-file">
          <FileCheck2 className="rp-file-icon" size={30} strokeWidth={1.5} aria-hidden="true" />
          <div className="rp-file-details"><h2 title={file.name}>{file.name}</h2><p>{formatFileSize(file.size)} · {busy ? 'Being reviewed' : 'Ready to review'}</p></div>
          <button className="rp-remove-file" type="button" disabled={busy} onClick={clearFile} aria-label={`Remove ${file.name}`}><X size={20} strokeWidth={1.6} aria-hidden="true" /></button>
        </div> : <div className="rp-empty-file"><Upload size={31} strokeWidth={1.5} aria-hidden="true" /><h2>Drop your document here</h2><p>Or select a file from your device.</p></div>}
        <div className="rp-picker-actions">
          <label className={`button button-${file ? 'outline' : 'primary'} rp-file-control${busy ? ' rp-disabled' : ''}`}>
            <input ref={inputRef} type="file" accept={FILE_ACCEPT} disabled={busy} aria-label={file ? 'Choose a different file' : 'Choose a file'} aria-describedby="rp-file-help rp-upload-error" aria-invalid={Boolean(error)} onChange={(event) => chooseFiles(event.target.files)} onClick={(event) => { event.target.value = ''; }} />
            <span>{file ? 'Change file' : 'Choose a file'}</span><ArrowUpRight size={17} strokeWidth={1.6} aria-hidden="true" />
          </label>
          <label className={`button button-outline rp-file-control${busy ? ' rp-disabled' : ''}`}>
            <input ref={photoRef} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" disabled={busy} aria-label="Take or choose a photo" aria-describedby="rp-file-help rp-upload-error" aria-invalid={Boolean(error)} onChange={(event) => chooseFiles(event.target.files, true)} onClick={(event) => { event.target.value = ''; }} />
            <Camera size={18} strokeWidth={1.6} aria-hidden="true" /><span>Take a photo</span>
          </label>
        </div>
        <p id="rp-file-help" className="rp-file-help">PDF, DOCX, TXT, JPG, PNG, WebP · <span>Up to 10 MB</span></p>
      </div>
      <div className="rp-context"><label htmlFor="rp-context">What should we focus on? <span>Optional</span></label>
        <textarea id="rp-context" value={context} maxLength={1000} rows={2} disabled={busy} placeholder="e.g. I’m the tenant. Check the deposit and early termination terms." onChange={(event) => { setContext(event.target.value); onInvalidate(); }} />
      </div>
      <p id="rp-upload-error" className="rp-upload-error" role="alert" hidden={!error}><CircleAlert size={17} strokeWidth={1.6} aria-hidden="true" />{error}</p>
      {connection !== 'ready' && <p className="rp-connection" role="status">{connection === 'checking' ? 'Checking the AI connection…' : connection === 'unconfigured' ? 'AI isn’t connected yet. You can select a file while it’s being set up.' : 'The AI connection is unavailable. You can try again shortly.'}</p>}
      <div className="rp-analysis-row">
        <p><LockKeyhole size={18} strokeWidth={1.6} aria-hidden="true" /><span>Only sent when you choose Analyze.<br />Gemini processes your document. SignWise doesn’t save files or reviews.</span></p>
        <div className="rp-analyze-actions">
          {busy ? <button className="button button-outline" type="button" onClick={cancelReview}>Cancel review<X size={16} aria-hidden="true" /></button> : <button className="button button-primary" type="submit" disabled={!file || connection === 'checking' || connection === 'unconfigured'}>Analyze document<ArrowUpRight size={17} aria-hidden="true" /></button>}
        </div>
      </div>
      {busy && <div className="rp-progress" aria-hidden="true"><LoaderCircle size={19} className="rp-spinner" />Reading your document and preparing your review…</div>}
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
      <div className="rp-page-heading"><h1 ref={headingRef} tabIndex={-1}>Review your document.</h1><p>Add a lease, job offer, or agreement.</p></div>
      <DocumentPicker onComplete={onComplete} onInvalidate={onInvalidate} />
    </div>
  </main>;
}

