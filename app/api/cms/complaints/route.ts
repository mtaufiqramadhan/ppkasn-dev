import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CmsStore } from "@/lib/cms-store";
import { cmsComplaintContentSchema, complaintStatusUpdateSchema } from "@/features/complaint/server";
import { requireCmsAdmin, guardMutation, readJsonBody, securityFailure } from "@/lib/security/request-guard";

export async function GET() {
  try {
    await requireCmsAdmin();
    return NextResponse.json({ success: true, data: CmsStore.getComplaints() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return securityFailure(error); }
}

export async function PUT(request: NextRequest) {
  try {
    await requireCmsAdmin();
    await guardMutation(request, "cms-complaints");
    const body = await readJsonBody(request);
    const update = complaintStatusUpdateSchema.safeParse(body);
    const data = CmsStore.getComplaints();
    if (update.success) {
      const ticket = data.tickets.find(item => item.ticketNumber === update.data.ticketNumber);
      if (!ticket) return NextResponse.json({ error: "Tiket tidak ditemukan." }, { status: 404 });
      ticket.status = update.data.status;
      if (update.data.statusNotes !== undefined) ticket.statusNotes = update.data.statusNotes;
      ticket.updatedAt = new Intl.DateTimeFormat("id-ID", { dateStyle: "full", timeStyle: "short" }).format(new Date());
      CmsStore.saveComplaints(data);
      return NextResponse.json({ success: true, data: ticket });
    }
    const content = cmsComplaintContentSchema.safeParse(body);
    if (!content.success || !Object.keys(content.data).length) return NextResponse.json({ error: "Payload pengaduan tidak valid." }, { status: 400 });
    const updated = { ...data, ...content.data };
    CmsStore.saveComplaints(updated);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) { return securityFailure(error); }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireCmsAdmin();
    await guardMutation(request, "cms-complaints");
    const parsed = z.string().trim().min(1).max(100).safeParse(request.nextUrl.searchParams.get("ticketNumber"));
    if (!parsed.success) return NextResponse.json({ error: "Nomor tiket tidak valid." }, { status: 400 });
    const data = CmsStore.getComplaints();
    const filtered = data.tickets.filter(ticket => ticket.ticketNumber !== parsed.data);
    if (filtered.length === data.tickets.length) return NextResponse.json({ error: "Tiket tidak ditemukan." }, { status: 404 });
    CmsStore.saveComplaints({ ...data, tickets: filtered });
    return NextResponse.json({ success: true });
  } catch (error) { return securityFailure(error); }
}
