import { getCollection } from "astro:content";

export async function GET() {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  const routes = [
    "",
    "about/",
    "anishot/",
    "capabilities/",
    "how-we-work/",
    "insights/",
    "playable-ads/",
    "playable-ads/development/",
    "playable-ads/qa-release-readiness/",
    "playable-ads/pricing/",
    "playable-ads/how-we-work/",
    "playable-ads/case-studies/magic-thai-playables/",
    "playable-ads/release-quality-platform-readiness/",
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
