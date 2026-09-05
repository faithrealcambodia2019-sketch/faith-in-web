import type { NextConfig } from "next";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' https://www.gstatic.com https://accounts.google.com https://apis.google.com",
  "style-src 'self' 'unsafe-inline' https://accounts.google.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  "media-src 'self' blob: https:",
  // wss://*.googleapis.com covers the Firestore listen channel used by the
  // realtime messaging screen when the SDK negotiates a socket rather than
  // long polling.
  "connect-src 'self' https://*.googleapis.com wss://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://*.supabase.co https://*.storage.supabase.co https://accounts.google.com https://bible-api.com https://auth.faithin.co",
  "frame-src https://accounts.google.com https://*.firebaseapp.com https://auth.faithin.co",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

/**
 * The policy we are working towards: identical to the enforced one, minus
 * 'unsafe-inline' in script-src. Served Report-Only so it measures the gap
 * without breaking anything.
 */
const strictScriptPolicy = contentSecurityPolicy.replace(
  "script-src 'self' 'unsafe-inline'",
  "script-src 'self'"
);

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
      { source: "/faithin-app/bible.html", destination: "/bible", permanent: true },
      { source: "/faithin-app/library.html", destination: "/library", permanent: true },
      { source: "/faithin-app/messaging.html", destination: "/messages", permanent: true },
      { source: "/faithin-app/network.html", destination: "/network", permanent: true },
      { source: "/faithin-app/notifications.html", destination: "/notifications", permanent: true },
      { source: "/faithin-app/profile.html", destination: "/profile", permanent: true },
      { source: "/faithin-app/article.html", destination: "/article", permanent: true },
      { source: "/faithin-app/settings.html", destination: "/settings", permanent: true },
      { source: "/faithin-app/settings-security.html", destination: "/settings-security", permanent: true },
      { source: "/faithin-app/studio.html", destination: "/studio", permanent: true },
      { source: "/faithin-app/dashboard.html", destination: "/dashboard", permanent: true },
      { source: "/faithin-app/bible.html", destination: "/bible", permanent: true },
    ];
  },
  async rewrites() {
    return {
      // Runs before filesystem routes, so the apex domain serves the new
      // Faith In interface while keeping the canonical faithin.co URL visible.
      beforeFiles: [
        { source: "/", destination: "/faithin-app/index.html" },
        { source: "/home", destination: "/faithin-app/index.html" },
        { source: "/bible", destination: "/faithin-app/bible.html" },
        { source: "/bible-study", destination: "/faithin-app/bible.html" },
        { source: "/article", destination: "/faithin-app/article.html" },
        { source: "/write", destination: "/faithin-app/article.html" },
        { source: "/jobs", destination: "/faithin-app/jobs.html" },
        { source: "/bible", destination: "/faithin-app/bible.html" },
        { source: "/library", destination: "/faithin-app/library.html" },
        { source: "/messages", destination: "/faithin-app/messaging.html" },
        { source: "/network", destination: "/faithin-app/network.html" },
        { source: "/notifications", destination: "/faithin-app/notifications.html" },
        { source: "/profile", destination: "/faithin-app/profile.html" },
        { source: "/settings", destination: "/faithin-app/settings.html" },
        { source: "/settings-security", destination: "/faithin-app/settings-security.html" },
        { source: "/settings/security", destination: "/faithin-app/settings-security.html" },
        { source: "/studio", destination: "/faithin-app/studio.html" },
        { source: "/dashboard", destination: "/faithin-app/dashboard.html" },
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
          // The enforced policy above still carries 'unsafe-inline' in
          // script-src, which is what makes an XSS bug exploitable rather than
          // inert. Removing it means converting roughly 400 inline event
          // handlers across bible.html and faith-in-app.js — too much to do
          // blind on a live app.
          //
          // This reports what the strict policy WOULD block, without blocking
          // anything. Violations appear in the browser console as
          // "Refused to execute... (report only)", which turns the remaining
          // work into a measured list instead of a guess. Delete this header
          // once script-src is clean and the strict policy is enforced.
          { key: "Content-Security-Policy-Report-Only", value: strictScriptPolicy },
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
        source: "/:path(home|network|messages|profile|jobs|library|bible|notifications|settings|settings-security|studio|dashboard)?",
        headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate, s-maxage=0" }],
      },
      {
        source: "/faithin-app/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate, s-maxage=0" }],
      },
      {
        source: "/assets/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" }],
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
