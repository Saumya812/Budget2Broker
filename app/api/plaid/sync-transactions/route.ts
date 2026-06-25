import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/server-auth";
import { plaidClient } from "@/lib/plaid";
import { supabaseAdmin } from "@/lib/supabase";

// Map Plaid categories to Budget2Broker categories
function mapCategory(plaidCategories: string[] | null): string {
  if (!plaidCategories?.length) return "Other";
  const primary = plaidCategories[0]?.toLowerCase() ?? "";
  const detail  = plaidCategories[1]?.toLowerCase() ?? "";

  if (primary.includes("food") || detail.includes("restaurant") || detail.includes("coffee")) return "Food & Dining";
  if (primary.includes("travel") || detail.includes("airline") || detail.includes("hotel")) return "Travel";
  if (primary.includes("transport") || detail.includes("uber") || detail.includes("gas")) return "Transport";
  if (primary.includes("shops") || primary.includes("retail")) return "Shopping";
  if (primary.includes("recreation") || detail.includes("gym") || detail.includes("sport")) return "Entertainment";
  if (primary.includes("healthcare") || detail.includes("pharmacy") || detail.includes("doctor")) return "Health";
  if (primary.includes("service") && detail.includes("utilities")) return "Utilities";
  if (primary.includes("payment") || detail.includes("rent")) return "Housing";
  if (primary.includes("income") || detail.includes("payroll") || detail.includes("deposit")) return "Income";
  return "Other";
}

export async function POST(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Get stored access token for this user
    const { data: connection, error: connErr } = await supabaseAdmin
      .from("plaid_connections")
      .select("access_token, institution_name")
      .eq("clerk_user_id", userId)
      .single();

    if (connErr || !connection) {
      return NextResponse.json({ error: "No bank connected" }, { status: 404 });
    }

    // Fetch last 90 days of transactions from Plaid
    const now   = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 90);

    const txResponse = await plaidClient.transactionsGet({
      access_token: connection.access_token,
      start_date:   start.toISOString().split("T")[0],
      end_date:     now.toISOString().split("T")[0],
      options:      { count: 200, offset: 0 },
    });

    const transactions = txResponse.data.transactions;

    // Map Plaid transactions → Budget2Broker expense format
    const expenses = transactions
      .filter(tx => !tx.pending)
      .map(tx => ({
        clerk_user_id: userId,
        name:          tx.name,
        amount:        Math.abs(tx.amount),
        // Plaid: positive = money out (expense), negative = money in (income)
        type:          tx.amount > 0 ? "expense" : "income",
        category:      mapCategory(tx.category ?? null),
        date:          tx.date,
        plaid_tx_id:   tx.transaction_id,
      }));

    if (expenses.length === 0) {
      return NextResponse.json({ synced: 0, message: "No transactions found" });
    }

    // Upsert — won't duplicate if synced again
    const { error: upsertErr } = await supabaseAdmin
      .from("expenses")
      .upsert(expenses, { onConflict: "plaid_tx_id", ignoreDuplicates: true });

    if (upsertErr) throw upsertErr;

    // Update last synced timestamp
    await supabaseAdmin
      .from("plaid_connections")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("clerk_user_id", userId);

    return NextResponse.json({
      synced:          expenses.length,
      institution:     connection.institution_name,
      period:          `${start.toISOString().split("T")[0]} → ${now.toISOString().split("T")[0]}`,
    });
  } catch (err) {
    console.error("Plaid sync-transactions error:", err);
    return NextResponse.json({ error: "Failed to sync transactions" }, { status: 500 });
  }
}

// GET — check if user has a bank connected + last sync time
export async function GET(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabaseAdmin
    .from("plaid_connections")
    .select("institution_name, connected_at, last_synced_at")
    .eq("clerk_user_id", userId)
    .single();

  return NextResponse.json({
    connected:        !!data,
    institution_name: data?.institution_name ?? null,
    connected_at:     data?.connected_at ?? null,
    last_synced_at:   data?.last_synced_at ?? null,
  });
}
