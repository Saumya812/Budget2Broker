import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;

// Use in API routes (server-side) — has full access
export const supabaseAdmin = createClient(
  url,
  process.env.SUPABASE_SECRET_KEY!
);

// Use in client components — safe to expose
export const supabase = createClient(
  url,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);
