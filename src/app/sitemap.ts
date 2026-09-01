import { MetadataRoute } from "next";

const BASE_URL = "https://aiuag.com";
const locales = ["ar", "en"];

const staticPages = [
  "",
  "/about",
  "/about/history",
  "/about/mission",
  "/about/vision",
  "/about/objectives",
  "/services",
  "/contact",
  "/news",
  "/events",
  "/projects",
  "/posts",
  "/faq",
  "/privacy",
  "/terms",
  "/membership",
  "/membership/apply",
  "/organization",
  "/organization/board",
  "/organization/committees",
  "/organization/secretariat",
  "/organization/branches",
  "/media",
  "/media/gallery",
  "/media/videos",
  "/publications",
  "/resources",
  "/graduate/claim",
  "/donations",
  "/volunteer",
  "/support",
  "/verify",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const urls: MetadataRoute.Sitemap = [];

  for (const page of staticPages) {
    for (const locale of locales) {
      urls.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: now,
        changeFrequency: page === "" ? "daily" : "weekly",
        priority: page === "" ? 1.0 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${BASE_URL}/${l}${page}`])
          ),
        },
      });
    }
  }

  return urls;
}
