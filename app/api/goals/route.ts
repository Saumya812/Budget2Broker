import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthUserId } from "@/lib/server-auth";

export async function GET(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const demo = new URL(req.url).searchParams.get("demo") === "true";

  const { data, error } = await supabaseAdmin
    .from("goals")
    .select("*")
    .eq("clerk_user_id", userId)
    .eq("is_demo", demo)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ goals: data });
}

export async function POST(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, target_amount, current_amount, deadline, category, color } = await req.json();
  if (!title || !target_amount) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("goals")
    .insert({ clerk_user_id: userId, title, target_amount, current_amount: current_amount ?? 0, deadline, category, color })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ goal: data });
}
