// One-off audit script: cross-reference internal links & fetch URLs against the route map
import { readFileSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");

function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (/\.(tsx?|jsx?)$/.test(f)) out.push(p);
  }
  return out;
}

const files = walk(SRC);

// Build real route sets from filesystem
import { existsSync } from "fs";
function pageRoutes() {
  const routes = new Set();
  const appDir = join(SRC, "app");
  function walkApp(dir, prefix) {
    for (const f of readdirSync(dir)) {
      const p = join(dir, f);
      if (statSync(p).isDirectory()) {
        walkApp(p, prefix + "/" + f);
      } else if (f === "page.tsx" || f === "page.jsx") {
        let r = prefix || "/";
        r = r.replace("/[lang]", ""); // locale pages accessible as /ar/x and /en/x
        routes.add(r);
        // also add locale variant base for matching /ar/... style
      }
    }
  }
  walkApp(appDir, "");
  return routes;
}

function apiRoutes() {
  const routes = new Set();
  const apiDir = join(SRC, "app", "api");
  function walkApi(dir, prefix) {
    for (const f of readdirSync(dir)) {
      const p = join(dir, f);
      if (statSync(p).isDirectory()) walkApi(p, prefix + "/" + f);
      else if (f === "route.ts") routes.add(prefix);
    }
  }
  walkApi(apiDir, "/api");
  return routes;
}

const pages = pageRoutes();
const apis = apiRoutes();

// For locale matching: a page /about exists under [lang], so /ar/about & /en/about valid
// "X" stands for a ${...} template placeholder (locale, id, etc.)
function pageExists(path) {
  const clean = path.split("?")[0].split("#")[0];
  if (pages.has(clean)) return true;
  // strip locale prefix
  const m = clean.match(/^\/(ar|en|X)(\/.*)?$/);
  if (m) {
    const rest = m[2] || "/";
    if (pages.has(rest)) return true;
  }
  return false;
}

// dynamic segment-aware page matching
const dynamicPages = [...pages].filter((p) => p.includes("["));
function pageMatches(path) {
  if (pageExists(path)) return true;
  const noLocale = (path.split("?")[0].split("#")[0]).replace(/^\/(ar|en|X)(?=\/|$)/, "") || "/";
  for (const dp of dynamicPages) {
    const dpParts = dp.split("/").filter(Boolean);
    const pParts = noLocale.split("/").filter(Boolean);
    if (dpParts.length === pParts.length) {
      let ok = true;
      for (let i = 0; i < dpParts.length; i++) {
        if (dpParts[i].startsWith("[")) continue;
        if (pParts[i] === "X") continue;
        if (dpParts[i] !== pParts[i]) { ok = false; break; }
      }
      if (ok) return true;
    }
  }
  return false;
}

const dynamicApis = [...apis].filter((p) => p.includes("["));
function apiMatches(path) {
  const clean = path.split("?")[0].split("#")[0];
  if (apis.has(clean)) return true;
  for (const da of dynamicApis) {
    const daParts = da.split("/").filter(Boolean);
    const pParts = clean.split("/").filter(Boolean);
    if (daParts.length === pParts.length) {
      let ok = true;
      for (let i = 0; i < daParts.length; i++) {
        if (daParts[i].startsWith("[")) continue;
        if (daParts[i] !== pParts[i]) { ok = false; break; }
      }
      if (ok) return true;
    }
  }
  return false;
}

const isExternal = (u) => /^([a-z]+:)?\/\//i.test(u) || u.startsWith("mailto:") || u.startsWith("tel:") || u.startsWith("#");
const isAsset = (u) => /\.(png|jpg|jpeg|svg|webp|ico|css|js|pdf|mp4|webm|woff2?|mp3|xml|json)$/i.test(u.split("?")[0]);

const linkRefs = []; // {file, line, kind, url}
const apiRefs = [];

for (const file of files) {
  const src = readFileSync(file, "utf8");
  const lines = src.split("\n");
  const rel = file.replace(ROOT + "\\", "").replace(/\\/g, "/");

  lines.forEach((line, i) => {
    if (/^\s*(\/\/|\/\*|\*)/.test(line)) return;

    // href="..." | href='...' | href={`...`}
    for (const m of line.matchAll(/href=\{?["`]([^"`]+)["`]/g)) {
      linkRefs.push({ file: rel, line: i + 1, kind: "href", url: m[1] });
    }
    // router.push / router.replace / redirect( / window.location
    for (const m of line.matchAll(/(?:router\.(?:push|replace)|redirect|window\.location(?:\.href)?)\s*[=(]\s*["`]([^"`]+)["`]/g)) {
      linkRefs.push({ file: rel, line: i + 1, kind: "nav", url: m[1] });
    }
    // fetch("...") / fetch(`...`) - capture template without interpolation result marker
    for (const m of line.matchAll(/fetch\s*\(\s*["`]([^"`$][^"`]*)["`]/g)) {
      apiRefs.push({ file: rel, line: i + 1, url: m[1] });
    }
    for (const m of line.matchAll(/fetch\s*\(\s*`([^`]+)`/g)) {
      apiRefs.push({ file: rel, line: i + 1, url: m[1], tpl: true });
    }
  });
}

console.log("=== BROKEN PAGE LINKS (pointing to non-existent pages) ===");
const seen = new Set();
for (const r of linkRefs) {
  let u = r.url;
  if (isExternal(u) || isAsset(u) || u === "#" || u.startsWith("mailto:")) continue;
  // more than one ${...} means nested template we can't resolve statically
  if ((u.match(/\$\{/g) || []).length > 1) continue;
  if (u.includes("${")) {
    u = u.replace(/\$\{[^}]*\}/g, "X");
  }
  if (!u.startsWith("/")) continue; // relative anchors etc.
  if (u.startsWith("/api")) continue;
  if (u.startsWith("/_next")) continue;
  if (pageMatches(u)) continue;
  const key = `${r.file}:${r.line}:${u}`;
  if (seen.has(key)) continue;
  seen.add(key);
  console.log(`${r.file}:${r.line} [${r.kind}] -> ${u}`);
}

console.log("\n=== BROKEN API CALLS (pointing to non-existent API routes) ===");
const seenApi = new Set();
for (const r of apiRefs) {
  let u = r.url;
  if (isExternal(u)) continue;
  if (u.includes("${")) u = u.replace(/\$\{[^}]*\}/g, "X");
  if (!u.startsWith("/api")) continue;
  if (apiMatches(u)) continue;
  const key = `${r.file}:${r.line}:${u}`;
  if (seenApi.has(key)) continue;
  seenApi.add(key);
  console.log(`${r.file}:${r.line} -> ${u}`);
}

console.log(`\nTotals: ${linkRefs.length} link refs, ${apiRefs.length} api refs, ${pages.size} pages, ${apis.size} api routes`);
