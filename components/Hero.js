'use client';

import { useEffect, useRef } from 'react';

/* HERO VIDEO (video starts after window load)
   - Poster <img> is in the server-rendered HTML, so the hero paints immediately.
   - A tiny inline script (below) starts the right video BEFORE React hydrates.
   - Mobile uses a 30 fps re-encode; desktop uses dhero.mp4.
   - Playback pauses when the hero is off-screen or the tab is hidden.
   - Reduced-motion / Data Saver / 2G users get the poster only. */
const EARLY = "(function(){try{var v=document.getElementById('hero-vid');if(!v)return;v.muted=true;v.poster=window.matchMedia('(min-width: 768px)').matches?'/images/hero-poster-desktop.jpg':'/images/hero-poster-mobile.jpg';}catch(e){}})();";

/* Visually hidden brand lead-in for the <h1> (crawlers + screen readers read it; layout is unchanged). */
const HERO_BRAND = { position: 'absolute', width: 1, height: 1, margin: -1, padding: 0, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap', border: 0 };

export default function Hero() {
  const vidRef = useRef(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const vid = vidRef.current;
    const section = sectionRef.current;
    if (!vid || !section) return;
    vid.muted = true;

    // Poster-only for Data Saver / 2G / reduced motion
    const c = navigator.connection || navigator.webkitConnection || navigator.mozConnection;
    if (c && (c.saveData || /^(slow-2g|2g)$/.test(c.effectiveType || ''))) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let inView = true;
    let io = null;
    let timer = 0;
    let cancelled = false;
    const tryPlay = () => { const p = vid.play(); if (p && p.catch) p.catch(() => {}); };
    const sync = () => { if (inView && !document.hidden) tryPlay(); else vid.pause(); };

    // Start the video after window load, so its ~1MB download never competes with
    // the poster / JS / CSS that decide LCP.
    const start = () => {
      if (cancelled) return;
      vid.src = window.matchMedia('(min-width: 768px)').matches ? '/videos/dhero.mp4' : '/videos/mhero-30.mp4';
      io = new IntersectionObserver((entries) => {
        for (const e of entries) inView = e.isIntersecting;
        sync();
      }, { threshold: 0.1 });
      io.observe(section);
      document.addEventListener('visibilitychange', sync);
      sync();
    };
    const schedule = () => { timer = window.setTimeout(start, 300); };
    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.removeEventListener('load', schedule);
      if (io) io.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  return (
    <section className="hero" aria-label="Hero section" ref={sectionRef}>
      <picture>
        <source media="(min-width: 768px)" srcSet="/images/hero-poster-desktop.jpg" />
        <img className="hero-poster" src="/images/hero-poster-mobile.jpg" alt="" aria-hidden="true" fetchPriority="high" decoding="async" />
      </picture>
      <video
        id="hero-vid"
        ref={vidRef}
        autoPlay
        loop
        muted
        playsInline
        webkit-playsinline=""
        preload="none"
        disablePictureInPicture
        disableRemotePlayback
        aria-hidden="true"
        suppressHydrationWarning
      ></video>
      <script dangerouslySetInnerHTML={{ __html: EARLY }} />
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <h1 className="hero-headline"><span style={HERO_BRAND}>Angelyn's Cakes: custom cakes in Manila. </span>Cakes that<br/><em>command</em><br/>attention.</h1>
        <div className="hero-btns">
          <a href="#showroom" className="btn-cta" style={{ fontSize: '0.82rem', padding: '15px 30px' }}>Book a Consultation</a>
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
