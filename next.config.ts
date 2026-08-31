import type { NextConfig } from "next";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' https://code.jquery.com https://unpkg.com https://www.gstatic.com https://accounts.google.com https://apis.google.com",
  "style-src 'self' 'unsafe-inline' https://accounts.google.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  "media-src 'self' blob: https:",
  // wss://*.googleapis.com covers the Firestore listen channel used by the
  // realtime messaging screen when the SDK negotiates a socket rather than
  // long polling.
  "connect-src 'self' https://*.googleapis.com wss://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://vercel.com https://*.blob.vercel-storage.com https://accounts.google.com https://bible-api.com",
  "frame-src https://accounts.google.com https://*.firebaseapp.com",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.faithin.co" }],
        destination: "https://faithin.co/:path*",
        permanent: true,
      },
      { source: "/faithin-app/index.html", destination: "/home", permanent: true },
      { source: "/faithin-app/jobs.html", destination: "/jobs", permanent: true },
      { source: "/faithin-app/library.html", destination: "/library", permanent: true },
      { source: "/faithin-app/messaging.html", destination: "/messages", permanent: true },
      { source: "/faithin-app/network.html", destination: "/network", permanent: true },
      { source: "/faithin-app/notifications.html", destination: "/notifications", permanent: true },
      { source: "/faithin-app/profile.html", destination: "/profile", permanent: true },
      { source: "/faithin-app/settings.html", destination: "/settings", permanent: true },
    ];
  },
  async rewrites() {
    return {
      // Runs before filesystem routes, so the apex domain serves the new
      // Faith In interface while keeping the canonical faithin.co URL visible.
      beforeFiles: [
        { source: "/", destination: "/faithin-app/index.html" },
        { source: "/home", destination: "/faithin-app/index.html" },
        { source: "/jobs", destination: "/faithin-app/jobs.html" },
        { source: "/library", destination: "/faithin-app/library.html" },
        { source: "/messages", destination: "/faithin-app/messaging.html" },
        { source: "/network", destination: "/faithin-app/network.html" },
        { source: "/notifications", destination: "/faithin-app/notifications.html" },
        { source: "/profile", destination: "/faithin-app/profile.html" },
        { source: "/settings", destination: "/faithin-app/settings.html" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "0" },
          { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
          { key: "Origin-Agent-Cluster", value: "?1" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          { key: "X-DNS-Prefetch-Control", value: "off" },
          { key: "Link", value: "<https://www.gstatic.com>; rel=preconnect; crossorigin, <https://firestore.googleapis.com>; rel=preconnect" },
        ],
      },
      {
        source: "/:path(home|network|messages|profile|jobs|library|notifications|settings)?",
        headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }],
      },
      {
        source: "/faithin-app/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
      {
        source: "/assets/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
      {
        source: "/app/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/messages",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
    ];
  },
};

export default nextConfig;
