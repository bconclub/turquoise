/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static export to allow dynamic admin routes
  // output: 'export', // Commented out to allow dynamic routes for admin
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
