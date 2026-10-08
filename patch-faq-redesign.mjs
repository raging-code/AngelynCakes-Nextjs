#!/usr/bin/env node
/* Angelyn's Cakes: FAQ page redesign patch (premium, clean, mobile-first)
 *
 * Run from the repo root on the `nextjs` branch:
 *   node patch-faq-redesign.mjs --dry     preview what will change, write nothing
 *   node patch-faq-redesign.mjs           apply the patch
 *   node patch-faq-redesign.mjs --closed  apply, but keep every FAQ item closed
 *                                         (default opens the first one, as in the preview)
 *
 * Touches only:
 *   app/globals.css      the `angelyn:faq-page` block (replaced)
 *   app/faq/page.js      removes 01-08 numbers + row arrows, new bottom back button
 *   components/FaqNav.js new back button (same design as the bottom one)
 *
 * No text content is changed. Safe to re-run: already-patched files are skipped.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const DRY = process.argv.includes('--dry');
const CLOSED = process.argv.includes('--closed');
const root = process.cwd();

const ARROW =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" ' +
  'strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>';

/* ───────────────────────── CSS ───────────────────────── */
const buildCss = (chips) => `/* >>> angelyn:faq-page */
/* angelyn:faq-redesign v1 : premium, clean, mobile-first */
.fq-main{--fq-line:rgba(46,21,16,.14);padding-top:64px;background:var(--bg)}
@media(min-width:768px){.fq-main{padding-top:80px}}

/* back button (nav + bottom share one design) */
.fq-short{display:inline}.fq-long{display:none}
@media(min-width:640px){.fq-short{display:none}.fq-long{display:inline}}
.fq-btn{display:inline-flex;align-items:center;justify-content:center;gap:.65rem;min-height:44px;padding:0 1.25rem;border:1px solid var(--text);border-radius:999px;background:transparent;color:var(--text);text-decoration:none;font:500 .9rem/1 'DM Sans',Helvetica,sans-serif;letter-spacing:.01em;white-space:nowrap;transition:background .3s,color .3s}
.fq-btn svg{flex:none;transition:transform .3s}
.fq-btn:active{opacity:.85}
.fq-btn:focus-visible{outline:2px solid var(--accent);outline-offset:4px}
@media(hover:hover){.fq-btn:hover{background:var(--text);color:var(--bg)}.fq-btn:hover svg{transform:translateX(-3px)}}
.fq-bottom{margin-top:3rem}
.fq-bottom .fq-btn{display:flex;width:100%;max-width:24rem;min-height:56px;margin:0 auto;padding:0 2rem;font-size:.95rem}

/* layout shell */
.fq-sec{padding:4rem 1.5rem 0}
@media(min-width:640px){.fq-sec{padding:5rem 2.5rem 0}}
@media(min-width:768px){.fq-sec{padding-top:6rem}}
.fq-in{max-width:1040px;margin:0 auto;padding-bottom:4rem}

/* hero */
.fq-eye{display:block;font-size:.85rem;font-weight:500;letter-spacing:0;text-transform:none;color:var(--accent);margin-bottom:1.1rem}
.fq-title{font-family:'Playfair Display',Georgia,serif;font-size:clamp(2.6rem,11vw,5.2rem);font-weight:900;line-height:1.02;letter-spacing:-.02em;color:var(--text)}
.fq-title br{display:none}
.fq-title em{display:block;font-style:italic;font-weight:400;color:var(--gold-lg)}
.fq-lead{margin-top:1.5rem;max-width:34rem;font-size:1.05rem;font-weight:300;line-height:1.75;color:var(--text-mid)}

/* occasions: plain list with hairlines */
.fq-list{margin-top:3rem;border-bottom:1px solid var(--fq-line)}
.fq-row{padding:1.6rem 0;border-top:1px solid var(--fq-line)}
.fq-row h2{font-size:1.3rem;font-weight:700;line-height:1.25;margin-bottom:.4rem;color:var(--text)}
.fq-row p{max-width:30rem;font-size:.97rem;font-weight:300;line-height:1.7;color:var(--text-mid)}
@media(min-width:768px){.fq-list{margin-top:4rem;display:grid;grid-template-columns:1fr 1fr;column-gap:4rem}}

/* where we serve */
.fq-areas{margin-top:4.5rem}
.fq-areas p{max-width:30rem;font:400 1.4rem/1.4 'Playfair Display',Georgia,serif;color:var(--text)}
.fq-cities{list-style:none;display:grid;grid-template-columns:1fr 1fr;gap:.35rem 1rem;margin-top:1.75rem}
.fq-cities li{font-size:.97rem;color:var(--text-mid)}
@media(min-width:640px){.fq-cities{grid-template-columns:repeat(3,1fr)}}
@media(min-width:768px){.fq-areas{margin-top:6rem}}
@media(min-width:960px){.fq-cities{grid-template-columns:repeat(4,1fr)}}

/* faq */
.fq-faq{display:grid;gap:2.25rem;margin-top:5rem}
@media(min-width:960px){.fq-faq{grid-template-columns:.8fr 1.4fr;gap:5rem;align-items:start;margin-top:6.5rem}.fq-faq>div:first-child{position:sticky;top:110px}}
.fq-h2{font-size:clamp(2rem,8vw,3rem);font-weight:700;line-height:1.08;letter-spacing:-.01em;color:var(--text)}
.fq-faq .fq-cta{display:flex;width:100%;min-height:52px;margin-top:1.75rem;padding:0 2rem;border:0;border-radius:999px;background:var(--accent);color:#fff;font-size:.95rem;font-weight:500;letter-spacing:0;text-transform:none;box-shadow:none;transition:background .2s}
.fq-faq .fq-cta:hover{background:var(--accent-h);transform:none;box-shadow:none}
@media(min-width:768px){.fq-faq .fq-cta{display:inline-flex;width:auto}}
.fq-faq details{border-top:1px solid var(--fq-line)}
.fq-faq details:last-child{border-bottom:1px solid var(--fq-line)}
.fq-faq summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:1.25rem;min-height:68px;padding:1.1rem 0;font-family:'Playfair Display',Georgia,serif;font-size:1.1rem;font-weight:700;line-height:1.35;color:var(--text)}
.fq-faq summary::-webkit-details-marker{display:none}
.fq-faq summary::after{content:'';flex:none;width:14px;height:14px;background:linear-gradient(var(--accent),var(--accent)) center/14px 1.5px no-repeat,linear-gradient(var(--accent),var(--accent)) center/1.5px 14px no-repeat;transition:transform .3s}
.fq-faq details[open] summary::after{transform:rotate(45deg)}
.fq-faq summary:focus-visible{outline:2px solid var(--accent);outline-offset:4px}
.fq-faq details p{max-width:38rem;padding:0 2rem 1.6rem 0;font-size:.98rem;font-weight:300;line-height:1.75;color:var(--text-mid)}
@media(min-width:960px){.fq-faq summary{font-size:1.15rem}}
@media(prefers-reduced-motion:reduce){.fq-btn,.fq-btn svg,.fq-faq summary::after,.fq-faq .fq-cta{transition:none}}
${chips}/* <<< angelyn:faq-page */`;

/* ───────────────────────── helpers ───────────────────────── */
const read = (rel) => {
  const p = resolve(root, rel);
  if (!existsSync(p)) {
    console.error(`✗ ${rel} not found. Run this from the repo root on the nextjs branch.`);
    process.exit(1);
  }
  return readFileSync(p, 'utf8');
};

// replace that must match, otherwise abort before anything is written
const sub = (src, re, to, label) => {
  if (!re.test(src)) {
    console.error(`✗ Could not find: ${label}\n  The file differs from what this patch expects. Nothing was written.`);
    process.exit(1);
  }
  return src.replace(re, () => to);
};

const jobs = [];

/* 1. globals.css */
{
  const rel = 'app/globals.css';
  const src = read(rel);
  if (src.includes('angelyn:faq-redesign')) {
    jobs.push({ rel, skip: true });
  } else {
    const re = /\/\* >>> angelyn:faq-page \*\/[\s\S]*?\/\* <<< angelyn:faq-page \*\//;
    const m = src.match(re);
    if (!m) {
      console.error('✗ angelyn:faq-page block not found in app/globals.css. Nothing was written.');
      process.exit(1);
    }
    // keep the existing (unused) .fq-chips rules untouched
    const chips = m[0].split('\n').filter((l) => l.startsWith('.fq-chips')).join('\n');
    jobs.push({ rel, out: src.replace(re, () => buildCss(chips ? chips + '\n' : '')) });
  }
}

/* 2. app/faq/page.js */
{
  const rel = 'app/faq/page.js';
  let s = read(rel);
  if (s.includes('fq-btn')) {
    jobs.push({ rel, skip: true });
  } else {
    s = sub(s, /const pad = [^\n]*\n\n?/, '', 'const pad helper');
    s = sub(s, /OCCASIONS\.map\(\(o, i\) =>/, 'OCCASIONS.map((o) =>', 'OCCASIONS.map((o, i)');
    s = sub(s, /\s*<span className="fq-n">\{pad\(i\)\}<\/span>/, '', 'fq-n numbering span');
    s = sub(s, /\s*<span className="fq-ar" aria-hidden="true">→<\/span>/, '', 'fq-ar arrow span');
    s = sub(
      s,
      /<a href="\/" className="btn-ghost">← Back to Angelyn's Cakes<\/a>/,
      `<a href="/" className="fq-btn">\n                ${ARROW}\n                Back to Angelyn's Cakes\n              </a>`,
      'bottom back button'
    );
    if (!CLOSED) {
      s = sub(s, /FAQ\.map\(\(f\) =>/, 'FAQ.map((f, i) =>', 'FAQ.map((f)');
      s = sub(s, /<details key=\{f\.q\}>/, '<details key={f.q} open={i === 0}>', '<details key={f.q}>');
    }
    jobs.push({ rel, out: s });
  }
}

/* 3. components/FaqNav.js */
{
  const rel = 'components/FaqNav.js';
  let s = read(rel);
  if (s.includes('fq-btn')) {
    jobs.push({ rel, skip: true });
  } else {
    s = sub(
      s,
      /<a href="\/" className="btn-ghost fq-back">\s*<span aria-hidden="true">←<\/span>/,
      `<a href="/" className="fq-btn fq-back">\n          ${ARROW}`,
      'nav back button'
    );
    jobs.push({ rel, out: s });
  }
}

/* ───────────────────────── write ───────────────────────── */
for (const j of jobs) {
  if (j.skip) {
    console.log(`• ${j.rel}: already patched, skipped`);
    continue;
  }
  if (DRY) {
    console.log(`~ ${j.rel}: would be updated (dry run)`);
  } else {
    writeFileSync(resolve(root, j.rel), j.out);
    console.log(`✓ ${j.rel}: updated`);
  }
}
console.log(
  DRY
    ? '\nDry run only. Re-run without --dry to apply.'
    : '\nDone. Review with `git diff`, then `npm run dev` and open /faq on a phone-sized window.'
);
