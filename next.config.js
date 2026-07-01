/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  experimental: {
    // Keep heavy Node-only packages (which have optional native/lazy deps) external
    // so webpack doesn't try to bundle their optional dependencies into the server build.
    serverComponentsExternalPackages: ["mongoose", "nodemailer"],
  },
};

module.exports = nextConfig;
