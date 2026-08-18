import type { MetadataRoute } from "next";
import { BRAND } from "@/config/brand";
import { getSiteUrl } from "@/lib/seo";

/**
 * XML sitemap served at /sitemap.xml. This is a single-page marketing site,
 * so the homepage is the only indexable URL.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl(BRAND);

  return [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
