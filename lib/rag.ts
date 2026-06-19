import { HfInference } from "@huggingface/inference";
import { supabaseAdmin } from "@/lib/supabase";

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export async function embedText(text: string): Promise<number[]> {
  const result = await hf.featureExtraction({
    model: "sentence-transformers/all-MiniLM-L6-v2",
    inputs: text,
  });
  return result as number[];
}

export async function searchKnowledge(query: string, matchCount = 3): Promise<string[]> {
  try {
    const queryEmbedding = await embedText(query);

    const { data, error } = await supabaseAdmin.rpc("match_knowledge", {
      query_embedding: queryEmbedding,
      match_threshold: 0.5,
      match_count: matchCount,
    });

    if (error || !data?.length) return [];

    return (data as { content: string }[]).map((row) => row.content);
  } catch {
    return [];
  }
}
