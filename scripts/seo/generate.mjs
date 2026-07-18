/**
 * SEO landing-page generator for AllInOneTrip.
 *
 * Produces static, index-friendly pages under travel/ that target high-intent
 * search queries ("cheap flights to <city>", "hotel deals in <city>"), each with
 * its own search widget, FAQ (with FAQ schema), and internal links. Outbound
 * booking links are monetized automatically by the Travelpayouts Drive script.
 *
 * Run:  node scripts/seo/generate.mjs
 * The generated .html files are committed to the repo and served as-is by the
 * Cloudflare static-asset Worker (no build step at deploy time).
 */
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");
const TRAVEL = join(ROOT, "travel");
const SITE = "https://allinonetrip.com";
const DRIVE = `<script nowprocket data-noptimize="1" data-cfasync="false" data-wpfc-render="false" seraph-accel-crit="1" data-no-defer="1">
  (function () {
      var script = document.createElement("script");
      script.async = 1;
      script.src = 'https://emrldtp.cc/NTQ5NTkx.js?t=549591';
      document.head.appendChild(script);
  })();
</script>`;

/* ------------------------------------------------------------------ data */
const DESTS = [
  { slug: "cancun",    city: "Cancún",       country: "Mexico",       iata: "CUN", emoji: "🏖️", hook: "white-sand beaches and all-inclusive resorts" },
  { slug: "dubai",     city: "Dubai",        country: "UAE",          iata: "DXB", emoji: "🕌", hook: "luxury towers, desert safaris and tax-free shopping" },
  { slug: "miami",     city: "Miami",        country: "USA",          iata: "MIA", emoji: "🌴", hook: "South Beach nightlife and year-round sun" },
  { slug: "london",    city: "London",       country: "UK",           iata: "LON", emoji: "🎡", hook: "history, theatre and world-class museums" },
  { slug: "paris",     city: "Paris",        country: "France",       iata: "PAR", emoji: "🗼", hook: "the Eiffel Tower, cafés and romance" },
  { slug: "las-vegas", city: "Las Vegas",    country: "USA",          iata: "LAS", emoji: "🎰", hook: "casinos, shows and the neon Strip" },
  { slug: "bali",      city: "Bali",         country: "Indonesia",    iata: "DPS", emoji: "🌺", hook: "rice terraces, surf and beach clubs" },
  { slug: "tokyo",     city: "Tokyo",        country: "Japan",        iata: "TYO", emoji: "🏯", hook: "neon streets, sushi and cherry blossom" },
  { slug: "new-york",  city: "New York",     country: "USA",          iata: "NYC", emoji: "🗽", hook: "Times Square, Broadway and Central Park" },
  { slug: "orlando",   city: "Orlando",      country: "USA",          iata: "MCO", emoji: "🎢", hook: "theme parks and family resorts" },
  { slug: "bangkok",   city: "Bangkok",      country: "Thailand",     iata: "BKK", emoji: "🛺", hook: "street food, temples and rooftop bars" },
  { slug: "rome",      city: "Rome",         country: "Italy",        iata: "FCO", emoji: "🏛️", hook: "the Colosseum, pasta and ancient history" },
];
const bySlug = (s) => DESTS.find((d) => d.slug === s);

/* Featured "Deal of the Week" — change FEATURED weekly (or ask Claude to) to keep it fresh. */
const FEATURED = "bali";
const RUNNERS = ["cancun", "miami", "las-vegas"];

/* ------------------------------------------------------------------ css */
const CSS = `*{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#0b1120;--bg2:#111a2e;--card:#16213e;--card2:#1c2a4a;--line:#243357;--txt:#eef2ff;--muted:#9fb0d0;--brand:#38bdf8;--brand2:#6366f1;--accent:#f472b6;--good:#34d399}
html,body{background:linear-gradient(160deg,#0b1120,#0d1530 55%,#0b1120);color:var(--txt);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;min-height:100vh;line-height:1.55}
a{color:inherit;text-decoration:none}
.wrap{max-width:920px;margin:0 auto;padding:0 20px}
header{position:sticky;top:0;z-index:20;background:rgba(11,17,32,.82);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
.nav{display:flex;align-items:center;gap:12px;padding:16px 0}
.logo{width:36px;height:36px;border-radius:10px;display:grid;place-items:center;font-size:20px;background:linear-gradient(135deg,var(--brand),var(--brand2))}
.nav b{font-size:18px}.nav small{display:block;color:var(--muted);font-size:11px;font-weight:400}
.nav a.home{margin-left:auto;color:var(--muted);font-size:14px;font-weight:600}
.crumb{color:var(--muted);font-size:13px;padding:18px 0 0}
.crumb a{color:var(--brand)}
h1{font-size:clamp(26px,4.5vw,38px);font-weight:800;margin:10px 0 8px;line-height:1.12}
.sub{color:var(--muted);font-size:17px;max-width:640px}
.panel{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:20px;margin:22px 0;box-shadow:0 18px 44px rgba(0,0,0,.34)}
.grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(140px,1fr))}
label{display:block;font-size:11px;color:var(--muted);margin-bottom:6px;font-weight:600;letter-spacing:.3px;text-transform:uppercase}
input,select{width:100%;padding:11px 12px;border-radius:10px;border:1px solid var(--line);background:var(--bg2);color:var(--txt);font-size:15px;outline:none}
input:focus,select:focus{border-color:var(--brand);box-shadow:0 0 0 3px rgba(56,189,248,.18)}
.btn{border:none;cursor:pointer;font-weight:700;font-size:15px;padding:13px 20px;border-radius:11px;background:linear-gradient(135deg,var(--brand),var(--brand2));color:#fff;margin-top:14px}
.hint{color:var(--muted);font-size:13px;margin-top:10px}
.out{display:none;gap:10px;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));margin-top:16px}
.pcard{display:flex;flex-direction:column;padding:13px;border-radius:11px;background:var(--card2);border:1px solid var(--line)}
.pcard:hover{border-color:var(--brand)}
.pcard b{font-size:14px}.pcard span{font-size:12px;color:var(--muted)}
section{margin:38px 0}
h2{font-size:22px;font-weight:800;margin-bottom:12px}
p.body{color:#c7d3ea;margin-bottom:12px}
.tips{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}
.tip{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px}
.tip b{color:var(--brand);font-size:14px}.tip p{color:var(--muted);font-size:13px;margin-top:6px}
.faq{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:6px 18px;margin-top:12px}
.faq details{border-bottom:1px solid var(--line);padding:14px 0}
.faq details:last-child{border-bottom:none}
.faq summary{cursor:pointer;font-weight:700;font-size:15px}
.faq p{color:var(--muted);font-size:14px;margin-top:8px}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
.chip{padding:8px 13px;border-radius:999px;background:var(--card);border:1px solid var(--line);font-size:13px;font-weight:600;color:var(--muted)}
.chip:hover{border-color:var(--brand);color:var(--txt)}
footer{border-top:1px solid var(--line);margin-top:50px;padding:26px 0 44px;color:#7688ab;font-size:12px;text-align:center;line-height:1.6}
footer a{color:var(--brand)}`;

const pad = (n) => (n < 10 ? "0" : "") + n;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* ------------------------------------------------------------------ shared header/footer */
function chrome(activeCity) {
  return {
    header: `<header><div class="wrap nav">
      <a class="logo" href="/">🧳</a>
      <a href="/"><b>AllInOneTrip</b><small>Search every travel site at once</small></a>
      <span style="margin-left:auto;display:flex;gap:16px;align-items:center">
        <a href="https://flights.allinonetrip.com" style="color:var(--brand);font-size:14px;font-weight:700">✈️ Live prices</a>
        <a href="/deal-of-the-week" style="color:var(--accent);font-size:14px;font-weight:700">🔥 Deal of the week</a>
        <a href="/" style="color:var(--muted);font-size:14px;font-weight:600">Full search →</a>
      </span>
    </div></header>`,
    footer: `<footer><div class="wrap">
      <div><b>AllInOneTrip</b> · search 30+ travel sites at once</div>
      <p>We don't sell tickets — we open live results on independent booking sites, which handle pricing, payment and support. We may earn a commission when you book, at no extra cost to you. <a href="/">Search all destinations →</a></p>
    </div></footer>`,
  };
}

/* ------------------------------------------------------------------ FAQ */
function faqFlights(d) {
  return [
    [`When is the cheapest time to fly to ${d.city}?`, `Midweek departures (Tuesday–Thursday) and booking 4–8 weeks ahead usually return the lowest fares to ${d.city}. Use the search above to compare 30+ sites at once and spot the cheapest day.`],
    [`How do I find last-minute flight deals to ${d.city}?`, `Set flexible dates and compare Google Flights, Skyscanner, Kayak and Aviasales together — last-minute drops appear on different sites, so searching them side by side is how you catch them.`],
    [`Which airport should I use for ${d.city}?`, `${d.city}'s main airport code is ${d.iata}. Our search checks nearby airports automatically on most partner sites so you never miss a cheaper option.`],
  ];
}
function faqHotels(d) {
  return [
    [`How do I get the best hotel deal in ${d.city}?`, `Compare Booking.com, Hotels.com, Expedia and Agoda at the same time — prices for the exact same room often differ by 20%+ between sites. The search above opens all of them with your dates pre-filled.`],
    [`When are ${d.city} hotels cheapest?`, `Rates dip in the shoulder season and midweek. Booking 2–4 weeks out (or same-week for last-minute flash rates) tends to beat weekend and peak-season pricing.`],
    [`Can I find last-minute hotel rooms in ${d.city}?`, `Yes — same-day and next-day discounts show up across different platforms. Searching them together is the fastest way to find the lowest available rate tonight.`],
  ];
}
function faqBlock(items) {
  const html = items.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("");
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };
  return { html: `<div class="faq">${html}</div>`, ld: JSON.stringify(ld) };
}

/* ------------------------------------------------------------------ related chips */
function relatedChips(current, kind) {
  return DESTS.filter((d) => d.slug !== current.slug).slice(0, 6).map((d) =>
    kind === "flights"
      ? `<a class="chip" href="/cheap-flights-to-${d.slug}">✈️ Flights to ${esc(d.city)}</a>`
      : `<a class="chip" href="/hotel-deals-in-${d.slug}">🏨 Hotels in ${esc(d.city)}</a>`
  ).join("") +
  (kind === "flights"
    ? `<a class="chip" href="/hotel-deals-in-${current.slug}">🏨 Hotels in ${esc(current.city)}</a>`
    : `<a class="chip" href="/cheap-flights-to-${current.slug}">✈️ Flights to ${esc(current.city)}</a>`);
}

/* ------------------------------------------------------------------ flight page */
function flightPage(d) {
  const title = `Cheap Flights to ${d.city} (${d.iata}) — Compare 30+ Sites | AllInOneTrip`;
  const desc = `Find cheap and last-minute flights to ${d.city}, ${d.country}. Compare Google Flights, Skyscanner, Kayak, Expedia and more in one search.`;
  const faq = faqBlock(faqFlights(d));
  const wp = JSON.stringify({ "@context": "https://schema.org", "@type": "WebPage", name: title, description: desc, url: `${SITE}/cheap-flights-to-${d.slug}` });
  const c = chrome(d.city);
  // browser JS uses string concatenation (no template literals) to stay clear of the Node generator
  const js = `<script>
(function(){
  var D="${d.iata}", CITY=${JSON.stringify(d.city)};
  var pad=function(n){return (n<10?'0':'')+n;};
  var f=function(x){return x.getFullYear()+'-'+pad(x.getMonth()+1)+'-'+pad(x.getDate());};
  var now=new Date(), a=new Date(now.getTime()+30*864e5), b=new Date(now.getTime()+37*864e5);
  document.getElementById('depart').value=f(a);
  document.getElementById('ret').value=f(b);
  var enc=encodeURIComponent;
  function ymd6(s){return s.slice(2).replace(/-/g,'');}
  function mdY(s){return s.slice(5,7)+'/'+s.slice(8,10)+'/'+s.slice(0,4);}
  function ddmm(s){return s.slice(8,10)+s.slice(5,7);}
  function build(o,dep,ret,ad){o=o.toUpperCase();return [
    {n:'Google Flights',u:'https://www.google.com/travel/flights?q='+enc('flights from '+o+' to '+CITY+' on '+dep+(ret?' returning '+ret:''))},
    {n:'Skyscanner',u:'https://www.skyscanner.net/transport/flights/'+o.toLowerCase()+'/'+D.toLowerCase()+'/'+ymd6(dep)+(ret?'/'+ymd6(ret):'')+'/?adults='+ad},
    {n:'Kayak',u:'https://www.kayak.com/flights/'+o+'-'+D+'/'+dep+(ret?'/'+ret:'')+'?sort=price_a'},
    {n:'Momondo',u:'https://www.momondo.com/flight-search/'+o+'-'+D+'/'+dep+(ret?'/'+ret:'')},
    {n:'Expedia',u:'https://www.expedia.com/Flights-Search?mode=search&trip='+(ret?'roundtrip':'oneway')+'&leg1=from:'+enc(o)+',to:'+enc(D)+',departure:'+mdY(dep)+'TANYT'+(ret?'&leg2=from:'+enc(D)+',to:'+enc(o)+',departure:'+mdY(ret)+'TANYT':'')+'&passengers=adults:'+ad},
    {n:'Aviasales',u:'https://www.aviasales.com/search/'+o+ddmm(dep)+D+(ret?ddmm(ret):'')+ad}
  ];}
  document.getElementById('go').onclick=function(){
    var o=(document.getElementById('origin').value||'').trim();
    var dep=document.getElementById('depart').value, ret=document.getElementById('ret').value, ad=document.getElementById('adults').value||'1';
    var h=document.getElementById('hint');
    if(!o){h.textContent='Enter your departure airport code (e.g. JFK, LHR).';return;}
    if(!dep){h.textContent='Pick a departure date.';return;}
    var L=build(o,dep,ret,ad), box=document.getElementById('out');
    box.innerHTML=L.map(function(x){return '<a class="pcard" target="_blank" rel="noopener nofollow" href="'+x.u+'"><b>'+x.n+'</b><span>Search flights →</span></a>';}).join('');
    box.style.display='grid';
    h.textContent='Opening '+L.length+' sites — click any to see live prices.';
  };
})();
</script>`;
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${SITE}/cheap-flights-to-${d.slug}">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:type" content="website">
<style>${CSS}</style>
${DRIVE}
<script type="application/ld+json">${wp}</script>
<script type="application/ld+json">${faq.ld}</script>
</head><body>
${c.header}
<div class="wrap">
  <div class="crumb"><a href="/">Home</a> › <a href="/destinations">Destinations</a> › Flights to ${esc(d.city)}</div>
  <h1>${d.emoji} Cheap Flights to ${esc(d.city)}</h1>
  <p class="sub">Compare 30+ airlines and booking sites in one search and grab the lowest fare to ${esc(d.city)}, ${esc(d.country)} — including last-minute deals.</p>

  <div class="panel">
    <div class="grid">
      <div><label>From (airport code)</label><input id="origin" placeholder="JFK, LHR, DXB…"></div>
      <div><label>Depart</label><input id="depart" type="date"></div>
      <div><label>Return (blank = one-way)</label><input id="ret" type="date"></div>
      <div><label>Travelers</label><select id="adults"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option></select></div>
    </div>
    <button class="btn" id="go">🔎 Search flights to ${esc(d.city)}</button>
    <div class="hint" id="hint"></div>
    <div class="out" id="out"></div>
  </div>

  <section>
    <h2>Finding cheap flights to ${esc(d.city)}</h2>
    <p class="body">${esc(d.city)} is loved for ${esc(d.hook)} — and it's one of the most-searched trips of the year, so fares swing a lot. The trick isn't loyalty to one site: the cheapest seat to ${esc(d.city)} (${d.iata}) hides on a different site every day. AllInOneTrip fires your exact trip into Google Flights, Skyscanner, Kayak, Momondo, Expedia and Aviasales at once, so you see who's cheapest in seconds instead of checking ten tabs.</p>
    <div class="tips">
      <div class="tip"><b>Be flexible ±3 days</b><p>Shifting your dates a few days around a weekend can cut fares to ${esc(d.city)} dramatically.</p></div>
      <div class="tip"><b>Search midweek</b><p>Tuesday–Thursday departures are typically cheaper than Friday–Sunday.</p></div>
      <div class="tip"><b>Compare, don't commit</b><p>Open all sites together — the same flight is often priced differently across them.</p></div>
    </div>
  </section>

  <section>
    <h2>${esc(d.city)} flight FAQs</h2>
    ${faq.html}
  </section>

  <section>
    <h2>Popular searches</h2>
    <div class="chips">${relatedChips(d, "flights")}</div>
  </section>
</div>
${c.footer}
${js}
</body></html>`;
}

/* ------------------------------------------------------------------ hotel page */
function hotelPage(d) {
  const title = `Hotel Deals in ${d.city} — Compare Booking, Expedia, Agoda | AllInOneTrip`;
  const desc = `Find the cheapest hotel deals in ${d.city}, ${d.country}. Compare Booking.com, Hotels.com, Expedia, Agoda and Airbnb in one search.`;
  const faq = faqBlock(faqHotels(d));
  const wp = JSON.stringify({ "@context": "https://schema.org", "@type": "WebPage", name: title, description: desc, url: `${SITE}/hotel-deals-in-${d.slug}` });
  const c = chrome(d.city);
  const js = `<script>
(function(){
  var CITY=${JSON.stringify(d.city)};
  var pad=function(n){return (n<10?'0':'')+n;};
  var f=function(x){return x.getFullYear()+'-'+pad(x.getMonth()+1)+'-'+pad(x.getDate());};
  var now=new Date(), a=new Date(now.getTime()+30*864e5), b=new Date(now.getTime()+33*864e5);
  document.getElementById('ci').value=f(a);
  document.getElementById('co').value=f(b);
  var enc=encodeURIComponent;
  function build(ci,co,g){return [
    {n:'Booking.com',u:'https://www.booking.com/searchresults.html?ss='+enc(CITY)+'&checkin='+ci+'&checkout='+co+'&group_adults='+g},
    {n:'Hotels.com',u:'https://www.hotels.com/Hotel-Search?destination='+enc(CITY)+'&startDate='+ci+'&endDate='+co+'&adults='+g},
    {n:'Expedia',u:'https://www.expedia.com/Hotel-Search?destination='+enc(CITY)+'&startDate='+ci+'&endDate='+co+'&adults='+g},
    {n:'Agoda',u:'https://www.agoda.com/search?city='+enc(CITY)+'&checkIn='+ci+'&checkOut='+co+'&adults='+g},
    {n:'Airbnb',u:'https://www.airbnb.com/s/'+enc(CITY)+'/homes?checkin='+ci+'&checkout='+co+'&adults='+g},
    {n:'Hotellook',u:'https://search.hotellook.com/?destination='+enc(CITY)+'&checkIn='+ci+'&checkOut='+co+'&adults='+g}
  ];}
  document.getElementById('go').onclick=function(){
    var ci=document.getElementById('ci').value, co=document.getElementById('co').value, g=document.getElementById('g').value||'2';
    var h=document.getElementById('hint');
    if(!ci||!co){h.textContent='Pick your check-in and check-out dates.';return;}
    var L=build(ci,co,g), box=document.getElementById('out');
    box.innerHTML=L.map(function(x){return '<a class="pcard" target="_blank" rel="noopener nofollow" href="'+x.u+'"><b>'+x.n+'</b><span>See rooms →</span></a>';}).join('');
    box.style.display='grid';
    h.textContent='Opening '+L.length+' sites — compare the same room across all of them.';
  };
})();
</script>`;
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${SITE}/hotel-deals-in-${d.slug}">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:type" content="website">
<style>${CSS}</style>
${DRIVE}
<script type="application/ld+json">${wp}</script>
<script type="application/ld+json">${faq.ld}</script>
</head><body>
${c.header}
<div class="wrap">
  <div class="crumb"><a href="/">Home</a> › <a href="/destinations">Destinations</a> › Hotels in ${esc(d.city)}</div>
  <h1>${d.emoji} Hotel Deals in ${esc(d.city)}</h1>
  <p class="sub">Compare Booking.com, Hotels.com, Expedia, Agoda and Airbnb side by side and book the cheapest room in ${esc(d.city)}, ${esc(d.country)}.</p>

  <div class="panel">
    <div class="grid">
      <div><label>Check-in</label><input id="ci" type="date"></div>
      <div><label>Check-out</label><input id="co" type="date"></div>
      <div><label>Guests</label><select id="g"><option>1</option><option selected>2</option><option>3</option><option>4</option><option>5</option><option>6</option></select></div>
    </div>
    <button class="btn" id="go">🔎 Compare hotels in ${esc(d.city)}</button>
    <div class="hint" id="hint"></div>
    <div class="out" id="out"></div>
  </div>

  <section>
    <h2>How to find the cheapest hotel in ${esc(d.city)}</h2>
    <p class="body">${esc(d.city)} draws travelers for ${esc(d.hook)}, which means hundreds of hotels competing on price — and the exact same room can cost 20% more on one site than another. Instead of trusting a single app, AllInOneTrip opens Booking.com, Hotels.com, Expedia, Agoda, Airbnb and Hotellook with your dates already filled in, so you compare real rates in one glance and book wherever it's cheapest.</p>
    <div class="tips">
      <div class="tip"><b>Compare every site</b><p>Loyalty costs money — the lowest rate in ${esc(d.city)} moves between platforms constantly.</p></div>
      <div class="tip"><b>Check free cancellation</b><p>Book a refundable rate now, then re-check closer to your trip for a price drop.</p></div>
      <div class="tip"><b>Try last-minute</b><p>Same-day and next-day rooms in ${esc(d.city)} often sell at a steep discount.</p></div>
    </div>
  </section>

  <section>
    <h2>${esc(d.city)} hotel FAQs</h2>
    ${faq.html}
  </section>

  <section>
    <h2>Popular searches</h2>
    <div class="chips">${relatedChips(d, "hotels")}</div>
  </section>
</div>
${c.footer}
${js}
</body></html>`;
}

/* ------------------------------------------------------------------ destinations hub */
function hubPage() {
  const title = "Popular Travel Destinations — Cheap Flights & Hotel Deals | AllInOneTrip";
  const desc = "Browse cheap flight and hotel deal pages for the world's most popular destinations. Compare 30+ travel sites in one search.";
  const c = chrome("");
  const cards = DESTS.map((d) => `<div class="tip">
    <b>${d.emoji} ${esc(d.city)}, ${esc(d.country)}</b>
    <p style="margin-top:10px">
      <a class="chip" href="/cheap-flights-to-${d.slug}">✈️ Cheap flights</a>
      <a class="chip" href="/hotel-deals-in-${d.slug}">🏨 Hotel deals</a>
    </p>
  </div>`).join("");
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${SITE}/destinations">
<style>${CSS}</style>
${DRIVE}
</head><body>
${c.header}
<div class="wrap">
  <div class="crumb"><a href="/">Home</a> › Destinations</div>
  <h1>🌍 Popular destinations</h1>
  <p class="sub">Hand-picked deal pages for the world's most-searched trips. Pick a city to compare cheap flights and hotels across 30+ sites.</p>
  <section><div class="tips">${cards}</div></section>
</div>
${c.footer}
</body></html>`;
}

/* ------------------------------------------------------------------ sitemap / robots / 404 */
function sitemap() {
  const urls = [`${SITE}/`, `${SITE}/deal-of-the-week`, `${SITE}/destinations`];
  DESTS.forEach((d) => { urls.push(`${SITE}/cheap-flights-to-${d.slug}`); urls.push(`${SITE}/hotel-deals-in-${d.slug}`); });
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc><changefreq>weekly</changefreq></url>`).join("\n")}
</urlset>
`;
}
const robots = `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`;
function notFound() {
  const c = chrome("");
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Page not found — AllInOneTrip</title><style>${CSS}</style>${DRIVE}</head><body>
${c.header}<div class="wrap"><h1 style="margin-top:60px">Page not found</h1>
<p class="sub">That page doesn't exist. <a href="/" style="color:var(--brand)">Go to the full travel search →</a> or <a href="/destinations" style="color:var(--brand)">browse destinations</a>.</p></div>${c.footer}</body></html>`;
}

/* ------------------------------------------------------------------ inject into home index.html */
function injectHome() {
  const p = join(TRAVEL, "index.html");
  let html = readFileSync(p, "utf8");
  const cards = DESTS.map((d) =>
    `<a class="deal" href="/cheap-flights-to-${d.slug}"><div class="tag">${d.emoji} ${esc(d.country)}</div><h4>${esc(d.city)}</h4><p>Cheap flights &amp; hotel deals — compare 30+ sites.</p><div class="destprice" data-dest="${d.slug}">Checking live price…</div><div class="go">Flights →</div></a>`
  ).join("\n      ");
  const block = `<!-- SEO-DEST-START -->\n      ${cards}\n      <!-- SEO-DEST-END -->`;
  if (html.includes("<!-- SEO-DEST-START -->")) {
    html = html.replace(/<!-- SEO-DEST-START -->[\s\S]*?<!-- SEO-DEST-END -->/, block);
  } else {
    const section = `
  <!-- Popular destinations (SEO landing pages) -->
  <section class="block">
    <h3>🌍 Popular destinations</h3>
    <p class="lead">Deal pages for the world's most-searched trips — tap through for cheap flights and hotels, or <a href="/destinations" style="color:var(--brand)">see all destinations</a>.</p>
    <div class="deals">
      ${block}
    </div>
  </section>

</div>`;
    // insert before the final </div> that closes .wrap (right before <footer>)
    html = html.replace(/\n<\/div>\s*\n<footer>/, section + "\n<footer>");
  }
  writeFileSync(p, html);
}

/* ------------------------------------------------------------------ deal of the week */
function cardSvg(d) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#0b1120"/><stop offset="0.55" stop-color="#0d1530"/><stop offset="1" stop-color="#0b1120"/>
  </linearGradient><linearGradient id="a" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#38bdf8"/><stop offset="1" stop-color="#6366f1"/></linearGradient></defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <text x="80" y="150" font-family="Arial,Helvetica,sans-serif" font-size="34" font-weight="700" fill="#f472b6">🔥 DEAL OF THE WEEK</text>
  <text x="80" y="290" font-family="Arial,Helvetica,sans-serif" font-size="96" font-weight="800" fill="#ffffff">${esc(d.city)}</text>
  <text x="80" y="370" font-family="Arial,Helvetica,sans-serif" font-size="40" font-weight="600" fill="#9fb0d0">Cheap flights &amp; hotels — compare 30+ sites</text>
  <rect x="80" y="430" width="420" height="72" rx="14" fill="url(#a)"/>
  <text x="290" y="477" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="30" font-weight="800" fill="#ffffff">Search deals now →</text>
  <text x="80" y="580" font-family="Arial,Helvetica,sans-serif" font-size="30" font-weight="700" fill="#38bdf8">🧳 AllInOneTrip.com</text>
</svg>`;
}

function dealPage() {
  const d = bySlug(FEATURED);
  const url = `${SITE}/deal-of-the-week`;
  const title = `This Week's Travel Deal: ${d.city} — Cheap Flights & Hotels | AllInOneTrip`;
  const desc = `${d.city} is our featured deal this week. Compare cheap flights and hotels to ${d.city} across 30+ sites in one search.`;
  const shareText = `🔥 This week's travel deal: cheap flights & hotels to ${d.city} — compare 30+ sites in one search!`;
  const c = chrome(d.city);
  const runners = RUNNERS.map(bySlug).filter(Boolean).map((r) => `<a class="deal" href="/cheap-flights-to-${r.slug}">
    <div class="tag">${r.emoji} ${esc(r.country)}</div><h4>${esc(r.city)}</h4>
    <p>Cheap flights &amp; hotels — compare 30+ sites.</p><div class="destprice" data-dest="${r.slug}"></div><div class="go">Explore →</div></a>`).join("");
  const enc = encodeURIComponent;
  const share = [
    ["Facebook", `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`],
    ["X", `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(shareText)}`],
    ["WhatsApp", `https://wa.me/?text=${enc(shareText + " " + url)}`],
    ["Telegram", `https://t.me/share/url?url=${enc(url)}&text=${enc(shareText)}`],
  ].map(([n, u]) => `<a class="chip" href="${u}" target="_blank" rel="noopener">Share on ${n}</a>`).join("");
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="website"><meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/deal-of-the-week/card.svg">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}"><meta name="twitter:image" content="${SITE}/deal-of-the-week/card.svg">
<style>${CSS}
.hero-deal{text-align:center;padding:30px 0 6px}
.hero-deal .kick{color:var(--accent);font-weight:800;letter-spacing:1px;font-size:15px}
.hero-deal h1{font-size:clamp(38px,8vw,72px);margin:6px 0}
.cta-row{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin:22px 0}
.cta{padding:15px 26px;border-radius:12px;font-weight:800;font-size:16px}
.cta.p{background:linear-gradient(135deg,var(--brand),var(--brand2));color:#fff}
.cta.s{background:var(--card);border:1px solid var(--line);color:var(--txt)}
.share{text-align:center;margin:26px 0}
.dealprice{display:flex;gap:9px;align-items:center;justify-content:center;margin:16px 0 2px;min-height:26px}
.destprice{display:flex;gap:7px;align-items:center;margin:8px 0 2px;min-height:20px;font-size:12px;color:var(--muted)}
.dp-price{color:var(--good);font-weight:800;font-size:20px}
.dealprice .dp-price{font-size:26px}
.dp-live{font-size:10px;font-weight:800;letter-spacing:.5px;color:var(--good);display:inline-flex;align-items:center;gap:4px}
.dp-live::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--good);animation:dpp 1.8s infinite}
@keyframes dpp{0%{box-shadow:0 0 0 0 rgba(52,211,153,.6)}70%{box-shadow:0 0 0 8px rgba(52,211,153,0)}100%{box-shadow:0 0 0 0 rgba(52,211,153,0)}}</style>
${DRIVE}
</head><body>
${c.header}
<div class="wrap">
  <div class="hero-deal">
    <div class="kick">🔥 DEAL OF THE WEEK</div>
    <h1>${d.emoji} ${esc(d.city)}</h1>
    <p class="sub" style="margin:0 auto">This week we're spotlighting <b>${esc(d.city)}, ${esc(d.country)}</b> — famous for ${esc(d.hook)}. Compare cheap flights and hotels across 30+ sites in one click and grab the lowest price before it's gone.</p>
    <div class="dealprice" data-dest="${d.slug}"></div>
    <div class="cta-row">
      <a class="cta p" href="/cheap-flights-to-${d.slug}">✈️ Find cheap flights</a>
      <a class="cta s" href="/hotel-deals-in-${d.slug}">🏨 Find hotel deals</a>
    </div>
  </div>

  <div class="share">
    <p style="color:var(--muted);font-size:14px;margin-bottom:12px">Know someone planning a trip? Share this deal 👇</p>
    <div class="chips" style="justify-content:center">${share}
      <button class="chip" id="copy" style="cursor:pointer;background:var(--card);color:var(--txt)">🔗 Copy link</button>
    </div>
  </div>

  <section>
    <h2>More hot destinations right now</h2>
    <div class="deals" style="display:grid;gap:14px;grid-template-columns:repeat(auto-fill,minmax(230px,1fr))">${runners}</div>
  </section>

  <section>
    <h2>Why book through AllInOneTrip?</h2>
    <p class="body">One search fires your trip into Google Flights, Skyscanner, Kayak, Booking.com, Expedia, Agoda and more at the same time — so you always see who's cheapest instead of checking ten tabs. It's 100% free to use, and prices are set by the booking sites themselves.</p>
    <div class="chips"><a class="chip" href="/destinations">🌍 All destinations</a><a class="chip" href="/">🔎 Full travel search</a></div>
  </section>
</div>
${c.footer}
<script>
(function(){
  var b=document.getElementById('copy');
  if(b) b.onclick=function(){
    var u=${JSON.stringify(url)};
    if(navigator.clipboard){navigator.clipboard.writeText(u);b.textContent='✓ Copied!';setTimeout(function(){b.textContent='🔗 Copy link';},1800);}
  };
  function fill(sel, prices){
    var els=document.querySelectorAll(sel);
    for(var i=0;i<els.length;i++){
      var el=els[i], p=prices[el.getAttribute('data-dest')];
      if(p&&p.price){ el.innerHTML='<span class="dp-price">from $'+p.price+'</span><span class="dp-live">LIVE</span>'; }
      else{ el.innerHTML=''; }
    }
  }
  function load(){
    fetch('/api/dest-prices').then(function(r){return r.json();}).then(function(j){
      var prices=(j&&j.prices)||{};
      fill('.dealprice[data-dest]', prices);
      fill('.destprice[data-dest]', prices);
    }).catch(function(){});
  }
  load(); setInterval(load, 600000);
})();
</script>
</body></html>`;
}

/* ------------------------------------------------------------------ run */
function write(rel, content) {
  const full = join(TRAVEL, rel);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content);
  return rel;
}
const written = [];
for (const d of DESTS) {
  written.push(write(`cheap-flights-to-${d.slug}/index.html`, flightPage(d)));
  written.push(write(`hotel-deals-in-${d.slug}/index.html`, hotelPage(d)));
}
written.push(write("deal-of-the-week/card.svg", cardSvg(bySlug(FEATURED))));
written.push(write("deal-of-the-week/index.html", dealPage()));
written.push(write("destinations/index.html", hubPage()));
written.push(write("sitemap.xml", sitemap()));
written.push(write("robots.txt", robots));
written.push(write("404.html", notFound()));
injectHome();
console.log(`Generated ${written.length} files for ${DESTS.length} destinations:`);
written.forEach((w) => console.log("  travel/" + w));
console.log("Injected 'Popular destinations' section into travel/index.html");
