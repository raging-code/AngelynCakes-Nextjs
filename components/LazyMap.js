'use client';

import { useEffect, useRef, useState } from 'react';
import { MAP_SRC } from '../lib/data';

/* Lazy-load the Google Maps iframe when the map scrolls near the viewport */
export default function LazyMap() {
  const wrapRef = useRef(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShow(true);
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="map-wrap map-dark" id="map-wrap" ref={wrapRef}>
      {show && (
        <iframe
          src={MAP_SRC}
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          loading="lazy"
          title="Map showing the Pasay showroom location"
        />
      )}
    </div>
  );
}
