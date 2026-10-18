import { getCollection } from "astro:content";

export async function GET() {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  // Intentional public catalog. test:search checks it against every built page.
  // Keep support, legacy redirects, and unpublished posts out.
  // Omit lastmod until content modification dates have a reliable source.
  const routes = [
    "",
    "about/",
    "anishot/",
    "anishot/privacy-policy/",
    "capabilities/",
    "contact/",
    "how-we-work/",
    "insights/",
    "playable-ads/",
    "playable-ads/pricing/",
    "quality-engineering/",
    "quality-engineering/pricing/",
    "privacy-policy/",
    "terms-of-use/",
    ...posts.map((post) => `insights/${post.id}/`),
  ];
  const urls = routes.map((route) => `<url><loc>https://aniloom.tech/${route}</loc></url>`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
