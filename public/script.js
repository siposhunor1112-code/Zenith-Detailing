/* =========================================================
   Zenith Detailing – adatok és mozgás
   ========================================================= */

/* ---------- Adatok: ezeket kell módosítani, ha valami változik ---------- */
const SHOP = {
  name: "Zenith Detailing",
  // Ha phone null, a weboldal elrejti a hívás gombokat.
  phone: "+36 30 727 9545",
  email: "info@zendet.com",
  // Nyitvatartás napokra bontva (0 = vasárnap … 6 = szombat); null = zárva
  hours: {
    1: ["09:00", "18:00"],
    2: ["09:00", "18:00"],
    3: ["09:00", "18:00"],
    4: ["09:00", "18:00"],
    5: ["09:00", "18:00"],
    6: null,
    0: null,
  },
  // Jesse O'Connor ebben az évben kezdte a szakmát – ebből számolja az oldal az „X éve” feliratot
  since: 1990,
  // A Google Térkép, ami kattintásra betölt
  mapEmbed: "https://www.google.com/maps?q=Zenith%20Detailing%2C%201116%20Budapest%2C%20Kondorosi%20%C3%BAt%202a&output=embed",
};

const DAY_NAMES = ["vasárnap", "hétfő", "kedd", "szerda", "csütörtök", "péntek", "szombat"];

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const desktop = window.matchMedia("(min-width: 901px)");
const phoneDigits = SHOP.phone ? SHOP.phone.replace(/[^\d+]/g, "") : null;

document.documentElement.classList.replace("no-js", "js");

/* ---------- Telefonszám, évek ---------- */
$$("[data-phone-link]").forEach((a) => {
  if (!SHOP.phone) { a.hidden = true; return; }
  a.href = `tel:${phoneDigits}`;
});
$$("[data-phone-text]").forEach((el) => { if (SHOP.phone) el.textContent = SHOP.phone; });
$$("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
$$("[data-since]").forEach((el) => { el.textContent = SHOP.since; });
$$("[data-years]").forEach((el) => { el.textContent = new Date().getFullYear() - SHOP.since; });

/* ---------- Nyitvatartás (budapesti idő szerint) ---------- */
function budapestNow() {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Budapest", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false,
    }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t).value;
    const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
    const minutes = (Number(get("hour")) % 24) * 60 + Number(get("minute"));
    if (day < 0 || Number.isNaN(minutes)) throw new Error("hiányos időzóna-adat");
    return { day, minutes };
  } catch (err) {
    // Tartalék: CET, nyári időszámítás március utolsó vasárnapjától október utolsó vasárnapjáig
    const now = new Date();
    const y = now.getUTCFullYear();
    const lastSunday = (month) => { const d = new Date(Date.UTC(y, month + 1, 0, 1)); d.setUTCDate(d.getUTCDate() - d.getUTCDay()); return d; };
    const summer = now >= lastSunday(2) && now < lastSunday(9);
    const t = new Date(now.getTime() + (summer ? 2 : 1) * 3600e3);
    return { day: t.getUTCDay(), minutes: t.getUTCHours() * 60 + t.getUTCMinutes() };
  }
}
const toMinutes = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
const pretty = (hhmm) => hhmm.replace(/^0/, "");

function openStatus() {
  const { day, minutes } = budapestNow();
  const today = SHOP.hours[day];
  if (today && minutes >= toMinutes(today[0]) && minutes < toMinutes(today[1])) {
    const left = toMinutes(today[1]) - minutes;
    return { open: true, text: left <= 45 ? `Nyitva még ${left} percig` : `Most nyitva · ${pretty(today[1])}-ig` };
  }
  if (today && minutes < toMinutes(today[0])) {
    return { open: false, text: `Zárva · ma ${pretty(today[0])}-kor nyitunk` };
  }
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    if (SHOP.hours[d]) {
      const when = i === 1 ? "holnap" : DAY_NAMES[d];
      return { open: false, text: `Zárva · ${when} ${pretty(SHOP.hours[d][0])}-kor nyitunk` };
    }
  }
  return { open: false, text: "Átmenetileg zárva" };
}

function renderStatus() {
  const s = openStatus();
  $$("[data-status]").forEach((el) => {
    el.classList.toggle("is-open", s.open);
    el.classList.toggle("is-closed", !s.open);
    $("[data-status-text]", el).textContent = s.text;
  });
  const { day } = budapestNow();
  $$("[data-hours] tr").forEach((tr) => tr.classList.toggle("is-today", Number(tr.dataset.day) === day));
}
renderStatus();
setInterval(renderStatus, 30_000);

/* ---------- Fejléc és menü ---------- */
const nav = $("[data-nav]");
const toggle = $(".nav__toggle");
const dock = $(".dock");
function setMenu(open) {
  nav.classList.toggle("is-open", open);
  nav.classList.remove("is-hidden");
  toggle.setAttribute("aria-expanded", String(open));
  document.body.style.overflow = open ? "hidden" : "";
}
toggle.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
$$("#menu a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); toggle.focus(); } });
desktop.addEventListener?.("change", () => setMenu(false));

let lastY = window.scrollY;
function onScroll() {
  const y = window.scrollY;
  nav.classList.toggle("is-scrolled", y > 10);
  // lefelé görgetéskor a fejléc elbújik, felfelé visszajön
  if (!nav.classList.contains("is-open") && !nav.contains(document.activeElement)) {
    nav.classList.toggle("is-hidden", y > window.innerHeight * 0.9 && y > lastY + 2);
    if (y < lastY - 2) nav.classList.remove("is-hidden");
  }
  lastY = y;
  dock?.classList.toggle("is-shown", y > window.innerHeight * 0.6);
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Az aktuális szekció kiemelése a menüben
const menuLinks = $$("#menu > a[href^='#']");
if ("IntersectionObserver" in window) {
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      menuLinks.forEach((a) => a.setAttribute("aria-current", String(a.getAttribute("href") === `#${en.target.id}`)));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  menuLinks.forEach((a) => { const t = $(a.getAttribute("href")); if (t) spy.observe(t); });
}

/* ---------- Görgetésre előtűnés ---------- */
const revealEls = $$("[data-reveal]");
revealEls.forEach((el) => {
  const sibs = [...el.parentElement.children].filter((c) => c.hasAttribute("data-reveal"));
  el.style.setProperty("--k", sibs.indexOf(el));
});
if ("IntersectionObserver" in window && !reduced) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("is-in"));
}

/* ---------- Nyitókép: belépés ---------- */
$$(".hero [data-rise]").forEach((el, i) => el.style.setProperty("--d", `${0.15 + i * 0.12}s`));
requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.add("is-ready")));

/* =========================================================
   Nyitókép: fekete lakk, stúdiófények tükröződésével (WebGL)
   A felület egy kitalált karosszéria-részlet: nagy ív, éles
   vállvonal, kerékív-domborulat. Az egyik fénycsík az egeret követi.
   ========================================================= */
const PAINT_FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uLight;
uniform float uIn;

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }

float height(vec2 p) {
  float t = uTime * 0.06;
  float asp = uRes.x / uRes.y;
  // a karosszéria nagy íve
  float h = -0.5 * p.y * p.y - 0.06 * p.x * p.x;
  // lassú hullámzás: „folyékony” fekete lakk
  h += 0.03 * sin(p.x * 1.7 + t * 2.0 + sin(p.y * 1.4 - t));
  h += 0.018 * sin(p.y * 2.6 - p.x * 0.9 + t * 1.3);
  // éles vállvonal
  float ln = p.y - (0.14 + 0.1 * sin(p.x * 0.8 + 0.7) - 0.12 * p.x);
  h -= 0.07 * sqrt(ln * ln + 0.00035);
  // kerékív-domborulat jobbra lent
  vec2 c = vec2(0.42 * asp, -0.72);
  float r = length((p - c) * vec2(1.0, 1.25));
  h += 0.16 * smoothstep(0.75, 0.18, r);
  h -= 0.05 * sqrt((r - 0.8) * (r - 0.8) + 0.0006) * smoothstep(1.2, 0.8, r);
  return h;
}

vec3 env(vec3 r) {
  float e = r.y, a = r.x;
  vec3 c = vec3(0.0);
  // felső, széles softbox
  float s1 = smoothstep(0.07, 0.045, abs(e - 0.78 - a * 0.06)) * smoothstep(0.95, 0.45, abs(a - 0.3));
  // hosszú, keskeny csík – ezt mozgatja az egér
  float e2 = uLight.y * 0.42 + 0.02;
  float s2 = smoothstep(0.04, 0.0, abs(e - e2 - (a - uLight.x * 0.6) * 0.16)) * smoothstep(1.1, 0.15, abs(a - uLight.x * 0.6));
  // függőleges csík oldalról
  float s3 = smoothstep(0.05, 0.0, abs(a - 0.62)) * smoothstep(0.7, 0.1, abs(e - 0.1));
  // alsó, hideg derítő
  float s4 = smoothstep(0.22, 0.0, abs(e + 0.5)) * smoothstep(1.0, 0.2, abs(a));
  c += vec3(1.0, 0.96, 0.9) * s1 * 0.6;
  c += vec3(1.0, 0.93, 0.82) * s2 * 2.4;
  c += vec3(0.85, 0.9, 1.0) * s3 * 0.55;
  c += vec3(0.55, 0.64, 0.85) * s4 * 0.18;
  c += vec3(0.02, 0.02, 0.024) * smoothstep(-0.7, 0.9, e);
  return c;
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float ep = 1.5 / uRes.y;
  float h0 = height(p);
  float hx = height(p + vec2(ep, 0.0));
  float hy = height(p + vec2(0.0, ep));
  vec3 n = normalize(vec3(-(hx - h0) / ep, -(hy - h0) / ep, 1.0));
  vec3 r = reflect(vec3(0.0, 0.0, -1.0), n);

  vec3 col = vec3(0.0016, 0.0016, 0.0019);
  vec3 refl = env(r) * uIn;
  col += refl * 0.62;

  // fémes szemcse: apró csillanások a fény közelében
  float fl = hash(floor(gl_FragCoord.xy / 1.3));
  vec3 rj = normalize(r + (vec3(hash(gl_FragCoord.xy + 3.1), hash(gl_FragCoord.xy + 7.7), 0.0) - 0.5) * 0.22);
  col += env(rj) * pow(fl, 60.0) * 0.45 * uIn;

  // kerámia-bevonat: halvány irizálás a fények peremén
  float L = clamp(dot(refl, vec3(0.33)), 0.0, 1.0);
  vec3 iri = 0.5 + 0.5 * cos(6.2831 * (L * 1.6 + vec3(0.0, 0.33, 0.67)) + uTime * 0.15);
  col += iri * L * (1.0 - L) * 0.07;

  // vignetta
  vec2 q = gl_FragCoord.xy / uRes;
  col *= smoothstep(1.25, 0.35, length((q - vec2(0.62, 0.55)) * vec2(1.0, 1.2)));
  // a szöveg alatt (balra, lent) visszafogottabb fény
  float asp = uRes.x / uRes.y;
  col *= asp > 1.0 ? 0.45 + 0.55 * smoothstep(0.1, 0.7, q.x + (q.y - 0.5) * 0.4) : 0.72;

  col = 1.0 - exp(-col * 1.5);
  col = pow(col, vec3(1.0 / 2.2));
  col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}`;

(function paint() {
  const hero = $("[data-hero]");
  const canvas = $("[data-paint]");
  if (!hero || !canvas) return;
  let gl;
  try { gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "high-performance" }); } catch { gl = null; }
  if (!gl) return;

  const sh = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, "attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }"));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, PAINT_FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  } catch (err) {
    console.warn("A nyitókép WebGL nélkül fut:", err);
    return;
  }
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aLoc = gl.getAttribLocation(prog, "a");
  gl.enableVertexAttribArray(aLoc);
  gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);
  const u = (n) => gl.getUniformLocation(prog, n);
  const uRes = u("uRes"), uTime = u("uTime"), uLight = u("uLight"), uIn = u("uIn");

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    // legfeljebb ~1,6 millió képpont: szép marad, de nem melegíti a laptopot
    const scale = Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(1.6e6 / Math.max(1, w * h)));
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener("resize", resize);

  // a fénycsík: bal oldalról „végigsöpör”, aztán lassan jár, vagy az egeret követi
  const light = { x: -2.4, y: 0.35 };
  const target = { x: 0.3, y: 0.1 };
  let lastMove = -1e9;
  if (finePointer) {
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      target.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      target.y = 1 - ((e.clientY - r.top) / r.height) * 2;
      lastMove = performance.now();
    });
  }

  const start = performance.now();
  let raf = 0, visible = true;
  function frame(now) {
    const t = (now - start) / 1000;
    if (now - lastMove > 3500) {
      target.x = 0.25 + Math.sin(t * 0.17) * 0.55;
      target.y = 0.05 + Math.sin(t * 0.23 + 1.3) * 0.3;
    }
    const k = t < 2.6 ? 0.025 : 0.06;
    light.x += (target.x - light.x) * k;
    light.y += (target.y - light.y) * k;
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, reduced ? 12 : t);
    gl.uniform2f(uLight, light.x, light.y);
    gl.uniform1f(uIn, reduced ? 1 : clamp(t / 1.8));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!reduced && visible && !document.hidden) raf = requestAnimationFrame(frame);
  }
  const run = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); };

  if (reduced) { light.x = target.x; light.y = target.y; }
  hero.classList.add("is-gl");
  run();
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) run(); }).observe(hero);
  }
  document.addEventListener("visibilitychange", () => { if (!document.hidden && visible) run(); });
  window.addEventListener("resize", () => { if (reduced) run(); });
  canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); cancelAnimationFrame(raf); hero.classList.remove("is-gl"); });
})();

/* =========================================================
   01 A fény próbája: swirl-karcok egy lámpa fényében
   A karc akkor villan fel, ha merőleges a lámpa felé mutató
   irányra – ezért rajzolódnak ki körök a fény körül.
   ========================================================= */
const PAINTS = {
  obsidian: { base: [5, 6, 8], lit: [44, 46, 54], scratch: 1 },
  midnight: { base: [3, 8, 22], lit: [34, 70, 150], scratch: 1 },
  rosso: { base: [28, 3, 5], lit: [170, 22, 28], scratch: 0.9 },
  nardo: { base: [64, 67, 70], lit: [150, 154, 158], scratch: 0.55 },
};

(function lab() {
  const stage = $("[data-lab-stage]");
  const canvas = $("[data-lab-canvas]");
  const handle = $("[data-lab-handle]");
  const cue = $("[data-lab-cue]");
  if (!stage || !canvas) return;
  const ctx = canvas.getContext("2d");
  let W = 0, H = 0, dpr = 1;
  let scratches = [];
  let deep = [];
  let split = 0.5;
  let paint = PAINTS.obsidian;
  const light = { x: 0.5, y: 0.45 };
  const target = { x: 0.5, y: 0.45 };
  let lastInput = -1e9;
  let visible = false, raf = 0, dirty = true;

  // álvéletlen, hogy minden betöltéskor ugyanúgy nézzen ki
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

  function build() {
    seed = 7;
    const n = Math.round(clamp((W * H) / (dpr * dpr) / 38, 5000, 18000));
    scratches = new Float32Array(n * 5);
    for (let i = 0; i < n; i++) {
      const a = rnd() * Math.PI;
      scratches[i * 5] = rnd() * W;
      scratches[i * 5 + 1] = rnd() * H;
      scratches[i * 5 + 2] = Math.cos(a);
      scratches[i * 5 + 3] = Math.sin(a);
      scratches[i * 5 + 4] = (3 + rnd() * rnd() * 12) * dpr;
    }
    // néhány mélyebb, hosszabb karc
    deep = [];
    for (let i = 0; i < 9; i++) {
      const a = rnd() * Math.PI;
      deep.push([rnd() * W, rnd() * H, Math.cos(a), Math.sin(a), (60 + rnd() * 160) * dpr]);
    }
  }

  function resize() {
    const r = stage.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.width = Math.round(r.width * dpr);
    H = canvas.height = Math.round(r.height * dpr);
    build();
    dirty = true;
  }

  const rgb = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  function drawBase(lx, ly, clean) {
    ctx.fillStyle = rgb(paint.base);
    ctx.fillRect(0, 0, W, H);
    // a fényezés színe a lámpa körül
    const R = Math.max(W, H) * 0.75;
    let g = ctx.createRadialGradient(lx, ly, 0, lx, ly, R);
    g.addColorStop(0, rgb(paint.lit, 0.9));
    g.addColorStop(0.35, rgb(paint.lit, 0.25));
    g.addColorStop(1, rgb(paint.lit, 0));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // fátyol: a karcos felület tejes, a korrigált tiszta
    g = ctx.createRadialGradient(lx, ly, 0, lx, ly, R * (clean ? 0.25 : 0.6));
    g.addColorStop(0, `rgba(255,250,240,${clean ? 0.05 : 0.13})`);
    g.addColorStop(1, "rgba(255,250,240,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // egy ablak tükörképe: a korrigált lakkon éles, a karcoson elmosódott
    const y0 = H * 0.2, bh = H * 0.07, blur = clean ? 0.012 : 0.09;
    g = ctx.createLinearGradient(0, y0 - H * blur, 0, y0 + bh + H * blur);
    const a = clean ? 0.1 : 0.05;
    g.addColorStop(0, "rgba(255,250,240,0)");
    g.addColorStop(clamp((H * blur) / (bh + 2 * H * blur)), `rgba(255,250,240,${a})`);
    g.addColorStop(clamp((H * blur + bh) / (bh + 2 * H * blur)), `rgba(255,250,240,${a * 0.6})`);
    g.addColorStop(1, "rgba(255,250,240,0)");
    ctx.fillStyle = g; ctx.fillRect(0, y0 - H * blur, W, bh + 2 * H * blur);
    // a lámpa tükörképe
    const s = Math.min(W, H);
    const core = s * (clean ? 0.022 : 0.03);
    g = ctx.createRadialGradient(lx, ly, 0, lx, ly, core * (clean ? 5 : 7));
    g.addColorStop(0, "rgba(255,252,245,1)");
    g.addColorStop(clean ? 0.2 : 0.14, "rgba(255,248,235,.95)");
    g.addColorStop(clean ? 0.24 : 0.3, `rgba(255,240,215,${clean ? 0.22 : 0.35})`);
    g.addColorStop(1, "rgba(255,240,215,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(lx, ly, core * (clean ? 5 : 7), 0, Math.PI * 2); ctx.fill();
  }

  const BUCKETS = 7;
  const paths = [];
  function drawSwirls(lx, ly) {
    for (let b = 0; b < BUCKETS; b++) paths[b] = new Path2D();
    const R = Math.min(W, H) * 0.34;
    const s = scratches;
    for (let i = 0; i < s.length; i += 5) {
      const dx = s[i] - lx, dy = s[i + 1] - ly;
      const d = Math.hypot(dx, dy) || 1;
      // a karc iránya és a lámpa körüli kör érintője mennyire esik egybe
      const al = Math.abs((s[i + 2] * -dy + s[i + 3] * dx) / d);
      if (al < 0.9) continue;
      let v = al ** 60 * (1.15 * Math.exp(-d / R) + 0.08);
      if (d < 14 * dpr) v *= 0.2;
      if (v < 0.035) continue;
      const b = Math.min(BUCKETS - 1, Math.floor(v * BUCKETS));
      const hl = s[i + 4] * 0.5;
      paths[b].moveTo(s[i] - s[i + 2] * hl, s[i + 1] - s[i + 3] * hl);
      paths[b].lineTo(s[i] + s[i + 2] * hl, s[i + 1] + s[i + 3] * hl);
    }
    ctx.lineWidth = Math.max(1, dpr * 0.9);
    ctx.lineCap = "round";
    for (let b = 0; b < BUCKETS; b++) {
      ctx.strokeStyle = `rgba(255,248,236,${((b + 1) / BUCKETS) * 0.95 * paint.scratch})`;
      ctx.stroke(paths[b]);
    }
    // mély karcok: minden irányból látszanak egy kicsit
    ctx.lineWidth = Math.max(1, dpr * 1.1);
    deep.forEach(([x, y, cx, cy, len]) => {
      const dx = x - lx, dy = y - ly, d = Math.hypot(dx, dy) || 1;
      const al = Math.abs((cx * -dy + cy * dx) / d);
      const v = (0.12 + al ** 6 * 0.6) * Math.exp(-d / (R * 1.4)) * paint.scratch;
      ctx.strokeStyle = `rgba(255,248,236,${v})`;
      ctx.beginPath(); ctx.moveTo(x - cx * len / 2, y - cy * len / 2); ctx.lineTo(x + cx * len / 2, y + cy * len / 2); ctx.stroke();
    });
  }

  function draw() {
    const lx = light.x * W, ly = light.y * H, sx = split * W;
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, sx, H); ctx.clip();
    drawBase(lx, ly, false);
    drawSwirls(lx, ly);
    ctx.restore();
    ctx.save();
    ctx.beginPath(); ctx.rect(sx, 0, W - sx, H); ctx.clip();
    drawBase(lx, ly, true);
    ctx.restore();
  }

  function frame(now) {
    const t = now / 1000;
    if (now - lastInput > 5000 && !reduced) {
      // magától körbejár a lámpa
      target.x = 0.5 + Math.sin(t * 0.35) * 0.3;
      target.y = 0.48 + Math.sin(t * 0.52 + 0.8) * 0.22;
    }
    const k = reduced ? 1 : 0.14;
    const nx = light.x + (target.x - light.x) * k;
    const ny = light.y + (target.y - light.y) * k;
    if (dirty || Math.abs(nx - light.x) > 1e-4 || Math.abs(ny - light.y) > 1e-4) {
      light.x = nx; light.y = ny; dirty = false;
      draw();
    }
    if (visible) raf = requestAnimationFrame(frame);
  }
  const run = () => { cancelAnimationFrame(raf); if (visible) raf = requestAnimationFrame(frame); };

  // lámpa mozgatása
  const toLocal = (e) => { const r = stage.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; };
  let dragging = null;
  const touched = () => { lastInput = performance.now(); cue?.classList.add("is-gone"); };
  stage.addEventListener("pointermove", (e) => {
    if (dragging === "split") return;
    if (e.pointerType === "mouse" || dragging === "light") {
      [target.x, target.y] = toLocal(e);
      touched();
    }
  });
  stage.addEventListener("pointerdown", (e) => {
    if (handle.contains(e.target)) return;
    dragging = "light";
    [target.x, target.y] = toLocal(e);
    touched();
  });
  window.addEventListener("pointerup", () => { dragging = null; });
  stage.addEventListener("pointercancel", () => { dragging = null; });

  // határvonal mozgatása
  function setSplit(v) {
    split = clamp(v, 0.04, 0.96);
    stage.style.setProperty("--split", `${split * 100}%`);
    const pct = Math.round(split * 100);
    handle.setAttribute("aria-valuenow", pct);
    handle.setAttribute("aria-valuetext", `${pct}% előtte, ${100 - pct}% utána`);
    dirty = true;
    if (reduced || !visible) draw();
  }
  handle.addEventListener("pointerdown", (e) => {
    dragging = "split";
    handle.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  handle.addEventListener("pointermove", (e) => { if (dragging === "split") { setSplit(toLocal(e)[0]); touched(); } });
  handle.addEventListener("keydown", (e) => {
    const step = e.shiftKey ? 0.1 : 0.02;
    const map = { ArrowLeft: split - step, ArrowDown: split - step, ArrowRight: split + step, ArrowUp: split + step, Home: 0, End: 1 };
    if (e.key in map) { e.preventDefault(); setSplit(map[e.key]); touched(); }
  });

  // fényezés színe
  const swatches = $$("[data-paint-color]");
  swatches.forEach((b) => b.addEventListener("click", () => {
    paint = PAINTS[b.dataset.paintColor] || PAINTS.obsidian;
    swatches.forEach((x) => x.setAttribute("aria-checked", String(x === b)));
    dirty = true;
    if (reduced) draw();
  }));
  $(".lab__swatches")?.addEventListener("keydown", (e) => {
    const i = swatches.indexOf(document.activeElement);
    if (i < 0) return;
    const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = swatches[(i + d + swatches.length) % swatches.length];
    next.focus(); next.click();
  });

  resize();
  setSplit(0.5);
  window.addEventListener("resize", () => { resize(); if (reduced) draw(); });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; run(); }, { rootMargin: "100px" }).observe(stage);
  } else { visible = true; run(); }
  draw();
})();

/* ---------- 02 Szolgáltatások: lenyíló sorok ---------- */
$$(".svc__row").forEach((row, i) => {
  row.addEventListener("click", () => {
    const open = row.getAttribute("aria-expanded") === "true";
    row.setAttribute("aria-expanded", String(!open));
  });
  if (finePointer) {
    row.addEventListener("pointermove", (e) => {
      const r = row.getBoundingClientRect();
      row.style.setProperty("--hx", `${((e.clientX - r.left) / r.width) * 100}%`);
    });
  }
  if (i === 0) row.setAttribute("aria-expanded", "true");
});

/* ---------- 03 Rétegek: görgetésre szétnyílik ---------- */
(function layers() {
  const sec = $("[data-layers]");
  if (!sec) return;
  const scene = $(".stack__scene", sec);
  const plates = $$(".stack__layer", sec);
  const legend = $$("[data-layers-legend] li", sec);
  let hoverIdx = null, current = -1, ticking = false;

  function highlight(idx) {
    plates.forEach((p, i) => p.classList.toggle("is-on", i === idx));
    legend.forEach((li) => li.classList.toggle("is-on", Number(li.dataset.l) === idx));
  }
  function update() {
    ticking = false;
    const r = sec.getBoundingClientRect();
    const vh = window.innerHeight;
    const sticky = desktop.matches;
    const p = sticky ? clamp(-r.top / (r.height - vh)) : clamp((vh * 0.85 - r.top) / (r.height * 0.9));
    const open = reduced ? 1 : clamp((p - 0.02) / 0.35);
    scene.style.setProperty("--p", (1 - (1 - open) ** 3).toFixed(4));
    // felülről lefelé végigmegy a rétegeken
    const idx = 5 - Math.min(5, Math.floor(clamp((p - 0.3) / 0.66) * 6));
    current = p < 0.28 ? 5 : idx;
    highlight(hoverIdx ?? current);
  }
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  legend.forEach((li) => {
    li.addEventListener("pointerenter", () => { hoverIdx = Number(li.dataset.l); highlight(hoverIdx); });
    li.addEventListener("pointerleave", () => { hoverIdx = null; highlight(current); });
  });
  update();
})();

/* ---------- Folyamat: a vonal sorban telik ---------- */
$$("[data-flow] li").forEach((li, i) => li.style.setProperty("--k", i));

/* ---------- Térkép kattintásra ---------- */
const mapBtn = $("[data-map-load]");
mapBtn?.addEventListener("click", () => {
  const f = document.createElement("iframe");
  f.src = SHOP.mapEmbed;
  f.title = "Zenith Detailing a térképen – 1116 Budapest, Kondorosi út 2/A";
  f.loading = "lazy";
  f.referrerPolicy = "no-referrer-when-downgrade";
  mapBtn.replaceWith(f);
});

/* ---------- Ajánlatkérés: előre megírt levél ---------- */
(function quote() {
  const box = $("[data-quote]");
  if (!box) return;
  const mail = $("[data-q-mail]", box);
  const car = $("[data-q-car]", box);
  const picked = (group) => $$(`[data-q-group="${group}"] [aria-pressed="true"]`, box).map((b) => b.dataset.v);

  $$("[data-q-group]", box).forEach((g) => {
    const single = g.hasAttribute("data-single");
    $$(".chip--pick", g).forEach((b) => b.addEventListener("click", () => {
      if (single) $$(".chip--pick", g).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      else b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true"));
      render();
    }));
  });
  car.addEventListener("input", render);

  function render() {
    const size = picked("size")[0];
    const svcs = picked("services");
    const model = car.value.trim();
    const subject = `Ajánlatkérés${svcs.length ? ` – ${svcs[0]}${svcs.length > 1 ? " és más" : ""}` : ""}`;
    const lines = [
      "Jó napot kívánok!",
      "",
      "Ajánlatot szeretnék kérni az alábbiakra:",
      "",
      `Ami érdekel: ${svcs.length ? svcs.join(", ") : "még nem tudom, tanácsot kérek"}`,
      `Az autó mérete: ${size || "–"}`,
      model ? `Az autó: ${model}` : null,
      "",
      "Mikor tudnák megnézni az autót?",
      "",
      "Köszönöm!",
    ].filter((l) => l !== null);
    mail.href = `mailto:${SHOP.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
  }
  render();
})();

/* ---------- Lábléc: a fény végigsiklik a feliraton ---------- */
(function footmark() {
  const mark = $("[data-footmark]");
  if (!mark) return;
  const foot = mark.closest(".foot");
  let visible = false, raf = 0, last = -1e9;
  if (finePointer) {
    foot.addEventListener("pointermove", (e) => {
      const r = mark.getBoundingClientRect();
      mark.style.setProperty("--fx", `${clamp((e.clientX - r.left) / r.width, -0.1, 1.1) * 100}%`);
      last = performance.now();
    });
  }
  function frame(now) {
    if (now - last > 2500) mark.style.setProperty("--fx", `${50 + Math.sin(now / 2200) * 42}%`);
    if (visible) raf = requestAnimationFrame(frame);
  }
  if (reduced || !("IntersectionObserver" in window)) return;
  new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    cancelAnimationFrame(raf);
    if (visible) raf = requestAnimationFrame(frame);
  }).observe(mark);
})();
