#!/usr/bin/env node
/**
 * Angelyn's Cakes — responsiveness + performance patch
 *
 * Run from the repo root (next to package.json):
 *
 *   node patch-responsive.mjs                 apply everything
 *   node patch-responsive.mjs --dry           show what would change, write nothing
 *   node patch-responsive.mjs --keep-assets   apply, but don't move unused video files
 *   node patch-responsive.mjs --revert        restore every touched file / moved asset
 *
 * Safe to run more than once. Originals are saved once into
 * .patch-backup-responsive/ (separate from the older .patch-backup/ so the two
 * patch scripts never interfere).
 *
 * ── RESPONSIVENESS ───────────────────────────────────────────────────────────
 *  • Nav: the desktop link row needs ~1070px but switched on at 768px, so the
 *    "Book a Consultation" button was clipped on every tablet and on iPad
 *    landscape. The hamburger now covers 768–1139px.
 *  • Mobile menu: scrolls when the screen is short (landscape phones), is no
 *    longer keyboard-focusable while closed, hamburger turns into an X,
 *    Esc / growing past the breakpoint closes it, aria-label/aria-controls.
 *  • Our Works: a window "resize" listener collapsed an expanded "Show all"
 *    grid whenever a phone's address bar hid while scrolling. Now uses
 *    matchMedia, which only fires when the 767px breakpoint is really crossed.
 *  • Hero: capped to the viewport on big monitors (was 1440px tall at 2560 wide),
 *    landscape-phone layout that no longer clips the headline, full-width
 *    buttons on small phones.
 *  • Ticker: the marquee ran out of content on screens wider than ~1850px
 *    (blank gap on the right). Track is now long enough for any screen.
 *  • Lightboxes: image/video sized with svh so the browser toolbar and the
 *    caption/controls never overlap or push the media off screen.
 *  • Showroom: two columns (info | map) from 900px instead of one wide stack.
 *  • Footer: two-column layout from 768px instead of one thin left column.
 *  • About: paragraph line length capped (~62ch) on wide screens.
 *  • Contact/footer: long email / phone text wraps instead of being cut off
 *    at 320px (body has overflow-x:hidden, which was hiding the overflow).
 *  • Video strip: scroll-snap + contained overscroll on touch.
 *  • Keyboard/a11y: photo cards and video cards are real focusable buttons
 *    (Enter/Space), visible focus rings on all interactive elements.
 *
 * ── PERFORMANCE ──────────────────────────────────────────────────────────────
 *  • content-visibility sections now remember their real height
 *    (contain-intrinsic-size: auto …) so scroll position doesn't jump.
 *  • Real HTTP security headers in public/_headers (meta http-equiv versions of
 *    X-Content-Type-Options / Permissions-Policy are ignored by browsers).
 *  • Unused / backup video files (*.bak-*, mhero.mp4, mhero-opt.mp4 …) are
 *    moved out of public/ so they stop being deployed (~4 MB less in out/).
 *    They are kept in .patch-backup-responsive/ and restored by --revert.
 *  • .gitignore gets the backup folders; README.md loses a stray UTF-16 line
 *    that PowerShell appended.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const args = new Set(process.argv.slice(2));
const DRY = args.has('--dry');
const REVERT = args.has('--revert');
const KEEP_ASSETS = args.has('--keep-assets');
const BACKUP = path.join(ROOT, '.patch-backup-responsive');

/* ───────────────────────── helpers ───────────────────────── */
const abs = (rel) => path.join(ROOT, rel);
const ok = (m) => console.log('  ✔ ' + m);
const skip = (m) => console.log('  • ' + m);
const fail = (m) => { console.error('  ✖ ' + m); process.exitCode = 1; };
const exists = (rel) => fs.existsSync(abs(rel));

const staged = new Map(); // rel -> new content (flushed at the end)
const read = (rel) => (staged.has(rel) ? staged.get(rel) : fs.readFileSync(abs(rel), 'utf8'));
const stage = (rel, content) => staged.set(rel, content);

function backup(rel) {
  const dest = path.join(BACKUP, rel);
  if (fs.existsSync(dest) || !exists(rel)) return;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(abs(rel), dest);
}

function flush() {
  if (DRY) return;
  for (const [rel, content] of staged) {
    backup(rel);
    fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
    fs.writeFileSync(abs(rel), content);
  }
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]
  );
}

/** Replace `find` (string or RegExp) with `replace`; skip if `done(src)`; fail loudly if the anchor is missing. */
function edit(rel, label, { done, find, replace }) {
  if (!exists(rel)) return fail(`${rel} not found — "${label}" skipped.`);
  const src = read(rel);
  if (done(src)) return skip(`${rel} — ${label} (already applied)`);
  const hit = typeof find === 'string' ? src.includes(find) : find.test(src);
  if (!hit) return fail(`${rel} — anchor for "${label}" not found (file differs from what this patch expects) — skipped.`);
  stage(rel, src.replace(find, () => replace));
  ok(`${rel} — ${label}`);
}

/* ───────────────────────── sanity ───────────────────────── */
if (!exists('components/Gallery.js') || !exists('app/globals.css') || !exists('package.json')) {
  console.error('Run this from the root of the AngelynCakes-Nextjs repo (components/, app/ and package.json not found).');
  process.exit(1);
}

/* ───────────────────────── revert ───────────────────────── */
if (REVERT) {
  console.log('Reverting…');
  if (!fs.existsSync(BACKUP)) { console.log('  Nothing to revert (no .patch-backup-responsive/).'); process.exit(0); }
  for (const file of walk(BACKUP)) {
    const rel = path.relative(BACKUP, file);
    if (!DRY) {
      fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
      fs.copyFileSync(file, abs(rel));
    }
    ok('restored ' + rel);
  }
  if (!DRY) fs.rmSync(BACKUP, { recursive: true, force: true });
  process.exit(0);
}

console.log(DRY ? 'Dry run — nothing will be written.\n' : 'Patching…\n');

/* ═════════════════════════ 1. CSS ═════════════════════════ */
console.log('CSS (app/globals.css)');

const CSS_OPEN = '/* >>> angelyn:responsive-perf-v1 */';
const CSS_CLOSE = '/* <<< angelyn:responsive-perf-v1 */';

const CSS = String.raw`
/* ── base ── */
html{-webkit-text-size-adjust:100%;text-size-adjust:100%}

/* ── focus rings (keyboard users) ── */
.hamburger:focus-visible,.nav-link:focus-visible,.mobile-link:focus-visible,
.btn-cta:focus-visible,.btn-ghost:focus-visible,.sr-btn:focus-visible,
.footer-social:focus-visible,.gcard:focus-visible,.vcard:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
.tv5-play-overlay:focus-visible{outline:3px solid #fff;outline-offset:-6px}

/* ── NAV ──
   The desktop row (logo + 4 links + CTA) needs ~1070px. It used to switch on at
   768px, so the CTA was clipped on tablets. Hamburger now covers 768–1139px. */
@media (min-width:768px) and (max-width:1139px){
  .nav-links{display:none}
  .hamburger{display:flex}
}
@media (min-width:1140px) and (max-width:1279px){.nav-links{gap:1.6rem}}

/* Mobile menu: scrolls on short screens, unfocusable while closed */
.mobile-menu{visibility:hidden;transition:max-height .38s cubic-bezier(.4,0,.2,1),visibility 0s linear .38s}
.mobile-menu.open{visibility:visible;transition-delay:0s;overscroll-behavior:contain;overflow-y:auto;max-height:min(420px,calc(100svh - 64px))}
@media (min-width:768px){.mobile-menu.open{max-height:min(420px,calc(100svh - 80px))}}

/* Hamburger → X */
.hamburger[aria-expanded="true"] span:nth-child(1){transform:translateY(7px) rotate(45deg)}
.hamburger[aria-expanded="true"] span:nth-child(2){opacity:0}
.hamburger[aria-expanded="true"] span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}

/* ── HERO ── */
@media (max-width:479px){
  .hero-btns .btn-cta,.hero-btns .btn-ghost{flex:1 1 100%}
}
/* big monitors: don't let a 16:9 hero grow taller than the window */
@media (min-width:768px) and (min-height:600px){
  .hero{max-height:100vh}
  .hero{max-height:100svh}
}
/* landscape phones: fill the screen and keep the headline inside it */
@media (max-height:500px) and (orientation:landscape){
  .hero{aspect-ratio:auto;max-height:none;min-height:100vh;min-height:100svh;align-items:center}
  .hero-content{padding-bottom:1rem}
  .hero-headline{font-size:clamp(2rem,11vh,3.4rem);margin-bottom:1rem}
}

/* ── TICKER: track is now 4 repeats long (see Ticker.js); keep the original pace ── */
.ticker-track{animation-duration:48s}

/* ── content-visibility: remember the real height once a section has rendered ── */
#gallery,#featured-tv5,#showroom,#reviews,#about,#contact{contain-intrinsic-size:auto none auto 1200px}

/* ── LIGHTBOXES: size against the visible viewport ── */
.lb-img-wrap{max-height:none}
.lb-img-wrap img{max-height:calc(100vh - 9rem);max-height:calc(100svh - 9rem)}
.video-lightbox video{max-height:calc(100vh - 11rem);max-height:calc(100svh - 11rem)}

/* ── VIDEO STRIP ── */
.video-horizontal-scroll{scroll-snap-type:x proximity;overscroll-behavior-x:contain}
.vcard{scroll-snap-align:start}

/* ── ABOUT ── */
.about-text-col p{max-width:62ch}
@media (min-width:1024px){.founder-photo{max-width:300px}}

/* ── CONTACT / FOOTER: let long strings wrap instead of being cut off at 320px ── */
.contact-row{min-width:0}
.contact-row>div:last-child{min-width:0}
.contact-row a,.contact-row p{overflow-wrap:anywhere;min-width:0}
.footer-inner a,.footer-inner p{overflow-wrap:anywhere}

/* ── SHOWROOM: info | map side by side on desktop ── */
@media (min-width:900px){
  .sr-card{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.25fr);align-items:stretch}
  .sr-card .sr-body{display:flex;flex-direction:column;justify-content:center;padding:3rem 2.5rem}
  .showroom-widget .map-wrap.map-dark{height:auto;min-height:480px;align-self:stretch;border-top:0;border-left:1px solid var(--border)}
}

/* ── FOOTER: two columns from 768px (brand + socials | contact details) ── */
@media (min-width:768px){
  .footer-inner>div:first-child{display:grid !important;grid-template-columns:minmax(0,1fr) minmax(0,auto);column-gap:3rem !important;row-gap:1.5rem !important;align-items:start !important}
  .footer-inner>div:first-child>div:nth-child(1){grid-column:1;grid-row:1}
  .footer-inner>div:first-child>div:nth-child(2){grid-column:1;grid-row:2}
  .footer-inner>div:first-child>div:nth-child(3){grid-column:2;grid-row:1 / span 2;max-width:34rem}
}
`;

{
  const rel = 'app/globals.css';
  const css = read(rel);
  const block = CSS_OPEN + '\n' + CSS.trim() + '\n' + CSS_CLOSE;
  const MARK = new RegExp(CSS_OPEN.replace(/[/*>]/g, '\\$&') + '[\\s\\S]*?' + CSS_CLOSE.replace(/[/*<]/g, '\\$&'));
  if (MARK.test(css)) {
    const next = css.replace(MARK, () => block);
    if (next === css) skip(rel + ' — responsive/perf block already up to date');
    else { stage(rel, next); ok(rel + ' — responsive/perf block refreshed'); }
  } else {
    stage(rel, css.replace(/\s*$/, '\n\n') + block + '\n');
    ok(rel + ' — responsive/perf block added');
  }
}

/* ═════════════════════════ 2. Ticker ═════════════════════════ */
console.log('\nTicker');

const TICKER_JS = `import { Fragment } from 'react';
import { ticker } from '../lib/data';

/* lib/data.js lists the 8 occasions twice. The marquee animates the track by
   -50%, so each half must be wider than the screen or a blank gap appears on
   the right (it did above ~1850px). Rendering the 8 unique items 4 times makes
   each half ~3700px wide. The track is aria-hidden: purely decorative. */
const unique = [...new Set(ticker)];
const items = [...unique, ...unique, ...unique, ...unique];

export default function Ticker() {
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-scroll">
        <div className="ticker-track">
          {items.map((label, i) => (
            <Fragment key={i}>
              <span className="ticker-item">{label}</span>
              <span className="ticker-dot">●</span>
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
`;

{
  const rel = 'components/Ticker.js';
  if (!exists(rel)) fail(rel + ' not found');
  else if (read(rel).includes('[...new Set(ticker)]')) skip(rel + ' (already applied)');
  else if (!read(rel).includes('ticker-track')) fail(rel + ' does not look like the expected file — skipped.');
  else { stage(rel, TICKER_JS); ok(rel + ' — 4-repeat track, data-driven'); }
}

/* ═════════════════════════ 3. Nav ═════════════════════════ */
console.log('\nNav');

edit('components/Nav.js', 'Esc / breakpoint closes the menu', {
  done: (s) => s.includes('Esc closes the menu'),
  find: '  // hide on scroll down, show on scroll up (8px dead-zone avoids jitter)',
  replace: `  // Esc closes the menu; growing past the hamburger breakpoint closes it too
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    const mq = window.matchMedia('(min-width: 1140px)');
    const onMq = (e) => { if (e.matches) setOpen(false); };
    document.addEventListener('keydown', onKey);
    mq.addEventListener('change', onMq);
    return () => {
      document.removeEventListener('keydown', onKey);
      mq.removeEventListener('change', onMq);
    };
  }, [open]);

  // hide on scroll down, show on scroll up (8px dead-zone avoids jitter)`,
});

edit('components/Nav.js', 'hamburger label + aria-controls', {
  done: (s) => s.includes('Close menu'),
  find: 'aria-label="Open menu"',
  replace: "aria-label={open ? 'Close menu' : 'Open menu'}\n          aria-controls=\"mobile-menu\"",
});

/* ═════════════════════════ 4. Gallery ═════════════════════════ */
console.log('\nGallery (Our Works)');

edit('components/Gallery.js', 'matchMedia instead of resize listener', {
  done: (s) => s.includes("matchMedia('(max-width: 767px)')"),
  find: /\/\* ─── Show more \/ show less: mobile detection ─── \*\/\r?\n  useEffect\(\(\) => \{[\s\S]*?\r?\n  \}, \[\]\);/,
  replace: `/* ─── Show more / show less: mobile detection ───
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
  }, []);`,
});

edit('components/Gallery.js', 'photo cards are keyboard-operable buttons', {
  done: (s) => s.includes("'View ' + it.name"),
  find: 'onClick={() => onOpen(items, i, seriesLabel)}',
  replace: `role="button"
            tabIndex={0}
            aria-label={'View ' + it.name + ' full screen'}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(items, i, seriesLabel); }
            }}
            onClick={() => onOpen(items, i, seriesLabel)}`,
});

edit('components/Gallery.js', 'video cards are keyboard-operable buttons', {
  done: (s) => s.includes("'Play Cake Preview '"),
  find: 'onClick={() => openVideo(i)}',
  replace: `role="button"
                    tabIndex={0}
                    aria-label={'Play Cake Preview ' + (i + 1)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openVideo(i); }
                    }}
                    onClick={() => openVideo(i)}`,
});

/* ═════════════════════════ 5. HTTP headers ═════════════════════════ */
console.log('\nHTTP headers (public/_headers)');

if (!exists('public/_headers')) {
  fail('public/_headers not found — skipped.');
} else {
  const rel = 'public/_headers';
  const src = read(rel);
  const eol = src.includes('\r\n') ? '\r\n' : '\n';
  if (src.includes('X-Content-Type-Options')) {
    skip(rel + ' — security headers already present');
  } else {
    const hsts = /^( {2}Strict-Transport-Security:[^\r\n]*)(\r?\n)/m;
    if (!hsts.test(src)) {
      fail(rel + ' — could not find the "/*" HSTS line to extend — skipped.');
    } else {
      const extra = [
        '  X-Content-Type-Options: nosniff',
        '  Referrer-Policy: strict-origin-when-cross-origin',
        '  Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=(), interest-cohort=()',
      ].join(eol);
      stage(rel, src.replace(hsts, (_, line, nl) => line + nl + extra + nl));
      ok(rel + ' — nosniff, Referrer-Policy, Permissions-Policy as real headers');
    }
  }
}

/* ═════════════════════════ 6. Repo hygiene ═════════════════════════ */
console.log('\nRepo hygiene');

/* README.md: a PowerShell append left a UTF-16 line (full of NUL bytes) at the end */
if (exists('README.md')) {
  const raw = read('README.md');
  const nul = raw.indexOf('\u0000');
  if (nul === -1) skip('README.md — clean');
  else {
    const cut = raw.lastIndexOf('\n', nul) + 1;
    stage('README.md', raw.slice(0, cut).replace(/\s*$/, '\n'));
    ok('README.md — stray UTF-16 line removed');
  }
}

/* .gitignore */
{
  const rel = '.gitignore';
  const want = ['.patch-backup/', '.patch-backup-responsive/', 'public/videos/*.bak*'];
  const cur = exists(rel) ? read(rel) : '';
  const have = new Set(cur.split(/\r?\n/).map((l) => l.trim()));
  const missing = want.filter((l) => !have.has(l));
  if (!missing.length) skip(rel + ' — already lists the backup folders');
  else {
    stage(rel, cur.replace(/\s*$/, '\n') + missing.join('\n') + '\n');
    ok(rel + ' — added ' + missing.join(', '));
  }
}

/* Unused / backup video files out of public/ so they are not deployed */
{
  const dir = 'public/videos';
  if (KEEP_ASSETS) skip('video cleanup skipped (--keep-assets)');
  else if (!exists(dir)) skip(dir + ' not found');
  else {
    const sources = ['app', 'components', 'lib']
      .filter(exists)
      .flatMap((d) => walk(abs(d)))
      .filter((f) => /\.(js|jsx|mjs|css)$/.test(f))
      .map((f) => fs.readFileSync(f, 'utf8'))
      .join('\n');
    const stale = fs.readdirSync(abs(dir)).filter((f) => {
      if (/^v\d+\.mp4$/.test(f)) return false; // gallery builds these names dynamically
      return /\.bak/i.test(f) || !sources.includes(f);
    });
    if (!stale.length) skip(dir + ' — nothing unused');
    for (const f of stale) {
      const rel = path.posix.join(dir, f);
      const mb = (fs.statSync(abs(rel)).size / 1048576).toFixed(1);
      if (!DRY) {
        backup(rel); // the backup copy is what --revert restores
        fs.rmSync(abs(rel));
      }
      ok(`${rel} (${mb} MB) moved to .patch-backup-responsive/`);
    }
  }
}

/* ═════════════════════════ finish ═════════════════════════ */
flush();

/* Report-only: things the patch deliberately does not change */
if (exists('public/videos')) {
  const sizes = new Map();
  for (const f of fs.readdirSync(abs('public/videos')).filter((n) => /^v\d+\.mp4$/.test(n))) {
    const s = fs.statSync(abs('public/videos/' + f)).size;
    sizes.set(s, [...(sizes.get(s) || []), f]);
  }
  const dupes = [...sizes.values()].filter((g) => g.length > 1);
  if (dupes.length) {
    console.log('\nNote (not changed): these gallery videos have identical file sizes, so they are likely duplicates:');
    for (const g of dupes) console.log('  ' + g.join(' = '));
    console.log('  Removing the duplicates means lowering MAX_VIDEOS / renumbering in components/Gallery.js — your call.');
  }
}

console.log('\n' + (DRY ? 'Dry run finished.' : 'Done.') + '  Test with:  npm run dev   (undo anytime with: node patch-responsive.mjs --revert)');
if (!DRY && exists('.patch-backup')) {
  console.log('Tip: .patch-backup/ is committed in git. Run:  git rm -r --cached .patch-backup  (it is now in .gitignore).');
}
