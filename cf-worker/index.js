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
   Live "last-minute deals" strip. Pulls the cheapest current fare for a set of
   popular leisure routes from the Travelpayouts Flight Data API and returns
   real prices + monetized Aviasales booking links. Cached for 1 hour so the
   homepage stays fast and we stay well under rate limits. Routes with no
   cached fare are silently dropped, so the strip never shows an empty card.
--------------------------------------------------------------------------- */
const DEAL_ROUTES = [
  { o: "NYC", d: "CUN", city: "Cancún",     emoji: "🏖️", from: "New York" },
  { o: "MIA", d: "CUN", city: "Cancún",     emoji: "🏖️", from: "Miami" },
  { o: "LAX", d: "CUN", city: "Cancún",     emoji: "🏖️", from: "Los Angeles" },
  { o: "CHI", d: "CUN", city: "Cancún",     emoji: "🏖️", from: "Chicago" },
  { o: "LAX", d: "LAS", city: "Las Vegas",  emoji: "🎰", from: "Los Angeles" },
  { o: "NYC", d: "LAS", city: "Las Vegas",  emoji: "🎰", from: "New York" },
  { o: "NYC", d: "MCO", city: "Orlando",    emoji: "🎢", from: "New York" },
  { o: "NYC", d: "MIA", city: "Miami",      emoji: "🌴", from: "New York" },
  { o: "LAX", d: "HNL", city: "Honolulu",   emoji: "🌺", from: "Los Angeles" },
  { o: "NYC", d: "LON", city: "London",     emoji: "🎡", from: "New York" },
  { o: "NYC", d: "PAR", city: "Paris",      emoji: "🗼", from: "New York" },
  { o: "MIA", d: "NYC", city: "New York",   emoji: "🗽", from: "Miami" },
];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function nextMonth() {
  const d = new Date();
  d.setUTCMonth(d.getUTCMonth() + 1);
  return d.getUTCFullYear() + "-" + String(d.getUTCMonth() + 1).padStart(2, "0");
}
function fmtDate(s) {
  if (!s) return "";
  const p = s.slice(0, 10).split("-");
  if (p.length < 3) return "";
  return MON[Number(p[1]) - 1] + " " + Number(p[2]);
}

async function handleDeals(url, env) {
  const token = env.TP_TOKEN;
  if (!token) return json({ ok: true, currency: "USD", deals: [] }, 200, 600);
  const month = nextMonth();

  const results = await Promise.all(
    DEAL_ROUTES.map(async (rt) => {
      try {
        const api = new URL("https://api.travelpayouts.com/aviasales/v3/prices_for_dates");
        api.searchParams.set("origin", rt.o);
        api.searchParams.set("destination", rt.d);
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
          : "https://www.aviasales.com/?marker=" + MARKER;
        return {
          from: rt.from,
          city: rt.city,
          emoji: rt.emoji,
          o: rt.o,
          d: rt.d,
          price: Math.round(t.price),
          date: fmtDate(t.departure_at),
          book,
        };
      } catch (e) {
        return null;
      }
    })
  );

  const deals = results.filter(Boolean).sort((a, b) => a.price - b.price).slice(0, 8);
  return json({ ok: true, currency: "USD", deals }, 200, 3600);
}
