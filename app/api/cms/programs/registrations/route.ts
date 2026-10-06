import { NextRequest, NextResponse } from "next/server";
import { CmsStore } from "@/lib/cms-store";
import { createClient } from "@/lib/supabase/server";
import { RegistrationSubmission } from "@/features/program/types";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const registrations = CmsStore.getRegistrations() as RegistrationSubmission[];
    return NextResponse.json({ success: true, data: registrations });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load registrations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RegistrationSubmission;
    if (!body.programId || !body.fullName || !body.nip) {
      return NextResponse.json(
        { error: "Data pendaftaran tidak lengkap (Program, Nama, NIP wajib)" },
        { status: 400 }
      );
    }

    const registrations = CmsStore.getRegistrations() as RegistrationSubmission[];
    registrations.unshift(body);
    CmsStore.saveRegistrations(registrations);

    // Also increment enrolledCount on the program
    const programs = CmsStore.getPrograms() as { id: string; enrolledCount: number }[];
    const prog = programs.find((p) => p.id === body.programId);
    if (prog) {
      prog.enrolledCount = (prog.enrolledCount || 0) + 1;
      CmsStore.savePrograms(programs as any);
    }

    return NextResponse.json({
      success: true,
      message: "Pendaftaran berhasil disimpan",
      data: body,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save registration" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { registrationCode, status } = await request.json();
    if (!registrationCode || !status) {
      return NextResponse.json(
        { error: "registrationCode dan status wajib disertakan" },
        { status: 400 }
      );
    }

    const registrations = CmsStore.getRegistrations() as RegistrationSubmission[];
    const item = registrations.find((r) => r.registrationCode === registrationCode);
    if (!item) {
      return NextResponse.json({ error: "Data pendaftaran tidak ditemukan" }, { status: 404 });
    }

    item.status = status;
    CmsStore.saveRegistrations(registrations);

    return NextResponse.json({
      success: true,
      message: "Status pendaftaran berhasil diperbarui",
      data: item,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update registration" },
      { status: 500 }
    );
  }
}
