import { NextRequest, NextResponse } from "next/server";
import { aiLimiter, getIdentifier } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  try {
    const { success } = await aiLimiter.limit(getIdentifier(req));
    if (!success) {
      return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
    }

    const { budgetData } = await req.json();

    const expenses = budgetData ?? [];
    const totalIncome  = expenses.filter((e: {type:string;amount:number}) => e.type === "income").reduce((s: number, e: {amount:number}) => s + e.amount, 0);
    const totalExpense = expenses.filter((e: {type:string;amount:number}) => e.type === "expense").reduce((s: number, e: {amount:number}) => s + e.amount, 0);
    const investable   = Math.max(0, totalIncome - totalExpense);

    const systemPrompt = `You are Budget2Broker's AI investment advisor. You analyze a user's budget and generate a precise, personalized investment plan.

You MUST respond ONLY with a valid JSON object — no markdown, no explanation, no preamble, no backticks. Just raw JSON.

The JSON must follow this exact structure:
{
  "summary": "2-sentence personalized summary of the plan",
  "monthlyInvestment": <number: how much to invest monthly>,
  "riskProfile": "Conservative" | "Moderate" | "Aggressive",
  "timeHorizon": "Short-term (1-2 years)" | "Medium-term (3-5 years)" | "Long-term (5+ years)",
  "allocations": [
    {
      "symbol": "TICKER",
      "name": "Full Company/Fund Name",
      "type": "Stock" | "ETF" | "Bond" | "Real Estate",
      "percentage": <number 0-100>,
      "monthlyAmount": <number>,
      "reason": "One sentence why this fits the user",
      "color": "#hexcolor"
    }
  ],
  "projections": {
    "oneYear": <number>,
    "threeYear": <number>,
    "fiveYear": <number>
  },
  "tips": ["tip1", "tip2", "tip3"]
}

Rules:
- All allocations must sum to exactly 100%
- monthlyAmount for each must sum to monthlyInvestment
- If investable amount is $0, suggest starting with $50/month
- Pick 4-6 allocations appropriate for the risk profile
- Use real ticker symbols (SPY, QQQ, AAPL, BND, VNQ, etc.)
- projections assume average annual returns based on risk profile
- Return ONLY the JSON, nothing else`;

    const userMessage = `Here is the user's financial data:
- Monthly Income: $${totalIncome.toFixed(2)}
- Monthly Expenses: $${totalExpense.toFixed(2)}
- Available to Invest: $${investable.toFixed(2)}/month
- Expense breakdown: ${JSON.stringify(expenses.filter((e:{type:string}) => e.type === "expense").map((e:{name:string;amount:number;category:string}) => ({ name: e.name, amount: e.amount, category: e.category })))}

Generate a personalized investment plan for this user.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1024,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq API error:", err);
      return NextResponse.json({ error: "Failed to generate plan" }, { status: 500 });
    }

    const data = await response.json();
    const raw  = data.choices?.[0]?.message?.content ?? "{}";

    const cleaned = raw.replace(/```json|```/g, "").trim();
    const plan    = JSON.parse(cleaned);

    return NextResponse.json({ plan });
  } catch (err) {
    console.error("Generate plan error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}