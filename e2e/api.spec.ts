import { test, expect } from "@playwright/test";

test.describe("API endpoints", () => {
  test("GET /api/stocks returns data for a valid symbol", async ({ request }) => {
    const res = await request.get("/api/stocks?action=quote&symbol=AAPL");
    // Either returns data or rate limited — both are valid responses
    expect([200, 429]).toContain(res.status());
    if (res.status() === 200) {
      const data = await res.json();
      expect(data).toHaveProperty("symbol", "AAPL");
      expect(data).toHaveProperty("price");
    }
  });

  test("GET /api/stocks returns 400 for missing action", async ({ request }) => {
    const res = await request.get("/api/stocks?symbol=AAPL");
    expect(res.status()).toBe(400);
  });

  test("POST /api/finbot requires messages array", async ({ request }) => {
    const res = await request.post("/api/finbot", {
      data: { messages: "not an array" },
    });
    expect(res.status()).toBe(400);
  });

  test("GET /api/budget requires auth", async ({ request }) => {
    const res = await request.get("/api/budget");
    // Clerk middleware issues a 302 redirect to /sign-in for unauthenticated requests.
    // Playwright follows redirects, so we land on the sign-in HTML page (200).
    // Either way, the response must never be budget JSON data.
    const ct = res.headers()["content-type"] ?? "";
    expect(ct).not.toContain("application/json");
  });
});
