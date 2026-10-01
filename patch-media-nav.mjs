#!/usr/bin/env node
/* patch-media-nav.mjs — Angelyn's Cakes
   Usage (from the repo root):
     node patch-media-nav.mjs --dry-run   show what would happen, write nothing
     node patch-media-nav.mjs             apply
     node patch-media-nav.mjs --revert    undo (restores the backups)
   Changes:
     1. Photo/video buttons -> brand pink with a white ring (lightbox close/prev/next,
        video lightbox buttons, play badge on thumbnails, "Watch Feature" play, strip arrows)
     2. Navbar slides up out of view when scrolling down, slides back when scrolling up
     3. Hero "Book a Consultation" now goes to the Showroom section (#showroom)
     4. Removes: "As Seen On" badge, "About Us" label above the About title,
        and the whole Consultation Request form (Contact section becomes a single column)
   Safe by design: checks every edit before writing anything, backs up originals,
   handles CRLF, idempotent (running twice does nothing the second time). */
import fs from 'node:fs';
import path from 'node:path';

const args = new Set(process.argv.slice(2));
const DRY = args.has('--dry-run'), REVERT = args.has('--revert');
const ROOT = process.cwd();
const BK = path.join(ROOT, '.patch-backup-media-nav');
const MAN = path.join(BK, 'manifest.json');
const abs = (p) => path.join(ROOT, p);
const log = (...a) => console.log(...a);
const die = (m) => { console.error('\nABORTED, nothing was changed.\n' + m); process.exit(1); };
const toLF = (s) => s.replace(/\r\n/g, '\n');

try {
  const pk = JSON.parse(fs.readFileSync(abs('package.json'), 'utf8'));
  if (pk.name !== 'angelynscakes') throw 0;
} catch {
  die('Run this from the repo root (the folder whose package.json is named "angelynscakes").');
}

if (REVERT) {
  if (!fs.existsSync(MAN)) die('No ' + MAN + ' found, nothing to revert.');
  const m = JSON.parse(fs.readFileSync(MAN, 'utf8'));
  for (const f of m.modified) {
    log((DRY ? '[dry] ' : '') + 'restore ' + f);
    if (!DRY) fs.copyFileSync(path.join(BK, 'files', f), abs(f));
  }
  if (!DRY) { fs.rmSync(BK, { recursive: true, force: true }); log('\nReverted. Backup folder removed.'); }
  process.exit(0);
}

/* ---------- helpers: every edit must match EXACTLY once, or the patch aborts ---------- */
const once = (text, find, replace) => {
  const parts = text.split(find);
  if (parts.length !== 2) return null;
  return parts[0] + replace + parts[1];
};
const onceRe = (text, re, replace) => {
  const g = new RegExp(re.source, re.flags.replace('g', '') + 'g');
  const m = text.match(g);
  if (!m || m.length !== 1) return null;
  return text.replace(re, () => replace);
};

/* ---------- 1. Nav: slide away on scroll down, back on scroll up ---------- */
const NAV_HOOK = `  const close = () => setOpen(false);
  const [hidden, setHidden] = useState(false);
  const openRef = useRef(false);

  // keep the bar visible while the mobile menu is open
  useEffect(() => {
    openRef.current = open;
    if (open) setHidden(false);
  }, [open]);

  // hide on scroll down, show on scroll up (8px dead-zone avoids jitter)
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = Math.max(window.scrollY, 0);
      const diff = y - lastY;
      if (y <= 80 || openRef.current) {
        setHidden(false);
        lastY = y;
      } else if (diff > 8) {
        setHidden(true);
        lastY = y;
      } else if (diff < -8) {
        setHidden(false);
        lastY = y;
      }
    };
    const onScroll = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
`;

/* ---------- CSS (appended once) ---------- */
const CSS_MARK = '/* ────────── Media buttons, nav slide, contact (patch-media-nav) ────────── */';
const CSS_BLOCK = `
${CSS_MARK}
/* Navbar: slides up when hidden */
.nav-root{transition:transform .35s cubic-bezier(.4,0,.2,1);will-change:transform}
.nav-root.nav-hidden{transform:translateY(-100%);box-shadow:none}

/* Photo + video buttons: brand pink, white ring */
.lb-close,.lb-nav,.vlb-btn,.scroll-btn,.play-icon-overlay,.tv5-play-btn{background:var(--accent);color:#fff;border:2px solid #fff;box-shadow:0 2px 12px rgba(0,0,0,.4);font-family:sans-serif;line-height:1}
.lb-close,.lb-nav,.vlb-btn{width:46px;height:46px;font-size:1.35rem}
.lb-nav{font-size:1.7rem;padding-bottom:3px}
.vlb-close{background:var(--accent)}
.lb-close:hover,.lb-nav:hover,.vlb-btn:hover,.vlb-close:hover{background:var(--accent-h)}
.lb-nav:hover{transform:translateY(-50%) scale(1.06)}
.scroll-btn{width:42px;height:42px;font-size:1.5rem;box-shadow:0 3px 12px rgba(201,92,114,.35)}
.scroll-btn:hover{background:var(--accent-h)}
.play-icon-overlay{width:46px;height:46px;background:var(--accent)}
.tv5-play-btn{border-width:3px;box-shadow:0 8px 28px rgba(0,0,0,.45)}
.tv5-play-overlay:hover .tv5-play-btn{background:var(--accent-h);box-shadow:0 12px 36px rgba(0,0,0,.5)}
.lb-close:focus-visible,.lb-nav:focus-visible,.vlb-btn:focus-visible,.scroll-btn:focus-visible{outline:2px solid #fff;outline-offset:3px}

/* Contact: the form is gone, so the info column takes the full width */
@media (min-width: 768px) { .contact-layout { grid-template-columns: 1fr; } }
`;

/* ---------- the edit list ---------- */
const NAV_IMPORT_OLD = "import { useState } from 'react';";
const NAV_IMPORT_NEW = "import { useEffect, useRef, useState } from 'react';";
const NAV_TAG_OLD = '<nav className="nav-root">';
const NAV_TAG_NEW = "<nav className={'nav-root' + (hidden ? ' nav-hidden' : '')} onFocusCapture={() => setHidden(false)}>";
const HERO_OLD = `<a href="#contact" className="btn-cta" style={{ fontSize: '0.82rem', padding: '15px 30px' }}>Book a Consultation</a>`;
const HERO_NEW = `<a href="#showroom" className="btn-cta" style={{ fontSize: '0.82rem', padding: '15px 30px' }}>Book a Consultation</a>`;

const FILES = [
  { path: 'components/Nav.js', edits: [
    { name: 'import hooks', done: (t) => t.includes(NAV_IMPORT_NEW), run: (t) => once(t, NAV_IMPORT_OLD, NAV_IMPORT_NEW) },
    { name: 'scroll hook', done: (t) => t.includes('const [hidden, setHidden]'), run: (t) => once(t, '  const close = () => setOpen(false);\n', NAV_HOOK) },
    { name: 'nav class', done: (t) => t.includes("'nav-root' + (hidden"), run: (t) => once(t, NAV_TAG_OLD, NAV_TAG_NEW) },
  ] },
  { path: 'components/Hero.js', edits: [
    { name: 'hero button -> #showroom', done: (t) => t.includes(HERO_NEW), run: (t) => once(t, HERO_OLD, HERO_NEW) },
  ] },
  { path: 'components/Tv5.js', edits: [
    { name: 'remove "As Seen On" badge', done: (t) => !t.includes('As Seen On'),
      run: (t) => onceRe(t, /\n[ \t]*<div className="tv5-badge">[\s\S]*?As Seen On\s*<\/div>/, '') },
  ] },
  { path: 'components/About.js', edits: [
    { name: 'remove "About Us" label', done: (t) => !t.includes('section-eyebrow">About Us'),
      run: (t) => onceRe(t, /\n[ \t]*<span className="section-eyebrow">About Us<\/span>/, '') },
  ] },
  { path: 'components/Contact.js', edits: [
    { name: 'remove consultation form', done: (t) => !t.includes('form-wrap'),
      run: (t) => onceRe(t, /\n[ \t]*<div className="form-wrap">[\s\S]*?Send Consultation Request<\/button>\n[ \t]*<\/div>/, '') },
  ] },
  { path: 'app/globals.css', edits: [
    { name: 'append styles', done: (t) => t.includes(CSS_MARK), run: (t) => t.replace(/\s*$/, '\n') + CSS_BLOCK },
  ] },
];

/* ---------- verify everything BEFORE writing ---------- */
const plan = [], problems = [];
for (const f of FILES) {
  if (!fs.existsSync(abs(f.path))) { problems.push('missing file: ' + f.path); continue; }
  const raw = fs.readFileSync(abs(f.path), 'utf8');
  let text = toLF(raw), changed = false;
  for (const e of f.edits) {
    if (e.done(text)) { log('ok (already done)  ' + f.path + ' · ' + e.name); continue; }
    const out = e.run(text);
    if (out === null) { problems.push(f.path + ': could not apply "' + e.name + '" (the file differs from what this patch expects)'); continue; }
    text = out; changed = true;
    log((DRY ? '[dry] ' : '') + 'edit ' + f.path + ' · ' + e.name);
  }
  if (changed) plan.push({ path: f.path, out: text, crlf: raw.includes('\r\n') });
}
if (problems.length) die(problems.map((x) => ' - ' + x).join('\n'));

/* ---------- apply ---------- */
const prev = fs.existsSync(MAN) ? JSON.parse(fs.readFileSync(MAN, 'utf8')) : { modified: [] };
const man = { modified: [...prev.modified] };
for (const f of plan) {
  if (DRY) continue;
  const bp = path.join(BK, 'files', f.path);
  if (!fs.existsSync(bp)) { fs.mkdirSync(path.dirname(bp), { recursive: true }); fs.copyFileSync(abs(f.path), bp); }
  if (!man.modified.includes(f.path)) man.modified.push(f.path);
  fs.writeFileSync(abs(f.path), f.crlf ? f.out.replace(/\n/g, '\r\n') : f.out);
}
if (!DRY) {
  if (plan.length) { fs.mkdirSync(BK, { recursive: true }); fs.writeFileSync(MAN, JSON.stringify(man, null, 2)); }
  log(plan.length ? '\nDone. Test with:  npm run dev   (or npm run build)' : '\nNothing to do, everything is already patched.');
  if (plan.length) log('Undo anytime with: node patch-media-nav.mjs --revert');
}
