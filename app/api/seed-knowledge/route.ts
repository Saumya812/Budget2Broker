import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { embedText } from "@/lib/rag";
import { KNOWLEDGE_CHUNKS } from "@/lib/knowledge";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-seed-secret");
  if (secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = [];

  for (const chunk of KNOWLEDGE_CHUNKS) {
    const embedding = await embedText(chunk.content);

    const { error } = await supabaseAdmin.from("knowledge_base").insert({
      content: chunk.content,
      topic: chunk.topic,
      embedding,
    });

    if (error) {
      results.push({ topic: chunk.topic, status: "error", error: error.message });
    } else {
      results.push({ topic: chunk.topic, status: "ok" });
    }
  }

  const failed = results.filter((r) => r.status === "error");
  return NextResponse.json({
    inserted: results.filter((r) => r.status === "ok").length,
    failed: failed.length,
    details: failed,
  });
}
