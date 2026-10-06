import { NextRequest, NextResponse } from "next/server";
import { CmsStore } from "@/lib/cms-store";
import { getStoredPrograms } from "@/features/program/server";
import { securityFailure } from "@/lib/security/request-guard";

export const dynamic = "force-dynamic";
export async function GET(_request: NextRequest, { params }: { params: Promise<{ section: string }> }) {
  try {
    const { section } = await params;
    let data: unknown;
    switch (section) {
      case "landing": data = CmsStore.getLandingData(); break;
      case "profile": data = CmsStore.getProfileData(); break;
      case "programs": data = getStoredPrograms(); break;
      case "complaints": {
        data = { ...CmsStore.getComplaints(), tickets: [] };
        break;
      }
      default: return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return securityFailure(error); }
}
