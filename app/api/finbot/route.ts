import { streamText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { NextRequest, NextResponse } from "next/server";
import { searchKnowledge } from "@/lib/rag";
import { aiLimiter, getIdentifier } from "@/lib/ratelimit";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { success } = await aiLimiter.limit(getIdentifier(req));
    if (!success) {
      return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
    }

    const { messages, budgetContext, noStream } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    // Retrieve relevant knowledge chunks based on the user's last message
    const lastUserMessage = [...messages].reverse().find((m: { role: string }) => m.role === "user");
    const relevantChunks = lastUserMessage
      ? await searchKnowledge(lastUserMessage.content, 3)
      : [];

    const knowledgeContext =
      relevantChunks.length > 0
        ? `\nRelevant financial knowledge for this question:\n${relevantChunks.map((c, i) => `[${i + 1}] ${c}`).join("\n\n")}\n`
        : "";

    const systemPrompt = `You are Budget2Broker AI, a warm, knowledgeable personal financial mentor. Your users are students and beginners who may feel intimidated by finance.

Your role:
- Act like a trusted friend who is a financial expert
- Explain concepts in plain, jargon-free language
- Give specific, actionable advice based on the user's budget data when available
- Be encouraging — never make users feel judged about spending
- Keep responses concise — 2-4 short paragraphs max
${knowledgeContext}
${budgetContext ? `Here is the user's current financial data:\n---\n${budgetContext}\n---\n\nUse this data to personalize your responses.` : "Encourage the user to add their budget data for personalized advice."}
Important: Your advice is educational, not a substitute for a licensed financial advisor.`;

    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      messages,
      maxOutputTokens: 1024,
    });

    if (noStream) {
      const text = await result.text;
      return NextResponse.json({ content: [{ type: "text", text }] });
    }

    return result.toTextStreamResponse();
  } catch (err) {
    console.error("Mentor API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
