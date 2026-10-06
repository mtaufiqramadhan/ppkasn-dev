import { NextRequest, NextResponse } from "next/server";
import { cmsLandingSchema } from "@/features/landing/server";
import { CmsStore } from "@/lib/cms-store";
import { requireCmsAdmin, guardMutation, readJsonBody, securityFailure } from "@/lib/security/request-guard";

export async function GET() {
  try {
    await requireCmsAdmin();
    const data = CmsStore.getLandingData();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return securityFailure(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireCmsAdmin();
    await guardMutation(request, "cms-landing");

    const parsed = cmsLandingSchema.safeParse(await readJsonBody(request));
    if (!parsed.success) return NextResponse.json({ error: "Format data beranda tidak valid." }, { status: 400 });
    const body = parsed.data;

    CmsStore.saveLandingData(body);
    return NextResponse.json({ success: true, message: "Beranda berhasil diperbarui", data: body });
  } catch (error) {
    return securityFailure(error);
  }
}
