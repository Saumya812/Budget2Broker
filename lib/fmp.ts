const FMP_BASE  = "https://financialmodelingprep.com/api/v3";
const CACHE_MS  = 6 * 60 * 60 * 1000; // 6 hours — FMP free tier: 250 req/day

const cache: Record<string, { data: unknown; ts: number }> = {};

async function fmpFetch<T>(path: string): Promise<T> {
  const key    = process.env.FMP_API_KEY ?? "";
  const url    = `${FMP_BASE}${path}&apikey=${key}`;
  const cached = cache[url];
  if (cached && Date.now() - cached.ts < CACHE_MS) return cached.data as T;

  const res  = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`FMP ${res.status}: ${path}`);
  const data = await res.json() as T;
  cache[url] = { data, ts: Date.now() };
  return data;
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface FMPEtfProfile {
  symbol:           string;
  companyName:      string;
  price:            number;
  mktCap:           number;
  expenseRatio?:    number;
  etfProvider?:     string;
  sectorsList?:     { industry: string; weightPercentage: string }[];
}

export interface ScreenedETF {
  symbol:       string;
  name:         string;
  price:        number;
  expenseRatio: number | null;
  aum:          number;
  type:         "ETF" | "Bond" | "Commodity" | "Real Estate";
  cagr5yr:      number | null;
  color:        string;
}

// ── ETF universe by risk tier ────────────────────────────────────────────────
// FMP free tier doesn't expose a full ETF screener, so we define the candidate
// pool per risk tier and let FMP give us live profiles + price history.
// This is still far better than hardcoded data — prices, expense ratios, AUM,
// and CAGRs all come from FMP in real time.

const CANDIDATES: Record<"Conservative" | "Moderate" | "Aggressive", {
  symbol: string;
  type: "ETF" | "Bond" | "Commodity" | "Real Estate";
  color: string;
}[]> = {
  Conservative: [
    { symbol: "BND",  type: "Bond",      color: "#00CFFF" },
    { symbol: "VTIP", type: "Bond",      color: "#A855F7" },
    { symbol: "VTI",  type: "ETF",       color: "#00FF88" },
    { symbol: "GLD",  type: "Commodity", color: "#FFD600" },
    { symbol: "SCHD", type: "ETF",       color: "#FF6B35" },
  ],
  Moderate: [
    { symbol: "VTI",  type: "ETF",          color: "#00FF88" },
    { symbol: "QQQ",  type: "ETF",          color: "#00CFFF" },
    { symbol: "BND",  type: "Bond",         color: "#A855F7" },
    { symbol: "VNQ",  type: "Real Estate",  color: "#FF6B35" },
    { symbol: "VXUS", type: "ETF",          color: "#FFD600" },
  ],
  Aggressive: [
    { symbol: "QQQ",  type: "ETF", color: "#00FF88" },
    { symbol: "VGT",  type: "ETF", color: "#00CFFF" },
    { symbol: "VTI",  type: "ETF", color: "#A855F7" },
    { symbol: "VXUS", type: "ETF", color: "#FF6B35" },
    { symbol: "SOXX", type: "ETF", color: "#FFD600" },
  ],
};

// ── Fetch ETF profile (price, AUM, expense ratio) ────────────────────────────
async function getEtfProfile(symbol: string): Promise<{ price: number; aum: number; expenseRatio: number | null }> {
  try {
    type QuoteRes = { price: number; marketCap: number }[];
    const quote = await fmpFetch<QuoteRes>(`/quote/${symbol}?`);
    const q     = quote[0];

    // ETF expense ratio via profile endpoint
    type ProfileRes = { expenseRatio?: number }[];
    let expenseRatio: number | null = null;
    try {
      const profile = await fmpFetch<ProfileRes>(`/profile/${symbol}?`);
      expenseRatio  = profile[0]?.expenseRatio ?? null;
    } catch { /* not all ETFs return expense ratio */ }

    return {
      price:        q?.price       ?? 0,
      aum:          q?.marketCap   ?? 0,
      expenseRatio,
    };
  } catch {
    return { price: 0, aum: 0, expenseRatio: null };
  }
}

// ── Calculate real 5yr CAGR from historical prices ───────────────────────────
async function getCagr5yr(symbol: string): Promise<number | null> {
  try {
    type HistRes = { historical: { date: string; close: number }[] };
    const data = await fmpFetch<HistRes>(
      `/historical-price-full/${symbol}?from=${fiveYearsAgo()}&serietype=line`
    );
    const history = data.historical;
    if (!history || history.length < 2) return null;

    // history is newest-first
    const latest  = history[0].close;
    const oldest  = history[history.length - 1].close;
    const years   = 5;
    const cagr    = Math.pow(latest / oldest, 1 / years) - 1;
    return parseFloat(cagr.toFixed(4));
  } catch {
    return null;
  }
}

function fiveYearsAgo(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 5);
  return d.toISOString().split("T")[0];
}

// ── Public: get top N ETFs for a risk profile with live FMP data ──────────────
export async function getScreenedETFs(
  riskProfile: "Conservative" | "Moderate" | "Aggressive",
  count = 4,
): Promise<ScreenedETF[]> {
  const candidates = CANDIDATES[riskProfile];

  const results = await Promise.all(
    candidates.map(async (c) => {
      const [profile, cagr5yr] = await Promise.all([
        getEtfProfile(c.symbol),
        getCagr5yr(c.symbol),
      ]);

      return {
        symbol:       c.symbol,
        name:         c.symbol, // fallback; enriched below
        price:        profile.price,
        expenseRatio: profile.expenseRatio,
        aum:          profile.aum,
        type:         c.type,
        cagr5yr,
        color:        c.color,
      } satisfies ScreenedETF;
    }),
  );

  // Filter out any that returned no price (API error / rate limit)
  const valid = results.filter(e => e.price > 0);

  // Sort: prefer higher AUM (more liquid) + lower expense ratio
  valid.sort((a, b) => {
    const aScore = (a.aum / 1e9) - (a.expenseRatio ?? 0.5) * 10;
    const bScore = (b.aum / 1e9) - (b.expenseRatio ?? 0.5) * 10;
    return bScore - aScore;
  });

  return valid.slice(0, count);
}

// ── ETF name map (FMP profile endpoint is extra call; use a local map) ────────
const ETF_NAMES: Record<string, string> = {
  BND:  "Vanguard Total Bond Market ETF",
  VTIP: "Vanguard Short-Term Inflation-Protected ETF",
  VTI:  "Vanguard Total Stock Market ETF",
  GLD:  "SPDR Gold Shares",
  SCHD: "Schwab US Dividend Equity ETF",
  QQQ:  "Invesco QQQ Trust (NASDAQ-100)",
  VNQ:  "Vanguard Real Estate ETF",
  VXUS: "Vanguard Total International Stock ETF",
  VGT:  "Vanguard Information Technology ETF",
  SOXX: "iShares Semiconductor ETF",
};

export function getEtfName(symbol: string): string {
  return ETF_NAMES[symbol] ?? symbol;
}
