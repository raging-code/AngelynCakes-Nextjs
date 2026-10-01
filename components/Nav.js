'use client';

import { useState } from 'react';

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const close = () => setOpen(false);

  return (
    <nav className="nav-root">
      <div className="nav-inner">
        <a href="#" className="logo-wrap">
          <div className="logo-box" id="logo-fallback">
            {logoFailed ? (
              <span className="logo-box-fallback">A</span>
            ) : (
              <img
                src="/images/logo.webp"
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
          aria-label="Open menu"
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
