import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthUserId } from "@/lib/server-auth";

const DEMO_EXPENSES = [
  { name: "Monthly Salary",       category: "Others",        type: "income",  amount: 4500 },
  { name: "Freelance Project",    category: "Others",        type: "income",  amount: 850  },
  { name: "Rent",                 category: "Rent",          type: "expense", amount: 1200 },
  { name: "Whole Foods",          category: "Food",          type: "expense", amount: 180  },
  { name: "Metro Pass",           category: "Transport",     type: "expense", amount: 90   },
  { name: "Netflix",              category: "Entertainment", type: "expense", amount: 18   },
  { name: "Electricity Bill",     category: "Utilities",     type: "expense", amount: 75   },
  { name: "Gym Membership",       category: "Health",        type: "expense", amount: 45   },
  { name: "Trader Joe's",         category: "Food",          type: "expense", amount: 95   },
  { name: "Uber rides",           category: "Transport",     type: "expense", amount: 48   },
  { name: "Amazon - Headphones",  category: "Shopping",      type: "expense", amount: 129  },
  { name: "Coffee subscription",  category: "Food",          type: "expense", amount: 22   },
  { name: "Internet Bill",        category: "Utilities",     type: "expense", amount: 60   },
  { name: "Doctor Visit",         category: "Health",        type: "expense", amount: 30   },
  { name: "Spotify",              category: "Entertainment", type: "expense", amount: 11   },
  { name: "Books (Kindle)",       category: "Education",     type: "expense", amount: 25   },
  { name: "Dinner out",           category: "Food",          type: "expense", amount: 68   },
];

const DEMO_GOALS = [
  { title: "Emergency Fund",     target_amount: 10000, current_amount: 3200, category: "emergency",  color: "#00CFFF", deadline: "2026-12-31" },
  { title: "Vacation to Japan",  target_amount: 3500,  current_amount: 800,  category: "travel",     color: "#A855F7", deadline: "2027-03-01" },
  { title: "Investment Starter", target_amount: 5000,  current_amount: 1500, category: "investment", color: "#00FF88", deadline: null         },
];

// POST — seed demo data (non-destructive, is_demo = true)
export async function POST() {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Remove any previous demo rows first to avoid duplicates
  await supabaseAdmin.from("expenses").delete().eq("clerk_user_id", userId).eq("is_demo", true);
  await supabaseAdmin.from("goals").delete().eq("clerk_user_id", userId).eq("is_demo", true);

  const { error: expErr } = await supabaseAdmin.from("expenses").insert(
    DEMO_EXPENSES.map(e => ({ ...e, clerk_user_id: userId, is_demo: true }))
  );
  if (expErr) return NextResponse.json({ error: expErr.message }, { status: 500 });

  const { error: goalErr } = await supabaseAdmin.from("goals").insert(
    DEMO_GOALS.map(g => ({ ...g, clerk_user_id: userId, is_demo: true }))
  );
  if (goalErr) return NextResponse.json({ error: goalErr.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

// DELETE — remove all demo data, restoring user's real data
export async function DELETE() {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await supabaseAdmin.from("expenses").delete().eq("clerk_user_id", userId).eq("is_demo", true);
  await supabaseAdmin.from("goals").delete().eq("clerk_user_id", userId).eq("is_demo", true);

  return NextResponse.json({ success: true });
}
