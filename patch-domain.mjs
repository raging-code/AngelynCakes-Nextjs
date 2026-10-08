#!/usr/bin/env node
// patch-domain.mjs
// Replaces the old domain (angelyncakes.com) with the new one (www.angelynscake.com)
// across the project, then checks that a canonical / metadataBase is set.
//
// Usage (run from the repo root):
//   node patch-domain.mjs            -> dry run, shows what WOULD change
//   node patch-domain.mjs --write    -> applies the changes (makes .bak-free edits; use git diff to review)

import fs from "node:fs";
import path from "node:path";

const WRITE = process.argv.includes("--write");
const ROOT = process.cwd();
const NEW_HOST = "www.angelynscake.com";

const SKIP_DIRS = new Set([
  "node_modules", ".git", ".next", "out", "dist", "build",
  ".vercel", ".wrangler", ".open-next", ".turbo", "coverage",
]);
const TEXT_EXT = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".md", ".mdx",
  ".html", ".xml", ".txt", ".css", ".env", ".toml", ".yml", ".yaml", ".webmanifest",
]);
const SKIP_FILES = new Set(["package-lock.json", "pnpm-lock.yaml", "yarn.lock", "patch-domain.mjs"]);

// Order matters: most specific first.
const RULES = [
  // https://www.angelyncakes.com and https://angelyncakes.com (any case, optional http)
  { re: /https?:\/\/(?:www\.)?angelyncakes\.com/gi, to: `https://${NEW_HOST}` },
  // bare hostnames, but NOT email addresses (preceded by "@")
  { re: /(?<![@\w.-])(?:www\.)?angelyncakes\.com/gi, to: NEW_HOST },
];
// Email addresses on the old domain are reported, never rewritten:
// the mailbox may still only exist on the old domain.
const EMAIL_RE = /[\w.+-]+@(?:www\.)?angelyncakes\.com/gi;

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) yield* walk(path.join(dir, entry.name));
    } else if (entry.isFile()) {
      if (SKIP_FILES.has(entry.name)) continue;
      const ext = path.extname(entry.name).toLowerCase();
      const isEnv = entry.name.startsWith(".env");
      if (TEXT_EXT.has(ext) || isEnv) yield path.join(dir, entry.name);
    }
  }
}

let filesChanged = 0;
let replacements = 0;
const emails = [];
const allSources = [];

for (const file of walk(ROOT)) {
  let original;
  try {
    original = fs.readFileSync(file, "utf8");
  } catch {
    continue;
  }
  allSources.push({ file, text: original });

  const rel = path.relative(ROOT, file);
  for (const m of original.matchAll(EMAIL_RE)) emails.push(`${rel}: ${m[0]}`);

  let updated = original;
  let count = 0;
  for (const { re, to } of RULES) {
    updated = updated.replace(re, () => {
      count++;
      return to;
    });
  }

  if (count > 0) {
    filesChanged++;
    replacements += count;
    console.log(`${WRITE ? "PATCHED" : "WOULD PATCH"}  ${rel}  (${count})`);
    // show the affected lines
    original.split(/\r?\n/).forEach((line, i) => {
      if (/angelyncakes\.com/i.test(line) && !EMAIL_RE.test(line)) {
        console.log(`    L${i + 1}: ${line.trim().slice(0, 140)}`);
      }
      EMAIL_RE.lastIndex = 0;
    });
    if (WRITE) fs.writeFileSync(file, updated, "utf8");
  }
}

console.log(
  `\n${WRITE ? "Done" : "Dry run"}: ${replacements} replacement(s) in ${filesChanged} file(s).`
);
if (!WRITE && filesChanged > 0) console.log("Re-run with --write to apply.");

if (emails.length) {
  console.log("\nLeft untouched (email addresses on the old domain, change by hand if wanted):");
  emails.forEach((e) => console.log("  " + e));
}

// ---- Sanity checks -------------------------------------------------------
const joined = allSources.map((s) => s.text).join("\n");
console.log("\nChecks:");
console.log(
  /metadataBase/.test(joined)
    ? "  [ok]   metadataBase found"
    : `  [warn] no metadataBase found. In app/layout.tsx add:\n         metadataBase: new URL("https://${NEW_HOST}"),\n         alternates: { canonical: "./" },`
);
const envHits = allSources.filter((s) => /NEXT_PUBLIC_SITE_URL|SITE_URL/.test(s.text));
if (envHits.length) {
  console.log("  [info] files referencing SITE_URL (also check Cloudflare Pages -> Settings -> Environment variables):");
  envHits.forEach((s) => console.log("         " + path.relative(ROOT, s.file)));
}
console.log("  [info] Cloudflare Pages env vars are NOT in the repo; check them in the dashboard.");
