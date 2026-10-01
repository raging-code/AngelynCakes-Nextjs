'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { portrait, tall } from '../lib/data';

const MAX_VIDEOS = 19;
const MOBILE_LIMIT = 4;
const thumb = (s) => s.replace(/\/([^/]+)$/, '/thumbs/$1');

/* One "Our Works" photo grid with its Show all / Show less buttons */
function PhotoGrid({ items, gridClass, imgClass, seriesKey, seriesLabel, mobile, expanded, onToggle, onOpen }) {
  const total = items.length;
  const limited = mobile && total > MOBILE_LIMIT;
  const collapsed = limited && !expanded;
  const lessVisible = limited && expanded;

  return (
    <div
      className={'grid-wrapper' + (collapsed ? ' collapsed' : '')}
      data-mobile-limit={MOBILE_LIMIT}
      data-series={seriesKey}
    >
      <div className={gridClass}>
        {items.map((it, i) => (
          <div
            className="gcard"
            data-name={it.name}
            data-series={seriesLabel}
            key={it.name}
            role="button"
            tabIndex={0}
            aria-label={'View ' + it.name + ' full screen'}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(items, i, seriesLabel); }
            }}
            onClick={() => onOpen(items, i, seriesLabel)}
          >
            <img
              className={imgClass}
              src={thumb(it.src)}
              alt={it.name}
              loading="lazy"
              decoding="async"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            />
          </div>
        ))}
      </div>
      <button
        className={'show-more-btn' + (collapsed ? ' visible' : '')}
        type="button"
        onClick={() => onToggle(seriesKey, true)}
      >
        {limited ? 'Show all ' + total + ' photos' : 'Show all photos'}
      </button>
      <button
        className={'show-less-btn' + (lessVisible ? ' visible' : '')}
        type="button"
        onClick={() => onToggle(seriesKey, false)}
      >
        Show less
      </button>
    </div>
  );
}

export default function Gallery() {
  const [mounted, setMounted] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [expanded, setExpanded] = useState({ portrait: false, tall: false });
  const [photo, setPhoto] = useState(null); // { items, index, series }
  const [video, setVideo] = useState({ open: false, index: 0 });

  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const sectionRef = useRef(null);
  const playerRef = useRef(null);
  const photoTouchX = useRef(0);
  const videoTouchX = useRef(0);

  useEffect(() => { setMounted(true); }, []);

  /* ─── Show more / show less: mobile detection ───
     matchMedia fires only when the 767px breakpoint is really crossed. A window
     "resize" listener also fires when a phone's address bar hides while
     scrolling, which used to collapse a grid the visitor had just expanded. */
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setMobile(mq.matches);
    const onChange = (e) => {
      setMobile(e.matches);
      setExpanded({ portrait: false, tall: false });
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggleExpanded = (key, value) => setExpanded((s) => ({ ...s, [key]: value }));

  /* ─── Photo lightbox ─── */
  const openPhoto = useCallback((items, index, series) => setPhoto({ items, index, series }), []);
  const closePhoto = useCallback(() => setPhoto(null), []);
  const stepPhoto = useCallback((d) => setPhoto((p) => p && ({ ...p, index: (p.index + d + p.items.length) % p.items.length })), []);

  useEffect(() => {
    if (!photo) return;
    const onKey = (e) => {
      if (e.key === 'Escape') closePhoto();
      if (e.key === 'ArrowRight') stepPhoto(1);
      if (e.key === 'ArrowLeft') stepPhoto(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [!!photo, closePhoto, stepPhoto]);

  /* ─── Video lightbox ─── */
  const openVideo = (index) => setVideo({ open: true, index });
  const closeVideo = useCallback(() => setVideo((v) => ({ ...v, open: false })), []);
  const stepVideo = useCallback((d) => setVideo((v) => ({ ...v, index: (v.index + d + MAX_VIDEOS) % MAX_VIDEOS })), []);

  useEffect(() => {
    const p = playerRef.current;
    if (!p) return;
    if (video.open) {
      p.innerHTML = '';
      const src = document.createElement('source');
      src.src = '/videos/v' + (video.index + 1) + '.mp4';
      src.type = 'video/mp4';
      p.appendChild(src);
      p.load();
      p.play().catch(() => {});
    } else {
      p.pause();
      p.innerHTML = '';
    }
  }, [video.open, video.index]);

  useEffect(() => {
    if (!video.open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') closeVideo();
      if (e.key === 'ArrowRight') stepVideo(1);
      if (e.key === 'ArrowLeft') stepVideo(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [video.open, closeVideo, stepVideo]);

  /* lock page scroll while either lightbox is open */
  const anyOpen = !!photo || video.open;
  useEffect(() => {
    document.body.style.overflow = anyOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [anyOpen]);

  /* ─── Video strip scroll controls ─── */
  const getScrollAmount = () => {
    const track = trackRef.current;
    const card = track && track.querySelector('.vcard');
    return card ? card.offsetWidth + parseInt(getComputedStyle(track).gap) : 250;
  };
  const scrollStrip = (dir) =>
    containerRef.current && containerRef.current.scrollBy({ left: dir * getScrollAmount(), behavior: 'smooth' });

  const cur = photo ? photo.items[photo.index] : null;

  return (
    <>
      <section className="section" id="gallery" style={{ background: 'var(--bg)' }}>
        <div className="section-inner">
          <div style={{ marginBottom: '2.75rem' }}>
            <h2 className="section-title">Our<br/><em>Works</em></h2>
          </div>

          {/* PORTRAIT PHOTOS */}
          <PhotoGrid
            items={portrait} gridClass="grid-a" imgClass="img-a" seriesKey="portrait" seriesLabel="Portrait"
            mobile={mobile} expanded={expanded.portrait} onToggle={toggleExpanded} onOpen={openPhoto}
          />

          <hr className="series-divider" />

          {/* TALL PHOTOS */}
          <PhotoGrid
            items={tall} gridClass="grid-b" imgClass="img-b" seriesKey="tall" seriesLabel="Tall"
            mobile={mobile} expanded={expanded.tall} onToggle={toggleExpanded} onOpen={openPhoto}
          />

          <hr className="series-divider" />

          {/* VIDEO CLIPS — static poster images, no runtime frame extraction */}
          <div className="video-scroll-wrapper" id="video-section" ref={sectionRef}>
            <div
              className="video-horizontal-scroll"
              id="video-scroll-container"
              ref={containerRef}
            >
              <div className="video-scroll-track" id="video-track" ref={trackRef}>
                {Array.from({ length: MAX_VIDEOS }, (_, i) => (
                  <div
                    className="vcard"
                    key={i}
                    data-video-src-mp4={'/videos/v' + (i + 1) + '.mp4'}
                    data-name={'Cake Preview ' + (i + 1)}
                    role="button"
                    tabIndex={0}
                    aria-label={'Play Cake Preview ' + (i + 1)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openVideo(i); }
                    }}
                    onClick={() => openVideo(i)}
                  >
                    <img
                      src={'/images/video-posters/v' + (i + 1) + '.jpg'}
                      alt={'Cake Preview ' + (i + 1)}
                      width={252}
                      height={480}
                      loading="lazy"
                      decoding="async"
                      sizes="200px"
                    />
                    <div className="play-icon-overlay"></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="video-scroll-controls">
              <button className="scroll-btn scroll-prev" aria-label="Previous videos" onClick={() => scrollStrip(-1)}>‹</button>
              <button className="scroll-btn scroll-next" aria-label="Next videos" onClick={() => scrollStrip(1)}>›</button>
            </div>
          </div>
        </div>
      </section>

      {/* Lightboxes live at the end of <body>, exactly like the original page */}
      {mounted && createPortal(
        <>
          {/* PHOTO LIGHTBOX */}
          <div
            className={'lightbox' + (photo ? ' open' : '')}
            id="photo-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label="Image viewer"
            onClick={(e) => { if (e.target === e.currentTarget) closePhoto(); }}
            onTouchStart={(e) => { photoTouchX.current = e.changedTouches[0].screenX; }}
            onTouchEnd={(e) => {
              const x = e.changedTouches[0].screenX;
              if (Math.abs(x - photoTouchX.current) > 50) stepPhoto(x < photoTouchX.current ? 1 : -1);
            }}
          >
            <div className="lb-img-wrap">
              <img id="photo-lb-img" src={cur ? cur.src : undefined} alt={cur ? cur.name : ''} />
              <button className="lb-close" id="photo-lb-close" aria-label="Close" onClick={closePhoto}>✕</button>
              <button className="lb-nav lb-prev" id="photo-lb-prev" onClick={() => stepPhoto(-1)}>‹</button>
              <button className="lb-nav lb-next" id="photo-lb-next" onClick={() => stepPhoto(1)}>›</button>
            </div>
            <div className="lb-info">
              <p className="lb-info-name" id="photo-lb-name">{cur ? cur.name : ''}</p>
              <p className="lb-info-sub" id="photo-lb-series">{photo ? photo.series : ''}</p>
            </div>
          </div>

          {/* VIDEO LIGHTBOX */}
          <div
            className={'video-lightbox' + (video.open ? ' open' : '')}
            id="video-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label="Video viewer"
            onClick={(e) => { if (e.target === e.currentTarget) closeVideo(); }}
            onTouchStart={(e) => { videoTouchX.current = e.changedTouches[0].screenX; }}
            onTouchEnd={(e) => {
              const diff = e.changedTouches[0].screenX - videoTouchX.current;
              if (Math.abs(diff) > 50) stepVideo(diff < 0 ? 1 : -1);
            }}
          >
            <div className="vlb-stage">
              <video id="video-lb-player" ref={playerRef} controls playsInline preload="auto"></video>
              <button className="vlb-btn vlb-close" id="video-lb-close" aria-label="Close" onClick={closeVideo}>✕</button>
            </div>
            <div className="vlb-controls">
              <button className="vlb-btn" id="video-lb-prev" onClick={() => stepVideo(-1)}>‹</button>
              <button className="vlb-btn" id="video-lb-next" onClick={() => stepVideo(1)}>›</button>
              <button
                className="vlb-btn"
                id="video-lb-fullscreen"
                onClick={() => {
                  const p = playerRef.current;
                  if (!p) return;
                  if (p.requestFullscreen) p.requestFullscreen();
                  else if (p.webkitRequestFullscreen) p.webkitRequestFullscreen();
                }}
              >⛶</button>
            </div>
            <div className="vlb-info" id="video-lb-info">{'Cake Preview ' + (video.index + 1)}</div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
