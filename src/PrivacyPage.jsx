import { ArrowLeft } from 'lucide-react';
import './terms.css';

export default function PrivacyPage() {
  return <main id="main" className="terms-page shell" tabIndex={-1}>
    <a className="rp-back" href="/review/"><ArrowLeft size={17} aria-hidden="true" />Review a document</a>
    <h1>Privacy Policy</h1>
    <p className="terms-updated">Last updated: October 9, 2026</p>
    <p>This policy explains how SignWise handles your documents and information when you use the service.</p>
    <section><h2>Documents and reviews</h2><p>Choosing a file keeps it in your browser until you choose Analyze document. Analysis sends your document to the SignWise server and Google Gemini to generate a review. SignWise does not save uploaded documents or reviews to permanent storage. The selected file and review remain in browser memory and may be lost when you refresh or close the page. Reviews you download are saved on your device.</p></section>
    <section><h2>Google Gemini</h2><p>Google processes your document under its own terms and data policies. Retention and use depend on the API plan and settings. Unpaid services may use submitted content and responses to improve Google products and may involve human review. Paid services have different data handling terms. Review <a href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noopener">Google’s Gemini API terms</a> and <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Privacy Policy</a> before submitting sensitive information.</p></section>
    <section><h2>Usage analytics</h2><p>When configured, SignWise uses PostHog to understand visits, clicks, file selection, and review success or failure. Analytics may include browser and device information, page URLs, file type and size, processing time, and counts of findings. Custom review events do not include filenames, document text, or generated review contents. Automatic interaction text and attributes are masked, and session recording is disabled.</p><p>PostHog may use cookies and browser storage to recognize visits. Analytics is handled separately from document processing and can remain after you close the page. See <a href="https://posthog.com/privacy" target="_blank" rel="noopener">PostHog’s Privacy Policy</a> for its data handling practices.</p></section>
    <section><h2>Your choices</h2><p>Upload only documents you are authorized to share and remove unnecessary personal information. You can remove a selected file before analysis, cancel a request, or refresh or close the page to clear the current review from browser memory. Cancelling does not undo information already sent to Google. Browser controls can block analytics requests or clear cookies and site storage; clearing local storage does not delete data already received by third parties.</p></section>
    <section><h2>Updates</h2><p>This policy may change as SignWise develops. The date above identifies the current version. Read it alongside our <a href="/terms/">Terms of Service</a> before submitting a document.</p></section>
  </main>;
}
