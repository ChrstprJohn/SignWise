import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Check, CircleAlert, Download, FileText, MessageCircle, Plus, Minus } from 'lucide-react';
import { navigateTo } from './navigation.js';
import './results.css';
import { trackEvent } from './analytics.js';
import { reviewCounts } from './analytics-metadata.js';

function toggleFinding(event) {
  // Summary handles its own native toggle; don't interrupt links or text selection.
  if (event.target.closest('summary, a, button, input') || window.getSelection()?.toString()) return;
  const finding = event.currentTarget.querySelector('.result-finding');
  if (finding) finding.open = !finding.open;
}

function FindingList({ items }) {
  return <ul className="result-findings">{items.map((item, index) => <li key={index} onClick={toggleFinding}>
    <details className="result-finding" name="review-findings">
    <summary>
    <div className="result-finding-title"><h3>{item.title}</h3></div>
    <span className="result-finding-preview">{item.explanation}</span>
    <span className="result-finding-toggle"><span className="result-show-more">Show more</span><span className="result-show-less">Show less</span><span className="result-accordion-icon" aria-hidden="true"><Plus className="result-plus" size={20} /><Minus className="result-minus" size={20} /></span></span>
    </summary>
    <dl className="result-finding-detail">
      {(item.quote || item.location) && <div><dt>Term</dt><dd>{item.quote}{item.location && <small className="result-term-source">{item.location}</small>}</dd></div>}
      <div className="result-verdict"><dt>Verdict</dt><dd>{item.explanation}</dd></div>
    </dl>
    </details>
  </li>)}</ul>;
}

function ReviewMap({ review }) {
  const groups = [
    { id: 'red-flags', label: 'Red flags', count: review.redFlags.length, note: 'Concerns to review', tone: 'concerns' },
    { id: 'good-terms', label: 'Good terms', count: review.goodTerms.length, note: 'Helpful clauses', tone: 'benefits' },
    { id: 'follow-up', label: 'Questions to ask', mobileLabel: 'Questions', count: review.questions.length, note: 'Points to clarify', tone: 'questions' },
  ];
  return <nav className="result-count-cards" aria-label="Review summary">{groups.map(group => <a key={group.id} href={`#${group.id}`} className={`result-count-card result-count-${group.tone}`}>
    <span>{group.mobileLabel ? <><span className="result-desktop-label">{group.label}</span><span className="result-mobile-label">{group.mobileLabel}</span></> : group.label}</span><strong>{group.count}</strong><small>{group.note}</small>
  </a>)}</nav>;
}
export default function ResultsPage({ report }) {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const titleRef = useRef(null);
  const trackedReport = useRef(undefined);
  useEffect(() => {
    if (trackedReport.current === report) return;
    trackedReport.current = report;
    trackEvent('review_results_viewed', { report_available: Boolean(report), ...report?.analytics, ...(report ? reviewCounts(report.review) : {}) });
  }, [report]);
  useEffect(() => { titleRef.current?.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'instant' }); }, []);

  async function downloadReview() {
    if (saving) return;
    setSaving(true); setSaveError('');
    const properties = { ...report.analytics, ...reviewCounts(report.review) };
    trackEvent('review_download_requested', properties);
    try {
      const { createReviewPdf } = await import('./review-pdf.js');
      const pdf = await createReviewPdf(report);
      pdf.save('signwise-review.pdf');
      trackEvent('review_download_started', properties);
    } catch { trackEvent('review_download_failed', { ...properties, error_type: 'export' }); setSaveError('Could not save the PDF. Try again.'); }
    finally { setSaving(false); }
  }

  if (!report) return <main id="main" className="results-page" tabIndex={-1}>
    <div className="shell results-workspace result-empty-page">
      <a className="rp-back" href="/" onClick={(event) => navigateTo('/', event)}><ArrowLeft size={17} aria-hidden="true" /><span className="rp-back-desktop">Back to home</span><span className="rp-back-mobile">Back</span></a>
      <h1 ref={titleRef} tabIndex={-1}>Start with a document.</h1>
      <p>This review is no longer available. Upload your document to create a new one.</p>
      <a className="button button-primary" href="/review/" onClick={(event) => navigateTo('/review/', event)}>Review a document<ArrowUpRight size={17} aria-hidden="true" /></a>
    </div>
  </main>;

  const { review, filename } = report;
  return <main id="main" className="results-page" tabIndex={-1}>
    <div className="shell results-workspace">
      <div className="result-toolbar">
        <a className="rp-back" href="/" onClick={(event) => navigateTo('/', event)}><ArrowLeft size={17} aria-hidden="true" /><span className="rp-back-desktop">Back to home</span><span className="rp-back-mobile">Back</span></a>
        <button className="result-save" type="button" onClick={downloadReview} disabled={saving}><Download size={16} aria-hidden="true" />{saving ? 'Creating PDF…' : <><span className="result-desktop-label">Save as PDF</span><span className="result-mobile-label">Save PDF</span></>}</button>
      </div>
      {saveError && <p className="result-export-error" role="alert">{saveError}</p>}
      <div className="result-summary-grid">
      <header className="result-heading">
        <h1 ref={titleRef} tabIndex={-1}>Document review</h1>
        <p><FileText size={17} strokeWidth={1.5} aria-hidden="true" /><span>{filename}</span></p>
      </header>
      <ReviewMap review={review} />
      </div>

      <div className="result-columns">
      <section id="red-flags" className="result-section result-concerns" aria-labelledby="red-flags-heading">
        <div className="result-section-heading"><CircleAlert size={23} strokeWidth={1.5} aria-hidden="true" /><h2 id="red-flags-heading">Red flags</h2><span>{review.redFlags.length}</span></div>
        {review.redFlags.length ? <FindingList items={review.redFlags} /> : <p className="result-empty">No specific red flags identified. Check the original before signing.</p>}
      </section>
      <section id="good-terms" className="result-section result-benefits" aria-labelledby="good-terms-heading">
        <div className="result-section-heading"><Check size={23} strokeWidth={1.5} aria-hidden="true" /><h2 id="good-terms-heading">Good terms</h2><span>{review.goodTerms.length}</span></div>
        {review.goodTerms.length ? <FindingList items={review.goodTerms} /> : <p className="result-empty">No clearly favorable terms identified.</p>}
      </section>
      <section id="follow-up" className="result-section" aria-labelledby="follow-up-heading">
        <div className="result-section-heading"><MessageCircle size={23} strokeWidth={1.5} aria-hidden="true" /><h2 id="follow-up-heading">Questions to ask</h2><span>{review.questions.length}</span></div>
        {review.questions.length ? <ol className="result-questions">{review.questions.map((item, index) => <li key={index} onClick={toggleFinding}>
          <details className="result-finding" name="review-findings">
            <summary>
              <div className="result-finding-title"><h3>{item.question}</h3></div>
              <span className="result-finding-preview">{item.why}</span>
              <span className="result-finding-toggle"><span className="result-show-more">Show more</span><span className="result-show-less">Show less</span><span className="result-accordion-icon" aria-hidden="true"><Plus className="result-plus" size={20} /><Minus className="result-minus" size={20} /></span></span>
            </summary>
            <dl className="result-finding-detail"><div><dt>Question</dt><dd>{item.question}</dd></div><div><dt>{item.kind === 'missing' ? 'Missing detail' : 'Unclear wording'}</dt><dd>{item.why}</dd></div></dl>
          </details>
        </li>)}</ol> : <p className="result-empty">No missing or unclear details identified for follow-up.</p>}
      </section>

      </div>
      <p className="result-disclaimer">AI can miss details. Check the original; this isn’t legal advice.</p>
    </div>
  </main>;
}


