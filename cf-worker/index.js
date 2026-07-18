/**
 * AllInOneTrip edge Worker.
 *
 * Serves the static travel/ site (via the ASSETS binding) and adds a small
 * price API at /api/flights that proxies the Travelpayouts Flight Data API so
 * the homepage can render live fares inline. The API token is read from the
 * TP_TOKEN secret (set in the Cloudflare dashboard) and never reaches the browser.
 */

const MARKER = "750159"; // Travelpayouts affiliate marker for booking links

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/api/flights") {
      return handleFlights(url, env);
    }
    if (url.pathname === "/api/deals") {
      return handleDeals(url, env);
    }
    if (url.pathname === "/api/dest-prices") {
      return handleDestPrices(url, env);
    }
    // Everything else is a static asset.
    return env.ASSETS.fetch(request);
  },
};

function json(obj, status = 200, maxAge = 300) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": `public, max-age=${maxAge}`,
    },
  });
}

async function handleFlights(url, env) {
  const q = url.searchParams;
  const origin = (q.get("origin") || "").toUpperCase();
  const dest = (q.get("dest") || "").toUpperCase();
  const depart = q.get("depart") || ""; // YYYY-MM-DD
  const ret = q.get("return") || "";
  const token = env.TP_TOKEN;

  if (!/^[A-Z]{3}$/.test(origin) || !/^[A-Z]{3}$/.test(dest) || !/^\d{4}-\d{2}-\d{2}$/.test(depart)) {
    return json({ error: "bad_params", data: [] }, 400);
  }
  if (!token) {
    return json({ error: "not_configured", message: "TP_TOKEN secret is not set", data: [] }, 500);
  }

  const api = new URL("https://api.travelpayouts.com/aviasales/v3/prices_for_dates");
  api.searchParams.set("origin", origin);
  api.searchParams.set("destination", dest);
  api.searchParams.set("departure_at", depart);
  if (ret) api.searchParams.set("return_at", ret);
  api.searchParams.set("currency", "usd");
  api.searchParams.set("sorting", "price");
  api.searchParams.set("direct", "false");
  api.searchParams.set("limit", "20");
  api.searchParams.set("one_way", ret ? "false" : "true");
  api.searchParams.set("token", token);

  let payload;
  try {
    const r = await fetch(api.toString(), { headers: { "x-access-token": token } });
    payload = await r.json();
  } catch (e) {
    return json({ error: "upstream_failed", data: [] }, 502, 0);
  }

  const rows = Array.isArray(payload && payload.data) ? payload.data : [];
  const data = rows.map((t) => {
    let link = t.link || "";
    const book = link
      ? "https://www.aviasales.com" + link + (link.indexOf("?") > -1 ? "&" : "?") + "marker=" + MARKER
      : "https://www.aviasales.com/?marker=" + MARKER;
    return {
      price: t.price,
      airline: t.airline || "",
      flight_number: t.flight_number || "",
      departure_at: t.departure_at || "",
      return_at: t.return_at || "",
      transfers: typeof t.transfers === "number" ? t.transfers : 0,
      duration: t.duration || null,
      origin: t.origin || origin,
      destination: t.destination || dest,
      book,
    };
  });

  return json({ ok: true, currency: "USD", data });
}

/* ---------------------------------------------------------------------------
   Live "last-minute deals" strip. Returns real cheapest fares + monetized
   Aviasales links for popular leisure routes, cached 1 hour.

   Reliability matters more than any single route, so each curated route tries
   three data sources in order until one returns a price:
     1) prices_for_dates for next month   (has a ready booking link)
     2) prices_for_dates for this month
     3) get_latest_prices for the pair     (broadest cache; link built by us)
   If the curated list still comes up short, we top it up with the cheapest
   "fly anywhere" fares out of major hubs via get_latest_prices, so the strip
   is populated with real numbers instead of hiding.
--------------------------------------------------------------------------- */
const DEAL_ROUTES = [
  { o: "NYC", d: "CUN" }, { o: "MIA", d: "CUN" }, { o: "LAX", d: "CUN" }, { o: "CHI", d: "CUN" },
  { o: "LAX", d: "LAS" }, { o: "NYC", d: "LAS" }, { o: "NYC", d: "MCO" }, { o: "NYC", d: "MIA" },
  { o: "LAX", d: "HNL" }, { o: "NYC", d: "LON" }, { o: "NYC", d: "PAR" }, { o: "MIA", d: "NYC" },
];
const FILL_ORIGINS = ["NYC", "LAX", "MIA", "CHI"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// IATA (city or airport) -> friendly city name + emoji for labels.
const CITY = {
  NYC: { c: "New York", e: "🗽" }, JFK: { c: "New York", e: "🗽" }, EWR: { c: "New York", e: "🗽" }, LGA: { c: "New York", e: "🗽" },
  LAX: { c: "Los Angeles", e: "🌴" }, MIA: { c: "Miami", e: "🌴" }, FLL: { c: "Fort Lauderdale", e: "🏖️" }, TPA: { c: "Tampa", e: "🌴" },
  CHI: { c: "Chicago", e: "🌆" }, ORD: { c: "Chicago", e: "🌆" }, MDW: { c: "Chicago", e: "🌆" },
  CUN: { c: "Cancún", e: "🏖️" }, LAS: { c: "Las Vegas", e: "🎰" }, MCO: { c: "Orlando", e: "🎢" }, HNL: { c: "Honolulu", e: "🌺" },
  SJU: { c: "San Juan", e: "🏝️" }, PUJ: { c: "Punta Cana", e: "🏝️" }, MBJ: { c: "Montego Bay", e: "🏝️" }, NAS: { c: "Nassau", e: "🏝️" },
  LON: { c: "London", e: "🎡" }, LHR: { c: "London", e: "🎡" }, PAR: { c: "Paris", e: "🗼" }, CDG: { c: "Paris", e: "🗼" },
  DXB: { c: "Dubai", e: "🕌" }, BKK: { c: "Bangkok", e: "🛺" }, CanCUN: { c: "Cancún", e: "🏖️" },
  SFO: { c: "San Francisco", e: "🌉" }, DEN: { c: "Denver", e: "🏔️" }, ATL: { c: "Atlanta", e: "🍑" }, SEA: { c: "Seattle", e: "🌲" },
  BOS: { c: "Boston", e: "🎓" }, DFW: { c: "Dallas", e: "🤠" }, IAH: { c: "Houston", e: "🚀" }, PHX: { c: "Phoenix", e: "🌵" },
  SAN: { c: "San Diego", e: "🏄" }, AUS: { c: "Austin", e: "🎸" }, AUA: { c: "Aruba", e: "🏝️" }, AUH: { c: "Abu Dhabi", e: "🕌" },
};
const cityOf = (code) => (CITY[code] && CITY[code].c) || code;
const emojiOf = (code) => (CITY[code] && CITY[code].e) || "✈️";

function ym(offset) {
  const d = new Date();
  d.setUTCMonth(d.getUTCMonth() + offset);
  return d.getUTCFullYear() + "-" + String(d.getUTCMonth() + 1).padStart(2, "0");
}
function fmtDate(s) {
  if (!s) return "";
  const p = s.slice(0, 10).split("-");
  if (p.length < 3) return "";
  return MON[Number(p[1]) - 1] + " " + Number(p[2]);
}
function aviasalesSearch(o, d, departYMD) {
  // path form: /search/{ORIGIN}{DDMM}{DEST}{PAX}
  const dd = (departYMD || "").slice(8, 10), mm = (departYMD || "").slice(5, 7);
  const seg = dd && mm ? o + dd + mm + d + "1" : "";
  return seg ? "https://www.aviasales.com/search/" + seg + "?marker=" + MARKER
             : "https://www.aviasales.com/?marker=" + MARKER;
}
function dealFrom(o, d, price, departYMD, book) {
  return {
    from: cityOf(o), city: cityOf(d), emoji: emojiOf(d),
    o, d, price: Math.round(price), date: fmtDate(departYMD), book,
  };
}

async function pricesForDates(o, d, month, token) {
  const api = new URL("https://api.travelpayouts.com/aviasales/v3/prices_for_dates");
  api.searchParams.set("origin", o);
  api.searchParams.set("destination", d);
  api.searchParams.set("departure_at", month);
  api.searchParams.set("currency", "usd");
  api.searchParams.set("sorting", "price");
  api.searchParams.set("direct", "false");
  api.searchParams.set("limit", "1");
  api.searchParams.set("one_way", "true");
  api.searchParams.set("token", token);
  const r = await fetch(api.toString(), { headers: { "x-access-token": token } });
  const p = await r.json();
  const t = p && Array.isArray(p.data) && p.data[0];
  if (!t || !t.price) return null;
  const link = t.link || "";
  const book = link
    ? "https://www.aviasales.com" + link + (link.indexOf("?") > -1 ? "&" : "?") + "marker=" + MARKER
    : aviasalesSearch(o, d, t.departure_at);
  return dealFrom(o, d, t.price, t.departure_at, book);
}

async function latestForRoute(o, d, token) {
  const api = new URL("https://api.travelpayouts.com/aviasales/v3/get_latest_prices");
  api.searchParams.set("currency", "usd");
  api.searchParams.set("origin", o);
  api.searchParams.set("destination", d);
  api.searchParams.set("period_type", "month");
  api.searchParams.set("beginning_of_period", ym(0) + "-01");
  api.searchParams.set("one_way", "true");
  api.searchParams.set("page", "1");
  api.searchParams.set("limit", "1");
  api.searchParams.set("sorting", "price");
  api.searchParams.set("token", token);
  const r = await fetch(api.toString(), { headers: { "x-access-token": token } });
  const p = await r.json();
  const t = p && Array.isArray(p.data) && p.data[0];
  if (!t || !t.value) return null;
  return dealFrom(o, d, t.value, t.depart_date, aviasalesSearch(o, d, t.depart_date));
}

async function latestFromOrigin(o, token, limit) {
  const api = new URL("https://api.travelpayouts.com/aviasales/v3/get_latest_prices");
  api.searchParams.set("currency", "usd");
  api.searchParams.set("origin", o);
  api.searchParams.set("period_type", "month");
  api.searchParams.set("beginning_of_period", ym(0) + "-01");
  api.searchParams.set("one_way", "true");
  api.searchParams.set("page", "1");
  api.searchParams.set("limit", String(limit || 20));
  api.searchParams.set("sorting", "price");
  api.searchParams.set("token", token);
  const r = await fetch(api.toString(), { headers: { "x-access-token": token } });
  const p = await r.json();
  const rows = p && Array.isArray(p.data) ? p.data : [];
  return rows
    .filter((t) => t && t.value && t.destination && t.destination !== o)
    .map((t) => dealFrom(o, t.destination, t.value, t.depart_date, aviasalesSearch(o, t.destination, t.depart_date)));
}

async function handleDeals(url, env) {
  const token = env.TP_TOKEN;
  if (!token) return json({ ok: true, currency: "USD", deals: [] }, 200, 600);
  const m0 = ym(0), m1 = ym(1);

  // 1) curated routes with 3-tier fallback
  const curated = await Promise.all(
    DEAL_ROUTES.map(async (rt) => {
      try {
        return (
          (await pricesForDates(rt.o, rt.d, m1, token)) ||
          (await pricesForDates(rt.o, rt.d, m0, token)) ||
          (await latestForRoute(rt.o, rt.d, token))
        );
      } catch (e) {
        return null;
      }
    })
  );

  const seen = new Set();
  const deals = [];
  for (const x of curated.filter(Boolean)) {
    const k = x.o + x.d;
    if (!seen.has(k)) { seen.add(k); deals.push(x); }
  }

  // 2) top up with cheapest "fly anywhere" fares if we're short
  if (deals.length < 8) {
    const fills = await Promise.all(FILL_ORIGINS.map((o) => latestFromOrigin(o, token, 20).catch(() => [])));
    for (const x of fills.flat().sort((a, b) => a.price - b.price)) {
      if (deals.length >= 8) break;
      const k = x.o + x.d;
      if (!seen.has(k)) { seen.add(k); deals.push(x); }
    }
  }

  deals.sort((a, b) => a.price - b.price);
  return json({ ok: true, currency: "USD", deals: deals.slice(0, 8) }, 200, 3600);
}

/* ---------------------------------------------------------------------------
   Live "from $X" price for each Popular-destination card. Returns the cheapest
   current one-way fare TO each city (from anywhere), keyed by the card's slug.
   Cached 30 min; the homepage also re-polls so numbers refresh on their own.
--------------------------------------------------------------------------- */
const DEST_CODES = [
  { slug: "cancun", d: "CUN" }, { slug: "dubai", d: "DXB" }, { slug: "miami", d: "MIA" },
  { slug: "london", d: "LON" }, { slug: "paris", d: "PAR" }, { slug: "las-vegas", d: "LAS" },
  { slug: "bali", d: "DPS" }, { slug: "tokyo", d: "TYO" }, { slug: "new-york", d: "NYC" },
  { slug: "orlando", d: "MCO" }, { slug: "bangkok", d: "BKK" }, { slug: "rome", d: "FCO" },
];

async function latestToDest(d, token) {
  const api = new URL("https://api.travelpayouts.com/aviasales/v3/get_latest_prices");
  api.searchParams.set("currency", "usd");
  api.searchParams.set("destination", d);
  api.searchParams.set("period_type", "month");
  api.searchParams.set("beginning_of_period", ym(0) + "-01");
  api.searchParams.set("one_way", "true");
  api.searchParams.set("page", "1");
  api.searchParams.set("limit", "1");
  api.searchParams.set("sorting", "price");
  api.searchParams.set("token", token);
  const r = await fetch(api.toString(), { headers: { "x-access-token": token } });
  const p = await r.json();
  const t = p && Array.isArray(p.data) && p.data[0];
  if (!t || !t.value) return null;
  const o = t.origin || "";
  return {
    price: Math.round(t.value),
    o,
    from: o ? cityOf(o) : "",
    date: fmtDate(t.depart_date),
    book: o ? aviasalesSearch(o, d, t.depart_date) : "https://www.aviasales.com/?marker=" + MARKER,
  };
}

async function handleDestPrices(url, env) {
  const token = env.TP_TOKEN;
  if (!token) return json({ ok: true, currency: "USD", prices: {} }, 200, 600);

  const entries = await Promise.all(
    DEST_CODES.map(async (x) => {
      try {
        let t = await latestToDest(x.d, token);
        if (!t) {
          const pf = (await pricesForDates("NYC", x.d, ym(1), token)) || (await pricesForDates("NYC", x.d, ym(0), token));
          if (pf) t = { price: pf.price, o: "NYC", from: "New York", date: pf.date, book: pf.book };
        }
        return t ? [x.slug, t] : null;
      } catch (e) {
        return null;
      }
    })
  );

  const prices = {};
  for (const e of entries.filter(Boolean)) prices[e[0]] = e[1];
  return json({ ok: true, currency: "USD", prices }, 200, 1800);
}
