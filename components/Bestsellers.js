'use client';

import { useState } from 'react';
import { bestsellers } from '../lib/data';

function CakeCard({ src, alt }) {
  const [tapped, setTapped] = useState(false);
  return (
    <div
      className={'cake-card' + (tapped ? ' tapped' : '')}
      onTouchStart={() => setTapped(true)}
      onTouchEnd={() => setTimeout(() => setTapped(false), 600)}
    >
      <img src={src} alt={alt} loading="lazy" decoding="async" />
      <div className="cake-name-bar"><p>{alt}</p></div>
    </div>
  );
}

export default function Bestsellers() {
  return (
    <section className="section" id="bestsellers" style={{ background: 'var(--bg)' }}>
      <div className="section-inner">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '2.75rem' }}>
          <h2 className="section-title">Signature<br/><em>Pieces</em></h2>
        </div>
        <div className="cake-grid">
          {bestsellers.map((c) => (
            <CakeCard key={c.src} src={c.src} alt={c.alt} />
          ))}
        </div>
        <div style={{ marginTop: '2.75rem', textAlign: 'center' }}>
          <a href="#contact" className="btn-ghost" style={{ fontSize: '0.8rem', padding: '14px 32px' }}>Commission a Custom Cake →</a>
        </div>
      </div>
    </section>
  );
}
