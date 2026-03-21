import { NextRequest, NextResponse } from "next/server";

const BASE = "https://www.alphavantage.co/query";

export async function GET(req: NextRequest) {
  const AV_KEY = process.env.ALPHA_VANTAGE_KEY ?? "demo";
  console.log("AV_KEY:", AV_KEY);

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const symbol = (searchParams.get("symbol") ?? "IBM").toUpperCase();

  try {
    switch (action) {
      case "quote": {
        const url = `${BASE}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${AV_KEY}`;
        const res  = await fetch(url, { next: { revalidate: 60 } });
        const data = await res.json();
        const q    = data["Global Quote"];

        if (!q || !q["05. price"]) {
          return NextResponse.json({ error: "Symbol not found or API limit reached" }, { status: 404 });
        }

        return NextResponse.json({
          symbol:    q["01. symbol"],
          price:     parseFloat(q["05. price"]),
          change:    parseFloat(q["09. change"]),
          changePct: q["10. change percent"],
          high:      parseFloat(q["03. high"]),
          low:       parseFloat(q["04. low"]),
          volume:    parseInt(q["06. volume"]),
          prevClose: parseFloat(q["08. previous close"]),
          latestDay: q["07. latest trading day"],
        });
      }

      case "intraday": {
        const url  = `${BASE}?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=60min&outputsize=compact&apikey=${AV_KEY}`;
        const res  = await fetch(url, { next: { revalidate: 300 } });
        const data = await res.json();
        const series = data["Time Series (60min)"];

        if (!series) {
          return NextResponse.json({ error: "No intraday data" }, { status: 404 });
        }

        const points = Object.entries(series)
          .slice(0, 30)
          .reverse()
          .map(([time, val]: [string, unknown]) => {
            const v = val as Record<string, string>;
            return {
              time,
              open:   parseFloat(v["1. open"]),
              high:   parseFloat(v["2. high"]),
              low:    parseFloat(v["3. low"]),
              close:  parseFloat(v["4. close"]),
              volume: parseInt(v["5. volume"]),
            };
          });

        return NextResponse.json({ symbol, points });
      }

      case "daily": {
        const url  = `${BASE}?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${AV_KEY}`;
        const res  = await fetch(url, { next: { revalidate: 3600 } });
        const data = await res.json();
        const series = data["Time Series (Daily)"];

        if (!series) {
          return NextResponse.json({ error: "No daily data" }, { status: 404 });
        }

        const points = Object.entries(series)
          .slice(0, 90)
          .reverse()
          .map(([date, val]: [string, unknown]) => {
            const v = val as Record<string, string>;
            return {
              time:   date,
              open:   parseFloat(v["1. open"]),
              high:   parseFloat(v["2. high"]),
              low:    parseFloat(v["3. low"]),
              close:  parseFloat(v["4. close"]),
              volume: parseInt(v["5. volume"]),
            };
          });

        return NextResponse.json({ symbol, points });
      }

      case "search": {
        const keywords = searchParams.get("q") ?? symbol;
        const url  = `${BASE}?function=SYMBOL_SEARCH&keywords=${keywords}&apikey=${AV_KEY}`;
        const res  = await fetch(url, { next: { revalidate: 3600 } });
        const data = await res.json();
        const matches = (data.bestMatches ?? []).slice(0, 6).map((m: Record<string, string>) => ({
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