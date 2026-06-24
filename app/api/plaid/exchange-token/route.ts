import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/server-auth";
import { plaidClient } from "@/lib/plaid";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { public_token, institution_name } = await req.json();
    if (!public_token) return NextResponse.json({ error: "Missing public_token" }, { status: 400 });

    // Exchange public token for permanent access token — happens server-side only
    const exchange = await plaidClient.itemPublicTokenExchange({ public_token });
    const accessToken = exchange.data.access_token;
    const itemId      = exchange.data.item_id;

    // Store securely in Supabase — access token never leaves the server
    const { error } = await supabaseAdmin
      .from("plaid_connections")
      .upsert({
        clerk_user_id:    userId,
        access_token:     accessToken,
        item_id:          itemId,
        institution_name: institution_name ?? "Your Bank",
        connected_at:     new Date().toISOString(),
      }, { onConflict: "clerk_user_id" });

    if (error) throw error;

    return NextResponse.json({ success: true, institution_name: institution_name ?? "Your Bank" });
  } catch (err) {
    console.error("Plaid exchange-token error:", err);
    return NextResponse.json({ error: "Failed to exchange token" }, { status: 500 });
  }
}
