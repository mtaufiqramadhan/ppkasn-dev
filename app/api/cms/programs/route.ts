import { NextRequest, NextResponse } from "next/server";
import { CmsStore } from "@/lib/cms-store";
import { createClient } from "@/lib/supabase/server";
import { cmsProgramSchema, getStoredPrograms } from "@/features/program/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let programs = getStoredPrograms();

    if (type && type !== "all") {
      programs = programs.filter((p) => p.type === type);
    }
    if (category && category !== "all") {
      programs = programs.filter((p) => p.category === category);
    }
    if (status && status !== "all") {
      programs = programs.filter((p) => p.status === status);
    }
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      programs = programs.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.organizer.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ success: true, data: programs }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch programs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = cmsProgramSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`).join("; ") }, { status: 400 });
    const newProgram = parsed.data;
    const programs = CmsStore.getPrograms();
    if (programs.some(program => program.id === newProgram.id || program.slug === newProgram.slug)) {
      return NextResponse.json({ error: "ID atau alamat program sudah digunakan" }, { status: 409 });
    }

    programs.unshift(newProgram);
    CmsStore.savePrograms(programs);

    return NextResponse.json({
      success: true,
      message: "Program berhasil ditambahkan",
      data: newProgram,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create program" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = cmsProgramSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`).join("; ") }, { status: 400 });
    const body = parsed.data;

    const programs = CmsStore.getPrograms();
    const index = programs.findIndex((p) => p.id === body.id);

    if (index === -1) {
      return NextResponse.json({ error: "Program tidak ditemukan" }, { status: 404 });
    }

    if (programs.some(program => program.id !== body.id && program.slug === body.slug)) {
      return NextResponse.json({ error: "Alamat program sudah digunakan" }, { status: 409 });
    }
    programs[index] = body;
    CmsStore.savePrograms(programs);

    return NextResponse.json({
      success: true,
      message: "Program berhasil diperbarui",
      data: programs[index],
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update program" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Program ID diperlukan" }, { status: 400 });
    }

    const programs = CmsStore.getPrograms();
    const filtered = programs.filter((p) => p.id !== id);

    if (filtered.length === programs.length) {
      return NextResponse.json({ error: "Program tidak ditemukan" }, { status: 404 });
    }

    CmsStore.savePrograms(filtered);
    return NextResponse.json({ success: true, message: "Program berhasil dihapus" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete program" },
      { status: 500 }
    );
  }
}
