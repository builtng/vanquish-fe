import { execSync } from "child_process";

function getCommitHash() {
  if (process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA) {
    return process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA.slice(0, 7);
  }
  if (process.env.VERCEL_GIT_COMMIT_SHA) {
    return process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7);
  }
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    return "b63bba7";
  }
}

const buildHash = getCommitHash();
const buildDate = new Date().toISOString().slice(0, 10);
const buildIdentifier = `Build ${buildDate} ${buildHash}`;

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
    NEXT_PUBLIC_BUILD_IDENTIFIER: buildIdentifier,
    NEXT_PUBLIC_APP_NAME: "Vanquish Therapies",
  },

  // Optimize production builds

  // Headers for SEO, security, and cache prevention
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
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/dashboard/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          },
        ],
      },
      {
        source: "/(low-cost-intake|mid-range-intake|coaching|trainee-counsellor-form|qualified-counsellor-form|clform|tcform|client-booking)/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          },
        ],
      },
      {
        source: "/(low-cost-intake|mid-range-intake|coaching|trainee-counsellor-form|qualified-counsellor-form|clform|tcform|client-booking)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/client",
        destination: "/low-cost-intake",
        permanent: true,
      },
      {
        source: "/low-cost",
        destination: "/low-cost-intake",
        permanent: true,
      },
      {
        source: "/ish",
        destination: "/coaching",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
