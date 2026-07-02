// Generates Couragely PWA icons into public/icons from a vector flame mark.
// Run: node scripts/generate-icons.mjs
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const INK = "#0B0B0D";
const GO = "#34D17E";
const OUT = new URL("../public/icons/", import.meta.url);

// Lucide "flame" — a closed, fillable path in a 24×24 box.
const FLAME =
  "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z";

function svg({ size, pad, fill, bg, radius }) {
  const k = (size * (1 - 2 * pad)) / 24;
  const rect = bg
    ? `<rect width="${size}" height="${size}" rx="${radius}" fill="${bg}"/>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${rect}
  <g transform="translate(${size / 2} ${size / 2}) scale(${k}) translate(-12 -12)">
    <path d="${FLAME}" fill="${fill}"/>
  </g>
</svg>`;
}

const icons = [
  { file: "icon-192.png", size: 192, pad: 0.2, fill: GO, bg: INK, radius: 42 },
  { file: "icon-512.png", size: 512, pad: 0.2, fill: GO, bg: INK, radius: 112 },
  // maskable: full-bleed background, flame inside the safe zone
  { file: "maskable-512.png", size: 512, pad: 0.3, fill: GO, bg: INK, radius: 0 },
  // notification badge: monochrome, transparent background
  { file: "badge-72.png", size: 72, pad: 0.15, fill: "#FFFFFF", bg: null, radius: 0 },
];

await mkdir(OUT, { recursive: true });
for (const i of icons) {
  const buf = Buffer.from(svg(i));
  await sharp(buf).png().toFile(new URL(i.file, OUT).pathname);
  console.log("wrote", i.file, `(${i.size}px)`);
}
console.log("done");
