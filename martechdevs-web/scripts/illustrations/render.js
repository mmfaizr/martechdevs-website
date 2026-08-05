// Rasterise built illustrations so they can be eyeballed.
//
//   node scripts/illustrations/render.js cdp messaging ...
//   node scripts/illustrations/render.js cdp-frame          the baked motion still
//
// resvg draws frame 0: sweeps sit just off the start of their line and the orbs
// are still transparent. So this checks layout, colour, type and logos, not
// timing. Timing is checked in the browser via public/_lab.html.
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const OUT = process.env.RENDER_OUT || path.join(require("os").tmpdir(), "illustrations");
fs.mkdirSync(OUT, { recursive: true });

// The shipped brand marks embed their artwork as WebP, which every target
// browser decodes and resvg does not - it silently draws an empty tile. Left
// alone, every logo would be invisible in exactly the renders used to check
// them. Transcoding to PNG here keeps the shipped file untouched.
async function inlineWebpAsPng(svg) {
  const re = /data:image\/webp;base64,([A-Za-z0-9+/=]+)/g;
  const hits = [...svg.matchAll(re)];
  for (const [full, b64] of hits) {
    try {
      const png = await sharp(Buffer.from(b64, "base64")).png().toBuffer();
      svg = svg.split(full).join(`data:image/png;base64,${png.toString("base64")}`);
    } catch {
      /* leave it; an empty tile is better than failing the whole render */
    }
  }
  return svg;
}

// Remove whole <g> elements whose opening tag matches, counting nesting.
// A non-greedy regex to the first </g> is wrong here: these groups contain a
// nested <g> for the logo, so it either stops short or, reaching for a second
// closing tag, swallows everything up to the next one and quietly deletes half
// the illustration from the preview.
function dropGroups(svg, opener) {
  for (;;) {
    opener.lastIndex = 0;
    const m = opener.exec(svg);
    if (!m) return svg;
    let i = svg.indexOf(">", m.index) + 1;
    let depth = 1;
    while (depth > 0 && i < svg.length) {
      const open = svg.indexOf("<g", i);
      const close = svg.indexOf("</g>", i);
      if (close === -1) return svg;
      if (open !== -1 && open < close) { depth++; i = open + 2; }
      else { depth--; i = close + 4; }
    }
    svg = svg.slice(0, m.index) + svg.slice(i);
  }
}

(async () => {
  for (const name of process.argv.slice(2)) {
    // "cdp" renders the live file, "cdp-frame" the baked mid-flight still
    const guess = [
      `public/assets/${name}-animated.svg`,
      `scripts/illustrations/.preview/${name}.svg`,
    ];
    const src = guess.find((p) => fs.existsSync(p)) || guess[0];
    try {
      let svg = await inlineWebpAsPng(fs.readFileSync(src, "utf8"));
      // resvg does not implement offset-path, so every pointer would pile up at
      // the origin and read as a green smudge in the corner. Drop them: motion
      // is checked in the browser via public/_lab.html, never from a still.
      svg = dropGroups(svg, /<g class="bead"/g);
      // brand slots share one spot and take turns via CSS, which the rasteriser
      // does not run, so every slot would print on top of the others
      svg = dropGroups(svg, /<g class="brand" style="opacity:0;/g);
      const info = await sharp(Buffer.from(svg), { density: 288 })
        .resize({ width: 700 })
        .flatten({ background: "#ffffff" })
        .png()
        .toFile(path.join(OUT, `${name}.png`));
      console.log(`${name}  ${info.width}x${info.height}  ${path.join(OUT, name + ".png")}`);
    } catch (e) {
      console.log(`${name}  RENDER FAILED  ${e.message}`);
      process.exitCode = 1;
    }
  }
})();
