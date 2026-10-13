// Server-side free-API adapters. Every call is cached (Next fetch cache) so
// traffic to the free tiers stays tiny no matter how many visitors we get.
// Primary: CoinGecko (Demo/public). Fallbacks: CoinPaprika, DexScreener.
// Optional env: COINGECKO_API_KEY (free Demo key) raises the rate limit.

const CG = "https://api.coingecko.com/api/v3";
const CP = "https://api.coinpaprika.com/v1";
const REVALIDATE = 300; // seconds

function cgHeaders() {
  const key = process.env.COINGECKO_API_KEY;
  return key ? { "x-cg-demo-api-key": key } : {};
}

async function getJson(url, headers = {}) {
  const res = await fetch(url, {
    headers: { accept: "application/json", ...headers },
    next: { revalidate: REVALIDATE },
  });
  if (!res.ok) throw new Error(`${res.status} from ${new URL(url).host}`);
  return res.json();
}

export async function getMarkets(page = 1, perPage = 100) {
  try {
    const data = await getJson(
      `${CG}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=true&price_change_percentage=1h,24h,7d`,
      cgHeaders()
    );
    return {
      source: "coingecko",
      coins: data.map((c) => ({
        id: c.id,
        rank: c.market_cap_rank,
        name: c.name,
        symbol: (c.symbol || "").toUpperCase(),
        image: c.image,
        price: c.current_price,
        marketCap: c.market_cap,
        volume24h: c.total_volume,
        change1h: c.price_change_percentage_1h_in_currency,
        change24h: c.price_change_percentage_24h_in_currency ?? c.price_change_percentage_24h,
        change7d: c.price_change_percentage_7d_in_currency,
        sparkline: c.sparkline_in_7d?.price ?? null,
      })),
    };
  } catch {
    const data = await getJson(`${CP}/tickers?quotes=USD&limit=${perPage}`);
    return {
      source: "coinpaprika",
      coins: data.map((c) => ({
        id: c.id,
        rank: c.rank,
        name: c.name,
        symbol: c.symbol,
        image: `https://static.coinpaprika.com/coin/${c.id}/logo.png`,
        price: c.quotes.USD.price,
        marketCap: c.quotes.USD.market_cap,
        volume24h: c.quotes.USD.volume_24h,
        change1h: c.quotes.USD.percent_change_1h,
        change24h: c.quotes.USD.percent_change_24h,
        change7d: c.quotes.USD.percent_change_7d,
        sparkline: null,
      })),
    };
  }
}

export async function getGlobal() {
  const out = { source: null, marketCap: null, marketCapChange24h: null, volume24h: null, btcDominance: null, coins: null, fearGreed: null, fearGreedLabel: null };
  try {
    const { data } = await getJson(`${CG}/global`, cgHeaders());
    out.source = "coingecko";
    out.marketCap = data.total_market_cap?.usd ?? null;
    out.marketCapChange24h = data.market_cap_change_percentage_24h_usd ?? null;
    out.volume24h = data.total_volume?.usd ?? null;
    out.btcDominance = data.market_cap_percentage?.btc ?? null;
    out.coins = data.active_cryptocurrencies ?? null;
  } catch {
    try {
      const d = await getJson(`${CP}/global`);
      out.source = "coinpaprika";
      out.marketCap = d.market_cap_usd;
      out.marketCapChange24h = d.market_cap_change_24h;
      out.volume24h = d.volume_24h_usd;
      out.btcDominance = d.bitcoin_dominance_percentage;
      out.coins = d.cryptocurrencies_number;
    } catch {}
  }
  try {
    const fg = await getJson("https://api.alternative.me/fng/?limit=1");
    out.fearGreed = Number(fg.data?.[0]?.value ?? NaN);
    out.fearGreedLabel = fg.data?.[0]?.value_classification ?? null;
    if (Number.isNaN(out.fearGreed)) out.fearGreed = null;
  } catch {}
  return out;
}

// Prices for CEXAID-listed tokens once they trade. `cgIds` are CoinGecko ids,
// `dex` is [{key, address}] looked up on DexScreener for tokens without a
// CoinGecko page yet. Returns { [key]: { price, change24h, source } }.
export async function getTokenPrices(cgIds = [], dex = []) {
  const out = {};
  if (cgIds.length) {
    try {
      const d = await getJson(
        `${CG}/simple/price?ids=${encodeURIComponent(cgIds.join(","))}&vs_currencies=usd&include_24hr_change=true`,
        cgHeaders()
      );
      for (const id of cgIds) {
        if (d[id]?.usd != null) out[id] = { price: d[id].usd, change24h: d[id].usd_24h_change ?? null, source: "coingecko" };
      }
    } catch {}
  }
  await Promise.all(
    dex.map(async ({ key, address }) => {
      if (out[key]) return;
      try {
        const d = await getJson(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
        const pair = (d.pairs || []).sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
        if (pair?.priceUsd) out[key] = { price: Number(pair.priceUsd), change24h: pair.priceChange?.h24 ?? null, source: "dexscreener" };
      } catch {}
    })
  );
  return out;
}

// CoinGecko trending search (free). Top ~15 coins people are searching for.
export async function getTrending() {
  const d = await getJson(`${CG}/search/trending`, cgHeaders());
  return (d.coins || []).map(({ item }, i) => ({
    id: item.id,
    rank: item.market_cap_rank,
    name: item.name,
    symbol: (item.symbol || "").toUpperCase(),
    image: item.small || item.thumb,
    price: item.data?.price ?? null,
    change24h: item.data?.price_change_percentage_24h?.usd ?? null,
    marketCap: item.data?.market_cap ? Number(String(item.data.market_cap).replace(/[^0-9.]/g, "")) || null : null,
    trendRank: i + 1,
  }));
}

// Newly listed / created tokens from DexScreener: latest token profiles,
// then one batched pair lookup per chain (max 30 addresses per call).
export async function getNewPairs() {
  const profiles = await fetch("https://api.dexscreener.com/token-profiles/latest/v1", {
    headers: { accept: "application/json" },
    next: { revalidate: 120 },
  }).then((r) => (r.ok ? r.json() : []));

  const byChain = {};
  for (const p of profiles.slice(0, 90)) {
    if (!p.chainId || !p.tokenAddress) continue;
    (byChain[p.chainId] ||= []).push(p.tokenAddress);
  }

  const results = await Promise.all(
    Object.entries(byChain).map(async ([chain, addrs]) => {
      const out = [];
      for (let i = 0; i < addrs.length; i += 30) {
        const batch = addrs.slice(i, i + 30);
        try {
          const pairs = await fetch(`https://api.dexscreener.com/tokens/v1/${chain}/${batch.join(",")}`, {
            headers: { accept: "application/json" },
            next: { revalidate: 120 },
          }).then((r) => (r.ok ? r.json() : []));
          out.push(...pairs);
        } catch {}
      }
      return out;
    })
  );

  // Keep the most liquid pair per token.
  const best = new Map();
  for (const pair of results.flat()) {
    const key = `${pair.chainId}:${pair.baseToken?.address}`;
    const cur = best.get(key);
    if (!cur || (pair.liquidity?.usd || 0) > (cur.liquidity?.usd || 0)) best.set(key, pair);
  }

  return [...best.values()]
    .filter((p) => p.priceUsd)
    .map((p) => ({
      id: `${p.chainId}:${p.baseToken.address}`,
      chain: p.chainId,
      dex: p.dexId,
      name: p.baseToken.name,
      symbol: p.baseToken.symbol,
      image: p.info?.imageUrl || null,
      price: Number(p.priceUsd),
      change1h: p.priceChange?.h1 ?? null,
      change24h: p.priceChange?.h24 ?? null,
      liquidity: p.liquidity?.usd ?? null,
      volume24h: p.volume?.h24 ?? null,
      fdv: p.fdv ?? null,
      createdAt: p.pairCreatedAt ?? null,
      url: p.url,
    }))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

// Market-wide token unlocks. DefiLlama's emissions endpoints are Pro-only, so
// this is used only when DEFILLAMA_API_KEY is set. Parsed defensively.
export async function getDefiLlamaUnlocks() {
  const key = process.env.DEFILLAMA_API_KEY;
  if (!key) return { enabled: false, events: [] };
  const res = await fetch(`https://pro-api.llama.fi/${key}/api/emissions`, { next: { revalidate: 3600 } });
  if (!res.ok) return { enabled: false, events: [], error: `DefiLlama returned ${res.status}` };
  const list = await res.json();
  const events = [];
  for (const item of Array.isArray(list) ? list : []) {
    const raw = Array.isArray(item.nextEvent) ? item.nextEvent[0] : item.nextEvent;
    if (!raw) continue;
    let ts = Number(raw.timestamp ?? raw.date);
    if (!ts) continue;
    if (ts < 1e12) ts *= 1000;
    const n = raw.noOfTokens;
    const tokens = Array.isArray(n) ? n.reduce((a, b) => a + (Number(b) || 0), 0) : Number(n ?? raw.tokens) || null;
    events.push({
      key: `llama-${item.gecko_id || item.name}`,
      name: item.name,
      symbol: null,
      geckoId: item.gecko_id || null,
      date: new Date(ts).toISOString(),
      tokens,
      marketCap: item.mcap ?? null,
      category: raw.category || raw.description || null,
      source: "defillama",
    });
  }
  return { enabled: true, events };
}
