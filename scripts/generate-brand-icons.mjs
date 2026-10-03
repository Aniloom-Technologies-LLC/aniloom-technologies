import sharp from 'sharp';
import { copyFile, writeFile } from 'node:fs/promises';

const source = process.argv[2];
if (!source) throw new Error('Provide the approved logo PNG path.');
const brandDirectory = new URL('../public/assets/images/brand/', import.meta.url);
const publicDirectory = new URL('../public/', import.meta.url);
await copyFile(source, new URL('aniloom-logo-original.png', brandDirectory));
const cropped = await sharp(source).trim().png().toBuffer();
const icon = async (size) => {
  const padding = Math.max(1, Math.round(size * 0.025));
  return sharp(cropped)
    .resize(size - padding * 2, size - padding * 2, {
      fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .extend({ top: padding, bottom: padding, left: padding, right: padding,
      background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toBuffer();
};
for (const [name, size] of [
  ['favicon-16x16.png', 16], ['favicon-32x32.png', 32],
  ['favicon-48x48.png', 48], ['apple-touch-icon.png', 180],
  ['icon-192.png', 192], ['icon-512.png', 512],
]) await writeFile(new URL(name, publicDirectory), await icon(size));
await writeFile(new URL('aniloom-logo.png', brandDirectory), await icon(96));

// ICO directory containing PNG frames for standard favicon sizes.
const sizes = [16, 32, 48];
const frames = await Promise.all(sizes.map(icon));
const header = Buffer.alloc(6 + sizes.length * 16);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
frames.forEach((frame, index) => {
  const entry = 6 + index * 16;
  header[entry] = sizes[index];
  header[entry + 1] = sizes[index];
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(frame.length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += frame.length;
});
await writeFile(new URL('favicon.ico', publicDirectory), Buffer.concat([header, ...frames]));
