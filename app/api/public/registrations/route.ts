import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { CmsStore } from "@/lib/cms-store";
import { getStoredPrograms, programRegistrationSchema } from "@/features/program/server";
import type { RegistrationSubmission } from "@/features/program";
import { guardMutation, readJsonBody, securityFailure } from "@/lib/security/request-guard";

export async function POST(request: NextRequest) {
  try {
    await guardMutation(request, "public-registration", 5, 15 * 60000);
    const parsed = programRegistrationSchema.strict().safeParse(await readJsonBody(request, 32 * 1024));
    if (!parsed.success) return NextResponse.json({ error: "Data pendaftaran tidak valid." }, { status: 400 });
    const values = parsed.data;
    const program = getStoredPrograms().find(item => item.id === values.programId);
    const sub = program?.subPelatihan?.find(item => values.subPelatihanId ? item.id === values.subPelatihanId : item.title === values.subPelatihan);
    if (!program || !sub) return NextResponse.json({ error: "Program atau subpelatihan tidak ditemukan." }, { status: 400 });
    if ((sub.status || program.status) !== "buka") return NextResponse.json({ error: "Pendaftaran subpelatihan belum dibuka atau telah ditutup." }, { status: 409 });
    const registrations = CmsStore.getRegistrations();
    if (registrations.some(item => item.programId === program.id && item.subPelatihanId === sub.id && item.nip === values.nip)) return NextResponse.json({ error: "Pendaftaran untuk subpelatihan ini sudah diterima." }, { status: 409 });
    const submission: RegistrationSubmission = {
      ...values,
      registrationCode: `REG-PPKASN-${new Date().getFullYear()}-${randomBytes(16).toString("hex").toUpperCase()}`,
      submittedAt: new Intl.DateTimeFormat("id-ID", { dateStyle: "full", timeStyle: "short" }).format(new Date()),
      programId: program.id, programTitle: program.title, programType: program.type,
      subPelatihan: sub.title, subPelatihanId: sub.id,
      phone: values.whatsapp, status: "Menunggu Seleksi Administrasi",
    };
    registrations.unshift(submission);
    CmsStore.saveRegistrations(registrations);
    return NextResponse.json({ success: true, data: submission }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) { return securityFailure(error); }
}
