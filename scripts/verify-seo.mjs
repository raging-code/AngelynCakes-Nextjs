#!/usr/bin/env node
/**
 * scripts/verify-seo.mjs: runs after `next build` (see "postbuild" in package.json).
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

const norm = (p) => (p.length > 1 ? p.replace(/\/+$/, '') : p) || '/';
const attr = (tag, name) => {
  const m = tag.match(new RegExp('\\b' + name + '\\s*=\\s*"([^"]*)"', 'i'));
  return m ? m[1].replace(/&amp;/g, '&') : null;
};
const tags = (html, name) => html.match(new RegExp('<' + name + '\\b[^>]*>', 'gi')) || [];

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
      if (rel === '404.html' || rel === '_not-found.html' || /^google[0-9a-f]+\.html$/i.test(rel)) continue;
      const route = norm('/' + rel.replace(/(^|\/)index\.html$/, '').replace(/\.html$/, ''));
      pages.push({ file: f, rel, route });
    }
  }
})(OUT);

if (!pages.length) err('no indexable pages found in out/');

for (const { file, rel, route } of pages) {
  const html = fs.readFileSync(file, 'utf8');

  const canon = tags(html, 'link').filter((t) => /rel\s*=\s*"canonical"/i.test(t));
  if (canon.length !== 1) err(rel + ': expected exactly 1 canonical link, found ' + canon.length);
  else {
    const p = check(rel + ' canonical', attr(canon[0], 'href') || '', route);
    if (p) err(p);
  }

  const og = tags(html, 'meta').filter((t) => /property\s*=\s*"og:url"/i.test(t));
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
  const locs = [...fs.readFileSync(smPath, 'utf8').matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1]);
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
  if (/^\s*Disallow:\s*\/\s*$/im.test(rb)) err('robots.txt contains "Disallow: /" (blocks the whole site)');
  const sm = [...rb.matchAll(/^\s*Sitemap:\s*(\S+)\s*$/gim)].map((m) => m[1]);
  if (!sm.length) err('robots.txt has no Sitemap line');
  for (const s of sm) if (s !== ORIGIN + '/sitemap.xml') err('robots.txt: Sitemap is ' + s + ', expected ' + ORIGIN + '/sitemap.xml');
}

if (errors.length) {
  console.error('[verify-seo] FAILED:\n  - ' + errors.join('\n  - '));
  process.exit(1);
}
console.log('[verify-seo] OK: ' + pages.length + ' page(s), canonical / og:url / sitemap / robots all on ' + ORIGIN);
