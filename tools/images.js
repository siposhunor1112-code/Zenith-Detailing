// Elkészíti a megosztási képet (public/assets/og.jpg) és az iPhone-ikont (public/assets/apple-touch-icon.png).
// Futtatás:  node tools/images.js      (kell hozzá a Playwright: npm i -g playwright, vagy NODE_PATH-on elérhetően)
const path = require("path");
const fs = require("fs");
let chromium;
try { ({ chromium } = require("playwright")); } catch { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }

const ROOT = path.join(__dirname, "..", "public");
// A betűket beágyazva adjuk át (az üres lapról a böngésző nem tölthet be helyi fájlt)
const font = (f) => `data:font/woff2;base64,${fs.readFileSync(path.join(ROOT, "assets", "fonts", f)).toString("base64")}`;

const base = `
  @font-face { font-family: Display; font-style: normal; src: url(${font("instrument-serif-latin-400-normal.woff2")}); }
  @font-face { font-family: Display; font-style: normal; src: url(${font("instrument-serif-latin-ext-400-normal.woff2")}); unicode-range: U+0100-02BA; }
  @font-face { font-family: Display; font-style: italic; src: url(${font("instrument-serif-latin-400-italic.woff2")}); }
  @font-face { font-family: Display; font-style: italic; src: url(${font("instrument-serif-latin-ext-400-italic.woff2")}); unicode-range: U+0100-02BA; }
  @font-face { font-family: Mono; font-weight: 500; src: url(${font("ibm-plex-mono-latin-500-normal.woff2")}); }
  @font-face { font-family: Mono; font-weight: 500; src: url(${font("ibm-plex-mono-latin-ext-500-normal.woff2")}); unicode-range: U+0100-02BA; }
  * { margin: 0; box-sizing: border-box; }
  html, body { width: 100%; height: 100%; }
  body { background: #060607; color: #efeae1; font-family: Display; overflow: hidden; position: relative; }
  /* két stúdiófény tükröződése a fekete lakkon */
  .paint { position: absolute; inset: 0;
    background:
      radial-gradient(70% 5% at 68% 26%, rgba(255, 246, 230, .55), transparent 70%),
      radial-gradient(90% 16% at 66% 26%, rgba(255, 246, 230, .10), transparent 70%),
      radial-gradient(60% 3% at 72% 58%, rgba(246, 234, 208, .7), transparent 70%),
      radial-gradient(80% 12% at 72% 58%, rgba(214, 191, 148, .12), transparent 70%),
      radial-gradient(70% 70% at 80% 40%, #16161a, transparent 70%); }
`;

const glint = `<svg viewBox="0 0 40 40"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6e6"/><stop offset=".55" stop-color="#d9c39c"/><stop offset="1" stop-color="#9c8660"/></linearGradient></defs><path d="M20 1.5C21 13.6 26.4 19 38.5 20 26.4 21 21 26.4 20 38.5 19 26.4 13.6 21 1.5 20 13.6 19 19 13.6 20 1.5Z" fill="url(#g)"/></svg>`;

const og = `<style>${base}
  .wrap { position: absolute; inset: 60px 72px; display: flex; flex-direction: column; }
  .top { display: flex; align-items: center; gap: 16px; font: 500 18px/1 Mono; letter-spacing: .32em; text-transform: uppercase; color: #8f8a82; }
  .top svg { width: 38px; height: 38px; }
  .top b { font: 400 36px/1 Display; letter-spacing: 0; text-transform: none; color: #efeae1; margin-right: 6px; }
  h1 { margin-top: auto; font-weight: 400; font-size: 132px; line-height: .88; letter-spacing: -.035em; }
  h1 em { display: block; padding-left: .7em; background: linear-gradient(100deg, #9c8660, #d6bf94 35%, #f6ead0 55%, #d6bf94 75%); -webkit-background-clip: text; color: transparent; }
  .bottom { margin-top: 36px; padding-top: 22px; border-top: 1px solid rgba(239,234,225,.18); display: flex; gap: 44px; font: 500 20px/1 Mono; letter-spacing: .08em; color: #8f8a82; }
  .bottom b { color: #efeae1; font-weight: 500; }
</style>
<div class="paint"></div>
<div class="wrap">
  <div class="top">${glint}<b>Zenith</b> Detailing · Budapest</div>
  <h1>A fény<em>nem hazudik.</em></h1>
  <div class="bottom"><span>Korrekció · Kerámia · SB3</span><span>Kondorosi út 2/A</span><span><b>+36 30 727 9545</b></span></div>
</div>`;

const icon = `<style>${base}
  body { display: grid; place-items: center; }
  svg { width: 58%; height: 58%; }
</style>${glint}`;

(async () => {
  const browser = await chromium.launch();
  const shot = async (html, w, h, file, type) => {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(ROOT, "assets", file), type, ...(type === "jpeg" ? { quality: 88 } : {}) });
    await page.close();
    console.log("kész:", file);
  };
  await shot(og, 1200, 630, "og.jpg", "jpeg");
  await shot(icon, 180, 180, "apple-touch-icon.png", "png");
  await browser.close();
})();
