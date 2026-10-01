/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export -> ./out, deployable on Cloudflare Pages with no server/adapter.
  // public/_headers is copied into ./out and keeps working on Cloudflare Pages.
  output: 'export',
  images: { unoptimized: true },
};

export default nextConfig;
