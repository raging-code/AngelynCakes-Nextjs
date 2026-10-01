# Angelyn's Cakes (Next.js)

Migrated from a single static `index.html` to Next.js (App Router, JavaScript).
Look, copy, CSS and behavior are unchanged.

## Commands
```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export -> ./out
npm run css:build  # (optional) regenerate css/tailwind.min.css from tailwind.input.css
```

## Deploy on Cloudflare Pages
- Framework preset: **Next.js (Static HTML Export)**
- Build command: `npm run build`
- Build output directory: `out`

`public/_headers`, `public/_routes.json` and `public/robots.txt` are copied into `out/` on build.

## Layout
```
app/layout.js, app/page.js, app/globals.css   page shell + the custom CSS from index.html
components/                                   Nav, Hero, Ticker, Bestsellers, Gallery, Tv5, Showroom,
                                              Testimonials, About, Contact, Footer, LazyMap
lib/data.js, lib/extractFirstFrame.js         cake/review data and the video first-frame helper
css/tailwind.min.css, tailwind.input.css      unchanged
public/images, public/videos                  unchanged filenames, served at /images/... and /videos/...
```
