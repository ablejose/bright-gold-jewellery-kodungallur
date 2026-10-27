import type { MetadataRoute } from "next";
import { BRAND } from "@/config/brand";
import { getSiteUrl } from "@/lib/seo";

/**
 * XML sitemap served at /sitemap.xml: the homepage plus the daily gold-rate
 * page (the admin desk is never listed).
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
    {
      url: `${siteUrl}/gold-rate`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];
}
