'use client';

import { useEffect, useRef } from 'react';

/* HERO VIDEO — heavily optimised for mobile smoothness.
   - Picks exactly one source for the real viewport (no double-fetching).
   - Baseline/Main-profile re-encodes so low/mid-end phones can hardware
     decode it instead of falling back to slow software decode.
   - Pauses playback via IntersectionObserver the instant the hero scrolls
     off-screen, so the decoder stops competing with scroll/paint elsewhere
     on the page (this was the main cause of "laggy" scrolling after the
     hero — the video kept decoding forever in the background).
   - Skips autoplay entirely for prefers-reduced-motion and Data Saver /
     slow-network users; they get the static poster only.
   - No forced compositor layer (will-change/translateZ) on a full-bleed
     absolutely-positioned video — that hack forces an expensive dedicated
     layer the size of the screen and made weak GPUs worse, not better. */
export default function Hero() {
  const vidRef = useRef(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const vid = vidRef.current;
    const section = sectionRef.current;
    if (!vid || !section) return;

    const isMobile = window.innerWidth < 768;
    const src = isMobile ? '/videos/mhero-opt.mp4' : '/videos/dhero.mp4';
    const poster = isMobile ? '/images/hero-poster-mobile.jpg' : '/images/hero-poster-desktop.jpg';
    vid.poster = poster;
    vid.muted = true; // React doesn't reliably render the muted attribute; autoplay needs it

    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const conn = navigator.connection || navigator.webkitConnection || navigator.mozConnection;
    const saveData = !!(conn && (conn.saveData || /^(slow-2g|2g)$/.test(conn.effectiveType || '')));

    // Users who prefer less motion, or are explicitly saving data, get the
    // poster only — no video is ever requested.
    if (reduceMotion || saveData) return;

    let sourceEl = null;
    let attached = false;
    let destroyed = false;

    function attachSource() {
      if (attached || destroyed) return;
      attached = true;
      sourceEl = document.createElement('source');
      sourceEl.src = src;
      sourceEl.type = 'video/mp4';
      vid.appendChild(sourceEl);
      vid.load();
    }

    function tryPlay() {
      const p = vid.play();
      if (p && typeof p.then === 'function') p.catch(() => {});
    }

    // Only decode/play while the hero is actually visible. As soon as it
    // scrolls out of view, pause — this frees the decoder for the rest of
    // the page (gallery scrolling, lightboxes, etc. all feel smoother).
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            attachSource();
            tryPlay();
          } else {
            vid.pause();
          }
        }
      },
      { threshold: 0.1 }
    );
    io.observe(section);

    const onVisibility = () => {
      if (!document.hidden && section.getBoundingClientRect().top < window.innerHeight) tryPlay();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      destroyed = true;
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      if (sourceEl && sourceEl.parentNode === vid) vid.removeChild(sourceEl);
    };
  }, []);

  return (
    <section className="hero" aria-label="Hero section" ref={sectionRef}>
      <video
        id="hero-vid"
        ref={vidRef}
        loop
        muted
        playsInline
        webkit-playsinline=""
        preload="metadata"
        disablePictureInPicture
        disableRemotePlayback
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
