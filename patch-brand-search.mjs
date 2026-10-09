#!/usr/bin/env node
/* Angelyn's Cakes: make the brand name unmistakable to Google ("angelyns cake" searches)
 *
 * Run from the repo root on the `nextjs` branch:
 *   node patch-brand-search.mjs --dry     preview, write nothing
 *   node patch-brand-search.mjs           apply
 *
 * What the audit found: the live site is already indexable (canonical, robots, sitemap are all
 * correct). The code gaps that weaken a brand-name search are:
 *   1. The home page <h1> says "Cakes that command attention." and never names the business.
 *   2. The About section calls the business "Angelyn's Cake" (singular), contradicting the
 *      title, JSON-LD and everything else ("Angelyn's Cakes").
 *   3. The WebSite JSON-LD has no alternateName, so Google's site-name feature only knows one spelling.
 *   4. No applicationName metadata.
 *
 * Changes:
 *   components/Hero.js   <h1> gets a screen-reader/crawler-visible lead-in:
 *                        "Angelyn's Cakes, custom cakes in Manila." (visually hidden, design unchanged)
 *   components/About.js  "Angelyn's Cake" -> "Angelyn's Cakes" (2 places)
 *   lib/seo.js           WebSite JSON-LD: alternateName with the common spellings
 *   app/layout.js        metadata.applicationName = "Angelyn's Cakes"
 *
 * Safe to re-run: steps already applied are skipped. Nothing is written unless every step can be applied.
 *
 * IMPORTANT: no code patch can force Google to list a site. After deploying, do the Search Console
 * steps printed at the end (inspect + request indexing, submit the sitemap).
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const DRY = process.argv.includes('--dry');
const root = process.cwd();
const abs = (rel) => resolve(root, rel);

const die = (msg) => {
  console.error(`✗ ${msg}\n  Nothing was written.`);
  process.exit(1);
};

for (const rel of ['components/Hero.js', 'components/About.js', 'lib/seo.js', 'app/layout.js']) {
  if (!existsSync(abs(rel))) die(`${rel} not found. Run this from the repo root on the nextjs branch.`);
}

const jobs = [];

/* 1. Hero <h1>: add the brand name (visually hidden, still read by Google and screen readers) */
{
  const rel = 'components/Hero.js';
  const s = readFileSync(abs(rel), 'utf8');
  if (s.includes('HERO_BRAND')) {
    jobs.push({ rel, skip: true });
  } else {
    const re = /<h1 className="hero-headline">(Cakes that)/;
    if (!re.test(s)) die('Could not find <h1 className="hero-headline">Cakes that… in components/Hero.js.');
    const decl =
      "/* Visually hidden brand lead-in for the <h1> (crawlers + screen readers read it; layout is unchanged). */\n" +
      "const HERO_BRAND = { position: 'absolute', width: 1, height: 1, margin: -1, padding: 0, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap', border: 0 };\n\n";
    let out = s.replace(re, `<h1 className="hero-headline"><span style={HERO_BRAND}>Angelyn's Cakes: custom cakes in Manila. </span>$1`);
    const anchor = /\nexport default function Hero\(\)/;
    if (!anchor.test(out)) die('Could not find "export default function Hero()" in components/Hero.js.');
    out = out.replace(anchor, `\n${decl}export default function Hero()`);
    jobs.push({ rel, out });
  }
}

/* 2. About: "Angelyn's Cake" -> "Angelyn's Cakes" */
{
  const rel = 'components/About.js';
  const s = readFileSync(abs(rel), 'utf8');
  const re = /Angelyn's Cake(?!s)/g;
  if (!re.test(s)) {
    jobs.push({ rel, skip: true });
  } else {
    jobs.push({ rel, out: s.replace(/Angelyn's Cake(?!s)/g, "Angelyn's Cakes") });
  }
}

/* 3. WebSite JSON-LD alternateName */
{
  const rel = 'lib/seo.js';
  const s = readFileSync(abs(rel), 'utf8');
  if (/\/#website'[\s\S]{0,250}?alternateName: \['Angelyns Cakes'/.test(s)) {
    jobs.push({ rel, skip: true });
  } else {
    const re = /('@id': SITE \+ '\/#website',\s*\n\s*url: SITE \+ '\/',\s*\n)(\s*)(name: BUSINESS\.name,\s*\n)/;
    if (!re.test(s)) die("Could not find the WebSite block (name: BUSINESS.name) in lib/seo.js.");
    jobs.push({
      rel,
      out: s.replace(
        re,
        (_m, head, ind, nameLine) =>
          `${head}${ind}${nameLine}${ind}alternateName: ['Angelyns Cakes', 'Angelyn Cakes', 'Angelyns Cake', 'Angelyn Cake'],\n`
      ),
    });
  }
}

/* 4. applicationName metadata */
{
  const rel = 'app/layout.js';
  const s = readFileSync(abs(rel), 'utf8');
  if (s.includes('applicationName')) {
    jobs.push({ rel, skip: true });
  } else {
    const re = /(  metadataBase: new URL\('[^']*'\),\r?\n)/;
    if (!re.test(s)) die('Could not find metadataBase in app/layout.js.');
    jobs.push({ rel, out: s.replace(re, (m) => `${m}  applicationName: "Angelyn's Cakes",\n`) });
  }
}

/* write */
for (const j of jobs) {
  if (j.skip) console.log(`• ${j.rel}: already applied, skipped`);
  else if (DRY) console.log(`~ ${j.rel}: would be updated (dry run)`);
  else {
    writeFileSync(abs(j.rel), j.out);
    console.log(`✓ ${j.rel}: updated`);
  }
}

console.log(
  DRY
    ? '\nDry run only. Re-run without --dry to apply.'
    : '\nDone. Run `npm run build` (the last line should read "[verify-seo] OK ..."), then commit, push and let Cloudflare redeploy.\n\n' +
        'Then, in Google Search Console (property: www.angelynscake.com or the angelynscake.com domain property):\n' +
        '  1. URL Inspection -> https://www.angelynscake.com/ -> "Test live URL" -> "Request indexing". Repeat for /faq.\n' +
        '  2. Sitemaps -> submit https://www.angelynscake.com/sitemap.xml.\n' +
        '  3. Pages report: if it says "Discovered/Crawled - currently not indexed", that is a quality/age signal, not a bug; keep requesting + earn links (below).\n' +
        'Also: claim/verify your Google Business Profile (60 Russel Ave, Pasay) and link the website, and make sure your\n' +
        'Facebook / Instagram bios link to https://www.angelynscake.com. Those links are what usually make a brand search work.'
);
