// Run from the repo root:  node patch-faq-page.mjs
//
// What it does
//  1. Adds a new page /faq (Design A: editorial occasions list + FAQ) with its own
//     title, description, canonical URL and FAQPage + Breadcrumb structured data.
//  2. Adds "FAQ" to the navbar (desktop + mobile menu) and a "Back to Angelyn's Cakes"
//     button on the FAQ page (top bar and bottom).
//  3. Replaces the long occasions + FAQ block on the home page with a short intro
//     that links to /faq (keeps the keywords on the home page).
//  4. Moves the FAQPage schema from the home page to /faq (Google requires the schema
//     to match visible content on the same page).
//  5. Adds all Metro Manila cities (areaServed, FAQ answer, visible list, keywords).
//  6. Adds name variants: Angelyns Cakes / Angelyns Cake / Angelyn Cake / angelyncakes.
//  7. Adds /faq to public/sitemap.xml.
//
// Safe to re-run: it stops if it was already applied. Nothing is written unless
// every edit can be applied.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const fail = (m) => { console.error('\nSTOPPED: ' + m + '\nNothing was changed.'); process.exit(1); };
for (const f of ['lib/seo.js', 'app/layout.js', 'components/Nav.js', 'components/Occasions.js', 'app/globals.css', 'public/sitemap.xml'])
  if (!existsSync(f)) fail('Cannot find ' + f + '. Run this from the repo root (Angelyns-Cakes).');

const read = (f) => readFileSync(f, 'utf8');
const out = new Map(); // path -> new content (written only if everything succeeds)

if (existsSync('app/faq/page.js')) fail('app/faq/page.js already exists. The patch looks already applied.');

/* ---------------------------------------------------------------- lib/seo.js */
let seo = read('lib/seo.js');

// 1) Metro Manila cities, defined right before FAQ
const CITIES = `export const METRO_CITIES = [
  'Pasay City', 'Makati', 'Manila', 'Quezon City', 'Taguig', 'Mandaluyong', 'San Juan', 'Pasig',
  'Parañaque', 'Las Piñas', 'Muntinlupa', 'Caloocan', 'Malabon', 'Navotas', 'Valenzuela', 'Marikina', 'Pateros',
];

`;
if (!seo.includes('export const FAQ = [')) fail('lib/seo.js: "export const FAQ = [" not found.');
seo = seo.replace('export const FAQ = [', () => CITIES + 'export const FAQ = [');

// 2) two extra FAQ answers (end of FAQ array)
const faqStart = seo.indexOf('export const FAQ = [');
const faqEnd = seo.indexOf('\n];', faqStart);
if (faqEnd < 0) fail('lib/seo.js: end of FAQ array not found.');
const NEW_FAQ = `  {
    q: 'Which areas in Metro Manila do you serve?',
    a: 'We make custom cakes for celebrations across Metro Manila, including ' + METRO_CITIES.join(', ') + '. Send us your celebration date and venue by phone, Viber or email and we will confirm delivery arrangements for your location.',
  },
  {
    q: "Is Angelyn's Cakes the same as Angelyns Cakes, Angelyn Cakes or Angelyn Cake?",
    a: "Yes. Angelyn's Cakes is also searched as Angelyns Cakes, Angelyns Cake, Angelyn Cakes, Angelyn Cake and angelyncakes. It is one custom cake shop in Pasay City, Metro Manila, at www.angelyncakes.com.",
  },`;
seo = seo.slice(0, faqEnd) + '\n' + NEW_FAQ + seo.slice(faqEnd);

// 3) brand name variants
const altRe = /alternateNames:\s*\[[^\]]*\],/;
if (!altRe.test(seo)) fail('lib/seo.js: alternateNames not found.');
seo = seo.replace(altRe, () =>
  `alternateNames: [
    "Angelyn's Cakes",
    "Angelyn's Cake",
    'Angelyns Cakes',
    'Angelyns Cake',
    'Angelyn Cakes',
    'Angelyn Cake',
    'AngelynCakes',
    'angelyncakes.com',
  ],`);

// 4) areaServed: all Metro Manila cities
const areaRe = /areaServed: \[\n\s+\{ '@type': 'AdministrativeArea', name: 'Metro Manila' \},[\s\S]*?\n\s+\],/;
if (!areaRe.test(seo)) fail('lib/seo.js: Bakery areaServed block not found.');
seo = seo.replace(areaRe, () =>
  `areaServed: [
        { '@type': 'AdministrativeArea', name: 'Metro Manila' },
        ...METRO_CITIES.map((c) => ({ '@type': 'City', name: c })),
      ],`);

// 5) remove FAQPage from the home-page graph (moves to /faq)
const faqNodeRe = /\n    \{\n      '@type': 'FAQPage',[\s\S]*?\n    \},/;
if (!faqNodeRe.test(seo)) fail('lib/seo.js: FAQPage node in JSON_LD not found.');
seo = seo.replace(faqNodeRe, '');

// 6) FAQ page schema
seo += `
// Structured data for the /faq page only (matches the visible FAQ on that page).
export const FAQ_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'FAQPage',
      '@id': SITE + '/faq#faq',
      url: SITE + '/faq',
      isPartOf: { '@id': SITE + '/#website' },
      about: { '@id': SITE + '/#business' },
      mainEntity: FAQ.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: "Angelyn's Cakes", item: SITE + '/' },
        { '@type': 'ListItem', position: 2, name: 'Occasions & FAQ', item: SITE + '/faq' },
      ],
    },
  ],
};
`;
out.set('lib/seo.js', seo);

/* ------------------------------------------------------------- app/layout.js */
let layout = read('app/layout.js');
const impRe = /import \{ JSON_LD \} from '\.\.\/lib\/seo';/;
if (!impRe.test(layout)) fail("app/layout.js: import { JSON_LD } line not found.");
layout = layout.replace(impRe, () => "import { JSON_LD, METRO_CITIES } from '../lib/seo';");

const kw1 = /(\n\s*)'custom cakes Manila',/;
if (!kw1.test(layout)) fail("app/layout.js: keyword 'custom cakes Manila' not found.");
layout = layout.replace(kw1, (m, sp) =>
  `${sp}'Angelyns Cakes',${sp}'Angelyns Cake',${sp}'Angelyn Cake',${sp}'angelyncakes',${sp}'angelyncakes.com',${sp}'custom cakes Manila',${sp}'custom cakes Metro Manila',${sp}'cake shop Metro Manila',`);

const kw2 = /(\n\s*)'bespoke cakes Philippines',/;
if (!kw2.test(layout)) fail("app/layout.js: keyword 'bespoke cakes Philippines' not found.");
layout = layout.replace(kw2, (m, sp) => `${m}${sp}...METRO_CITIES.map((c) => 'custom cakes ' + c),`);

const descOld = 'cakes in Manila. Visit our Pasay City showroom by appointment.';
if (layout.includes(descOld))
  layout = layout.replace(descOld, 'cakes in Manila and across Metro Manila. Visit our Pasay City showroom by appointment.');
else console.warn('Note: meta description text not found in layout.js, left as is.');
out.set('app/layout.js', layout);

/* ----------------------------------------------------------- components/Nav.js */
let nav = read('components/Nav.js');
const dRe = /(<a href="#reviews" className="nav-link">Reviews<\/a>)/;
const mRe = /(<a href="#reviews" className="mobile-link" onClick=\{close\}>Reviews<\/a>)/;
if (!dRe.test(nav) || !mRe.test(nav)) fail('components/Nav.js: Reviews links not found.');
nav = nav.replace(dRe, (m) => m + '\n          <a href="/faq" className="nav-link">FAQ</a>');
nav = nav.replace(mRe, (m) => m + '\n          <a href="/faq" className="mobile-link" onClick={close}>FAQ</a>');
out.set('components/Nav.js', nav);

/* ------------------------------------------------- components/Occasions.js (home) */
out.set('components/Occasions.js', String.raw`import { OCCASIONS } from '../lib/seo';

/* Short, crawlable intro on the home page. The full occasions list and the FAQ live on /faq. */
export default function Occasions() {
  return (
    <section className="section" id="occasions" style={{ background: 'var(--bg-alt)' }}>
      <div className="section-inner">
        <h2 className="section-title" style={{ marginBottom: '1.1rem' }}>
          Custom Cakes for<br />
          <em>Every Occasion</em>
        </h2>
        <p className="seo-intro">
          Looking for wedding cakes, birthday cakes, debut cakes or christening cakes in Metro Manila? Angelyn's Cakes
          designs every cake to order, handcrafted for weddings, birthdays, anniversaries, graduations, corporate events
          and private parties in Pasay City, Makati, Manila, Quezon City and across Metro Manila.
        </p>
        <ul className="fq-chips">
          {OCCASIONS.map((o) => (
            <li key={o.title}><a href="/faq#occasions">{o.title}</a></li>
          ))}
        </ul>
        <div style={{ marginTop: '2rem' }}>
          <a href="/faq" className="btn-ghost" style={{ fontSize: '0.78rem' }}>Occasions &amp; FAQ →</a>
        </div>
      </div>
    </section>
  );
}
`);

/* ----------------------------------------------------------- components/FaqNav.js */
out.set('components/FaqNav.js', String.raw`/* Simple top bar for the /faq page: logo + a clear way back to the main site. */
export default function FaqNav() {
  return (
    <nav className="nav-root" aria-label="Main">
      <div className="nav-inner">
        <a href="/" className="logo-wrap">
          <div className="logo-box">
            <img src="/images/logo-sm.webp" alt="Angelyn's Cakes logo" decoding="async" loading="eager" />
          </div>
          <span className="logo-text">Angelyn's Cakes</span>
        </a>
        <a href="/" className="btn-ghost fq-back">
          <span aria-hidden="true">←</span>
          <span className="fq-long">Back to Angelyn's Cakes</span>
          <span className="fq-short">Back</span>
        </a>
      </div>
    </nav>
  );
}
`);

/* ------------------------------------------------------------------ app/faq/page.js */
out.set('app/faq/page.js', String.raw`import FaqNav from '../../components/FaqNav';
import Footer from '../../components/Footer';
import { OCCASIONS, FAQ, METRO_CITIES, FAQ_JSON_LD } from '../../lib/seo';

export const metadata = {
  title: "Custom Cake Occasions & FAQ in Metro Manila | Angelyn's Cakes",
  description:
    "Answers about ordering custom wedding, birthday, debut and christening cakes from Angelyn's Cakes (Angelyn Cakes, Angelyns Cake) in Pasay City. Serving all of Metro Manila.",
  alternates: { canonical: 'https://www.angelyncakes.com/faq' },
};

const pad = (i) => (i + 1 < 10 ? '0' : '') + (i + 1);

export default function FaqPage() {
  return (
    <>
      <FaqNav />
      <main className="fq-main">
        <section className="fq-sec" id="occasions">
          <div className="fq-in">
            <span className="fq-eye">Occasions</span>
            <h1 className="fq-title">
              Custom Cakes for<br />
              <em>Every Occasion</em>
            </h1>
            <p className="fq-lead">
              Looking for wedding cakes, birthday cakes, debut cakes or christening cakes in Metro Manila? Angelyn's Cakes
              designs every cake to order, handcrafted for weddings, birthdays, anniversaries, graduations, corporate
              events and private parties.
            </p>

            <div className="fq-list">
              {OCCASIONS.map((o, i) => (
                <article className="fq-row" key={o.title}>
                  <span className="fq-n">{pad(i)}</span>
                  <h2>{o.title}</h2>
                  <p>{o.text}</p>
                  <span className="fq-ar" aria-hidden="true">→</span>
                </article>
              ))}
            </div>

            <div className="fq-areas" id="areas">
              <span className="fq-eye">Where we serve</span>
              <p>Based in Pasay City, creating custom cakes for celebrations across all of Metro Manila.</p>
              <ul className="fq-cities">
                {METRO_CITIES.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>

            <div className="fq-faq" id="faq">
              <div>
                <span className="fq-eye">FAQ</span>
                <h2 className="fq-h2">Frequently asked questions</h2>
                <a href="/#contact" className="btn-cta fq-cta">Book a Consultation</a>
              </div>
              <div>
                {FAQ.map((f) => (
                  <details key={f.q}>
                    <summary>{f.q}</summary>
                    <p>{f.a}</p>
                  </details>
                ))}
              </div>
            </div>

            <div className="fq-bottom">
              <a href="/" className="btn-ghost">← Back to Angelyn's Cakes</a>
            </div>
          </div>
        </section>
        <Footer />
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }} />
    </>
  );
}
`);

/* ------------------------------------------------------------------ app/globals.css */
let css = read('app/globals.css');
if (css.includes('angelyn:faq-page')) fail('globals.css already contains the faq-page styles.');
css += String.raw`

/* >>> angelyn:faq-page */
.fq-back{font-size:.7rem;padding:10px 16px;gap:.5rem;white-space:nowrap}
.fq-short{display:inline}.fq-long{display:none}
@media(min-width:640px){.fq-short{display:none}.fq-long{display:inline}.fq-back{font-size:.74rem;padding:11px 22px}}
.fq-main{padding-top:64px;background:var(--bg)}
@media(min-width:768px){.fq-main{padding-top:80px}}
.fq-sec{padding:4rem 1.25rem 0}
@media(min-width:768px){.fq-sec{padding:6rem 3rem 0}}
.fq-in{max-width:1100px;margin:0 auto;padding-bottom:5rem}
.fq-eye{display:block;font-size:.72rem;font-weight:700;letter-spacing:.32em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem}
.fq-title{font-family:'Playfair Display',Georgia,serif;font-size:clamp(2.2rem,6vw,4.2rem);font-weight:900;line-height:.98;color:var(--text);margin-bottom:1.1rem}
.fq-title em{font-style:italic;font-weight:400;color:var(--gold-lg)}
.fq-lead{font-size:1rem;font-weight:300;line-height:1.75;color:var(--text-mid);max-width:600px}
.fq-list{margin-top:3.5rem;border-bottom:1px solid rgba(46,21,16,.16)}
.fq-row{display:grid;grid-template-columns:3rem 1fr;gap:.25rem 1rem;padding:1.6rem 0;border-top:1px solid rgba(46,21,16,.16);transition:padding .3s}
@media(min-width:800px){.fq-row{grid-template-columns:4rem 1.1fr 1.4fr 2rem;align-items:baseline;gap:2rem}.fq-row:hover{padding-left:1rem}}
.fq-n{font-family:'Playfair Display',serif;font-style:italic;font-size:1rem;color:var(--gold-lg)}
.fq-row h2{font-family:'Playfair Display',serif;font-size:1.45rem;font-weight:700;color:var(--text);transition:color .2s}
.fq-row:hover h2{color:var(--accent)}
.fq-row p{grid-column:2;font-size:.92rem;line-height:1.65;font-weight:300;color:var(--text-mid)}
@media(min-width:800px){.fq-row p{grid-column:auto}}
.fq-ar{display:none;color:var(--accent)}
@media(min-width:800px){.fq-ar{display:block}}
.fq-areas{margin-top:5rem}
.fq-areas p{font-size:1rem;font-weight:300;line-height:1.75;color:var(--text-mid);max-width:600px}
.fq-cities{list-style:none;display:flex;flex-wrap:wrap;gap:.5rem 0;margin-top:1.25rem}
.fq-cities li{font-size:.72rem;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--text-mid);padding-right:.9rem;margin-right:.9rem;border-right:1px solid rgba(46,21,16,.2)}
.fq-cities li:last-child{border-right:0}
.fq-faq{display:grid;gap:2rem;margin-top:6rem}
@media(min-width:900px){.fq-faq{grid-template-columns:1fr 1.6fr;gap:4rem}}
.fq-h2{font-family:'Playfair Display',serif;font-size:clamp(1.8rem,4vw,2.6rem);font-weight:700;line-height:1.1;color:var(--text)}
.fq-cta{margin-top:2rem}
.fq-faq details{border-top:1px solid rgba(46,21,16,.16)}
.fq-faq details:last-child{border-bottom:1px solid rgba(46,21,16,.16)}
.fq-faq summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;gap:1rem;padding:1.3rem 0;font-family:'Playfair Display',serif;font-size:1.1rem;font-weight:700;color:var(--text)}
.fq-faq summary::-webkit-details-marker{display:none}
.fq-faq summary::after{content:'+';font:300 1.6rem 'DM Sans',sans-serif;color:var(--accent);line-height:1;flex-shrink:0;transition:transform .25s}
.fq-faq details[open] summary::after{transform:rotate(45deg)}
.fq-faq summary:focus-visible{outline:2px solid var(--accent);outline-offset:4px}
.fq-faq details p{font-size:.95rem;font-weight:300;line-height:1.7;color:var(--text-mid);padding-bottom:1.3rem;max-width:620px}
.fq-bottom{margin-top:4rem}
.fq-chips{list-style:none;display:flex;flex-wrap:wrap;gap:.5rem;margin-top:1.5rem}
.fq-chips a{display:inline-block;font-size:.72rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;text-decoration:none;color:var(--text-mid);border:1px solid var(--border-h);border-radius:999px;padding:.5rem .95rem;transition:background .2s,color .2s}
.fq-chips a:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
/* <<< angelyn:faq-page */
`;
out.set('app/globals.css', css);

/* ------------------------------------------------------------ public/sitemap.xml */
let sm = read('public/sitemap.xml');
if (sm.includes('/faq')) fail('public/sitemap.xml already lists /faq.');
if (!sm.includes('</urlset>')) fail('public/sitemap.xml: </urlset> not found.');
const today = new Date().toISOString().slice(0, 10);
sm = sm.replace('</urlset>', () =>
  `  <url>
    <loc>https://www.angelyncakes.com/faq</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`);
out.set('public/sitemap.xml', sm);

/* ----------------------------------------------------------------------- write */
for (const [p, c] of out) {
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, c);
  console.log('wrote  ' + p);
}
console.log(`
Done. Next:
  npm run build
  git add -A
  git commit -m "Add FAQ page, Metro Manila coverage and brand name variants"
  git push origin nextjs

After Cloudflare shows Success:
  1. Open https://www.angelyncakes.com/faq and click the FAQ link in the navbar.
  2. Search Console > URL inspection > https://www.angelyncakes.com/faq > Test live URL > Request indexing.
  3. Sitemaps: submit sitemap.xml again so Google sees /faq.`);
