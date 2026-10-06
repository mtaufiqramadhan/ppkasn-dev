import { NextRequest, NextResponse } from "next/server";
import { cmsProfileSchema } from "@/features/profile/server";
import { CmsStore } from "@/lib/cms-store";
import { requireCmsAdmin, guardMutation, readJsonBody, securityFailure } from "@/lib/security/request-guard";

export async function GET() {
  try {
    await requireCmsAdmin();
    const data = CmsStore.getProfileData();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return securityFailure(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireCmsAdmin();
    await guardMutation(request, "cms-profile");

    const parsed = cmsProfileSchema.partial().safeParse(await readJsonBody(request));
    if (!parsed.success) return NextResponse.json({ error: "Format profil tidak valid." }, { status: 400 });
    const current = CmsStore.getProfileData();
    const updated = { ...current, ...parsed.data };

    CmsStore.saveProfileData(updated);
    return NextResponse.json({
      success: true,
      message: "Profil PPKASN berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    return securityFailure(error);
  }
}
