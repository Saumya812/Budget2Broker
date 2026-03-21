

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages, budgetContext } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    const systemPrompt = `You are FinMentor, a warm, knowledgeable, and encouraging personal financial mentor built into a budgeting and investing app called FinMentor AI. Your users are primarily students and beginners who may feel intimidated by finance and investing.

Your role:
- Act like a trusted friend who happens to be a financial expert
- Explain complex concepts in plain, jargon-free language
- Give specific, actionable advice based on the user's actual budget data when available
- Be encouraging and positive — never make the user feel judged about their spending
- If they ask about investments, explain the options clearly and help them understand risk
- You can help them build investment plans, savings goals, and budgets
- When relevant, reference their actual budget data to make advice personalized

Personality: Warm, encouraging, clear, practical. Use occasional emojis to keep things friendly but don't overdo it.

Response length: Keep responses concise — 2-4 short paragraphs max. Use bullet points for lists. Users are on a mobile-sized chat widget.

Important disclaimer: Always remind users that your advice is educational and not a substitute for a licensed financial advisor when discussing specific investment decisions.

Here is the user's current financial data from their budget tracker:
---
${budgetContext}
---

Use this data to personalize your responses whenever relevant. If they haven't added budget data yet, gently encourage them to do so for better personalized advice.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic API error:", err);
      return NextResponse.json({ error: "Anthropic API error" }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Mentor API route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}