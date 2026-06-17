import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthUserId } from "@/lib/server-auth";

export async function DELETE(req: Request, { params }: { params: Promise<{ symbol: string }> }) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { symbol } = await params;
  const { error } = await supabaseAdmin
    .from("watchlist")
    .delete()
    .eq("clerk_user_id", userId)
    .eq("symbol", symbol.toUpperCase());
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
