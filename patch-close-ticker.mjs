#!/usr/bin/env node
/* patch-close-ticker.mjs — Angelyn's Cakes
   Usage (from the repo root):
     node patch-close-ticker.mjs --dry-run   show what would happen, write nothing
     node patch-close-ticker.mjs             apply
     node patch-close-ticker.mjs --revert    undo (restores the backups)
   Changes:
     1. Photo + video lightbox: the close (X) button is smaller (32px, still a 44px tap area)
        and now sits ON the image / video, in its top-right corner
     2. Removes the "Trusted By" label from the scrolling strip under the hero
   Safe by design: checks every edit before writing anything, backs up originals,
   handles CRLF, idempotent (running twice does nothing the second time). */
import fs from 'node:fs';
import path from 'node:path';

const args = new Set(process.argv.slice(2));
const DRY = args.has('--dry-run'), REVERT = args.has('--revert');
const ROOT = process.cwd();
const BK = path.join(ROOT, '.patch-backup-close-ticker');
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

/* ---------- CSS (appended once) ---------- */
const CSS_MARK = '/* ────────── Smaller close button on the media (patch-close-ticker) ────────── */';
const CSS_BLOCK = `
${CSS_MARK}
.vlb-stage{position:relative;display:flex;max-width:90vw}
.lb-close,.vlb-close{top:.6rem;right:.6rem;width:32px;height:32px;font-size:.85rem;padding:0;z-index:3;box-shadow:0 2px 8px rgba(0,0,0,.45)}
.lb-close::after,.vlb-close::after{content:'';position:absolute;inset:-6px}
`;

/* ---------- the edit list ---------- */
const PHOTO_OLD = `            <button className="lb-close" id="photo-lb-close" aria-label="Close" onClick={closePhoto}>✕</button>
            <div className="lb-img-wrap">
              <img id="photo-lb-img" src={cur ? cur.src : undefined} alt={cur ? cur.name : ''} />
`;
const PHOTO_NEW = `            <div className="lb-img-wrap">
              <img id="photo-lb-img" src={cur ? cur.src : undefined} alt={cur ? cur.name : ''} />
              <button className="lb-close" id="photo-lb-close" aria-label="Close" onClick={closePhoto}>✕</button>
`;
const VIDEO_OLD = `            <button className="vlb-btn vlb-close" id="video-lb-close" aria-label="Close" onClick={closeVideo}>✕</button>
            <video id="video-lb-player" ref={playerRef} controls playsInline preload="auto"></video>
`;
const VIDEO_NEW = `            <div className="vlb-stage">
              <video id="video-lb-player" ref={playerRef} controls playsInline preload="auto"></video>
              <button className="vlb-btn vlb-close" id="video-lb-close" aria-label="Close" onClick={closeVideo}>✕</button>
            </div>
`;
const TICKER_OLD = '        <div className="ticker-label"><span>Trusted By</span></div>\n';

const FILES = [
  { path: 'components/Gallery.js', edits: [
    { name: 'photo close button inside the image', done: (t) => t.includes(PHOTO_NEW), run: (t) => once(t, PHOTO_OLD, PHOTO_NEW) },
    { name: 'video close button inside the video', done: (t) => t.includes(VIDEO_NEW), run: (t) => once(t, VIDEO_OLD, VIDEO_NEW) },
  ] },
  { path: 'components/Ticker.js', edits: [
    { name: 'remove "Trusted By"', done: (t) => !t.includes('Trusted By'), run: (t) => once(t, TICKER_OLD, '') },
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
  if (plan.length) log('Undo anytime with: node patch-close-ticker.mjs --revert');
}
