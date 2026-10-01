#!/usr/bin/env node
/* patch-showroom-widget.mjs — Angelyn's Cakes: unified showroom widget + map fix
   Usage (from the repo root):
     node patch-showroom-widget.mjs --dry-run   show what would happen, write nothing
     node patch-showroom-widget.mjs             apply
     node patch-showroom-widget.mjs --revert    undo (restores the backups)
     node patch-showroom-widget.mjs --force     overwrite Showroom.js even if you edited it
   What it does:
     1. lib/data.js          MAP_SRC -> your new Google "Angelyn Cake" place embed
     2. components/Showroom.js  one white widget: text on top, map at the bottom
                                (removes "Open · Pasay Studio", the renovation notice, Book a visit)
     3. app/globals.css      appends the widget styles (mobile-first); map keeps the dark gold look
   Safe by design: checks every file before writing, backs up originals, handles CRLF, idempotent. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const args = new Set(process.argv.slice(2));
const DRY = args.has('--dry-run'), REVERT = args.has('--revert'), FORCE = args.has('--force');
const ROOT = process.cwd();
const BK = path.join(ROOT, '.patch-backup-showroom');
const MAN = path.join(BK, 'manifest.json');
const abs = (p) => path.join(ROOT, p);
const log = (...a) => console.log(...a);
const die = (m) => { console.error('\nABORTED, nothing was changed.\n' + m); process.exit(1); };
const sha = (s) => crypto.createHash('sha256').update(s, 'utf8').digest('hex');
const toLF = (s) => s.replace(/\r\n/g, '\n');

try {
  const pk = JSON.parse(fs.readFileSync(abs('package.json'), 'utf8'));
  if (pk.name !== 'angelynscakes') throw 0;
} catch {
  die('Run this from the repo root (the folder whose package.json is named "angelynscakes").');
}

/* ---------------- revert ---------------- */
if (REVERT) {
  if (!fs.existsSync(MAN)) die('No ' + MAN + ' found, nothing to revert.');
  const m = JSON.parse(fs.readFileSync(MAN, 'utf8'));
  for (const f of m.modified) {
    log((DRY ? '[dry] ' : '') + 'restore ' + f);
    if (!DRY) fs.copyFileSync(path.join(BK, 'files', f), abs(f));
  }
  if (!DRY) { fs.rmSync(BK, { recursive: true, force: true }); log('\nReverted. Backup folder removed.'); }
  process.exit(0);
}

/* ---------------- new content ---------------- */
const MAP_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d811.9163386976629!2d120.99586129069267!3d14.53359737428597!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c950e0984ef9%3A0x7d6c1a17da98837c!2sAngelyn%20Cake!5e0!3m2!1sen!2sph!4v1790836708801!5m2!1sen!2sph';

const SHOWROOM_JS = `import LazyMap from './LazyMap';

export default function Showroom() {
  return (
    <>
      <section className="section" id="showroom" style={{ "background": "var(--bg)" }}>
        <div className="section-inner">
          <div style={{ "marginBottom": "2.75rem" }}>
            <h2 className="section-title">Visit the<br/><em>Showroom</em></h2>
            <p className="showroom-tagline">Come see where every cake begins its story.</p>
          </div>
          <div className="showroom-widget sr-card">
            <div className="sr-body">
              <p className="sr-street">60 Russel Ave</p>
              <p className="sr-city">Brgy. San Rafael, Pasay City</p>
              <p className="sr-hours">Daily · <strong>7:30 AM – 6:00 PM</strong></p>
              <span className="sr-rule" aria-hidden="true"></span>
              <p className="sr-appt">By appointment only</p>
              <p className="sr-note">Please reach us ahead so we can prepare for you.</p>
              <div className="sr-actions">
                <a href="https://maps.app.goo.gl/dpGJnVEoqirTxCUv8" target="_blank" rel="noopener" className="sr-btn sr-btn-outline">Open in Maps ↗</a>
                <a href="viber://chat?number=%2B639178152578" className="sr-btn sr-btn-viber"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.003 0C5.376 0 0 5.376 0 12.003c0 2.407.715 4.647 1.944 6.524L.671 23.329l4.937-1.577A11.963 11.963 0 0012.003 24C18.627 24 24 18.624 24 12.003 24 5.376 18.627 0 12.003 0zm5.849 16.604c-.236.658-1.38 1.257-1.912 1.338-.488.073-1.107.105-1.787-.112a16.66 16.66 0 01-1.617-.598c-2.847-1.226-4.706-4.064-4.849-4.252-.14-.19-1.145-1.52-1.145-2.903s.666-2.002.965-2.326c.3-.325.65-.406.867-.406.218 0 .434.002.624.01.203.01.473-.077.74.566.278.657.944 2.303.944 2.466 0 .164-.081.366-.163.53-.082.162-.244.406-.407.61-.162.2-.34.415-.18.704.16.29.712 1.173 1.53 1.9 1.052.938 1.94 1.228 2.21 1.362.27.136.427.113.587-.068.162-.181.692-.81.877-1.09.183-.277.365-.23.61-.138.244.091 1.556.734 1.822.869.265.133.44.2.505.31.063.108.063.624-.172 1.283z"/></svg> Open Viber</a>
              </div>
              <div className="sr-contact">
                <a href="tel:+639178152578" className="sr-phone">0917 815 2578</a>
                <a href="mailto:contact.angelynscakes@gmail.com" className="sr-email">contact.angelynscakes@gmail.com</a>
              </div>
            </div>
            <LazyMap />
          </div>
        </div>
      </section>
    </>
  );
}
`;

const CSS_MARK = '/* ────────── Showroom widget (patch-showroom-widget) ────────── */';
const CSS_BLOCK = `
${CSS_MARK}
.sr-card{background:#fff}
.sr-body{padding:2rem 1.25rem 1.75rem;text-align:center}
.sr-street{font-family:'Playfair Display',serif;font-size:1.6rem;font-weight:700;line-height:1.2;color:var(--text)}
.sr-city{margin-top:.3rem;font-size:.92rem;color:var(--text-mid)}
.sr-hours{margin-top:.65rem;font-size:.9rem;color:var(--text-mid)}
.sr-hours strong{font-weight:600;color:var(--text)}
.sr-rule{display:block;width:36px;height:1px;background:var(--gold);margin:1.4rem auto}
.sr-appt{font-family:'Playfair Display',serif;font-style:italic;font-size:1.15rem;color:var(--accent)}
.sr-note{margin:.5rem auto 1.4rem;max-width:270px;font-size:.88rem;line-height:1.6;color:var(--text-mid)}
.sr-actions{display:flex;flex-direction:column;gap:.6rem;max-width:380px;margin:0 auto 1.3rem}
.sr-btn{display:flex;align-items:center;justify-content:center;gap:.5rem;min-height:48px;padding:0 1.2rem;font-family:'DM Sans',sans-serif;font-size:.75rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;text-decoration:none;border-radius:6px;transition:background .2s,color .2s,transform .15s}
.sr-btn svg{width:15px;height:15px;flex-shrink:0}
.sr-btn-outline{color:var(--accent);background:#fff;border:1.5px solid var(--border-h)}
.sr-btn-outline:hover{background:rgba(201,92,114,.07)}
.sr-btn-viber{color:#fff;background:var(--viber);border:1.5px solid var(--viber)}
.sr-btn-viber:hover{background:var(--viber-h);border-color:var(--viber-h)}
.sr-contact{display:flex;flex-direction:column;align-items:center;gap:.35rem}
.sr-contact a{text-decoration:none;word-break:break-word}
.sr-phone{font-size:.95rem;font-weight:500;color:var(--text)}
.sr-email{font-size:.85rem;color:var(--text-mid)}
.sr-contact a:hover{color:var(--accent)}
.showroom-widget .map-wrap.map-dark{border:0;border-top:1px solid var(--border);border-radius:0;height:320px;min-height:320px}
.showroom-widget .map-wrap.map-dark iframe{height:calc(100% + var(--crop) * 2)}
@media(min-width:640px){
  .sr-actions{flex-direction:row;justify-content:center;max-width:none}
  .sr-btn{padding:0 1.7rem}
  .sr-contact{flex-direction:row;justify-content:center;gap:1.75rem}
}
@media(min-width:768px){
  .sr-body{padding:3rem 2rem 2.5rem}
  .sr-street{font-size:2rem}
  .showroom-widget .map-wrap.map-dark{height:420px;min-height:420px}
}
`;

/* ---------------- plan (verify everything BEFORE writing) ---------------- */
const SHOWROOM_ORIG_SHA = 'cb41d22ad34da1ea04a2d56425c6f7cba25e93c270b9a65c4ef2b1db6d36ca41';
const MAP_LINE_RE = /^export const MAP_SRC = .*;$/m;
const plan = [];
const problems = [];

function read(p) {
  if (!fs.existsSync(abs(p))) { problems.push('missing file: ' + p); return null; }
  const raw = fs.readFileSync(abs(p), 'utf8');
  return { crlf: raw.includes('\r\n'), text: toLF(raw) };
}

{ // lib/data.js
  const f = read('lib/data.js');
  if (f) {
    if (f.text.includes(MAP_URL)) plan.push({ path: 'lib/data.js', action: 'skip' });
    else if (!MAP_LINE_RE.test(f.text)) problems.push('lib/data.js: could not find the "export const MAP_SRC = ..." line');
    else plan.push({ path: 'lib/data.js', action: 'write', crlf: f.crlf, out: f.text.replace(MAP_LINE_RE, () => 'export const MAP_SRC = "' + MAP_URL + '";') });
  }
}
{ // components/Showroom.js
  const f = read('components/Showroom.js');
  if (f) {
    if (f.text === SHOWROOM_JS) plan.push({ path: 'components/Showroom.js', action: 'skip' });
    else if (sha(f.text) === SHOWROOM_ORIG_SHA || FORCE) plan.push({ path: 'components/Showroom.js', action: 'write', crlf: f.crlf, out: SHOWROOM_JS });
    else problems.push('components/Showroom.js was edited since this patch was made. Re-run with --force to overwrite it (a backup is still made).');
  }
}
{ // app/globals.css
  const f = read('app/globals.css');
  if (f) {
    if (f.text.includes(CSS_MARK)) plan.push({ path: 'app/globals.css', action: 'skip' });
    else if (!f.text.includes('.map-wrap.map-dark')) problems.push('app/globals.css: the ".map-wrap.map-dark" rules were not found (is the earlier map patch applied?)');
    else plan.push({ path: 'app/globals.css', action: 'write', crlf: f.crlf, out: f.text.replace(/\s*$/, '\n') + CSS_BLOCK });
  }
}
if (problems.length) die(problems.map((x) => ' - ' + x).join('\n'));

/* ---------------- apply ---------------- */
const prev = fs.existsSync(MAN) ? JSON.parse(fs.readFileSync(MAN, 'utf8')) : { modified: [] };
const man = { modified: [...prev.modified] };
for (const f of plan) {
  if (f.action === 'skip') { log('ok (already patched)  ' + f.path); continue; }
  log((DRY ? '[dry] ' : '') + 'patch ' + f.path);
  if (DRY) continue;
  const bp = path.join(BK, 'files', f.path);
  if (!fs.existsSync(bp)) { fs.mkdirSync(path.dirname(bp), { recursive: true }); fs.copyFileSync(abs(f.path), bp); }
  if (!man.modified.includes(f.path)) man.modified.push(f.path);
  fs.writeFileSync(abs(f.path), f.crlf ? f.out.replace(/\n/g, '\r\n') : f.out);
}
if (!DRY) {
  fs.mkdirSync(BK, { recursive: true });
  fs.writeFileSync(MAN, JSON.stringify(man, null, 2));
  log('\nDone. Test with:  npm run dev   (or npm run build)');
  log('Undo anytime with: node patch-showroom-widget.mjs --revert');
  log('If Google\'s white place card still peeks out of the map, raise --crop in app/globals.css (.map-wrap.map-dark).');
}
