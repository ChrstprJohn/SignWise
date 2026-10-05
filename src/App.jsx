import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import ReviewFlow from './ReviewFlow.jsx';
import { getPath, subscribeToPath } from './navigation.js';
import InfoSections from './InfoPages.jsx';

function Header({ page }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(() => window.scrollY > 24);
  const menuButtonRef = useRef(null);
  const headerRef = useRef(null);
  useEffect(() => {
    const updateScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', updateScroll, { passive: true });
    return () => window.removeEventListener('scroll', updateScroll);
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const dismissOutside = (event) => {
      if (!headerRef.current?.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener('pointerdown', dismissOutside);
    return () => document.removeEventListener('pointerdown', dismissOutside);
  }, [menuOpen]);
  const sectionHref = (id) => page === 'home' ? `#${id}` : `/#${id}`;
  function closeMenu() {
    setMenuOpen(false);
    const button = menuButtonRef.current;
    if (button?.getClientRects().length) button.focus();
  }
  return <header ref={headerRef} className={`site-header${page === 'home' ? ' is-overlay' : ''}${page === 'home' && !scrolled && !menuOpen ? ' is-clear' : ''}`} onKeyDown={(event) => {
    if (event.key === 'Escape' && menuOpen) {
      event.stopPropagation();
      closeMenu();
    }
  }}>
    <div className="masthead shell">
      <a className="wordmark" href={sectionHref('home')} aria-label="SignWise home"><img src="/images/signwise-wordmark-v2.png" alt="SignWise" width="2173" height="724" /></a>
      <nav id="site-navigation" className={`primary-nav${menuOpen ? ' is-open' : ''}`} aria-label="Main navigation" onClick={() => { if (menuOpen) closeMenu(); }}>
        <a href={sectionHref('home')}>Home</a>
        <a href={sectionHref('how-it-works')}>How it works</a>
        <a href={sectionHref('what-we-review')}>What we do</a>
        <a href={sectionHref('testimonials')}>Testimonials</a>
        <a href={sectionHref('faqs')}>FAQs</a>
      </nav>
      <button type="button" className="nav-toggle" ref={menuButtonRef} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="site-navigation" onClick={() => setMenuOpen((open) => !open)}>
        {menuOpen ? <X size={23} strokeWidth={1.5} aria-hidden="true" /> : <Menu size={23} strokeWidth={1.5} aria-hidden="true" />}
      </button>
    </div>
  </header>;
}

function LandingPage() {
  return <main id="main" tabIndex={-1}>
    <section className="editorial-hero" id="home" aria-labelledby="hero-heading">
      <img className="hero-image" src="/images/document-desk-navy.png" alt="An agreement and fountain pen on a sunlit stone desk" width="1536" height="1024" fetchPriority="high" />
      <div className="hero-shade" aria-hidden="true" />
      <div className="hero-content shell">
        <h1 id="hero-heading">Understand what<br />you’re signing.</h1>
        <p>Spot red flags, understand the terms,<br className="desktop-break" /> and know what to ask before you sign.</p>
        <div className="hero-actions"><a href="/review/" className="button button-light">Check my document<ArrowUpRight size={18} aria-hidden="true" /></a></div>
      </div>
    </section>

    <section className="stats-section" aria-label="SignWise at a glance">
      <dl className="stats-layout shell">
        <div><dt>Total visits</dt><dd>15k+</dd></div>
        <div><dt>Document types</dt><dd>3</dd></div>
        <div><dt>Supported formats</dt><dd>6</dd></div>
      </dl>
    </section>

    <section className="how-section" id="how-it-works" aria-labelledby="how-heading">
      <div className="how-layout shell">
        <div className="how-copy">
          <h2 id="how-heading">How it works.</h2>
          <ol className="how-steps">
            <li>
              <div className="how-step-visual">
                <img className="how-step-image" src="/images/how-add-document-white.webp" alt="A phone ready to photograph an agreement" width="1536" height="1024" loading="lazy" decoding="async" />
                <span className="step-number" aria-hidden="true">01</span>
              </div>
              <div className="how-step-caption">
                <h3>Add your document.</h3>
                <p>Choose a file or take a photo.</p>
              </div>
            </li>
            <li>
              <div className="how-step-visual">
                <img className="how-step-image" src="/images/how-ai-analysis.webp" alt="A magnifying glass examining clauses in an agreement" width="1536" height="1024" loading="lazy" decoding="async" />
                <span className="step-number" aria-hidden="true">02</span>
              </div>
              <div className="how-step-caption">
                <h3>AI analyzes it.</h3>
                <p>AI checks the terms for risks, benefits, and key details.</p>
              </div>
            </li>
            <li>
              <div className="how-step-visual">
                <img className="how-step-image" src="/images/how-analysis-results.webp" alt="A tablet showing a document summary with warnings, good terms, and suggested questions" width="1536" height="1024" loading="lazy" decoding="async" />
                <span className="step-number" aria-hidden="true">03</span>
              </div>
              <div className="how-step-caption">
                <h3>Get your results.</h3>
                <p>See a clear summary, red flags, good terms, and questions to ask.</p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </section>
    <InfoSections />
  </main>;
}

function Footer() {
  return <footer className="site-footer"><div className="footer-inner shell">
    <span>© {new Date().getFullYear()} SignWise</span>
    <span className="footer-credit">Made by <strong>.dcd</strong></span>
  </div></footer>;
}

export default function App() {
  const path = useSyncExternalStore(subscribeToPath, getPath);
  const showingResults = path === '/review/results';
  const page = path === '/review' || showingResults ? 'review' : 'home';
  useEffect(() => {
    document.title = showingResults ? 'Your document review — SignWise' : page === 'review' ? 'Review a document — SignWise' : 'SignWise — Understand what you’re signing.';
  }, [page, showingResults]);
  return <>
    <a href="#main" className="skip-link" onClick={(event) => { event.preventDefault(); document.getElementById('main')?.focus(); }}>Skip to content</a>
    <Header page={page} />
    {page === 'review' ? <ReviewFlow showingResults={showingResults} /> : <LandingPage />}
    <Footer />
  </>;
}
