/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Enable image optimization on Vercel (automatic), disable for static export
    unoptimized: process.env.ENABLE_STATIC_EXPORT === 'true',
  },
  
  // Add trailing slash for better compatibility
  trailingSlash: true,
  
  // Performance optimizations are enabled by default in Next.js 14+
  // Run Lighthouse audits for 90+ scores after deployment
};

// Static export is DISABLED by default
// Enable it ONLY if you're using shared hosting (Hostinger shared, etc.)
// To enable: Set ENABLE_STATIC_EXPORT=true in your environment
// See HOSTING_OPTIONS.md for details

if (process.env.ENABLE_STATIC_EXPORT === 'true') {
  nextConfig.output = 'export';
  console.log('⚠️  Static export enabled - API routes will not work in production');
}

export default nextConfig;

