// switch-canonical-domain.mjs
// Switches the site's canonical/primary domain from angelyncakes.com -> angelynscake.com
// Run from the repo root: node switch-canonical-domain.mjs

import { readFileSync, writeFileSync } from 'fs';

const OLD_DOMAIN = 'angelyncakes.com';
const NEW_DOMAIN = 'angelynscake.com';
const OLD_SITE = `https://www.${OLD_DOMAIN}`;
const NEW_SITE = `https://www.${NEW_DOMAIN}`;

const edits = [
  {
    file: 'lib/seo.js',
    changes: [
      {
        from: `export const SITE = '${OLD_SITE}';`,
        to: `export const SITE = '${NEW_SITE}';`,
      },
      {
        from: `    'AngelynCakes',\n    '${OLD_DOMAIN}',`,
        to: `    'AngelynCakes',\n    '${NEW_DOMAIN}',\n    '${OLD_DOMAIN}',`,
      },
      {
        from: `It is one custom cake shop in Pasay City, Metro Manila, at www.${OLD_DOMAIN}.`,
        to: `It is one custom cake shop in Pasay City, Metro Manila, at www.${NEW_DOMAIN}.`,
      },
    ],
  },
  {
    file: 'app/layout.js',
    changes: [
      {
        from: `metadataBase: new URL('${OLD_SITE}'),`,
        to: `metadataBase: new URL('${NEW_SITE}'),`,
      },
      {
        from: `    'angelyncakes',\n    '${OLD_DOMAIN}',`,
        to: `    'angelyncakes',\n    '${NEW_DOMAIN}',\n    '${OLD_DOMAIN}',`,
      },
      {
        from: `alternates: { canonical: '${OLD_SITE}/' },`,
        to: `alternates: { canonical: '${NEW_SITE}/' },`,
      },
      {
        from: `<meta property="og:url" content="${OLD_SITE}/" />`,
        to: `<meta property="og:url" content="${NEW_SITE}/" />`,
      },
    ],
  },
  {
    file: 'app/faq/page.js',
    changes: [
      {
        from: `alternates: { canonical: '${OLD_SITE}/faq' },`,
        to: `alternates: { canonical: '${NEW_SITE}/faq' },`,
      },
    ],
  },
];

let totalApplied = 0;
let totalSkipped = 0;

for (const { file, changes } of edits) {
  let content;
  try {
    content = readFileSync(file, 'utf8');
  } catch (err) {
    console.error(`✗ Could not read ${file}: ${err.message}`);
    continue;
  }

  let fileChanged = false;

  for (const { from, to } of changes) {
    if (!content.includes(from)) {
      console.warn(`  ⚠ Pattern not found in ${file}, skipping one change:\n    ${from.slice(0, 80)}...`);
      totalSkipped++;
      continue;
    }
    content = content.replace(from, to);
    fileChanged = true;
    totalApplied++;
  }

  if (fileChanged) {
    writeFileSync(file, content, 'utf8');
    console.log(`✓ Updated ${file}`);
  } else {
    console.log(`– No changes applied to ${file}`);
  }
}

console.log(`\nDone. ${totalApplied} change(s) applied, ${totalSkipped} skipped (pattern not found — check manually).`);
console.log(`\nNote: alternateNames / keywords now list BOTH domains (new first, old kept as an alias)`);
console.log(`so people searching the old name still find you. The old domain is no longer canonical.`);
console.log(`\nNext steps:`);
console.log(`  1. Review the diff: git diff`);
console.log(`  2. Commit & push: git add -A && git commit -m "Switch canonical domain to ${NEW_DOMAIN}" && git push`);
console.log(`  3. In Cloudflare Pages, make sure ${NEW_DOMAIN} redirects/serves correctly as the primary domain.`);
console.log(`  4. In Search Console, use "Request indexing" on https://www.${NEW_DOMAIN}/ again after deploying.`);
