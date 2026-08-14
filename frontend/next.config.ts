import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for production builds (next build → out/).
  // In dev mode (next dev / Turbopack) output is undefined so dynamic routes
  // work normally; Next.js 16 enforces generateStaticParams() even in dev
  // when output: "export" is set, which breaks runtime-created prompt IDs.
  output: process.env.NODE_ENV === "production" ? "export" : undefined,

  // Disable image optimization (not available in static export)
  images: { unoptimized: true },

  // Electron loads apps via 127.0.0.1 but dev servers bind to localhost
  allowedDevOrigins: ["127.0.0.1:3002", "localhost:3002", "127.0.0.1", "localhost"],
};

export default nextConfig;
