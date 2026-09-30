import { NextRequest } from "next/server";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Periodically clean up expired records to prevent memory leak
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 60000);
}

/**
 * In-memory sliding window rate limiter
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
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

/**
 * Verify same-origin for state-changing requests (CSRF mitigation)
 */
export function verifySameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin || !host) {
    return true;
  }

  try {
    const originUrl = new URL(origin);
    return originUrl.host === host;
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
