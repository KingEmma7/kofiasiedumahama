/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Add your image domains here if using external images
    domains: [],
    // Enable image optimization
    unoptimized: false,
  },
  // Enable static exports if needed for hosting elsewhere
  // output: 'export',
  
  // Performance optimizations are enabled by default in Next.js 14+
  // Run Lighthouse audits for 90+ scores after deployment
};

export default nextConfig;

