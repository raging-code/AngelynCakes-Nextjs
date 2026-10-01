#!/usr/bin/env node
/**
 * scripts/csp-hash.mjs — runs automatically after `next build` ("postbuild").
 *
 * Static export => no per-request nonces, so we hash every inline <script> that Next.js
 * and the app emit into out/*.html and put those hashes in a real HTTP Content-Security-Policy
 * header (out/_headers). Result: script-src has NO 'unsafe-inline'; an injected <script> or
 * inline handler will not run.
 *
 * Fails the build if an inline event handler attribute (onclick=...) is found, because the
 * strict policy would silently break it.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const OUT = path.resolve('out');
if (!fs.existsSync(OUT)) {
  console.error('[csp-hash] out/ not found — run "next build" first.');
  process.exit(1);
}

const htmlFiles = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) walk(f);
    else if (e.name.endsWith('.html')) htmlFiles.push(f);
  }
})(OUT);

const hashes = new Set();
let problems = 0;

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  // inline handlers
  const handlers = html.match(/\s(on[a-z]+)=["']/gi);
  if (handlers) {
    console.error(`[csp-hash] ${path.relative(OUT, file)}: inline event handlers found: ${[...new Set(handlers)].join(', ')}`);
    problems++;
  }
  // inline scripts (no src attribute). Skip JSON data blocks, which are not executed.
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    const attrs = m[1];
    const body = m[2];
    if (/\bsrc\s*=/.test(attrs)) continue;
    if (/type\s*=\s*["']application\/(ld\+)?json["']/i.test(attrs)) continue;
    if (!body.trim()) continue;
    hashes.add("'sha256-" + crypto.createHash('sha256').update(body, 'utf8').digest('base64') + "'");
  }
}
if (problems) process.exit(1);

const csp = [
  "default-src 'self'",
  "script-src 'self' https://static.cloudflareinsights.com " + [...hashes].join(' '),
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // React inline style="" attributes
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self' https://cloudflareinsights.com",
  "frame-src https://www.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join('; ');

const hdrPath = path.join(OUT, '_headers');
let hdr = fs.existsSync(hdrPath) ? fs.readFileSync(hdrPath, 'utf8') : '/*\n';
const line = '  Content-Security-Policy: ' + csp;
if (line.length > 2000) {
  console.error('[csp-hash] CSP header line is ' + line.length + ' chars; Cloudflare Pages limit is 2000.');
  process.exit(1);
}
if (/^[ \t]+Content-Security-Policy:.*$/m.test(hdr)) {
  hdr = hdr.replace(/^[ \t]+Content-Security-Policy:.*$/m, line);
} else {
  hdr = hdr.replace(/^\/\*\n/, '/*\n' + line + '\n');
}
fs.writeFileSync(hdrPath, hdr);
console.log('[csp-hash] ' + hashes.size + ' inline script hashes written to out/_headers (' + line.length + ' chars).');
