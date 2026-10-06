import { z } from "zod";
import { NextRequest } from "next/server";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Bounded in-memory fixed window rate limiter
 * @param identifier Unique client key (IP or user ID)
 * @param maxRequests Maximum allowed requests in window
 * @param windowMs Window duration in milliseconds (default 60 seconds)
 * @returns { success: boolean, limit: number, remaining: number, reset: number }
 */
export function rateLimit(
  identifier: string,
  maxRequests = 30,
  windowMs = 60000
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  if (rateLimitStore.size >= 10000) {
    for (const [key, value] of rateLimitStore) {
      if (now >= value.resetTime) rateLimitStore.delete(key);
    }
    if (!rateLimitStore.has(identifier) && rateLimitStore.size >= 10000) {
      return { success: false, limit: maxRequests, remaining: 0, reset: Math.ceil((now + windowMs) / 1000) };
    }
  }
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      reset: Math.ceil((now + windowMs) / 1000),
    };
  }

  if (record.count >= maxRequests) {
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      reset: Math.ceil(record.resetTime / 1000),
    };
  }

  record.count += 1;
  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - record.count,
    reset: Math.ceil(record.resetTime / 1000),
  };
}

/**
 * Extract client IP address from standard proxy/CDN headers
 */
export function getClientIp(request: NextRequest): string {
  return getClientIpFromHeaders(request.headers);
}

/** Only enable a header that the deployment proxy overwrites on every request. */
export function getClientIpFromHeaders(headers: Headers): string {
  const trustedHeader = process.env.TRUSTED_PROXY_IP_HEADER;
  if (!trustedHeader) return "unknown";
  const value = headers.get(trustedHeader)?.split(",")[0]?.trim();
  return value && z.string().ip().safeParse(value).success ? value : "unknown";
}

export function verifySameOrigin(request: NextRequest): boolean {
  return verifyOrigin(request.headers, request.nextUrl.origin);
}

export function verifyOrigin(headers: Headers, requestOrigin: string): boolean {
  if (headers.get("sec-fetch-site") === "cross-site") return false;
  const origin = headers.get("origin");
  if (!origin || origin === "null") return false;
  try {
    const expected = new URL(process.env.APP_ORIGIN || requestOrigin);
    const actual = new URL(origin);
    return ["http:", "https:"].includes(actual.protocol) && actual.origin === expected.origin;
  } catch {
    return false;
  }
}

/**
 * Sanitize untrusted user input string:
 * - Strip HTML tags and control characters
 * - Trim and enforce max length
 */
export function sanitizeInput(val: unknown, maxLength = 500): string {
  if (val === null || val === undefined) return "";
  const raw = String(val);
  // Strip control characters and HTML tags
  const sanitized = raw
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/<[^>]*>/g, "")
    .trim();

  return sanitized.slice(0, maxLength);
}
