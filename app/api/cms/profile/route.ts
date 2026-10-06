import { NextRequest, NextResponse } from "next/server";
import { CmsStore } from "@/lib/cms-store";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const data = CmsStore.getProfileData();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load profile data" },
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

    const body = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Payload profil tidak valid" }, { status: 400 });
    }

    const current = CmsStore.getProfileData();
    const updated = {
      ...current,
      ...body,
    };

    CmsStore.saveProfileData(updated);
    return NextResponse.json({
      success: true,
      message: "Profil PPKASN berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update profile data" },
      { status: 500 }
    );
  }
}
