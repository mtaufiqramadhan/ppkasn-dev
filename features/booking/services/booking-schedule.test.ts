import { expect, mock, test } from "bun:test";
import type { SupabaseClient } from "@supabase/supabase-js";
mock.module("server-only", () => ({}));
const { fetchBookingSchedule } = await import("./booking-schedule");
function client(rows: unknown[], rpcError: { code: string } | null = { code: "PGRST202" }) {
  const selections: string[] = [];
  const query = {
    select(value: string) { selections.push(value); return this; },
    eq() { return this; }, lte() { return this; },
    limit: async () => ({ data: rows, error: null }),
  };
  return { selections, backend: { from: () => query, rpc: async () => ({ data: rows, error: rpcError }) } as unknown as SupabaseClient };
}

test("verified admins can read schedules with their session client without service credentials", async () => {
  const row = { id: "booking-1", room_ids: ["AST-1"], created_at: "2026-10-06", status: "confirmed", payload: { bookingStart: "2026-10-06", bookingEnd: "2026-10-06", name: "Admin booking", phoneNumber: "private" } };
  const fixture = client([row]);
  expect(await fetchBookingSchedule(fixture.backend, true, "2026-10-01", "2026-10-31")).toEqual([row]);
  expect(fixture.selections[0]).toContain("payload");
});
test("public legacy projection only requests schedule fields and never returns personal information", async () => {
  const fixture = client([{ id: "booking-1", room_ids: ["AST-1"], created_at: "2026-10-06", status: "confirmed", booking_start: "2026-10-06", booking_end: "2026-10-06", start_time: "08:00", end_time: "09:00", name: "private", phoneNumber: "private" }]);
  const rows = await fetchBookingSchedule(fixture.backend, false, "2026-10-01", "2026-10-31");
  expect(fixture.selections[0]).not.toContain(", payload");
  expect(JSON.stringify(rows)).not.toContain("private");
  expect(rows[0].payload?.startTime).toBe("08:00");
});
test("public permission errors do not trigger a weaker database fallback", async () => {
  const fixture = client([], { code: "42501" });
  await expect(fetchBookingSchedule(fixture.backend, false, "2026-10-01", "2026-10-31")).rejects.toMatchObject({ code: "42501" });
  expect(fixture.selections).toHaveLength(0);
});
