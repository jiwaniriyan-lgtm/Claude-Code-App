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
