import type { MetadataRoute } from "next";
import { site } from "@/lib/site-content";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { url: `${site.origin}/`, changeFrequency: "daily" as const, priority: 1.0 },
    { url: `${site.origin}/home`, changeFrequency: "daily" as const, priority: 1.0 },
    { url: `${site.origin}/article`, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${site.origin}/studio`, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${site.origin}/jobs`, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${site.origin}/library`, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${site.origin}/network`, changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${site.origin}/messages`, changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${site.origin}/profile`, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${site.origin}/settings`, changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${site.origin}/settings-security`, changeFrequency: "monthly" as const, priority: 0.5 },
  ];

  return routes.map((r) => ({
    url: r.url,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
