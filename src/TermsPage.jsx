import { ArrowLeft } from 'lucide-react';

import './terms.css';



export default function TermsPage() {

  return <main id="main" className="terms-page shell" tabIndex={-1}>

    <a className="rp-back" href="/review/"><ArrowLeft size={17} aria-hidden="true" />Review a document</a>

    <h1>Terms of Service</h1>

    <p className="terms-updated">Last updated: October 9, 2026</p>

    <p>These terms explain how you may use SignWise and how your document is handled. By accepting them and choosing Analyze document, you agree to the terms below.</p>

    <section><h2>What SignWise provides</h2><p>SignWise uses AI to summarize documents, highlight potential concerns and helpful clauses, and suggest questions. Its output is for general information. It is not legal advice and does not create a lawyer-client relationship.</p></section>

    <section><h2>Your documents and permission</h2><p>Only upload documents you own or are authorized to share and process. Remove personal, confidential, or sensitive information that is not needed for your review. You remain responsible for the content you submit.</p></section>

    <section><h2>AI processing and file handling</h2><p>Choosing a file keeps it in your browser until you choose Analyze document. Analysis sends the file to the SignWise server and then to Google Gemini. SignWise does not save uploaded files or generated reviews to permanent storage. Your selected file and review stay in browser memory and may be lost when you refresh or close the page.</p><p>Google processes submitted information under its own applicable terms and data policies. Google’s retention and data use depend on the API plan and settings; SignWise’s lack of permanent storage does not mean Google retains no data. See <a href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noopener">Google’s Gemini API terms</a> for details.</p></section>

    <section><h2>Check the original document</h2><p>AI can miss important details, misunderstand a clause, or produce incorrect information and citations. Check every finding against your original document. Consult a qualified professional when you need advice about your rights, obligations, or whether to sign.</p></section>

    <section><h2>Acceptable use</h2><p>Do not use SignWise for unlawful activity, upload content you are not authorized to share, attempt to access another person’s information, or interfere with the service.</p></section>

    <section><h2>Availability and responsibility</h2><p>SignWise is provided as available, without a guarantee that analysis will be complete, accurate, or uninterrupted. You are responsible for decisions made using its output. Nothing in these terms limits rights or protections that cannot be excluded under applicable law.</p></section>

    <section><h2>Updates</h2><p>These terms may change as the service develops. The updated date above identifies the current version. Review the terms before submitting another document.</p></section>

  </main>;

}



