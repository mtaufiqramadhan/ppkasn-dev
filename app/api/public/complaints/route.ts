import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { CmsStore } from "@/lib/cms-store";
import { complaintSubmissionSchema } from "@/features/complaint/server";
import { guardMutation, readJsonBody, securityFailure } from "@/lib/security/request-guard";

export async function POST(request: NextRequest) {
  try {
    await guardMutation(request, "public-complaint", 5, 15 * 60000);
    const parsed = complaintSubmissionSchema.safeParse(await readJsonBody(request, 16 * 1024));
    if (!parsed.success) return NextResponse.json({ error: "Data pengaduan tidak valid." }, { status: 400 });
    const body = parsed.data;
    const ticketNumber = `PPK-${new Date().getFullYear()}-${randomBytes(16).toString("hex").toUpperCase()}`;
    const now = new Intl.DateTimeFormat("id-ID", { dateStyle: "full", timeStyle: "short" }).format(new Date());
    const ticket = {
      ...body, ticketNumber, reporterName: body.isAnonymous ? "Anonim" : body.reporterName || "Masyarakat",
      submittedAt: now, updatedAt: now, status: "TERKIRIM" as const,
      statusNotes: "Laporan telah masuk ke dalam sistem dan menunggu verifikasi petugas.",
    };
    const data = CmsStore.getComplaints();
    data.tickets.unshift(ticket);
    CmsStore.saveComplaints(data);
    return NextResponse.json({ success: true, data: ticket }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) { return securityFailure(error); }
}
