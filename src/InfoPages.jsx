import { ArrowUpRight, CircleAlert, MessageCircle, Minus, Plus, ShieldCheck, Star } from 'lucide-react'
import './info-pages.css'

const coverage = [
  {
    title: 'Spot red flags',
    icon: CircleAlert,
    description: 'Hidden fees, one-sided clauses, and obligations you may not expect.',
  },
  {
    title: 'Explain good terms',
    icon: ShieldCheck,
    description: 'Protections, fair conditions, and terms that work in your favor.',
  },
  {
    title: 'Suggest questions',
    icon: MessageCircle,
    description: 'Specific points to clarify before you commit.',
  },
]

const essentials = [
  {
    question: 'Can I analyze a document now?',
    answer: 'Choose a file or photo, then select Analyze document. Your results open on a new page: red flags, good terms, and questions about missing or unclear details.',
  },
  {
    question: 'Which files are supported?',
    answer: 'PDF, DOCX, TXT, JPG, PNG, and WebP, up to 10 MB. On supported phones, you can take a photo.',
  },
  {
    question: 'Where does my file go?',
    answer: 'When you select Analyze document, your document or photo is sent through SignWise to Google Gemini for analysis. SignWise doesn’t save files or reviews. Google’s handling depends on the API plan and settings.',
  },
  {
    question: 'Is this legal advice?',
    answer: 'No. SignWise is for understanding documents. Consult a qualified lawyer for legal advice.',
  },
]

const testimonials = [
  { name: 'Maya R.', comment: 'The renewal clause was easy to miss. Seeing it clearly helped me ask the right question.' },
  { name: 'Daniel K.', comment: 'A straightforward way to understand the terms before making a decision.' },
  { name: 'Alex P.', comment: 'The questions to ask were the most useful part. Clear, practical, and easy to follow.' },
  { name: 'Sofia M.', comment: 'I could see the good terms alongside the risks. That made the agreement easier to understand.' },
]

function Testimonials() {
  return <section id="testimonials" className="testimonials-section" aria-labelledby="testimonials-heading">
    <div className="shell testimonials-heading">
      <h2 id="testimonials-heading">Testimonials.</h2>
    </div>
    <div className="testimonials-marquee">
      <div className="testimonials-track">
        {[false, true].map(duplicate => <ul className="testimonials-group" key={String(duplicate)} aria-hidden={duplicate || undefined}>
          {testimonials.map(({ name, comment }) => <li className="testimonial" key={name}>
            <div className="testimonial-stars" role="img" aria-label="5 out of 5 stars">{Array.from({length: 5}, (_, index) => <Star key={index} size={15} fill="currentColor" strokeWidth={1} aria-hidden="true" />)}</div>
            <blockquote><p>{comment}</p></blockquote><span className="testimonial-name">{name}</span>
          </li>)}
        </ul>)}
      </div>
    </div>
  </section>
}

export default function InfoSections() {
  return <>
    <section id="what-we-review" className="ip-section" aria-labelledby="coverage-heading">
      <div className="shell ip-coverage-layout">
        <header className="ip-intro">
          <h2 id="coverage-heading">What we do.</h2>
          <p>For leases, job offers, and contracts.</p>
        </header>
          <dl className="ip-coverage">
            {coverage.map(({ title, description, icon: CoverageIcon }) => (
              <div className="ip-coverage-row" key={title}>
                <dt><CoverageIcon size={25} strokeWidth={1.5} aria-hidden="true" />{title}</dt>
                <dd>{description}</dd>
              </div>
            ))}
          </dl>
      </div>
    </section>
    <Testimonials />
    <section id="faqs" className="ip-section ip-faq-section" aria-labelledby="faqs-heading">
      <div className="shell ip-faq-layout">
        <header className="ip-intro"><h2 id="faqs-heading">Before you upload.</h2></header>
          <div className="ip-essentials">
            {essentials.map(({ question, answer }) => (
              <details className="ip-disclosure" key={question}>
                <summary>
                  <span>{question}</span>
                  <span className="ip-disclosure-icon" aria-hidden="true">
                    <Plus className="ip-plus" size={18} strokeWidth={1.5} />
                    <Minus className="ip-minus" size={18} strokeWidth={1.5} />
                  </span>
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
      </div>
    </section>
    <section className="closing-cta" aria-labelledby="closing-cta-heading">
      <div className="shell closing-cta-layout">
        <div>
          <h2 id="closing-cta-heading">Ready to understand your document?</h2>
          <p>Start with a file or photo.</p>
        </div>
        <a href="/review/" className="button button-light">Check my document<ArrowUpRight size={18} aria-hidden="true" /></a>
      </div>
    </section>
  </>
}
