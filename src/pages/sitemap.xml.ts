import { getCollection } from "astro:content";

export async function GET() {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  const routes = ["", "about/", "capabilities/", "how-we-work/", "insights/", "playable-ads/", "quality-engineering/", "privacy-policy/", "terms-of-use/", ...posts.map((post) => `insights/${post.id}/`)];
  const urls = routes.map((route) => `<url><loc>https://aniloom.tech/${route}</loc></url>`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
