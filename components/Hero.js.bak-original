'use client';

import { useEffect, useRef } from 'react';

/* HERO VIDEO — optimised (ported from index.html)
   One <video> in the DOM. The source is chosen from the real viewport
   width so only ONE file is ever fetched. The dark background-color
   (#2E1510) is the instant placeholder, and the poster shows until the
   video plays. */
export default function Hero() {
  const vidRef = useRef(null);

  useEffect(() => {
    const vid = vidRef.current;
    if (!vid) return;

    const isMobile = window.innerWidth < 768;
    const src = isMobile ? '/videos/mhero-opt.mp4' : '/videos/dhero.mp4';
    const poster = isMobile ? '/images/hero-poster-mobile.jpg' : '/images/hero-poster-desktop.jpg';

    vid.poster = poster;
    vid.muted = true; // React doesn't reliably render the muted attribute; autoplay needs it

    const source = document.createElement('source');
    source.src = src;
    source.type = 'video/mp4';
    vid.appendChild(source);

    const playPromise = vid.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.catch(() => {
        // Autoplay blocked (e.g. Low Power Mode on iOS) — poster stays visible
      });
    }

    const onVisible = () => {
      if (!document.hidden) vid.play().catch(() => {});
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      if (source.parentNode === vid) vid.removeChild(source);
    };
  }, []);

  return (
    <section className="hero" aria-label="Hero section">
      <video
        id="hero-vid"
        ref={vidRef}
        autoPlay
        loop
        muted
        playsInline
        webkit-playsinline=""
        preload="auto"
        style={{ backgroundColor: '#2E1510' }}
        aria-hidden="true"
      ></video>
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <h1 className="hero-headline">Cakes that<br/><em>command</em><br/>attention.</h1>
        <div className="hero-btns">
          <a href="#contact" className="btn-cta" style={{ fontSize: '0.82rem', padding: '15px 30px' }}>Book a Consultation</a>
          <a
            href="#bestsellers"
            className="btn-ghost"
            style={{ fontSize: '0.82rem', padding: '15px 30px', color: '#fff', borderColor: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.08)' }}
          >See the Collection →</a>
        </div>
      </div>
    </section>
  );
}
