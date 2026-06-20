import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest } from "next/server";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// AI endpoints: 15 requests per minute per user
export const aiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(15, "1 m"),
  prefix: "rl:ai",
});

// Stock endpoints: 30 requests per minute per user
export const stockLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"),
  prefix: "rl:stock",
});

export function getIdentifier(req: NextRequest): string {
  return (
    req.headers.get("x-user-id") ??
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "anonymous"
  );
}
