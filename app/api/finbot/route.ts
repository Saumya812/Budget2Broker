import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages, budgetContext } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    const systemPrompt = `You are Budget2Broker AI, a warm, knowledgeable personal financial mentor. Your users are students and beginners who may feel intimidated by finance.

Your role:
- Act like a trusted friend who is a financial expert
- Explain concepts in plain, jargon-free language
- Give specific, actionable advice based on the user's budget data when available
- Be encouraging — never make users feel judged about spending
- Keep responses concise — 2-4 short paragraphs max

Here is the user's current financial data:
---
${budgetContext}
---

Use this data to personalize your responses. If no budget data exists, encourage them to add some.
Important: Your advice is educational, not a substitute for a licensed financial advisor.`;

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
          ...messages.map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content,
          })),
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq API error:", err);
      return NextResponse.json({ error: "Groq API error" }, { status: 500 });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? "Sorry, I could not get a response.";

    // Return in same format the frontend expects
    return NextResponse.json({ content: [{ type: "text", text }] });
  } catch (err) {
    console.error("Mentor API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}