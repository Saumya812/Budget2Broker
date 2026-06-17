import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthUserId } from "@/lib/server-auth";

export async function GET(_req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabaseAdmin
    .from("watchlist")
    .select("symbol, added_at, last_price")
    .eq("clerk_user_id", userId)
    .order("added_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ watchlist: data });
}

export async function POST(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { symbol, last_price } = await req.json();
  if (!symbol) return NextResponse.json({ error: "Missing symbol" }, { status: 400 });
  const { data, error } = await supabaseAdmin
    .from("watchlist")
    .upsert(
      { clerk_user_id: userId, symbol: symbol.toUpperCase(), last_price: last_price ?? null, added_at: new Date().toISOString() },
      { onConflict: "clerk_user_id,symbol" }
    )
    .select("symbol, added_at, last_price")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data });
}
