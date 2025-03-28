import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['jnkvsjlpvaqqftuejjgh.supabase.co'],
  },
  async rewrites() {
    return {
      beforeFiles: [
        // For localhost development, handle subdomain-like paths
        {
          source: '/:subdomain/:path*',
          destination: '/[subdomain]/:path*',
          has: [
            {
              type: 'host',
              value: 'localhost:3000',
            },
          ],
        },
      ],
    };
  },
  // Enable hostname detection for development
  experimental: {
    useCache: true,
  },
};

export default nextConfig;
