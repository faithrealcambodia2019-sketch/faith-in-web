import type { MetadataRoute } from "next";
import { site } from "@/lib/site-content";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /messages is a private inbox; there is nothing there to index.
      disallow: ["/api/", "/app/", "/messages"],
    },
    sitemap: `${site.origin}/sitemap.xml`,
  };
}
