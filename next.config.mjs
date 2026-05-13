/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable compression for better performance
  compress: true,

  // Optimize images
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Enable React strict mode for better development experience
  reactStrictMode: true,

  env: {
    NEXT_PUBLIC_STRIPE_TEST_PUBLIC_KEY:
      process.env.NEXT_PUBLIC_STRIPE_TEST_PUBLIC_KEY ||
      "pk_test_51T334zBNtP3ABfrvsG3vnxy4EhBREwnuGj8MkkxQqZVx8zpsoIFV4N3tRMcamg45jbppTNSH0SCcesi2NL4koYo100TDnTqTdn",
    NEXT_PUBLIC_STRIPE_MODE: process.env.NEXT_PUBLIC_STRIPE_MODE || "test",
  },

  // Optimize production builds

  // Headers for SEO and security
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
