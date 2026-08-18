import type { MetadataRoute } from "next";
import { BRAND } from "@/config/brand";

/**
 * Web app manifest served at /manifest.webmanifest. Powers "Add to Home
 * Screen" and PWA install with the brand icons and colours.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND.businessName,
    short_name: "Bright Gold",
    description: BRAND.seo.description,
    start_url: "/",
    display: "standalone",
    background_color: "#050509",
    theme_color: "#050509",
    icons: [
      { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
