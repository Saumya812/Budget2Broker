import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtected = createRouteMatcher([
  "/dashboard(.*)",
  "/api/budget(.*)",
  "/api/watchlist(.*)",
  "/api/portfolio(.*)",
  "/api/plaid(.*)",
  "/api/goals(.*)",
  "/api/profile(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const reqHeaders = new Headers(req.headers);
  // Strip incoming header so external clients can't spoof the userId
  reqHeaders.delete("x-user-id");

  if (isProtected(req)) {
    await auth.protect();
    const { userId } = await auth();
    if (userId) reqHeaders.set("x-user-id", userId);
  }

  return NextResponse.next({ request: { headers: reqHeaders } });
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
