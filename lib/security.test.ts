import { describe, expect, test } from "bun:test";
import { NextRequest } from "next/server";
import { getClientIp, rateLimit, verifySameOrigin } from "./security";

describe("request security", () => {
  test("rejects missing and cross-site origins for mutations", () => {
    expect(verifySameOrigin(new NextRequest("https://example.com/api/cms/news", { method: "POST" }))).toBe(false);
    expect(verifySameOrigin(new NextRequest("https://example.com/api/cms/news", { headers: { origin: "https://attacker.com", host: "example.com" } }))).toBe(false);
  });
  test("compares the complete origin including scheme and port", () => {
    expect(verifySameOrigin(new NextRequest("https://example.com/api/cms/news", { headers: { origin: "http://example.com", host: "example.com" } }))).toBe(false);
    expect(verifySameOrigin(new NextRequest("https://example.com/api/cms/news", { headers: { origin: "https://example.com" } }))).toBe(true);
  });
  test("does not trust arbitrary forwarded IP headers", () => {
    expect(getClientIp(new NextRequest("https://example.com", { headers: { "x-forwarded-for": "203.0.113.1" } }))).toBe("unknown");
  });
  test("blocks attempts after the configured limit without resetting the window", () => {
    const key = crypto.randomUUID();
    expect(rateLimit(key, 2).success).toBe(true);
    expect(rateLimit(key, 2).success).toBe(true);
    expect(rateLimit(key, 2).success).toBe(false);
  });
});
