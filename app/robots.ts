import type { MetadataRoute } from "next";
import { BRAND } from "@/config/brand";
import { getSiteUrl } from "@/lib/seo";

/**
 * robots.txt served at /robots.txt. Allows all crawlers and points them to
 * the sitemap so Google and Bing can discover the site.
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl(BRAND);

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
