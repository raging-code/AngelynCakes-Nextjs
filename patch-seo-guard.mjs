#!/usr/bin/env node
/* Angelyn's Cakes: SEO canonical guard
 *
 * Why: Search Console reported "Page is not indexed: Alternate page with proper canonical tag"
 * for https://www.angelynscake.com/ because the deployed HTML declared its canonical as
 * https://www.angelynscake.com/ (a different domain). The source was already corrected in commit
 * c4c3a2a; this patch makes sure that mistake can never ship again.
 *
 * Run from the repo root on the `nextjs` branch:
 *   node patch-seo-guard.mjs --dry     preview, write nothing
 *   node patch-seo-guard.mjs           apply
 *
 * Changes:
 *   1. scripts/verify-seo.mjs   NEW. Runs after the build and FAILS the build if, in out/:
 *                               - a page's canonical / og:url is missing, on the wrong host, or the wrong path
 *                               - a page carries a noindex robots tag
 *                               - sitemap.xml <loc> entries are on the wrong host or point to pages that don't exist
 *                               - robots.txt blocks everything or its Sitemap line is on the wrong host
 *   2. package.json             "postbuild" now also runs scripts/verify-seo.mjs
 *   3. app/not-found.js         the 404 page no longer inherits the home-page canonical / og:url
 *
 * Safe to re-run: steps already applied are skipped. Nothing is written unless every step can be applied.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const DRY = process.argv.includes('--dry');
const root = process.cwd();
const abs = (rel) => resolve(root, rel);

const die = (msg) => {
  console.error(`✗ ${msg}\n  Nothing was written.`);
  process.exit(1);
};

for (const rel of ['package.json', 'app/not-found.js', 'scripts/csp-hash.mjs', 'app/layout.js']) {
  if (!existsSync(abs(rel))) die(`${rel} not found. Run this from the repo root on the nextjs branch.`);
}

const jobs = [];

/* 1. scripts/verify-seo.mjs */
const VERIFY = `#!/usr/bin/env node
/**
 * scripts/verify-seo.mjs: runs after \`next build\` (see "postbuild" in package.json).
 * Fails the build when the exported site in out/ would send Google the wrong canonical signals.
 */
import fs from 'node:fs';
import path from 'node:path';

const ORIGIN = 'https://www.angelynscake.com'; // the ONE canonical host. Change here if the domain ever changes.
const OUT = path.resolve('out');
const errors = [];
const err = (m) => errors.push(m);

if (!fs.existsSync(OUT)) {
  console.error('[verify-seo] out/ not found. Run "next build" first.');
  process.exit(1);
}

const norm = (p) => (p.length > 1 ? p.replace(/\\/+$/, '') : p) || '/';
const attr = (tag, name) => {
  const m = tag.match(new RegExp('\\\\b' + name + '\\\\s*=\\\\s*"([^"]*)"', 'i'));
  return m ? m[1].replace(/&amp;/g, '&') : null;
};
const tags = (html, name) => html.match(new RegExp('<' + name + '\\\\b[^>]*>', 'gi')) || [];

/** Compare a URL against the expected origin + route. Returns a problem string or null. */
const check = (label, url, route) => {
  let u;
  try {
    u = new URL(url);
  } catch {
    return label + ' is not a valid absolute URL: ' + url;
  }
  if (u.origin !== ORIGIN) return label + ' is on ' + u.origin + ', expected ' + ORIGIN + ' (' + url + ')';
  if (norm(u.pathname) !== route) return label + ' path is ' + u.pathname + ', expected ' + route;
  return null;
};

/* Indexable pages: every exported .html except the 404 shells. */
const pages = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === '_next') continue;
      walk(f);
    } else if (e.name.endsWith('.html')) {
      const rel = path.relative(OUT, f).split(path.sep).join('/');
      if (rel === '404.html' || rel === '_not-found.html' || /^google[0-9a-f]+\\.html$/i.test(rel)) continue;
      const route = norm('/' + rel.replace(/(^|\\/)index\\.html$/, '').replace(/\\.html$/, ''));
      pages.push({ file: f, rel, route });
    }
  }
})(OUT);

if (!pages.length) err('no indexable pages found in out/');

for (const { file, rel, route } of pages) {
  const html = fs.readFileSync(file, 'utf8');

  const canon = tags(html, 'link').filter((t) => /rel\\s*=\\s*"canonical"/i.test(t));
  if (canon.length !== 1) err(rel + ': expected exactly 1 canonical link, found ' + canon.length);
  else {
    const p = check(rel + ' canonical', attr(canon[0], 'href') || '', route);
    if (p) err(p);
  }

  const og = tags(html, 'meta').filter((t) => /property\\s*=\\s*"og:url"/i.test(t));
  if (og.length !== 1) err(rel + ': expected exactly 1 og:url, found ' + og.length);
  else {
    const p = check(rel + ' og:url', attr(og[0], 'content') || '', route);
    if (p) err(p);
  }

  for (const t of tags(html, 'meta')) {
    const n = (attr(t, 'name') || '').toLowerCase();
    if ((n === 'robots' || n === 'googlebot') && /noindex|none/i.test(attr(t, 'content') || '')) {
      err(rel + ': <meta name="' + n + '"> contains noindex');
    }
  }
}

/* sitemap.xml */
const smPath = path.join(OUT, 'sitemap.xml');
if (!fs.existsSync(smPath)) err('sitemap.xml missing from out/');
else {
  const locs = [...fs.readFileSync(smPath, 'utf8').matchAll(/<loc>\\s*([^<\\s]+)\\s*<\\/loc>/gi)].map((m) => m[1]);
  if (!locs.length) err('sitemap.xml has no <loc> entries');
  const routes = new Set(pages.map((p) => p.route));
  for (const loc of locs) {
    let u;
    try {
      u = new URL(loc);
    } catch {
      err('sitemap.xml: invalid URL ' + loc);
      continue;
    }
    if (u.origin !== ORIGIN) err('sitemap.xml: ' + loc + ' is not on ' + ORIGIN);
    else if (!routes.has(norm(u.pathname))) err('sitemap.xml: ' + loc + ' does not match any built page');
  }
  for (const r of routes) {
    if (!locs.some((l) => { try { return norm(new URL(l).pathname) === r; } catch { return false; } })) {
      err('sitemap.xml: built page ' + r + ' is missing from the sitemap');
    }
  }
}

/* robots.txt */
const rbPath = path.join(OUT, 'robots.txt');
if (!fs.existsSync(rbPath)) err('robots.txt missing from out/');
else {
  const rb = fs.readFileSync(rbPath, 'utf8');
  if (/^\\s*Disallow:\\s*\\/\\s*$/im.test(rb)) err('robots.txt contains "Disallow: /" (blocks the whole site)');
  const sm = [...rb.matchAll(/^\\s*Sitemap:\\s*(\\S+)\\s*$/gim)].map((m) => m[1]);
  if (!sm.length) err('robots.txt has no Sitemap line');
  for (const s of sm) if (s !== ORIGIN + '/sitemap.xml') err('robots.txt: Sitemap is ' + s + ', expected ' + ORIGIN + '/sitemap.xml');
}

if (errors.length) {
  console.error('[verify-seo] FAILED:\\n  - ' + errors.join('\\n  - '));
  process.exit(1);
}
console.log('[verify-seo] OK: ' + pages.length + ' page(s), canonical / og:url / sitemap / robots all on ' + ORIGIN);
`;

{
  const rel = 'scripts/verify-seo.mjs';
  const cur = existsSync(abs(rel)) ? readFileSync(abs(rel), 'utf8') : null;
  jobs.push(cur === VERIFY ? { rel, skip: true } : { rel, out: VERIFY, isNew: cur === null });
}

/* 2. package.json postbuild */
{
  const rel = 'package.json';
  const s = readFileSync(abs(rel), 'utf8');
  if (s.includes('verify-seo.mjs')) {
    jobs.push({ rel, skip: true });
  } else {
    const re = /("postbuild"\s*:\s*")node scripts\/csp-hash\.mjs(")/;
    if (!re.test(s)) die('Could not find "postbuild": "node scripts/csp-hash.mjs" in package.json.');
    jobs.push({ rel, out: s.replace(re, '$1node scripts/csp-hash.mjs && node scripts/verify-seo.mjs$2') });
  }
}

/* 3. app/not-found.js: stop inheriting the home canonical / og:url from the root layout */
{
  const rel = 'app/not-found.js';
  const s = readFileSync(abs(rel), 'utf8');
  if (/alternates:\s*\{\s*\}/.test(s)) {
    jobs.push({ rel, skip: true });
  } else {
    const re = /(\n)([ \t]*)(robots:\s*\{\s*index:\s*false,\s*follow:\s*true\s*\},)/;
    if (!re.test(s)) die('Could not find the robots line in app/not-found.js.');
    jobs.push({
      rel,
      out: s.replace(re, (_m, nl, ind, robots) => `${nl}${ind}alternates: {},\n${ind}openGraph: {},\n${ind}${robots}`),
    });
  }
}

/* write */
for (const j of jobs) {
  if (j.skip) console.log(`• ${j.rel}: already applied, skipped`);
  else if (DRY) console.log(`~ ${j.rel}: would be ${j.isNew ? 'created' : 'updated'} (dry run)`);
  else {
    mkdirSync(dirname(abs(j.rel)), { recursive: true });
    writeFileSync(abs(j.rel), j.out);
    console.log(`✓ ${j.rel}: ${j.isNew ? 'created' : 'updated'}`);
  }
}

console.log(
  DRY
    ? '\nDry run only. Re-run without --dry to apply.'
    : '\nDone. Run `npm run build`: the last line should read "[verify-seo] OK ...".\nThen commit, push, and let Cloudflare Pages redeploy.'
);
