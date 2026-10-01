'use client';
import { useEffect, useState } from 'react';

type Props = { src: string; poster: string; className?: string };

/**
 * Poster <img> is server-rendered => browser discovers the LCP image from the HTML immediately
 * (fixes "LCP request discovery"). The 900KB video loads only AFTER window load, only on
 * desktop-width screens, and never for reduced-motion / Save-Data / 2G users.
 * Parent should be position:relative with a set height (e.g. h-screen).
 */
export default function HeroVideo({ src, poster, className }: Props) {
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const conn = (navigator as any).connection;
    const saveData = conn?.saveData || /(^|-)2g$/.test(conn?.effectiveType || '');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const wide = window.matchMedia('(min-width: 768px)').matches;
    if (saveData || reduce || !wide) return;
    const start = () => setTimeout(() => setPlay(true), 150);
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    return () => window.removeEventListener('load', start);
  }, []);

  const fill: React.CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' };

  return (
    <div className={className} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={poster} alt="" fetchPriority="high" decoding="async" style={fill} />
      {play && (
        <video src={src} poster={poster} autoPlay muted loop playsInline preload="auto" tabIndex={-1} style={fill}>
          <track kind="captions" src="/captions-empty.vtt" srcLang="en" label="No dialogue" />
        </video>
      )}
    </div>
  );
}
