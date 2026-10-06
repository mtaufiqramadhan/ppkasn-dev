import { expect, test } from "bun:test";
import { isCmsAdmin } from "./admin-policy";

test("ordinary authenticated users do not become CMS admins", () => {
  expect(isCmsAdmin({ email: "user@example.com", email_confirmed_at: "2026-01-01", app_metadata: {} }, "")).toBe(false);
  expect(isCmsAdmin(null)).toBe(false);
});
test("only confirmed allowlisted emails or trusted app metadata grant access", () => {
  expect(isCmsAdmin({ email: "ADMIN@example.com", email_confirmed_at: "2026-01-01" }, " admin@example.com ")).toBe(true);
  expect(isCmsAdmin({ email: "admin@example.com" }, "admin@example.com")).toBe(false);
  expect(isCmsAdmin({ app_metadata: { cms_role: "admin" } }, "")).toBe(true);
  expect(isCmsAdmin({ is_anonymous: true, app_metadata: { cms_role: "admin" } }, "")).toBe(false);
});
