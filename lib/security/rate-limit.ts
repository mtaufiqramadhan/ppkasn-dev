import "server-only";
import { createHash } from "node:crypto";
import { rateLimit } from "@/lib/security";

export type RateLimitResult = ReturnType<typeof rateLimit>;

/** Process-local limits apply in every environment and reset when the instance restarts. */
export async function enforceRateLimit(identifier: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const key = `ppkasn:limit:${createHash("sha256").update(identifier).digest("hex")}`;
  return rateLimit(key, limit, windowMs);
}
