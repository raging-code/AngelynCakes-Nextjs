'use client';

import { useCallback, useState } from 'react';
import { bestsellers } from '../lib/data';
import PhotoLightbox from './PhotoLightbox';

const thumb = (s) => s.replace(/\/([^/]+)$/, '/thumbs/$1');

/* lightbox wants { name, src } — same shape the "Our Works" photos use */
const items = bestsellers.map((c) => ({ name: c.alt, src: c.src }));

function CakeCard({ src, alt, onOpen }) {
  const [tapped, setTapped] = useState(false);
  return (
    <div
      className={'cake-card' + (tapped ? ' tapped' : '')}
      role="button"
      tabIndex={0}
      aria-label={'View ' + alt + ' full screen'}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); }
      }}
      onTouchStart={() => setTapped(true)}
      onTouchEnd={() => setTimeout(() => setTapped(false), 600)}
    >
      <img src={thumb(src)} alt={'Custom celebration cake ' + alt + " by Angelyn's Cakes, Manila"} loading="lazy" decoding="async" />
      <div className="cake-name-bar"><p>{alt}</p></div>
    </div>
  );
}

export default function Bestsellers() {
  const [photo, setPhoto] = useState(null); // { items, index, series }

  const open = (index) => setPhoto({ items, index, series: 'Signature Pieces' });
  const close = useCallback(() => setPhoto(null), []);
  const step = useCallback(
    (d) => setPhoto((p) => p && ({ ...p, index: (p.index + d + p.items.length) % p.items.length })),
    []
  );

  return (
    <section className="section" id="bestsellers" style={{ background: 'var(--bg)' }}>
      <div className="section-inner">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '2.75rem' }}>
          <h2 className="section-title">Signature<br/><em>Pieces</em></h2>
        </div>
        <div className="cake-grid">
          {bestsellers.map((c, i) => (
            <CakeCard key={c.src} src={c.src} alt={c.alt} onOpen={() => open(i)} />
          ))}
        </div>
        <div style={{ marginTop: '2.75rem', textAlign: 'center' }}>
          <a href="#contact" className="btn-ghost" style={{ fontSize: '0.8rem', padding: '14px 32px' }}>Commission a Custom Cake →</a>
        </div>
      </div>

      <PhotoLightbox photo={photo} onClose={close} onStep={step} idPrefix="best" />
    </section>
  );
}