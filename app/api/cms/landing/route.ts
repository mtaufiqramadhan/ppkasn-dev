import { NextRequest, NextResponse } from "next/server";
import { CmsStore, CmsLandingData } from "@/lib/cms-store";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const data = CmsStore.getLandingData();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load landing data" },
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

    const body = (await request.json()) as CmsLandingData;
    if (!body || !Array.isArray(body.heroSlides) || !Array.isArray(body.generalInfo)) {
      return NextResponse.json({ error: "Format data tidak valid" }, { status: 400 });
    }

    CmsStore.saveLandingData(body);
    return NextResponse.json({ success: true, message: "Beranda berhasil diperbarui", data: body });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update landing data" },
      { status: 500 }
    );
  }
}
