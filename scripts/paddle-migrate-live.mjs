const SB_KEY = process.env.PADDLE_SANDBOX_KEY;
const LIVE_KEY = process.env.PADDLE_LIVE_KEY;
const SB_URL = "https://sandbox-api.paddle.com";
const LIVE_URL = "https://api.paddle.com";

if (!SB_KEY || !LIVE_KEY) {
  console.error("Set PADDLE_SANDBOX_KEY and PADDLE_LIVE_KEY env vars");
  process.exit(1);
}

async function api(url, key, method = "GET", body) {
  const res = await fetch(url, {
    method,
    headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`${res.status} — ${txt.substring(0, 200)}`);
  }
  return res.json();
}

async function listAll(base, key, path, maxPages = 5) {
  const all = [];
  let url = path.startsWith("http") ? path : `${base}${path}`;
  for (let i = 0; i < maxPages; i++) {
    const j = await api(url, key);
    all.push(...(j.data ?? []));
    const next = j.meta?.pagination?.next;
    if (!next) break;
    url = next.startsWith("http") ? next : `${base}${next}`;
  }
  return all;
}

async function tryList(base, key, path, label) {
  try { return await listAll(base, key, path); }
  catch (e) { console.log(`  ⚠ ${label}: ${e.message}`); return null; }
}

function priceLabel(p) {
  const amt = (Number(p.unit_price?.amount ?? 0) / 100).toFixed(2);
  const cur = p.unit_price?.currency_code ?? "USD";
  const bc = p.billing_cycle;
  return `${p.description} — ${amt} ${cur}${bc ? ` ${bc.frequency}x/${bc.interval}` : " one-time"}`;
}

const before = Date.now();

const sbProducts = await listAll(SB_URL, SB_KEY, "/products?include=prices");
const liveProducts = await listAll(LIVE_URL, LIVE_KEY, "/products?include=prices");

console.log("═══ COMPARISON ═══\n");
const idMap = { products: {}, prices: {} };
const needCreate = [];

for (const sp of sbProducts) {
  const m = liveProducts.find(lp => lp.name === sp.name);
  if (m) {
    idMap.products[sp.id] = m.id;
    console.log(`✓ "${sp.name}" → LIVE ${m.id}`);
    for (const spr of (sp.prices ?? [])) {
      const mpr = (m.prices ?? []).find(lpr =>
        lpr.description === spr.description
        && lpr.unit_price?.amount === spr.unit_price?.amount
        && (lpr.billing_cycle?.interval ?? null) === (spr.billing_cycle?.interval ?? null)
      );
      if (mpr) { idMap.prices[spr.id] = mpr.id; console.log(`  ✓ ${priceLabel(spr)} → ${mpr.id}`); }
      else { needCreate.push({ product: sp, price: spr }); console.log(`  ✗ ${priceLabel(spr)} — MISSING`); }
    }
  } else {
    needCreate.push({ product: sp });
    console.log(`✗ "${sp.name}" (${sp.id}) — MISSING from live`);
    for (const pr of (sp.prices ?? [])) console.log(`  will create: ${priceLabel(pr)}`);
  }
}

for (const lp of liveProducts) {
  if (!sbProducts.find(sp => sp.name === lp.name)) {
    console.log(`? "${lp.name}" (${lp.id}) — exists in live only`);
  }
}

const sbNotifs = await tryList(SB_URL, SB_KEY, "/notification-settings", "sandbox notifications");
const liveNotifs = await tryList(LIVE_URL, LIVE_KEY, "/notification-settings", "live notifications");

const sbTokens = await tryList(SB_URL, SB_KEY, "/client-tokens", "sandbox tokens");
const liveTokens = await tryList(LIVE_URL, LIVE_KEY, "/client-tokens", "live tokens");

console.log("\n═══ LIVE NOTIFICATION DESTINATIONS ═══\n");
if (liveNotifs) {
  if (liveNotifs.length === 0) console.log("  (none)");
  for (const n of liveNotifs) {
    console.log(`  "${n.description}" (${n.id}) — ${n.endpoint_url}`);
    console.log(`    active: ${n.active}, has_secret: ${!!n.endpoint_secret_key}`);
    console.log(`    events: ${n.subscribed_events?.join(", ") ?? "all"}`);
  }
}

console.log("\n═══ LIVE CLIENT TOKENS ═══\n");
if (liveTokens) {
  if (liveTokens.length === 0) console.log("  (none)");
  for (const t of liveTokens) {
    console.log(`  "${t.name}" (${t.id}) — token: ${t.token}`);
  }
}

console.log("\n═══════════════════════════════════════════");
console.log("  SUMMARY");
console.log("═══════════════════════════════════════════\n");
console.log(`Products in sandbox: ${sbProducts.length}`);
console.log(`Products in live: ${liveProducts.length}`);
console.log(`Items needing creation: ${needCreate.length}`);
console.log(`Time: ${Date.now() - before}ms`);
console.log(`\nID mapping:\n${JSON.stringify(idMap, null, 2)}`);