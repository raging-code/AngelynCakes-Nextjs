'use client';

import { useEffect, useState } from 'react';

/* Top bar for the /faq page: logo + a clear way back to the main site.
   Hides on scroll down and shows on scroll up, using the same logic and
   the same .nav-hidden transition as the main-page Nav. */
export default function FaqNav() {
  const [hidden, setHidden] = useState(false);

  // hide on scroll down, show on scroll up (8px dead-zone avoids jitter)
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = Math.max(window.scrollY, 0);
      const diff = y - lastY;
      if (y <= 80) {
        setHidden(false);
        lastY = y;
      } else if (diff > 8) {
        setHidden(true);
        lastY = y;
      } else if (diff < -8) {
        setHidden(false);
        lastY = y;
      }
    };
    const onScroll = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={'nav-root' + (hidden ? ' nav-hidden' : '')}
      aria-label="Main"
      onFocusCapture={() => setHidden(false)}
    >
      <div className="nav-inner">
        <a href="/" className="logo-wrap">
          <div className="logo-box">
            <img src="/images/logo-sm.webp" alt="Angelyn's Cakes logo" decoding="async" loading="eager" />
          </div>
          <span className="logo-text">Angelyn's Cakes</span>
        </a>
        <a href="/" className="btn-ghost fq-back">
          <span aria-hidden="true">←</span>
          <span className="fq-long">Back to Angelyn's Cakes</span>
          <span className="fq-short">Back</span>
        </a>
      </div>
    </nav>
  );
}
