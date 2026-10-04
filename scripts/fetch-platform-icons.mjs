import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

// Editorial identification of delivery targets, not partner badges.
// Preserve source colors and geometry. Rasterize SVGs for consistent, safe img use.
const sources = {
  applovin: 'https://www.applovin.com/icon.svg?088bdaa79f9e2de9',
  'google-ads': 'https://www.gstatic.com/images/branding/product/2x/ads_96dp.png',
  unity: 'https://cdn.jsdelivr.net/npm/simple-icons@16/icons/unity.svg',
  meta: 'https://static.xx.fbcdn.net/rsrc.php/yf/r/-7pQO6hUGK_.svg',
  tiktok: 'https://admanage.ai/brand-assets/platforms/tiktok-logo.svg',
  pangle: 'https://sf16-scmcdn-sg.i18n-pglstatp.com/obj/ad-media-static-sg/pangle_platform/pc/favicon.ico',
  mintegral: 'https://assets-official.mintegral.com/v3/assets/image/common/favicon.png',
  liftoff: 'https://liftoff.ai/wp-content/themes/liftoff/images/favicon.svg?v=3',
  moloco: 'https://cdn.prod.website-files.com/6a59dd0133b776de7ec526cd/6a8fdd99f0b6e0102ab8f943_moloco-webclip-l.png',
  ironsource: 'https://companieslogo.com/img/orig/IS-b6ade979.svg?download=true&t=1720244492',
};
const destination = new URL('../public/assets/images/platforms/', import.meta.url);
await mkdir(destination, { recursive: true });
await Promise.all(Object.entries(sources).map(async ([name, url]) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${name}: ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (name === 'pangle') {
    await writeFile(new URL(`${name}.ico`, destination), bytes);
  } else {
    await sharp(bytes).resize(96, 96, { fit: 'contain', background: '#FFFFFF00' })
      .png().toFile(new URL(`${name}.png`, destination).pathname);
  }
  console.log(`${name}: saved`);
}));
