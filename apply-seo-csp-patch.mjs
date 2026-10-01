#!/usr/bin/env node
/**
 * apply-seo-csp-patch.mjs  —  Angelyn's Cakes (branch: nextjs)
 *
 * Run from the repo root:
 *     node apply-seo-csp-patch.mjs          # apply
 *     node apply-seo-csp-patch.mjs --dry    # show what would change, write nothing
 *
 * What it does
 *  1. CSP: allows Cloudflare Web Analytics (script + beacon endpoint) in scripts/csp-hash.mjs
 *  2. /home 404: adds public/_redirects (/home -> /) and a friendly app/not-found.js
 *  3. SEO:
 *       - lib/seo.js            business info, FAQ, JSON-LD (Bakery + WebSite + FAQPage)
 *       - app/layout.js         keyword-rich title/description, Open Graph, JSON-LD
 *       - components/Occasions.js  visible "Custom Cakes for Every Occasion" + FAQ section
 *       - app/page.js           renders <Occasions /> after the gallery
 *       - app/globals.css       small styles for the new section
 *       - Gallery.js / Bestsellers.js  descriptive image alt text (was just "TAN-147")
 *       - public/sitemap.xml + public/robots.txt
 *
 * Safe to re-run (idempotent). Originals are copied to .patch-backup-seo/ first.
 * Nothing is written unless EVERY edit anchor was found.
 */
import fs from 'node:fs';
import path from 'node:path';

const DRY = process.argv.includes('--dry');
const ROOT = process.cwd();
const BACKUP = path.join(ROOT, '.patch-backup-seo');
const SITE = 'https://www.angelyncakes.com';
const TODAY = new Date().toISOString().slice(0, 10);

const p = (...a) => path.join(ROOT, ...a);
const read = (f) => fs.readFileSync(p(f), 'utf8');
const exists = (f) => fs.existsSync(p(f));

if (!exists('package.json') || !exists('app/layout.js') || !exists('scripts/csp-hash.mjs')) {
  console.error('✖ Run this from the repo root of the "nextjs" branch (app/layout.js and scripts/csp-hash.mjs not found).');
  process.exit(1);
}

/** path -> new content. Filled first, written only if everything succeeded. */
const plan = new Map();
const notes = [];

function stage(file, content, why) {
  const old = exists(file) ? read(file) : null;
  if (old === content) { notes.push(`= ${file} (already up to date)`); return; }
  plan.set(file, content);
  notes.push(`${old === null ? '+' : '~'} ${file}  — ${why}`);
}

function edit(file, why, fn) {
  const cur = plan.has(file) ? plan.get(file) : read(file);
  const next = fn(cur);
  if (next === null) { notes.push(`= ${file} (${why}: already applied)`); return; }
  stage(file, next, why);
}

function mustReplace(src, from, to, label) {
  if (typeof from === 'string') {
    if (!src.includes(from)) throw new Error(`Anchor not found for "${label}": ${from.slice(0, 80)}`);
    return src.split(from).join(to);
  }
  if (!from.test(src)) throw new Error(`Anchor not found for "${label}": ${from}`);
  return src.replace(from, to);
}

/* ───────────────────────── 1. CSP: Cloudflare Web Analytics ───────────────────────── */
edit('scripts/csp-hash.mjs', 'allow Cloudflare Web Analytics beacon', (s) => {
  if (s.includes('static.cloudflareinsights.com')) return null;
  s = mustReplace(
    s,
    `"script-src 'self' " + [...hashes].join(' '),`,
    `"script-src 'self' https://static.cloudflareinsights.com " + [...hashes].join(' '),`,
    'script-src'
  );
  s = mustReplace(
    s,
    `"connect-src 'self'",`,
    `"connect-src 'self' https://cloudflareinsights.com",`,
    'connect-src'
  );
  return s;
});

/* ───────────────────────── 2. /home redirect + 404 page ───────────────────────── */
stage(
  'public/_redirects',
  [
    '# Old / guessed URLs that search engines may still have indexed -> the home page',
    '/home        /  301',
    '/home/       /  301',
    '/home.html   /  301',
    '/index.html  /  301',
    '',
  ].join('\n'),
  'send /home (and other old URLs) to the homepage instead of a 404'
);

stage(
  'app/not-found.js',
  `export const metadata = {
  title: "Page not found | Angelyn's Cakes",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
        background: 'var(--bg)',
      }}
    >
      <h1 className="section-title">
        Page not<br />
        <em>found</em>
      </h1>
      <p style={{ margin: '1.25rem 0 2rem', color: 'var(--text-mid)', maxWidth: '28rem', lineHeight: 1.7 }}>
        Sorry, we couldn't find that page. You can browse our custom wedding, birthday and celebration cakes on the home page.
      </p>
      <a href="/" className="btn-cta" style={{ fontSize: '0.8rem', padding: '14px 28px' }}>
        Back to Angelyn's Cakes
      </a>
    </main>
  );
}
`,
  'friendly 404 page (noindex)'
);

/* ───────────────────────── 3a. lib/seo.js ───────────────────────── */
stage(
  'lib/seo.js',
  `// Single source of truth for SEO data (used by app/layout.js JSON-LD and components/Occasions.js).
// >>> Check every value here is correct for the business. <<<

export const SITE = '${SITE}';

export const BUSINESS = {
  name: "Angelyn's Cakes",
  alternateNames: ["Angelyn's Cake", 'Angelyns Cakes', 'Angelyn Cakes'],
  email: 'contact.angelynscakes@gmail.com',
  phones: ['+63 2 8524 4452', '+63 917 815 2578'],
  street: '60 Russel Ave, Brgy. San Rafael',
  city: 'Pasay City',
  region: 'Metro Manila',
  country: 'PH',
  mapUrl: 'https://maps.app.goo.gl/dpGJnVEoqirTxCUv8',
  instagram: 'https://www.instagram.com/angelynscakes',
  facebook: 'https://www.facebook.com/angelynscakes',
  image: SITE + '/images/hero-poster-desktop.jpg',
  logo: SITE + '/images/icon.png',
};

export const OCCASIONS = [
  {
    title: 'Wedding Cakes',
    text: 'Elegant custom wedding cakes designed around your theme, colors and guest count, from intimate celebrations to grand ballroom receptions.',
  },
  {
    title: 'Birthday Cakes',
    text: 'Custom birthday cakes for kids and adults, from themed designs to giant showpiece cakes made to order.',
  },
  {
    title: 'Debut (18th Birthday) Cakes',
    text: 'Statement cakes for a once-in-a-lifetime 18th birthday, personalized to the celebrant and the party theme.',
  },
  {
    title: 'Christening & Baptism Cakes',
    text: 'Delicate, tasteful christening and baptism cakes for your little one\\u2019s special day.',
  },
  {
    title: 'Anniversary Cakes',
    text: 'Custom anniversary cakes for milestone years, with designs that reflect your story.',
  },
  {
    title: 'Corporate & Hotel Event Cakes',
    text: 'Branded and bespoke cakes for corporate events, product launches and 5-star hotel functions.',
  },
  {
    title: 'Graduation Cakes',
    text: 'Celebrate the achievement with a custom graduation cake made for your school colors and theme.',
  },
  {
    title: 'Private Party Cakes',
    text: 'Bridal showers, gender reveals, family gatherings and more: tell us the occasion and we will design the cake.',
  },
];

export const FAQ = [
  {
    q: 'Where can I order custom cakes in Manila?',
    a: "Angelyn's Cakes is a custom cake shop at 60 Russel Ave, Brgy. San Rafael, Pasay City, Metro Manila. Our showroom is open daily from 7:30 AM to 6:00 PM, by appointment only.",
  },
  {
    q: 'Do you make wedding cakes?',
    a: 'Yes. We create custom wedding cakes designed around your theme, colors and number of guests. Book a private consultation at our Pasay showroom to plan yours.',
  },
  {
    q: 'Do you make birthday cakes and debut cakes?',
    a: 'Yes. We make custom birthday cakes for kids and adults, debut (18th birthday) cakes, and giant celebration cakes. We also make christening, baptism, anniversary, graduation and corporate event cakes.',
  },
  {
    q: 'How do I order a custom cake?',
    a: 'Call (02) 8524 4452 or 0917 815 2578, message us on Viber, Instagram (@angelynscakes) or Facebook, or email contact.angelynscakes@gmail.com. Tell us your date, number of guests and theme, and we will set up a consultation.',
  },
  {
    q: 'Do you deliver cakes in Metro Manila?',
    a: 'Send us your celebration date and venue by phone, Viber or email and we will confirm delivery arrangements for your location.',
  },
  {
    q: 'Can I visit the showroom without an appointment?',
    a: 'Our showroom is by appointment only so we can prepare for your visit. Please contact us ahead to schedule a time.',
  },
];

const hours = {
  '@type': 'OpeningHoursSpecification',
  dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  opens: '07:30',
  closes: '18:00',
};

export const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': SITE + '/#website',
      url: SITE + '/',
      name: BUSINESS.name,
      inLanguage: 'en-PH',
      publisher: { '@id': SITE + '/#business' },
    },
    {
      '@type': 'Bakery',
      '@id': SITE + '/#business',
      name: BUSINESS.name,
      alternateName: BUSINESS.alternateNames,
      url: SITE + '/',
      description:
        "Angelyn's Cakes creates bespoke custom cakes in Manila for weddings, birthdays, debuts, christenings, anniversaries, graduations and corporate events. Showroom in Pasay City, by appointment.",
      image: BUSINESS.image,
      logo: BUSINESS.logo,
      email: BUSINESS.email,
      telephone: BUSINESS.phones[0],
      contactPoint: BUSINESS.phones.map((t) => ({
        '@type': 'ContactPoint',
        telephone: t,
        contactType: 'customer service',
        areaServed: 'PH',
        availableLanguage: ['English', 'Filipino'],
      })),
      address: {
        '@type': 'PostalAddress',
        streetAddress: BUSINESS.street,
        addressLocality: BUSINESS.city,
        addressRegion: BUSINESS.region,
        addressCountry: BUSINESS.country,
      },
      hasMap: BUSINESS.mapUrl,
      openingHoursSpecification: [hours],
      areaServed: [
        { '@type': 'AdministrativeArea', name: 'Metro Manila' },
        { '@type': 'City', name: 'Pasay City' },
        { '@type': 'City', name: 'Makati' },
        { '@type': 'City', name: 'Manila' },
      ],
      knowsAbout: OCCASIONS.map((o) => o.title),
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Custom cakes',
        itemListElement: OCCASIONS.map((o) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Product', name: o.title, description: o.text },
        })),
      },
      sameAs: [BUSINESS.instagram, BUSINESS.facebook],
    },
    {
      '@type': 'FAQPage',
      '@id': SITE + '/#faq',
      mainEntity: FAQ.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ],
};
`,
  'business info, FAQ and JSON-LD structured data'
);

/* ───────────────────────── 3b. components/Occasions.js ───────────────────────── */
stage(
  'components/Occasions.js',
  `import { OCCASIONS, FAQ } from '../lib/seo';

/* Visible, crawlable text that matches what people search for
   ("wedding cakes", "birthday cakes", "debut cakes", "cakes in Manila"...).
   Server component: renders to plain HTML at build time. */
export default function Occasions() {
  return (
    <section className="section" id="occasions" style={{ background: 'var(--bg-alt)' }}>
      <div className="section-inner">
        <h2 className="section-title" style={{ marginBottom: '1.1rem' }}>
          Custom Cakes for<br />
          <em>Every Occasion</em>
        </h2>
        <p className="seo-intro">
          Looking for wedding cakes, birthday cakes, debut cakes or christening cakes in Manila? Angelyn's Cakes designs
          every cake to order, handcrafted for weddings, birthdays, anniversaries, graduations, corporate events and
          private parties across Metro Manila.
        </p>

        <div className="seo-grid">
          {OCCASIONS.map((o) => (
            <article className="seo-card" key={o.title}>
              <h3>{o.title}</h3>
              <p>{o.text}</p>
            </article>
          ))}
        </div>

        <h2 id="faq" className="seo-faq-title">Frequently asked questions</h2>
        <div className="seo-faq">
          {FAQ.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>

        <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <a href="#contact" className="btn-cta" style={{ fontSize: '0.8rem', padding: '14px 28px', display: 'inline-flex' }}>
            Book a Consultation →
          </a>
        </div>
      </div>
    </section>
  );
}
`,
  'visible keyword-rich occasions + FAQ section'
);

/* ───────────────────────── 3c. app/page.js ───────────────────────── */
edit('app/page.js', 'render Occasions section', (s) => {
  if (s.includes('Occasions')) return null;
  s = mustReplace(s, "import Gallery from '../components/Gallery';", "import Gallery from '../components/Gallery';\nimport Occasions from '../components/Occasions';", 'import Gallery');
  s = mustReplace(s, '<Gallery />', '<Gallery />\n        <Occasions />', '<Gallery />');
  return s;
});

/* ───────────────────────── 3d. app/globals.css ───────────────────────── */
edit('app/globals.css', 'styles for Occasions section', (s) => {
  if (s.includes('angelyn:seo-section')) return null;
  return (
    s.replace(/\s*$/, '\n') +
    `
/* >>> angelyn:seo-section */
.seo-intro{font-size:.95rem;font-weight:300;color:var(--text-mid);line-height:1.85;max-width:720px;margin-bottom:2.25rem}
.seo-grid{display:grid;grid-template-columns:1fr;gap:1rem}
@media(min-width:640px){.seo-grid{grid-template-columns:repeat(2,1fr)}}
@media(min-width:1024px){.seo-grid{grid-template-columns:repeat(4,1fr)}}
.seo-card{background:var(--bg-card);border:1px solid var(--border);border-radius:14px;padding:1.4rem 1.25rem}
.seo-card h3{font-family:'Playfair Display',serif;font-size:1.1rem;color:var(--text);margin-bottom:.5rem}
.seo-card p{font-size:.86rem;font-weight:300;color:var(--text-mid);line-height:1.7}
.seo-faq-title{font-family:'Playfair Display',serif;font-size:clamp(1.35rem,4vw,1.8rem);color:var(--text);margin:3rem 0 1rem}
.seo-faq{max-width:760px}
.seo-faq details{border-bottom:1px solid var(--border);padding:.95rem 0}
.seo-faq summary{cursor:pointer;font-size:.95rem;font-weight:500;color:var(--text);list-style:none;display:flex;justify-content:space-between;gap:1rem;align-items:center}
.seo-faq summary::-webkit-details-marker{display:none}
.seo-faq summary::after{content:'+';color:var(--accent);font-size:1.25rem;line-height:1;flex-shrink:0}
.seo-faq details[open] summary::after{content:'\\2212'}
.seo-faq summary:focus-visible{outline:2px solid var(--accent);outline-offset:4px}
.seo-faq details p{margin-top:.6rem;font-size:.9rem;font-weight:300;color:var(--text-mid);line-height:1.8}
/* <<< angelyn:seo-section */
`
  );
});

/* ───────────────────────── 3e. app/layout.js ───────────────────────── */
edit('app/layout.js', 'SEO metadata, Open Graph, JSON-LD', (s) => {
  if (s.includes("from '../lib/seo'")) return null;

  // imports
  s = mustReplace(
    s,
    "import './globals.css';",
    "import './globals.css';\nimport { JSON_LD } from '../lib/seo';",
    'globals.css import'
  );

  // metadata object (everything between "export const metadata = {" and the closing "};" before viewport)
  const metaRe = /export const metadata = \{[\s\S]*?\n\};\n(?=\s*export const viewport)/;
  s = mustReplace(
    s,
    metaRe,
    `export const metadata = {
  metadataBase: new URL('${SITE}'),
  title: "Custom Wedding, Birthday & Debut Cakes in Manila | Angelyn's Cakes",
  description:
    "Angelyn's Cakes makes custom wedding cakes, birthday cakes, debut, christening, anniversary and corporate cakes in Manila. Visit our Pasay City showroom by appointment.",
  keywords: [
    "Angelyn's Cakes",
    'Angelyn Cakes',
    'custom cakes Manila',
    'wedding cakes Manila',
    'birthday cakes Manila',
    'debut cakes Manila',
    'christening cakes',
    'baptism cakes',
    'anniversary cakes',
    'corporate cakes',
    'cakes for birthday',
    'cakes for wedding',
    'custom cake shop Pasay',
    'cake delivery Metro Manila',
    'bespoke cakes Philippines',
  ],
  alternates: { canonical: '${SITE}/' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  icons: { icon: [{ url: '/images/icon-sm.png', type: 'image/png' }] },
};
`,
    'metadata block'
  );

  // Open Graph / Twitter text (same wording as the title / description)
  s = mustReplace(
    s,
    `content="Angelyn's Cakes — For Every Occasion"`,
    `content="Custom Wedding, Birthday & Debut Cakes in Manila | Angelyn's Cakes"`,
    'og/twitter title'
  );
  s = mustReplace(
    s,
    'content="Custom cakes for weddings, debuts, and corporate events. Handcrafted in Makati."',
    'content="Custom wedding cakes, birthday cakes, debut, christening and corporate cakes in Manila. Showroom in Pasay City, by appointment."',
    'og/twitter description'
  );
  s = mustReplace(
    s,
    '<meta property="og:type" content="website" />',
    '<meta property="og:type" content="website" />\n        <meta property="og:site_name" content="Angelyn\'s Cakes" />\n        <meta property="og:locale" content="en_PH" />\n        <meta name="twitter:card" content="summary_large_image" />',
    'og:type'
  );

  // JSON-LD (not executable, so csp-hash.mjs ignores it)
  s = mustReplace(
    s,
    /<\/noscript>\s*<\/head>/,
    `</noscript>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      </head>`,
    '</head>'
  );
  return s;
});

/* ───────────────────────── 3f. image alt text ───────────────────────── */
edit('components/Gallery.js', 'descriptive alt text for gallery photos', (s) => {
  if (s.includes("Custom celebration cake")) return null;
  return mustReplace(s, 'alt={it.name}', `alt={'Custom celebration cake ' + it.name + " by Angelyn's Cakes, Manila"}`, 'Gallery alt');
});
edit('components/Bestsellers.js', 'descriptive alt text for signature cakes', (s) => {
  if (s.includes("Custom celebration cake")) return null;
  return mustReplace(
    s,
    '<img src={thumb(src)} alt={alt} loading="lazy" decoding="async" />',
    `<img src={thumb(src)} alt={'Custom celebration cake ' + alt + " by Angelyn's Cakes, Manila"} loading="lazy" decoding="async" />`,
    'Bestsellers alt'
  );
});

/* ───────────────────────── 3g. sitemap.xml + robots.txt ───────────────────────── */
stage(
  'public/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE}/</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`,
  'sitemap for Google/Bing'
);
stage(
  'public/robots.txt',
  `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`,
  'robots.txt with sitemap link (all crawlers allowed)'
);

/* ───────────────────────── 3h. .gitignore ───────────────────────── */
edit('.gitignore', 'ignore patch backup folder', (s) => {
  if (s.includes('.patch-backup-seo/')) return null;
  return s.replace(/\s*$/, '\n') + '.patch-backup-seo/\n';
});

/* ───────────────────────── write ───────────────────────── */
console.log(DRY ? '\nDRY RUN — nothing will be written\n' : '\nApplying patch…\n');
for (const n of notes) console.log('  ' + n);

if (DRY) process.exit(0);

for (const [file, content] of plan) {
  if (exists(file)) {
    const b = path.join(BACKUP, file);
    if (!fs.existsSync(b)) {
      fs.mkdirSync(path.dirname(b), { recursive: true });
      fs.copyFileSync(p(file), b);
    }
  }
  fs.mkdirSync(path.dirname(p(file)), { recursive: true });
  fs.writeFileSync(p(file), content);
}

console.log(`\n✔ Done (${plan.size} file(s) written). Originals are in .patch-backup-seo/`);
console.log('\nNext:\n  npm run build        # must print "[csp-hash] ... hashes written"\n  npm run start        # preview at http://localhost:3000\n  git add -A && git commit -m "SEO, CSP for Cloudflare analytics, /home redirect" && git push\n');
