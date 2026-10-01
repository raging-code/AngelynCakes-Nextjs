'use client';

import { useEffect, useRef, useState } from 'react';

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const close = () => setOpen(false);
  const [hidden, setHidden] = useState(false);
  const openRef = useRef(false);

  // keep the bar visible while the mobile menu is open
  useEffect(() => {
    openRef.current = open;
    if (open) setHidden(false);
  }, [open]);

  // Esc closes the menu; growing past the hamburger breakpoint closes it too
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    const mq = window.matchMedia('(min-width: 1140px)');
    const onMq = (e) => { if (e.matches) setOpen(false); };
    document.addEventListener('keydown', onKey);
    mq.addEventListener('change', onMq);
    return () => {
      document.removeEventListener('keydown', onKey);
      mq.removeEventListener('change', onMq);
    };
  }, [open]);

  // hide on scroll down, show on scroll up (8px dead-zone avoids jitter)
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = Math.max(window.scrollY, 0);
      const diff = y - lastY;
      if (y <= 80 || openRef.current) {
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
    <nav className={'nav-root' + (hidden ? ' nav-hidden' : '')} onFocusCapture={() => setHidden(false)}>
      <div className="nav-inner">
        <a href="#" className="logo-wrap">
          <div className="logo-box" id="logo-fallback">
            {logoFailed ? (
              <span className="logo-box-fallback">A</span>
            ) : (
              <img
                src="/images/logo-sm.webp"
                alt="Angelyn's Cakes logo"
                decoding="async"
                loading="eager"
                onError={() => setLogoFailed(true)}
              />
            )}
          </div>
          <span className="logo-text">Angelyn's Cakes</span>
        </a>
        <div className="nav-links">
          <a href="#bestsellers" className="nav-link">Collection</a>
          <a href="#showroom" className="nav-link">Showroom</a>
          <a href="#about" className="nav-link">About Us</a>
          <a href="#reviews" className="nav-link">Reviews</a>
          <a href="#contact" className="btn-cta" style={{ fontSize: '0.76rem', padding: '11px 24px' }}>Book a Consultation</a>
        </div>
        <button
          className="hamburger"
          id="hamburger"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-controls="mobile-menu"
          aria-expanded={open ? 'true' : 'false'}
          onClick={() => setOpen((o) => !o)}
        >
          <span></span><span></span><span></span>
        </button>
      </div>
      <div
        className={'mobile-menu' + (open ? ' open' : '')}
        id="mobile-menu"
        aria-hidden={open ? 'false' : 'true'}
      >
        <div className="mobile-menu-inner">
          <a href="#bestsellers" className="mobile-link" onClick={close}>Collection</a>
          <a href="#showroom" className="mobile-link" onClick={close}>Showroom</a>
          <a href="#about" className="mobile-link" onClick={close}>About Us</a>
          <a href="#reviews" className="mobile-link" onClick={close}>Reviews</a>
          <div style={{ paddingTop: '1rem' }}>
            <a href="#contact" className="btn-cta" onClick={close} style={{ width: '100%', display: 'block', padding: '14px 0' }}>Book a Consultation</a>
          </div>
        </div>
      </div>
    </nav>
  );
}
