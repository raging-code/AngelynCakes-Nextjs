'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/*
 * Full-screen photo viewer. Uses the exact same markup and CSS classes as the
 * "Our Works" lightbox in Gallery.js, so both look and behave identically:
 * Esc / arrow keys, swipe, backdrop click, page-scroll lock.
 *
 * photo = { items: [{ name, src }], index, series } | null
 */
export default function PhotoLightbox({ photo, onClose, onStep, idPrefix = 'photo' }) {
  const [mounted, setMounted] = useState(false);
  const touchX = useRef(0);
  const open = !!photo;
  const cur = photo ? photo.items[photo.index] : null;

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onStep(1);
      if (e.key === 'ArrowLeft') onStep(-1);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, onStep]);

  /* warm the cache for the neighbouring photos so arrows feel instant */
  useEffect(() => {
    if (!photo) return;
    const n = photo.items.length;
    [1, -1].forEach((d) => {
      const it = photo.items[(photo.index + d + n) % n];
      if (it) new Image().src = it.src;
    });
  }, [photo]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={'lightbox' + (open ? ' open' : '')}
      id={idPrefix + '-lightbox'}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onTouchStart={(e) => { touchX.current = e.changedTouches[0].screenX; }}
      onTouchEnd={(e) => {
        const x = e.changedTouches[0].screenX;
        if (Math.abs(x - touchX.current) > 50) onStep(x < touchX.current ? 1 : -1);
      }}
    >
      <div className="lb-img-wrap">
        <img id={idPrefix + '-lb-img'} src={cur ? cur.src : undefined} alt={cur ? cur.name : ''} />
        <button className="lb-close" aria-label="Close" onClick={onClose}>✕</button>
        <button className="lb-nav lb-prev" aria-label="Previous photo" onClick={() => onStep(-1)}>‹</button>
        <button className="lb-nav lb-next" aria-label="Next photo" onClick={() => onStep(1)}>›</button>
      </div>
      <div className="lb-info">
        <p className="lb-info-name">{cur ? cur.name : ''}</p>
        <p className="lb-info-sub">{photo ? photo.series : ''}</p>
      </div>
    </div>,
    document.body
  );
}