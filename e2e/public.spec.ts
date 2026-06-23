import { test, expect } from "@playwright/test";

test.describe("Public pages", () => {
  test("landing page loads and shows app name", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Budget2Broker/i);
  });

  test("sign-in page is reachable", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.locator("body")).toBeVisible();
    // Clerk renders an iframe-based sign-in form
    await expect(page.locator("text=Sign in").or(page.locator("text=sign in")).first()).toBeVisible({ timeout: 10000 });
  });

  test("unauthenticated /dashboard redirects to sign-in", async ({ page }) => {
    await page.goto("/dashboard");
    // Clerk middleware should redirect away from the dashboard
    await expect(page).not.toHaveURL(/\/dashboard/, { timeout: 8000 });
  });

  test("sign-up page is reachable", async ({ page }) => {
    await page.goto("/sign-up");
    await expect(page.locator("body")).toBeVisible();
    // Clerk renders a form — wait for any input field to appear
    await expect(page.locator("input").first()).toBeVisible({ timeout: 10000 });
  });
});
