#!/usr/bin/env node
// patch-about-redirect.mjs
//
// Problem: https://www.angelynscake.com/about/ 404s. The site has no
// /about route — "About" is just the #about section on the single-page
// home (see components/About.js, rendered from app/page.js). Old links /
// search-engine guesses for /about still exist, so visitors land on
// app/not-found.js instead of the real About content.
//
// Fix: this is a static export (next.config.mjs: output: 'export') on
// Cloudflare Pages, which already retires guessed URLs via public/_redirects
// (see /home, /home.html, etc. -> /). This script adds /about and /about/
// to that same list as 301s to /#about, so visitors land directly on the
// About section instead of the home page top.
//
// Usage (run from the repo root):
//   node patch-about-redirect.mjs            -> dry run, shows what WOULD change
//   node patch-about-redirect.mjs --write    -> applies the change

import fs from "node:fs";
import path from "node:path";

const WRITE = process.argv.includes("--write");
const ROOT = process.cwd();
const REDIRECTS_FILE = path.join(ROOT, "public", "_redirects");

const NEW_RULES = [
  "/about        /#about  301",
  "/about/       /#about  301",
];

if (!fs.existsSync(REDIRECTS_FILE)) {
  console.error(`[error] ${path.relative(ROOT, REDIRECTS_FILE)} not found. Run this from the repo root.`);
  process.exit(1);
}

const original = fs.readFileSync(REDIRECTS_FILE, "utf8");
const lines = original.split(/\r?\n/);

// Idempotency: skip any rule whose source path already appears
// (ignoring whitespace), so re-running this script is a no-op.
const existingSources = new Set(
  lines
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => l.split(/\s+/)[0])
);

const toAdd = NEW_RULES.filter((rule) => {
  const source = rule.trim().split(/\s+/)[0];
  return !existingSources.has(source);
});

if (toAdd.length === 0) {
  console.log(`[ok] ${path.relative(ROOT, REDIRECTS_FILE)} already redirects /about and /about/ — nothing to do.`);
  process.exit(0);
}

console.log(`${WRITE ? "PATCHED" : "WOULD PATCH"}  public/_redirects  (+${toAdd.length} rule(s))`);
toAdd.forEach((r) => console.log(`    + ${r}`));

if (WRITE) {
  const needsBlankLineBefore = original.length > 0 && !original.endsWith("\n\n") && !original.endsWith("\n");
  const sep = original.endsWith("\n") ? "" : "\n";
  const block =
    "\n# /about has no real route (About is the #about section on the home page) ->\n# send visitors straight to that section instead of 404ing\n" +
    toAdd.join("\n") +
    "\n";
  fs.writeFileSync(REDIRECTS_FILE, original + sep + block, "utf8");
  console.log(`\nDone: wrote ${toAdd.length} rule(s) to public/_redirects.`);
} else {
  console.log("\nDry run: no files changed. Re-run with --write to apply.");
}

console.log(
  "\n[info] Cloudflare Pages reads public/_redirects at deploy time; this takes effect on the next deploy, no code change needed to Nav.js/About.js."
);
console.log(
  "[info] If you'd rather /about render the real page instead of redirecting (e.g. for SEO as its own indexable page), that's a different fix — say so and I'll add an app/about/page.js route instead."
);
