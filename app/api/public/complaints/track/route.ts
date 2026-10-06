import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CmsStore } from "@/lib/cms-store";
import { guardMutation, readJsonBody, securityFailure } from "@/lib/security/request-guard";

const lookup = z.object({ ticketNumber: z.string().trim().toUpperCase().regex(/^PPK-\d{4}-[A-F0-9]{32}$/) }).strict();
export async function POST(request: NextRequest) {
  try {
    await guardMutation(request, "complaint-tracker", 10, 60000);
    const parsed = lookup.safeParse(await readJsonBody(request, 1024));
    const ticket = parsed.success ? CmsStore.getComplaints().tickets.find(item => item.ticketNumber === parsed.data.ticketNumber) : undefined;
    if (!ticket) return NextResponse.json({ error: "Tiket tidak ditemukan." }, { status: 404 });
    const { ticketNumber, title, category, submittedAt, status, statusNotes, updatedAt } = ticket;
    return NextResponse.json({ success: true, data: { ticketNumber, title, category, submittedAt, status, statusNotes, updatedAt } }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return securityFailure(error); }
}
