import { NextRequest, NextResponse } from "next/server";
import { aiLimiter, getIdentifier } from "@/lib/ratelimit";
import { getRiskProfile, getTimeHorizon, buildAllocations, calculateProjections } from "@/lib/portfolio-engine";
import { getScreenedETFs, getEtfName } from "@/lib/fmp";

export async function POST(req: NextRequest) {
  try {
    const { success } = await aiLimiter.limit(getIdentifier(req));
    if (!success) {
      return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
    }

    const { budgetData } = await req.json();
    const expenses: { type: string; amount: number; name?: string; category?: string }[] = budgetData ?? [];

    const totalIncome  = expenses.filter(e => e.type === "income") .reduce((s, e) => s + e.amount, 0);
    const totalExpense = expenses.filter(e => e.type === "expense").reduce((s, e) => s + e.amount, 0);
    const investable   = Math.max(0, totalIncome - totalExpense);
    const monthlyInvestment = investable > 0 ? Math.round(investable * 0.8) : 100;

    // ── 1. Algorithm: risk profile + time horizon ─────────────────────────────
    const riskProfile = getRiskProfile(totalIncome, totalExpense, investable);
    const timeHorizon = getTimeHorizon(riskProfile);

    // ── 2. FMP: screen live ETFs — fall back to hardcoded if FMP fails ──────────
    const FALLBACK_ETFS: Record<string, { symbol: string; name: string; type: "ETF"|"Bond"|"Commodity"|"Real Estate"; color: string; cagr5yr: number; price: number; expenseRatio: number; aum: number }[]> = {
      Conservative: [
        { symbol: "BND",  name: "Vanguard Total Bond Market ETF",       type: "Bond",      color: "#00CFFF", cagr5yr: 0.015, price: 72,  expenseRatio: 0.03, aum: 100e9 },
        { symbol: "VTI",  name: "Vanguard Total Stock Market ETF",      type: "ETF",       color: "#00FF88", cagr5yr: 0.12,  price: 280, expenseRatio: 0.03, aum: 400e9 },
        { symbol: "VTIP", name: "Vanguard Short-Term Inflation-Prot ETF", type: "Bond",    color: "#A855F7", cagr5yr: 0.022, price: 47,  expenseRatio: 0.04, aum: 20e9  },
        { symbol: "GLD",  name: "SPDR Gold Shares",                     type: "Commodity", color: "#FFD600", cagr5yr: 0.07,  price: 220, expenseRatio: 0.40, aum: 60e9  },
      ],
      Moderate: [
        { symbol: "VTI",  name: "Vanguard Total Stock Market ETF",      type: "ETF",         color: "#00FF88", cagr5yr: 0.12, price: 280, expenseRatio: 0.03, aum: 400e9 },
        { symbol: "QQQ",  name: "Invesco QQQ Trust (NASDAQ-100)",       type: "ETF",         color: "#00CFFF", cagr5yr: 0.17, price: 480, expenseRatio: 0.20, aum: 250e9 },
        { symbol: "BND",  name: "Vanguard Total Bond Market ETF",       type: "Bond",        color: "#A855F7", cagr5yr: 0.015,price: 72,  expenseRatio: 0.03, aum: 100e9 },
        { symbol: "VNQ",  name: "Vanguard Real Estate ETF",             type: "Real Estate", color: "#FF6B35", cagr5yr: 0.08, price: 85,  expenseRatio: 0.12, aum: 30e9  },
      ],
      Aggressive: [
        { symbol: "QQQ",  name: "Invesco QQQ Trust (NASDAQ-100)",      type: "ETF", color: "#00FF88", cagr5yr: 0.17, price: 480, expenseRatio: 0.20, aum: 250e9 },
        { symbol: "VGT",  name: "Vanguard Information Technology ETF", type: "ETF", color: "#00CFFF", cagr5yr: 0.20, price: 580, expenseRatio: 0.10, aum: 70e9  },
        { symbol: "VTI",  name: "Vanguard Total Stock Market ETF",     type: "ETF", color: "#A855F7", cagr5yr: 0.12, price: 280, expenseRatio: 0.03, aum: 400e9 },
        { symbol: "VXUS", name: "Vanguard Total International Stock ETF", type: "ETF", color: "#FF6B35", cagr5yr: 0.07, price: 60, expenseRatio: 0.07, aum: 80e9 },
      ],
    };

    let screenedETFs;
    try {
      screenedETFs = await getScreenedETFs(riskProfile, 4);
      if (!screenedETFs.length) throw new Error("No ETFs returned");
    } catch {
      screenedETFs = FALLBACK_ETFS[riskProfile];
    }

    const namedETFs = screenedETFs.map(etf => ({
      ...etf,
      name: getEtfName(etf.symbol) || etf.name,
    }));

    // ── 3. Build allocations + real projections ───────────────────────────────
    const allocations = buildAllocations(namedETFs, monthlyInvestment);
    const projections = calculateProjections(monthlyInvestment, allocations);

    // ── 4. Groq: explanation text only ────────────────────────────────────────
    const expenseList = expenses
      .filter(e => e.type === "expense")
      .map(e => `${e.category ?? "general"}: $${e.amount}`)
      .join(", ");

    const systemPrompt = `You are Budget2Broker's AI financial writer. You receive a fully computed investment plan and write short, friendly explanations in plain English. You do NOT choose tickers, percentages, or numbers — those are already determined by our algorithm. Respond ONLY with valid JSON, no markdown, no backticks.

Required format:
{
  "summary": "2 sentences personalizing this plan to the user's specific income/expense situation",
  "reasons": {
    "<SYMBOL>": "1 sentence explaining why this ETF fits this user's risk profile and goals"
  },
  "tips": ["tip1", "tip2", "tip3"]
}`;

    const userMessage = `User financial snapshot:
- Monthly income: $${totalIncome.toFixed(2)}
- Monthly expenses: $${totalExpense.toFixed(2)}
- Available to invest: $${investable.toFixed(2)}/month
- We are investing: $${monthlyInvestment}/month
- Expense categories: ${expenseList || "no data yet"}
- Risk profile: ${riskProfile}
- Time horizon: ${timeHorizon}
- Portfolio: ${allocations.map(a => `${a.symbol} ${a.name} (${a.percentage}%, $${a.monthlyAmount}/mo, 5yr CAGR: ${(a.cagr * 100).toFixed(1)}%)`).join(" | ")}

Write the summary, a 1-sentence reason per ticker, and 3 practical tips tailored to this user.`;

    let summary = `Based on your ${riskProfile.toLowerCase()} risk profile, we've built a diversified portfolio investing $${monthlyInvestment}/month across ${allocations.length} live-screened ETFs.`;
    let reasons: Record<string, string> = {};
    let tips: string[] = [
      "Invest consistently every month regardless of market conditions.",
      "Reinvest any dividends to accelerate compound growth.",
      "Review your allocation once a year and rebalance if needed.",
    ];

    try {
      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model:      "llama-3.3-70b-versatile",
          max_tokens: 512,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user",   content: userMessage  },
          ],
        }),
      });

      if (groqRes.ok) {
        const groqData = await groqRes.json() as { choices: { message: { content: string } }[] };
        const raw      = groqData.choices?.[0]?.message?.content ?? "{}";
        const parsed   = JSON.parse(raw.replace(/```json|```/g, "").trim());
        if (parsed.summary)                              summary = parsed.summary;
        if (parsed.reasons)                              reasons = parsed.reasons;
        if (Array.isArray(parsed.tips) && parsed.tips.length) tips = parsed.tips;
      }
    } catch { /* fall through to defaults */ }

    // ── 5. Assemble final plan ────────────────────────────────────────────────
    const plan = {
      summary,
      monthlyInvestment,
      riskProfile,
      timeHorizon,
      allocations: allocations.map(a => ({
        symbol:         a.symbol,
        name:           a.name,
        type:           a.type,
        percentage:     a.percentage,
        monthlyAmount:  a.monthlyAmount,
        livePrice:      a.livePrice,
        expenseRatio:   a.expenseRatio,
        sharesPerMonth: a.sharesPerMonth,
        cagr:           a.cagr,
        reason:         reasons[a.symbol] ?? `${a.name} provides ${a.type.toLowerCase()} exposure suited to a ${riskProfile.toLowerCase()} investor.`,
        color:          a.color,
      })),
      projections,
      tips,
      meta: {
        generatedAt:  new Date().toISOString(),
        dataSource:   "Financial Modeling Prep (live)",
        riskProfile,
      },
    };

    return NextResponse.json({ plan });
  } catch (err) {
    console.error("Generate plan error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
