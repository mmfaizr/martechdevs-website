// Rebuild public/assets/tool logos icons so every brand mark is the same
// optical size and dead centre in its 42x42 box.
//
//   node scripts/illustrations/normalise-logos.js --dry
//   node scripts/illustrations/normalise-logos.js
//
// Source of truth is _asset-originals/tool logos icons, which holds the export
// as it came out of design: a PNG bitmap at full resolution, a pattern, and a
// rect placing it. Where that rect sits and how much of it the visible mark
// fills varies per file - measured across the set, marks centre anywhere from
// x=19.4 to x=24.1 and range from 20.9 to 29.6 units across. In a row of pills
// that reads as some logos sitting high and others being bigger than their
// neighbours.
//
// Two things happen here, and the first is what makes the second exact:
//
//   1. The bitmap is trimmed to its own non-transparent bounds, so the file's
//      internal padding stops counting as part of the mark. Adjusting only the
//      rect cannot fix that padding, and it differs per file.
//   2. The rect is sized so the trimmed mark's longest side is TARGET, and
//      placed so its CENTRE OF MASS lands at 21,21 - not its bounding box.
//
// The centroid matters. HubSpot's sprocket is a circle with a stem hanging off
// it: box-centred, the box includes the stem, so the circle everyone actually
// looks at sits high and the mark reads as misaligned even though it measures
// dead centre. Weighting by alpha puts the visual mass in the middle, which is
// what the eye is judging.
//
// The bitmap is also re-encoded to WebP, which is the form the shipped files
// were in: as PNG these are ~22KB each, and several get inlined into the
// illustrations, which in turn ship inlined in the page bundle.
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const SRC = "_asset-originals/tool logos icons";
const OUT = "public/assets/tool logos icons";
const BOX = 42;      // the file's own viewBox
const TARGET = 24;   // longest side of the visible mark, in those units
// The bitmaps arrive at full export resolution, several hundred pixels square,
// for a mark that is drawn at 18px in a pill and 24 in an illustration. The
// shipped files were downscaled to about 59px; 96 keeps a retina display honest
// and still costs a fraction of the original.
const MAX_PX = 96;
const RADIUS = 8.964;
const PLATE = "#F7F8F7";
const DRY = process.argv.includes("--dry");

const RECT = /<rect[^>]*x="([\d.-]+)"[^>]*y="([\d.-]+)"[^>]*width="([\d.-]+)"[^>]*height="([\d.-]+)"[^>]*fill="url\(#[^)]+\)"[^>]*\/>/;
const IMG = /<image[^>]*xlink:href="data:image\/(png|jpe?g|webp);base64,([A-Za-z0-9+/=]+)"/;

(async () => {
  if (!fs.existsSync(SRC)) { console.error(`no source at ${SRC}`); process.exit(1); }
  const rows = [];
  let before = 0, after = 0;

  for (const file of fs.readdirSync(SRC).filter((f) => f.endsWith(".svg"))) {
    const name = file.replace(" logo icon.svg", "");
    const raw = fs.readFileSync(path.join(SRC, file), "utf8");
    before += Buffer.byteLength(raw);
    const rect = raw.match(RECT);
    const img = raw.match(IMG);
    if (!rect || !img) { rows.push([name, "SKIPPED, unexpected shape"]); continue; }

    let trimmed, meta, trimmedRaw;
    try {
      const buf = Buffer.from(img[2], "base64");
      const res = await sharp(buf).trim({ threshold: 1 })
        .resize({ width: MAX_PX, height: MAX_PX, fit: "inside", withoutEnlargement: true })
        .toBuffer({ resolveWithObject: true });
      meta = res.info;
      trimmedRaw = res.data;
      trimmed = await sharp(res.data).webp({ quality: 92, effort: 6 }).toBuffer();
    } catch (e) { rows.push([name, "SKIPPED, undecodable: " + e.message]); continue; }

    // alpha-weighted centre of mass, as a fraction of the trimmed bitmap
    let cx = 0.5, cy = 0.5;
    try {
      const { data, info } = await sharp(trimmedRaw).ensureAlpha().raw()
        .toBuffer({ resolveWithObject: true });
      let sx = 0, sy = 0, sa = 0;
      for (let py = 0; py < info.height; py++) {
        for (let px = 0; px < info.width; px++) {
          const a = data[(py * info.width + px) * info.channels + info.channels - 1];
          if (!a) continue;
          sx += a * (px + 0.5); sy += a * (py + 0.5); sa += a;
        }
      }
      if (sa) { cx = sx / sa / info.width; cy = sy / sa / info.height; }
    } catch { /* fall back to the box centre */ }

    const k = TARGET / Math.max(meta.width, meta.height);
    const w = meta.width * k, h = meta.height * k;
    // place so the centroid, not the box, lands in the middle; clamp so a very
    // lopsided mark still cannot escape the plate
    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
    const x = clamp(BOX / 2 - cx * w, 3, BOX - w - 3);
    const y = clamp(BOX / 2 - cy * h, 3, BOX - h - 3);
    const f = (n) => +n.toFixed(3);

    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ` +
      `width="${BOX}" height="${BOX}" fill="none" viewBox="0 0 ${BOX} ${BOX}">` +
      `<rect width="${BOX}" height="${BOX}" rx="${RADIUS}" fill="${PLATE}"/>` +
      `<path fill="url(#a)" d="M${f(x)} ${f(y)}h${f(w)}v${f(h)}H${f(x)}z"/>` +
      `<defs><pattern id="a" width="1" height="1" patternContentUnits="objectBoundingBox">` +
      `<use xlink:href="#b" transform="scale(${f(1 / meta.width)} ${f(1 / meta.height)})"/></pattern>` +
      `<image id="b" width="${meta.width}" height="${meta.height}" preserveAspectRatio="none" ` +
      `xlink:href="data:image/webp;base64,${trimmed.toString("base64")}"/></defs></svg>\n`;

    after += Buffer.byteLength(svg);
    const oldMax = Math.max(+rect[3], +rect[4]);
    rows.push([name, `mass at ${(cx * 100).toFixed(0)},${(cy * 100).toFixed(0)}%   ` +
                     `${(Buffer.byteLength(raw) / 1024).toFixed(1)}KB -> ${(Buffer.byteLength(svg) / 1024).toFixed(1)}KB`]);
    if (!DRY) fs.writeFileSync(path.join(OUT, file), svg);
  }

  rows.sort();
  for (const [n, d] of rows) console.log(n.padEnd(13), d);
  console.log(`\n${rows.length} files, ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB` +
              (DRY ? "  (dry run, nothing written)" : ""));
})();
