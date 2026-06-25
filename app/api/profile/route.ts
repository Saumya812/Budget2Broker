import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthUserId } from "@/lib/server-auth";

export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabaseAdmin
    .from("user_profiles")
    .select("*")
    .eq("clerk_user_id", userId)
    .single();

  return NextResponse.json({ profile: data ?? null });
}

export async function PUT(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { display_name, risk_preference, monthly_income_goal, currency } = body;

  const { data, error } = await supabaseAdmin
    .from("user_profiles")
    .upsert({ clerk_user_id: userId, display_name, risk_preference, monthly_income_goal, currency, updated_at: new Date().toISOString() }, { onConflict: "clerk_user_id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profile: data });
}
