import { NextRequest, NextResponse } from "next/server";
import { stockLimiter, getIdentifier } from "@/lib/ratelimit";

const BASE = "https://www.alphavantage.co/query";

// Server-side cache — survives across requests
const cache: Record<string, { data: unknown; ts: number }> = {};
const CACHE_MS = 5 * 60 * 1000; // 5 minutes

async function cachedFetch(url: string): Promise<unknown> {
  const cached = cache[url];
  if (cached && Date.now() - cached.ts < CACHE_MS) {
    return cached.data;
  }
  const res  = await fetch(url, { cache: "no-store" });
  const data = await res.json();
  cache[url] = { data, ts: Date.now() };
  return data;
}

export async function GET(req: NextRequest) {
  const { success } = await stockLimiter.limit(getIdentifier(req));
  if (!success) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
  }

  const AV_KEY = process.env.ALPHA_VANTAGE_KEY ?? "demo";

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const symbol = (searchParams.get("symbol") ?? "IBM").toUpperCase();

  try {
    switch (action) {

      case "quote":
      case "daily": {
        const url  = `${BASE}?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${AV_KEY}`;
        const data = await cachedFetch(url) as Record<string, unknown>;
        const series = data["Time Series (Daily)"] as Record<string, Record<string, string>> | undefined;

        if (!series) {
          return NextResponse.json({ error: "Symbol not found or API limit reached" }, { status: 404 });
        }

        const entries = Object.entries(series);
        const [latestDay, latestVal] = entries[0];
        const [,          prevVal]   = entries[1];

        const price     = parseFloat(latestVal["4. close"]);
        const prevClose = parseFloat(prevVal["4. close"]);
        const change    = price - prevClose;
        const changePct = ((change / prevClose) * 100).toFixed(4) + "%";

        const points = entries.slice(0, 90).reverse().map(([date, val]) => ({
          time:   date,
          open:   parseFloat(val["1. open"]),
          high:   parseFloat(val["2. high"]),
          low:    parseFloat(val["3. low"]),
          close:  parseFloat(val["4. close"]),
          volume: parseInt(val["5. volume"]),
        }));

        return NextResponse.json({
          symbol,
          price,
          change,
          changePct,
          high:      parseFloat(latestVal["2. high"]),
          low:       parseFloat(latestVal["3. low"]),
          volume:    parseInt(latestVal["5. volume"]),
          prevClose,
          latestDay,
          points,
        });
      }

      case "intraday": {
        const url  = `${BASE}?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=60min&outputsize=compact&apikey=${AV_KEY}`;
        const data = await cachedFetch(url) as Record<string, unknown>;
        const series = data["Time Series (60min)"] as Record<string, Record<string, string>> | undefined;

        if (!series) {
          return NextResponse.json({ error: "No intraday data" }, { status: 404 });
        }

        const points = Object.entries(series)
          .slice(0, 30)
          .reverse()
          .map(([time, val]) => ({
            time,
            open:   parseFloat(val["1. open"]),
            high:   parseFloat(val["2. high"]),
            low:    parseFloat(val["3. low"]),
            close:  parseFloat(val["4. close"]),
            volume: parseInt(val["5. volume"]),
          }));

        return NextResponse.json({ symbol, points });
      }

      case "search": {
        const keywords = searchParams.get("q") ?? symbol;
        const url  = `${BASE}?function=SYMBOL_SEARCH&keywords=${keywords}&apikey=${AV_KEY}`;
        const data = await cachedFetch(url) as Record<string, unknown>;
        const matches = ((data as Record<string, unknown>).bestMatches as Record<string, string>[] ?? []).slice(0, 6).map((m) => ({
          symbol:   m["1. symbol"],
          name:     m["2. name"],
          type:     m["3. type"],
          region:   m["4. region"],
          currency: m["8. currency"],
        }));
        return NextResponse.json({ matches });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (err) {
    console.error("Stocks API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}