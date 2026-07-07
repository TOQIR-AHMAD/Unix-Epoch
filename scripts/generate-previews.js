// Generates media/preview/previews.html — a hero banner plus terminal
// mockups rendered from the real theme palettes in src/themes.ts.
// Run `npm run compile` first (reads the compiled out/themes.js), then
// screenshot #hero and each #shot-<slug> element to media/preview/*.png.
const fs = require("fs");
const path = require("path");
const { RETRO_THEMES } = require("../out/themes.js");

const SHOWCASE = [
  "DEC VT52 Amber",
  "Apple II Green",
  "Commodore 64",
  "Turbo Pascal",
  "Hacker Green (Matrix)",
  "Solarized Dark",
];
const HERO_MINIS = ["DEC VT52 Amber", "Apple II Green", "Commodore 64", "Turbo Pascal", "Hacker Green (Matrix)"];

const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const byName = (name) => RETRO_THEMES.find((t) => t.name === name);

// Same chrome-shade math as src/extension.ts, so the README mockups match VS Code.
const hexToRgb = (hex) => {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};
const rgbToHex = (r, g, b) => {
  const c = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
};
const luminance = (hex) => {
  const [r, g, b] = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};
const mix = (from, to, amt) => {
  const [r1, g1, b1] = hexToRgb(from);
  const [r2, g2, b2] = hexToRgb(to);
  return rgbToHex(r1 + (r2 - r1) * amt, g1 + (g2 - g1) * amt, b1 + (b2 - b1) * amt);
};
const shade = (hex, amt) => (luminance(hex) < 0.5 ? mix(hex, "#ffffff", amt) : mix(hex, "#000000", amt));
const toolbarBgFor = (bg) => shade(bg, 0.1);
const borderFor = (bg) => shade(bg, 0.28);

function terminalBody(t) {
  const c = t.colors;
  const span = (key, text) => `<span style="color:${c[key]}">${text}</span>`;
  const fg = (text) => `<span style="color:${c["terminal.foreground"]}">${text}</span>`;
  return [
    fg("$ ") + span("terminal.ansiBrightCyan", "retro-terminal") + fg(" --theme ") + span("terminal.ansiBrightYellow", `"${t.name}"`),
    span("terminal.ansiBrightGreen", "  ✔ applied") + span("terminal.ansiBrightBlack", `  # ${t.description}`),
    fg("$ ls"),
    "  " + span("terminal.ansiBrightBlue", "src/") + "  " + span("terminal.ansiBrightBlue", "docs/") + "  " + fg("README.md") + "  " + span("terminal.ansiBrightMagenta", "themes.ts") + "  " + span("terminal.ansiBrightCyan", "package.json"),
    fg("$ git log --oneline -2"),
    "  " + span("terminal.ansiYellow", "6cd8511") + fg(" add activity bar theme browser"),
    "  " + span("terminal.ansiYellow", "dd9c66e") + fg(" ship 20 retro palettes"),
    fg("$ echo $YEAR"),
    "  " + span("terminal.ansiBrightRed", String(t.year)),
    fg("$ ") + `<span class="cursor" style="background:${c["terminalCursor.foreground"]}">&nbsp;&nbsp;</span>`,
  ].map((l) => `<div>${l}</div>`).join("\n");
}

function shot(t) {
  const c = t.colors;
  const bg = c["terminal.background"];
  const fg = c["terminal.foreground"];
  const accent = c["terminalCursor.foreground"];
  const tbg = toolbarBgFor(bg);
  const bd = borderFor(bg);
  const muted = mix(fg, bg, 0.55);
  return `
  <div class="shot" id="shot-${slug(t.name)}">
    <div class="win" style="border:1px solid ${bd}">
      <div class="toolbar" style="background:${tbg};border-bottom:1px solid ${bd}">
        <span class="tab" style="color:${fg};border-bottom:2px solid ${accent}">
          <span class="tico" style="background:${accent}"></span>pwsh — ${t.name} · ${t.year}
        </span>
        <span class="tools" style="color:${muted}">+ &nbsp;⌄&nbsp; ▭ &nbsp;🗑&nbsp; ⋯ &nbsp;✕</span>
      </div>
      <div class="term" style='background:${bg};color:${fg};font-family:${t.font}'>
${terminalBody(t)}
        <div class="scan"></div>
      </div>
    </div>
  </div>`;
}

function heroMini(t) {
  const c = t.colors;
  const bar = (key) => `<i style="background:${c[key]}"></i>`;
  return `
    <div class="mini">
      <div class="mini-screen" style="background:${c["terminal.background"]}">
        <b style="color:${c["terminal.foreground"]}">$ ${t.year}</b>
        <div class="bars">${bar("terminal.ansiBrightRed")}${bar("terminal.ansiBrightYellow")}${bar("terminal.ansiBrightGreen")}${bar("terminal.ansiBrightBlue")}</div>
        <div class="scan"></div>
      </div>
      <span class="mini-label">${t.name}</span>
    </div>`;
}

const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=VT323&family=IBM+Plex+Mono&family=Share+Tech+Mono&family=Courier+Prime&family=Ubuntu+Mono&display=swap" rel="stylesheet">
<style>
  body { margin: 0; padding: 24px; background: #101010; font-family: Consolas, "Courier New", monospace; display: flex; flex-direction: column; gap: 32px; align-items: flex-start; }
  .scan { position: absolute; inset: 0; pointer-events: none; background: repeating-linear-gradient(to bottom, rgba(0,0,0,0) 0 2px, rgba(0,0,0,0.22) 2px 4px); border-radius: inherit; }

  #hero { width: 1280px; box-sizing: border-box; padding: 44px 48px 36px; background: radial-gradient(ellipse at 50% -20%, #12351a 0%, #050b06 60%, #030503 100%); border: 4px solid #2a241a; border-radius: 18px; position: relative; }
  #hero h1 { margin: 0; color: #33ff41; font-size: 52px; letter-spacing: 6px; text-shadow: 0 0 18px rgba(51,255,65,.75); }
  #hero h1 .amber { color: #ffb000; text-shadow: 0 0 18px rgba(255,176,0,.75); }
  #hero p { margin: 10px 0 30px; color: #7adf88; font-size: 19px; letter-spacing: 2px; }
  .minis { display: flex; gap: 22px; }
  .mini { display: flex; flex-direction: column; gap: 8px; align-items: center; }
  .mini-screen { position: relative; width: 200px; height: 118px; border: 3px solid #3a3428; border-radius: 8px; padding: 12px 14px; box-sizing: border-box; }
  .mini-screen b { font-size: 15px; }
  .bars { display: flex; gap: 6px; margin-top: 14px; }
  .bars i { width: 30px; height: 9px; border-radius: 2px; }
  .mini-label { color: #9aa08a; font-size: 13px; letter-spacing: 1px; }

  .shot { width: 820px; }
  .win { border-radius: 10px; overflow: hidden; box-shadow: 0 12px 40px rgba(0,0,0,.6); }
  .toolbar { padding: 0 12px; height: 36px; display: flex; align-items: stretch; justify-content: space-between; font-size: 12px; }
  .tab { display: inline-flex; align-items: center; gap: 8px; padding: 0 4px; letter-spacing: .5px; }
  .tico { width: 11px; height: 11px; border-radius: 2px; display: inline-block; }
  .tools { display: inline-flex; align-items: center; font-size: 13px; letter-spacing: 2px; }
  .term { position: relative; padding: 18px 20px 22px; font-size: 15px; line-height: 1.65; text-shadow: 0 0 3px rgba(255,255,255,.15); }
  .cursor { display: inline-block; }
</style></head>
<body>
<div id="hero">
  <h1>RETRO TERMINAL <span class="amber">THEMES</span></h1>
  <p>&gt; 20 RETRO TERMINAL COLOR THEMES · 1964–2010 · FOR THE VS CODE INTEGRATED TERMINAL_</p>
  <div class="minis">${HERO_MINIS.map((n) => heroMini(byName(n))).join("")}</div>
  <div class="scan"></div>
</div>
${SHOWCASE.map((n) => shot(byName(n))).join("\n")}
</body></html>`;

const out = path.join(__dirname, "..", "media", "preview", "previews.html");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log("wrote", out);
console.log("shots:", ["hero", ...SHOWCASE.map(slug)].join(", "));
