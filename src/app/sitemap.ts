import { MetadataRoute } from "next";

const BASE_URL = "https://aiuag.edu";
const locales = ["ar", "en"];

const staticPages = [
  "",
  "/about",
  "/programs",
  "/admission",
  "/student-life",
  "/research",
  "/contact",
  "/news",
  "/events",
  "/faculty",
  "/faq",
  "/privacy-policy",
  "/terms",
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
