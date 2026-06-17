import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthUserId } from "@/lib/server-auth";

export async function GET(_req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabaseAdmin
    .from("portfolio")
    .select("cash, holdings")
    .eq("clerk_user_id", userId)
    .single();
  if (error && error.code !== "PGRST116") return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ portfolio: data ?? { cash: 10000, holdings: [] } });
}

export async function PUT(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { cash, holdings } = await req.json();
  const { data, error } = await supabaseAdmin
    .from("portfolio")
    .upsert(
      { clerk_user_id: userId, cash, holdings, updated_at: new Date().toISOString() },
      { onConflict: "clerk_user_id" }
    )
    .select("cash, holdings")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ portfolio: data });
}
