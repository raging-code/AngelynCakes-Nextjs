'use client';

import { useState } from 'react';
import { reviews } from '../lib/data';

export default function Testimonials() {
  // Pause the auto-scrolling track while the user touches it
  const [paused, setPaused] = useState(false);

  return (
    <section className="section" id="reviews" style={{ background: 'var(--bg-alt)', paddingBottom: '3.5rem' }}>
      <div className="section-inner" style={{ marginBottom: '2.75rem' }}>
        <h2 className="section-title">Voices of<br/><em>Celebration</em></h2>
      </div>
      <div
        className="testi-outer"
        id="testi-outer"
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
        onTouchCancel={() => setPaused(false)}
      >
        <div className={'testi-track' + (paused ? ' paused' : '')} id="testi-track">
          {reviews.map((r, i) => (
            <div className="tcard" key={i} aria-hidden={r.hidden ? 'true' : undefined}>
              <div className="tcard-stars">{r.stars}</div>
              <p className="tcard-text">{r.text}</p>
              <div>
                <p className="tcard-name">{r.name}</p>
                <p className="tcard-role">{r.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
