import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/server-auth";
import { plaidClient } from "@/lib/plaid";
import { CountryCode, Products } from "plaid";

export async function POST(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const response = await plaidClient.linkTokenCreate({
      user:          { client_user_id: userId },
      client_name:   "Budget2Broker",
      products:      [Products.Transactions],
      country_codes: [CountryCode.Us],
      language:      "en",
    });

    return NextResponse.json({ link_token: response.data.link_token });
  } catch (err) {
    console.error("Plaid create-link-token error:", err);
    return NextResponse.json({ error: "Failed to create link token" }, { status: 500 });
  }
}
