import { useEffect, useRef } from 'react';
import { ArrowLeft, ArrowUpRight, Check, CircleAlert, Download, FileText, MessageCircle } from 'lucide-react';
import { navigateTo } from './navigation.js';
import { formatReviewText } from './review-export.js';
import './results.css';
import { trackEvent } from './analytics.js';
import { reviewCounts } from './analytics-metadata.js';

function Clause({ quote, location }) {
  if (!quote && !location) return null;
  return <details className="result-clause">
    <summary>View clause{location && <span> · {location}</span>}</summary>
    {quote ? <blockquote>{quote}</blockquote> : <p>See {location} in the original document.</p>}
  </details>;
}

function FindingList({ items, concerns = false }) {
  return <ul className="result-findings">{items.map((item, index) => <li key={index}>
    <div className="result-finding-title"><h3>{item.title}</h3>{concerns && <span className={`result-priority result-priority-${item.severity}`}>{item.severity} priority</span>}</div>
    <p>{item.explanation}</p>
    <Clause quote={item.quote} location={item.location} />
  </li>)}</ul>;
}

export default function ResultsPage({ report }) {
  const titleRef = useRef(null);
  const trackedReport = useRef(undefined);
  useEffect(() => {
    if (trackedReport.current === report) return;
    trackedReport.current = report;
    trackEvent('review_results_viewed', { report_available: Boolean(report), ...report?.analytics, ...(report ? reviewCounts(report.review) : {}) });
  }, [report]);
  useEffect(() => { titleRef.current?.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'instant' }); }, []);

  function downloadReview() {
    const properties = { ...report.analytics, ...reviewCounts(report.review) };
    trackEvent('review_download_requested', properties);
    try {
      const url = URL.createObjectURL(new Blob([formatReviewText(report)], { type: 'text/plain;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url; link.download = 'signwise-review.txt';
      document.body.appendChild(link); link.click(); link.remove();
      trackEvent('review_download_started', properties);
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch (error) { trackEvent('review_download_failed', { ...properties, error_type: 'export' }); throw error; }
  }

  if (!report) return <main id="main" className="results-page" tabIndex={-1}>
    <div className="shell results-workspace result-empty-page">
      <a className="rp-back" href="/review/" onClick={(event) => navigateTo('/review/', event)}><ArrowLeft size={17} aria-hidden="true" />Back to upload</a>
      <h1 ref={titleRef} tabIndex={-1}>Start with a document.</h1>
      <p>This review is no longer available. Upload your document to create a new one.</p>
      <a className="button button-primary" href="/review/" onClick={(event) => navigateTo('/review/', event)}>Review a document<ArrowUpRight size={17} aria-hidden="true" /></a>
    </div>
  </main>;

  const { review, filename } = report;
  return <main id="main" className="results-page" tabIndex={-1}>
    <div className="shell results-workspace">
      <div className="result-toolbar">
        <a className="rp-back" href="/review/" onClick={(event) => navigateTo('/review/', event)}><ArrowLeft size={17} aria-hidden="true" />Back to upload</a>
        <button className="result-save" type="button" onClick={downloadReview}><Download size={16} aria-hidden="true" />Save review</button>
      </div>
      <header className="result-heading">
        <h1 ref={titleRef} tabIndex={-1}>Your document review.</h1>
        <p><FileText size={17} strokeWidth={1.5} aria-hidden="true" /><span>{filename}<span className="result-document-type">{review.documentType}</span></span></p>
      </header>
      <nav className="result-jump-nav" aria-label="Review sections">
        <a href="#red-flags">Red flags<span>{review.redFlags.length}</span></a>
        <a href="#good-terms">Good terms<span>{review.goodTerms.length}</span></a>
        <a href="#follow-up">Follow-up<span>{review.questions.length}</span></a>
      </nav>

      <section id="red-flags" className="result-section result-concerns" aria-labelledby="red-flags-heading">
        <div className="result-section-heading"><CircleAlert size={23} strokeWidth={1.5} aria-hidden="true" /><h2 id="red-flags-heading">Red flags</h2><span>{review.redFlags.length}</span></div>
        {review.redFlags.length ? <FindingList items={review.redFlags} concerns /> : <p className="result-empty">No specific red flags identified. Check the original before signing.</p>}
      </section>
      <section id="good-terms" className="result-section" aria-labelledby="good-terms-heading">
        <div className="result-section-heading"><Check size={23} strokeWidth={1.5} aria-hidden="true" /><h2 id="good-terms-heading">Good terms</h2><span>{review.goodTerms.length}</span></div>
        {review.goodTerms.length ? <FindingList items={review.goodTerms} /> : <p className="result-empty">No clearly favorable terms identified.</p>}
      </section>
      <section id="follow-up" className="result-section" aria-labelledby="follow-up-heading">
        <div className="result-section-heading"><MessageCircle size={23} strokeWidth={1.5} aria-hidden="true" /><h2 id="follow-up-heading">Follow-up questions</h2><span>{review.questions.length}</span></div>
        {review.questions.length ? <ol className="result-questions">{review.questions.map((item, index) => <li key={index}>
          <span className="result-question-kind">{item.kind === 'missing' ? 'Missing detail' : 'Unclear wording'}</span>
          <h3>{item.question}</h3><p>{item.why}</p>
        </li>)}</ol> : <p className="result-empty">No missing or unclear details identified for follow-up.</p>}
      </section>

      <details className="result-overview">
        <summary>Document overview</summary>
        <div className="result-overview-content"><p>{review.summary}</p>
          {review.keyTerms.length > 0 && <dl>{review.keyTerms.map((term, index) => <div key={index}><dt>{term.name}</dt><dd>{term.value}{term.source && <small>{term.source}</small>}</dd></div>)}</dl>}
          {review.limitations.length > 0 && <div className="result-limitations"><h3>Review limits</h3><ul>{review.limitations.map((item, index) => <li key={index}>{item}</li>)}</ul></div>}
        </div>
      </details>
      <p className="result-disclaimer">AI can miss details. Check the original; this isn’t legal advice.</p>
    </div>
  </main>;
}
