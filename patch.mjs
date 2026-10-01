#!/usr/bin/env node
/**
 * Angelyn's Cakes — patch script
 *
 *   1. Signature Pieces: tapping a photo opens it full screen, exactly like "Our Works"
 *      (new shared component: components/PhotoLightbox.js)
 *   2. Removes "Come see where every cake begins its story." (+ its orphaned CSS)
 *   3. Restyles the "Show all N photos" / "Show less" buttons (clean design)
 *
 * Run from the repo root:
 *
 *   node patch.mjs            # apply everything
 *   node patch.mjs --dry      # show what would change, write nothing
 *   node patch.mjs --revert   # restore every file from .patch-backup/
 *
 * Safe to run more than once. Originals are saved once to .patch-backup/
 * (add it to .gitignore).
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const REVERT = args.includes('--revert');
const BACKUP = path.join(ROOT, '.patch-backup');

const LIGHTBOX_JS = String.raw`'use client';

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
}`;
const BESTSELLERS_JS = String.raw`'use client';

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
      <img src={thumb(src)} alt={alt} loading="lazy" decoding="async" />
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
}`;

const BUTTON_CSS = String.raw`.show-more-btn,.show-less-btn{display:none;position:relative;align-items:center;justify-content:center;gap:.6rem;margin:1.5rem auto 0;padding:12px 2px 9px;font-family:'DM Sans',sans-serif;font-size:.72rem;font-weight:500;letter-spacing:.18em;text-transform:uppercase;white-space:nowrap;color:var(--text);background:none;border:0;border-bottom:1px solid var(--text-dim);border-radius:0;box-shadow:none;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:color .25s ease,border-color .25s ease}
.show-more-btn::before,.show-less-btn::before{content:'';position:absolute;inset:-6px -14px}
.show-more-btn::after,.show-less-btn::after{content:'';width:6px;height:6px;border-right:1.5px solid currentColor;border-bottom:1.5px solid currentColor;transform:translateY(-2px) rotate(45deg);transition:transform .25s ease}
.show-less-btn::after{transform:translateY(2px) rotate(-135deg)}
.show-more-btn.visible,.show-less-btn.visible{display:flex}
.show-more-btn:active,.show-less-btn:active{opacity:.6}
.show-more-btn:focus-visible,.show-less-btn:focus-visible{outline:2px solid var(--accent);outline-offset:4px}
@media(hover:hover){
.show-more-btn:hover,.show-less-btn:hover{color:var(--accent);border-color:var(--accent)}
.show-more-btn:hover::after{transform:translateY(1px) rotate(45deg)}
.show-less-btn:hover::after{transform:translateY(0) rotate(-135deg)}
}`;

const FOCUS_CSS = '.cake-card:focus-visible{outline:2px solid var(--accent);outline-offset:3px}';

/* ───────────────────────── helpers ───────────────────────── */
const abs = (rel) => path.join(ROOT, rel);
const ok = (m) => console.log('  ✔ ' + m);
const skip = (m) => console.log('  • ' + m);
const fail = (m) => { console.error('  ✖ ' + m); process.exitCode = 1; };

function read(rel) { return fs.readFileSync(abs(rel), 'utf8'); }

function backup(rel) {
  const dest = path.join(BACKUP, rel);
  if (fs.existsSync(dest) || !fs.existsSync(abs(rel))) return;
  if (DRY) return;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(abs(rel), dest);
}

function write(rel, content, { isNew = false } = {}) {
  if (DRY) return;
  if (!isNew) backup(rel); /* files the patch creates have no original to save */
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), content);
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]
  );
}

/* ───────────────────────── sanity ───────────────────────── */
if (!fs.existsSync(abs('components/Bestsellers.js')) || !fs.existsSync(abs('app/globals.css'))) {
  console.error('Run this from the root of the AngelynCakes-Nextjs repo (components/ and app/ not found).');
  process.exit(1);
}

/* ───────────────────────── revert ───────────────────────── */
if (REVERT) {
  console.log('Reverting…');
  if (!fs.existsSync(BACKUP)) { console.log('  Nothing to revert (no .patch-backup/).'); process.exit(0); }
  for (const file of walk(BACKUP)) {
    const rel = path.relative(BACKUP, file);
    if (!DRY) fs.copyFileSync(file, abs(rel));
    ok('restored ' + rel);
  }
  if (fs.existsSync(abs('components/PhotoLightbox.js'))) {
    if (!DRY) fs.rmSync(abs('components/PhotoLightbox.js'));
    ok('removed components/PhotoLightbox.js');
  }
  if (!DRY) fs.rmSync(BACKUP, { recursive: true, force: true });
  process.exit(0);
}

console.log(DRY ? 'Dry run — nothing will be written.\n' : 'Patching…\n');

/* ── 1. Signature Pieces → full-screen lightbox ── */
console.log('Signature Pieces lightbox');
write('components/PhotoLightbox.js', LIGHTBOX_JS, { isNew: true });
ok('components/PhotoLightbox.js');

const best = read('components/Bestsellers.js');
if (best.includes('PhotoLightbox')) {
  skip('components/Bestsellers.js already patched');
} else if (!best.includes('function CakeCard') || !best.includes('cake-grid')) {
  fail('components/Bestsellers.js does not look like the expected file — skipped. Send it to me and I will adjust the patch.');
} else {
  write('components/Bestsellers.js', BESTSELLERS_JS);
  ok('components/Bestsellers.js (cards now open the lightbox)');
}

/* ── 2. Remove the showroom tagline ── */
console.log('\nShowroom tagline');
const showroom = read('components/Showroom.js');
const TAGLINE_JSX = /\n?[ \t]*<p className="showroom-tagline">[^<]*<\/p>[ \t]*(?=\n)/;
if (!TAGLINE_JSX.test(showroom)) {
  skip('components/Showroom.js — tagline already gone');
} else {
  write('components/Showroom.js', showroom.replace(TAGLINE_JSX, ''));
  ok('components/Showroom.js — tagline removed');
}

let css = read('app/globals.css');
const before = css;

const TAGLINE_CSS = /\n[ \t]*\/\*[^*]*Responsive tagline for mobile[^*]*\*\/[ \t]*\n?|[ \t]*\.showroom-tagline\s*\{[^}]*\}[ \t]*\n?|[ \t]*@media\s*\(max-width:\s*767px\)\s*\{\s*\}[ \t]*\n?/g;
if (/\.showroom-tagline/.test(css)) {
  /* the mobile override lives inside an @media block: drop the whole block, then the base rule */
  css = css
    .replace(/[ \t]*@media\s*\(max-width:\s*767px\)\s*\{\s*\.showroom-tagline\s*\{[^}]*\}\s*\}[ \t]*\n?/g, '')
    .replace(TAGLINE_CSS, '');
  ok('app/globals.css — orphaned .showroom-tagline rules removed');
} else {
  skip('app/globals.css — no tagline CSS left');
}

/* ── 3. Lightbox focus ring for the Signature Pieces cards ── */
const FOCUS_BLOCK = '/* >>> angelyn:best-lightbox */\n' + FOCUS_CSS + '\n/* <<< angelyn:best-lightbox */';
if (!css.includes('angelyn:best-lightbox')) {
  css = css.replace(/\s*$/, '\n\n' + FOCUS_BLOCK + '\n');
  ok('app/globals.css — keyboard focus ring for cake cards');
}

/* ── 4. Button design ── */
console.log('\nShow all / Show less buttons');
const MARK = /\/\* >>> angelyn:showmore-buttons[^*]*\*\/[\s\S]*?\/\* <<< angelyn:showmore-buttons \*\//;
const ORIGINAL = /\.show-more-btn,\.show-less-btn\{[^}]*\}\s*\.show-more-btn:hover,\.show-less-btn:hover\{[^}]*\}\s*\.show-more-btn\.visible,\.show-less-btn\.visible\{[^}]*\}/;

const block =
  '/* >>> angelyn:showmore-buttons (clean) */\n' +
  BUTTON_CSS.trim() + '\n' +
  '/* <<< angelyn:showmore-buttons */';
if (MARK.test(css)) {
  css = css.replace(MARK, () => block);
  ok('clean design already present — refreshed');
} else if (ORIGINAL.test(css)) {
  css = css.replace(ORIGINAL, () => block);
  ok('applied the clean design');
} else {
  fail('could not find the original .show-more-btn rules in app/globals.css — skipped.');
}

if (css !== before) write('app/globals.css', css);

console.log('\n' + (DRY ? 'Dry run finished.' : 'Done.') + ' Test with:  npm run dev   (undo anytime with: node patch.mjs --revert)');
