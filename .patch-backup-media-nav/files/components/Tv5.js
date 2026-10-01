'use client';

import { useRef, useState } from 'react';

export default function Tv5() {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  const start = () => {
    if (playing) return;
    setPlaying(true);
    // play() is queued for after the <video> mounts, on the next tick
    requestAnimationFrame(() => videoRef.current && videoRef.current.play().catch(() => {}));
  };

  return (
    <section className="tv5-section" id="featured-tv5" aria-label="Featured at TV5" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div className="tv5-inner">
        <div className="tv5-header" style={{ marginBottom: '1.5rem' }}>
          <div className="tv5-badge">
            <span className="tv5-badge-dot"></span>
            As Seen On
          </div>
          <h2 className="tv5-title">Featured at<br/><em>TV5</em></h2>
          <p className="tv5-subtitle">Angelyn's Cakes was featured on national television — a milestone that celebrates years of craft, dedication, and heartfelt service to every client.</p>
        </div>

        <div className="tv5-video-wrap" id="tv5-video-wrap">
          {!playing && (
            <img
              id="tv5-poster-img"
              src="/images/video-posters/feat.jpg"
              alt="Angelyn's Cakes featured on TV5"
              width={1280}
              height={720}
              loading="lazy"
              decoding="async"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block', zIndex: 1 }}
            />
          )}
          {playing && (
            <video
              ref={videoRef}
              controls
              playsInline
              preload="auto"
              poster="/images/video-posters/feat.jpg"
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                objectFit: 'cover', background: '#000', zIndex: 0,
                display: failed ? 'none' : undefined,
              }}
              onError={() => setFailed(true)}
            >
              <source src="/videos/feat.mp4" type="video/mp4" />
              <source src="/videos/feat.webm" type="video/webm" />
            </video>
          )}
          {failed && (
            <div style={{ color: '#fff', position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', zIndex: 0 }}>
              Video not available
            </div>
          )}
          <div
            className={'tv5-play-overlay' + (playing ? ' hidden' : '')}
            id="tv5-play-overlay"
            role="button"
            tabIndex={0}
            aria-label="Play TV5 feature video"
            onClick={start}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); start(); }
            }}
          >
            <div className="tv5-play-btn" aria-hidden="true"></div>
            <span className="tv5-play-label">Watch Feature</span>
          </div>
        </div>
      </div>
    </section>
  );
}
