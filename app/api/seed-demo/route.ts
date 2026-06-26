import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthUserId } from "@/lib/server-auth";

const DEMO_EXPENSES = [
  // Income
  { name: "Monthly Salary",       category: "Others",        type: "income",  amount: 4500, date: "2026-06-01" },
  { name: "Freelance Project",    category: "Others",        type: "income",  amount: 850,  date: "2026-06-15" },
  // Expenses
  { name: "Rent",                 category: "Rent",          type: "expense", amount: 1200, date: "2026-06-01" },
  { name: "Whole Foods",          category: "Food",          type: "expense", amount: 180,  date: "2026-06-03" },
  { name: "Metro Pass",           category: "Transport",     type: "expense", amount: 90,   date: "2026-06-04" },
  { name: "Netflix",              category: "Entertainment", type: "expense", amount: 18,   date: "2026-06-05" },
  { name: "Electricity Bill",     category: "Utilities",     type: "expense", amount: 75,   date: "2026-06-07" },
  { name: "Gym Membership",       category: "Health",        type: "expense", amount: 45,   date: "2026-06-08" },
  { name: "Trader Joe's",         category: "Food",          type: "expense", amount: 95,   date: "2026-06-10" },
  { name: "Uber rides",           category: "Transport",     type: "expense", amount: 48,   date: "2026-06-12" },
  { name: "Amazon - Headphones",  category: "Shopping",      type: "expense", amount: 129,  date: "2026-06-14" },
  { name: "Coffee subscript",     category: "Food",          type: "expense", amount: 22,   date: "2026-06-16" },
  { name: "Internet Bill",        category: "Utilities",     type: "expense", amount: 60,   date: "2026-06-18" },
  { name: "Doctor Visit",         category: "Health",        type: "expense", amount: 30,   date: "2026-06-19" },
  { name: "Spotify",              category: "Entertainment", type: "expense", amount: 11,   date: "2026-06-20" },
  { name: "Books (Kindle)",       category: "Education",     type: "expense", amount: 25,   date: "2026-06-22" },
  { name: "Dinner out",           category: "Food",          type: "expense", amount: 68,   date: "2026-06-24" },
];

const DEMO_GOALS = [
  { title: "Emergency Fund",    target_amount: 10000, current_amount: 3200, category: "emergency",  color: "#00CFFF", deadline: "2026-12-31" },
  { title: "Vacation to Japan", target_amount: 3500,  current_amount: 800,  category: "travel",     color: "#A855F7", deadline: "2027-03-01" },
  { title: "Investment Starter",target_amount: 5000,  current_amount: 1500, category: "investment", color: "#00FF88", deadline: null         },
];

export async function POST() {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Clear existing data first
  await supabaseAdmin.from("expenses").delete().eq("clerk_user_id", userId);
  await supabaseAdmin.from("goals").delete().eq("clerk_user_id", userId);

  // Seed expenses
  const { error: expErr } = await supabaseAdmin.from("expenses").insert(
    DEMO_EXPENSES.map(e => ({ ...e, clerk_user_id: userId, time: "12:00" }))
  );
  if (expErr) return NextResponse.json({ error: expErr.message }, { status: 500 });

  // Seed goals
  const { error: goalErr } = await supabaseAdmin.from("goals").insert(
    DEMO_GOALS.map(g => ({ ...g, clerk_user_id: userId }))
  );
  if (goalErr) return NextResponse.json({ error: goalErr.message }, { status: 500 });

  return NextResponse.json({ success: true, expenses: DEMO_EXPENSES.length, goals: DEMO_GOALS.length });
}
