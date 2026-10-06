import "server-only";
import { createHash } from "node:crypto";
import { rateLimit } from "@/lib/security";

export type RateLimitResult = ReturnType<typeof rateLimit>;

/** Atomic Redis counters share limits across replicas. Configured backend failures fail closed. */
export async function enforceRateLimit(identifier: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const key = `ppkasn:limit:${createHash("sha256").update(identifier).digest("hex")}`;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url && !token) {
    if (process.env.REQUIRE_DISTRIBUTED_RATE_LIMIT === "true" || process.env.NODE_ENV === "production") throw new Error("Rate limit backend is not configured");
    return rateLimit(key, limit, windowMs);
  }
  if (!url || !token || new URL(url).protocol !== "https:") throw new Error("Invalid rate limit backend configuration");
  const script = "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('PEXPIRE',KEYS[1],ARGV[1]); end; return {n,redis.call('PTTL',KEYS[1])}";
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(["EVAL", script, "1", key, String(windowMs)]),
    cache: "no-store",
    signal: AbortSignal.timeout(3000),
  });
  if (!response.ok) throw new Error("Rate limit backend unavailable");
  const body: unknown = await response.json();
  const result = body && typeof body === "object" && "result" in body ? body.result : null;
  if (!Array.isArray(result) || result.length !== 2 || !result.every(value => typeof value === "number" && Number.isFinite(value))) throw new Error("Invalid rate limit response");
  const [count, ttl] = result as [number, number];
  if (ttl < 0) throw new Error("Rate limit counter has no expiry");
  return { success: count <= limit, limit, remaining: Math.max(0, limit - count), reset: Math.ceil((Date.now() + ttl) / 1000) };
}
