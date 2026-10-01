import '../css/tailwind.min.css'; // self-hosted, purged Tailwind CSS (same file as before)
import './globals.css';           // custom styles extracted from index.html

export const metadata = {
  title: "Angelyn's Cakes — For Every Occasion",
  description:
    "Angelyn's Cakes creates bespoke, luxury celebration cakes in Manila. Custom wedding, debut, and corporate cakes. Visit our Pasay showroom by appointment.",
  keywords:
    "custom cakes Manila, wedding cakes, debut cakes, bespoke cakes, cake delivery Makati, Angelyn's Cakes",
  alternates: { canonical: 'https://www.angelyncakes.com/' },
  icons: { icon: [{ url: '/images/icon-sm.png', type: 'image/png' }] },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#C95C72',
};

const OG_IMAGE = 'https://res.cloudinary.com/dgbwapcgt/image/upload/v1778334726/thumb_lwhuzr.jpg';
const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap';

// Same policy as the original <meta http-equiv> tag. Only applied in production:
// `next dev` needs 'unsafe-eval' for hot reloading, which this policy forbids.
const CSP =
  "default-src 'self'; script-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; media-src 'self' blob:; connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; font-src 'self' https://fonts.gstatic.com; frame-src https://www.google.com;";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Social sharing */}
        <meta property="og:title" content="Angelyn's Cakes — For Every Occasion" />
        <meta property="og:description" content="Custom cakes for weddings, debuts, and corporate events. Handcrafted in Makati." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.angelyncakes.com/" />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:image" content={OG_IMAGE} />
        <meta name="twitter:title" content="Angelyn's Cakes — For Every Occasion" />
        <meta name="twitter:description" content="Custom cakes for weddings, debuts, and corporate events. Handcrafted in Makati." />

        {/* Security headers */}
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        {process.env.NODE_ENV === 'production' && (
          <meta httpEquiv="Content-Security-Policy" content={CSP} />
        )}

        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

        {/* Preload the correct hero video for this viewport so playback starts
            as early as possible, without fetching the other (unused) variant. */}
        <link rel="preload" as="image" href="/images/hero-poster-mobile.jpg" media="(max-width: 767px)" fetchPriority="high" />
        <link rel="preload" as="image" href="/images/hero-poster-desktop.jpg" media="(min-width: 768px)" fetchPriority="high" />

        {/* Google Fonts (non-blocking): print media until loaded, then switch to all */}
        <link id="gfonts" href={FONTS_URL} rel="stylesheet" media="print" suppressHydrationWarning />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){var l=document.getElementById('gfonts');if(!l)return;function s(){l.media='all'}if(l.sheet){s()}else{l.addEventListener('load',s)}})();",
          }}
        />
        <noscript>
          <link href={FONTS_URL} rel="stylesheet" />
        </noscript>
      </head>
      <body>{children}</body>
    </html>
  );
}
