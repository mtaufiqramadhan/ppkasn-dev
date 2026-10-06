import { expect, test, mock, afterEach } from "bun:test";
import { NextRequest } from "next/server";
import { restoreRecordsSchema } from "./restore-schema";
import { contentLinkSchema } from "./content-schema";
import { buildContentSecurityPolicy } from "./csp";
import { bookingApiSchema } from "@/features/booking/schemas/booking-api-schema";

mock.module("server-only", () => ({}));
let providerCalls = 0;
mock.module("next/headers", () => ({ headers: async () => new Headers({ origin: "http://localhost:3000", host: "localhost:3000" }) }));
mock.module("@/lib/supabase/server", () => ({ createClient: async () => ({ auth: { signInWithPassword: async () => { providerCalls++; return { error: { message: "provider detail must stay private" } }; }, getUser: async () => ({ data: { user: { id: "ordinary", email: "user@example.com", email_confirmed_at: "2026-01-01", app_metadata: {} } }, error: null }) } }) }));
const { readLimitedBody, readJsonBody, requireCmsAdmin, guardMutation } = await import("./request-guard");
const { enforceRateLimit } = await import("./rate-limit");
const originalFetch = globalThis.fetch;
const originalRedisUrl = process.env.UPSTASH_REDIS_REST_URL;
const originalRedisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalRedisUrl === undefined) delete process.env.UPSTASH_REDIS_REST_URL; else process.env.UPSTASH_REDIS_REST_URL = originalRedisUrl;
  if (originalRedisToken === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN; else process.env.UPSTASH_REDIS_REST_TOKEN = originalRedisToken;
});

test("CMS access rejects ordinary users even when directly invoking a route guard", async () => {
  await expect(requireCmsAdmin()).rejects.toMatchObject({ status: 403 });
});
test("mutation guard rejects cross-origin requests before consuming input", async () => {
  await expect(guardMutation(new NextRequest("https://example.com/api/cms/news", { method: "PUT", headers: { origin: "https://evil.example" } }), "test")).rejects.toMatchObject({ status: 403 });
});
test("body limits also apply to chunked requests without Content-Length", async () => {
  const body = new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array(8)); controller.enqueue(new Uint8Array(8)); controller.close(); } });
  const request = new Request("https://example.com", { method: "POST", body, duplex: "half" } as RequestInit);
  await expect(readLimitedBody(request, 10)).rejects.toMatchObject({ status: 413 });
});
test("JSON parsing rejects mismatched content types and invalid JSON", async () => {
  await expect(readJsonBody(new Request("https://example.com", { method: "POST", body: "{}" }))).rejects.toMatchObject({ status: 415 });
  await expect(readJsonBody(new Request("https://example.com", { method: "POST", headers: { "content-type": "application/json" }, body: "{" }))).rejects.toMatchObject({ status: 400 });
});
test("configured distributed limiter failures never fall back to an unlimited request", async () => {
  process.env.UPSTASH_REDIS_REST_URL = "https://redis.example.com";
  process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
  globalThis.fetch = (async () => new Response("unavailable", { status: 500 })) as unknown as typeof fetch;
  await expect(enforceRateLimit("test-account", 5, 60000)).rejects.toThrow("unavailable");
});
test("CMS links reject executable and protocol-relative URLs", () => {
  for (const link of ["javascript:alert(1)", "data:text/html,test", "//evil.example", "/\\evil.example", "https://user:pass@example.com"]) expect(contentLinkSchema.safeParse(link).success).toBe(false);
  for (const link of ["/program", "https://example.com", "mailto:help@example.com"]) expect(contentLinkSchema.safeParse(link).success).toBe(true);
});
test("production CSP permits nonce scripts while denying inline and eval scripts", () => {
  const csp = buildContentSecurityPolicy("testnonce", false);
  const scripts = csp.split(";").find(directive => directive.trim().startsWith("script-src"));
  expect(scripts).toContain("'nonce-testnonce'");
  expect(scripts).not.toContain("unsafe-inline");
  expect(scripts).not.toContain("unsafe-eval");
});
test("booking requests reject forged identity, duplicate rooms and reversed schedules", () => {
  const booking = { roomIds: ["AST-1"], payload: { bookingStart: "2026-10-06", bookingEnd: "2026-10-06", startTime: "08:00", endTime: "09:00", name: "Peminjam", institutionName: "PPKASN" } };
  expect(bookingApiSchema.safeParse(booking).success).toBe(true);
  expect(bookingApiSchema.safeParse({ ...booking, roomIds: ["AST-1", "AST-1"] }).success).toBe(false);
  expect(bookingApiSchema.safeParse({ ...booking, payload: { ...booking.payload, userId: "admin" } }).success).toBe(false);
  expect(bookingApiSchema.safeParse({ ...booking, payload: { ...booking.payload, endTime: "07:00" } }).success).toBe(false);
  expect(bookingApiSchema.safeParse({ ...booking, payload: { ...booking.payload, bookingStart: "2026-02-30" } }).success).toBe(false);
});


test("login stops the sixth account attempt before contacting the auth provider", async () => {
  const previousOrigin = process.env.APP_ORIGIN;
  const previousCaptcha = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const previousRequired = process.env.REQUIRE_DISTRIBUTED_RATE_LIMIT;
  delete process.env.APP_ORIGIN;
  delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  delete process.env.REQUIRE_DISTRIBUTED_RATE_LIMIT;
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  try {
    const { login } = await import("@/features/auth/services/auth-service");
    const form = new FormData();
    form.set("email", `audit-${Date.now()}@example.com`);
    form.set("password", "invalid-password");
    const before = providerCalls;
    for (let attempt = 0; attempt < 5; attempt++) {
      const result = await login({}, form);
      expect(result?.error).toContain("Email atau password tidak valid");
      expect(result?.error).not.toContain("provider detail");
    }
    expect((await login({}, form))?.error).toContain("Terlalu banyak percobaan");
    expect(providerCalls - before).toBe(5);
  } finally {
    if (previousOrigin === undefined) delete process.env.APP_ORIGIN; else process.env.APP_ORIGIN = previousOrigin;
    if (previousCaptcha === undefined) delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY; else process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = previousCaptcha;
    if (previousRequired === undefined) delete process.env.REQUIRE_DISTRIBUTED_RATE_LIMIT; else process.env.REQUIRE_DISTRIBUTED_RATE_LIMIT = previousRequired;
  }
});


test("restore rejects dangerous nested keys and excessive nesting before database writes", () => {
  expect(restoreRecordsSchema.safeParse([{ id: "AST-1", name: "Aset", capacity: 10 }]).success).toBe(true);
  expect(restoreRecordsSchema.safeParse(JSON.parse('[{"payload":{"__proto__":{"admin":true}}}]')).success).toBe(false);
  expect(restoreRecordsSchema.safeParse([{ payload: { a: { b: { c: { d: { e: { f: 1 } } } } } } }]).success).toBe(false);
});
