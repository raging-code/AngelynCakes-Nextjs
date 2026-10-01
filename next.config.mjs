import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  allowedDevOrigins: (process.env.DEV_ORIGINS || '').split(',').map((x) => x.trim()).filter(Boolean),
  turbopack: { root: __dirname },
};

export default nextConfig;