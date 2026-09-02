import type { MetadataRoute } from "next";
import { site } from "@/lib/site-content";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { url: `${site.origin}/`, changeFrequency: "daily" as const, priority: 1.0 },
    { url: `${site.origin}/features`, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${site.origin}/bible-study`, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${site.origin}/bible`, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${site.origin}/for-churches`, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${site.origin}/about`, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${site.origin}/contact`, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${site.origin}/privacy`, changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${site.origin}/terms`, changeFrequency: "yearly" as const, priority: 0.3 },
  ];

  return routes.map((r) => ({
    url: r.url,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
