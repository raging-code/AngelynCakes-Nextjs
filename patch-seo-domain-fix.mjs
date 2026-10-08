#!/usr/bin/env node
/* Angelyn's Cakes: finish the canonical domain switch (angelyncakes.com -> angelynscake.com)
 *
 * Run from the repo root on the `nextjs` branch:
 *   node patch-seo-domain-fix.mjs --dry       preview, write nothing
 *   node patch-seo-domain-fix.mjs             apply
 *   node patch-seo-domain-fix.mjs --cleanup   apply + delete patch-faq-redesign.mjs from the repo root
 *
 * Fixes:
 *   public/sitemap.xml   <loc> URLs -> https://www.angelynscake.com, lastmod -> today
 *   public/robots.txt    Sitemap line -> https://www.angelynscake.com/sitemap.xml
 *   app/layout.js        og:url moved from a hard-coded <meta> to metadata.openGraph.url
 *                        (so each page can set its own)
 *   app/faq/page.js      /faq now declares og:url = https://www.angelynscake.com/faq
 *
 * Not touched on purpose: the 'angelyncakes.com' SEO keyword entries in layout.js / lib/seo.js
 * (people still search for that spelling).
 * Safe to re-run: already-fixed files are skipped.
 */
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';

const DRY = process.argv.includes('--dry');
const CLEANUP = process.argv.includes('--cleanup');
const root = process.cwd();

const OLD = 'www.angelyncakes.com';
const NEW = 'www.angelynscake.com';
const TODAY = new Date().toISOString().slice(0, 10);

const read = (rel) => {
  const p = resolve(root, rel);
  if (!existsSync(p)) {
    console.error(`✗ ${rel} not found. Run this from the repo root on the nextjs branch.`);
    process.exit(1);
  }
  return readFileSync(p, 'utf8');
};

const sub = (src, re, to, label) => {
  if (!re.test(src)) {
    console.error(`✗ Could not find: ${label}\n  The file differs from what this patch expects. Nothing was written.`);
    process.exit(1);
  }
  return src.replace(re, typeof to === 'function' ? to : () => to);
};

const jobs = [];

/* 1. sitemap.xml */
{
  const rel = 'public/sitemap.xml';
  const s = read(rel);
  if (!s.includes(OLD)) {
    jobs.push({ rel, skip: true });
  } else {
    let out = s.split(OLD).join(NEW);
    out = out.replace(/<lastmod>[^<]*<\/lastmod>/g, `<lastmod>${TODAY}</lastmod>`);
    jobs.push({ rel, out });
  }
}

/* 2. robots.txt */
{
  const rel = 'public/robots.txt';
  const s = read(rel);
  jobs.push(s.includes(OLD) ? { rel, out: s.split(OLD).join(NEW) } : { rel, skip: true });
}

/* 3. app/layout.js: per-page og:url via the metadata API */
{
  const rel = 'app/layout.js';
  let s = read(rel);
  if (s.includes('openGraph:')) {
    jobs.push({ rel, skip: true });
  } else {
    s = sub(
      s,
      /[ \t]*<meta property="og:url" content="[^"]*" \/>\r?\n/,
      '',
      'hard-coded <meta property="og:url">'
    );
    s = sub(
      s,
      /(alternates: \{ canonical: '[^']*' \},\r?\n)/,
      (m) => `${m}  openGraph: { url: 'https://${NEW}/' },\n`,
      'alternates.canonical in layout metadata'
    );
    jobs.push({ rel, out: s });
  }
}

/* 4. app/faq/page.js */
{
  const rel = 'app/faq/page.js';
  let s = read(rel);
  if (s.includes('openGraph:')) {
    jobs.push({ rel, skip: true });
  } else {
    s = sub(
      s,
      /(  alternates: \{ canonical: '[^']*' \},\r?\n)/,
      (m) => `${m}  openGraph: { url: 'https://${NEW}/faq' },\n`,
      'alternates.canonical in faq metadata'
    );
    jobs.push({ rel, out: s });
  }
}

/* write */
for (const j of jobs) {
  if (j.skip) {
    console.log(`• ${j.rel}: already fixed, skipped`);
  } else if (DRY) {
    console.log(`~ ${j.rel}: would be updated (dry run)`);
  } else {
    writeFileSync(resolve(root, j.rel), j.out);
    console.log(`✓ ${j.rel}: updated`);
  }
}

if (CLEANUP) {
  const old = resolve(root, 'patch-faq-redesign.mjs');
  if (existsSync(old)) {
    if (DRY) console.log('~ patch-faq-redesign.mjs: would be deleted (dry run)');
    else {
      unlinkSync(old);
      console.log('✓ patch-faq-redesign.mjs: deleted');
    }
  }
}

console.log(
  DRY
    ? '\nDry run only. Re-run without --dry to apply.'
    : '\nDone. Review with `git diff`, run `npm run build`, then deploy.\n' +
        'After deploy: in the angelynscake.com domain property, submit https://www.angelynscake.com/sitemap.xml,\n' +
        'then request indexing for / and /faq.'
);
