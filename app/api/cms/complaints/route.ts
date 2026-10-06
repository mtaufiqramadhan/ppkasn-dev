import { NextRequest, NextResponse } from "next/server";
import { CmsStore, type CmsComplaintsData } from "@/lib/cms-store";
import { createClient } from "@/lib/supabase/server";
import { ComplaintTicket, ComplaintStatus } from "@/features/complaint/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ticketNumber = searchParams.get("ticketNumber");

    const data = CmsStore.getComplaints();

    // If searching for a specific ticket (e.g. public tracker)
    if (ticketNumber) {
      const clean = ticketNumber.trim().toUpperCase();
      const ticket = data.tickets.find((t: ComplaintTicket) => t.ticketNumber.toUpperCase() === clean);
      if (!ticket) {
        return NextResponse.json({ error: "Tiket tidak ditemukan" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: ticket });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load complaints" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<ComplaintTicket>;
    if (!body.title || !body.description || !body.category) {
      return NextResponse.json(
        { error: "Judul, kategori, dan deskripsi pengaduan wajib diisi" },
        { status: 400 }
      );
    }

    const data = CmsStore.getComplaints();
    const ticketNumber =
      body.ticketNumber ||
      `PPK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const now = new Date();
    const formattedDate = new Intl.DateTimeFormat("id-ID", {
      dateStyle: "full",
      timeStyle: "short",
    }).format(now);

    const newTicket: ComplaintTicket = {
      ticketNumber,
      category: body.category,
      title: body.title,
      description: body.description,
      isAnonymous: !!body.isAnonymous,
      reporterName: body.isAnonymous ? "Anonim" : body.reporterName || "Masyarakat",
      agency: body.agency || "-",
      submittedAt: formattedDate,
      status: "TERKIRIM",
      statusNotes: "Laporan telah masuk ke dalam sistem dan menunggu verifikasi petugas.",
      updatedAt: formattedDate,
    };

    data.tickets.unshift(newTicket);
    CmsStore.saveComplaints(data);

    return NextResponse.json({
      success: true,
      message: "Pengaduan berhasil dikirim",
      data: newTicket,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create complaint" },
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

    // Mode A: Updating whole complaints content (hero, channels, banner, commitment)
    if (body.hero || body.channels || body.bannerUrl) {
      const current = CmsStore.getComplaints();
      const updated: CmsComplaintsData = {
        ...current,
        ...(body.hero && { hero: body.hero }),
        ...(body.bannerUrl && { bannerUrl: body.bannerUrl }),
        ...(body.channelsTitle && { channelsTitle: body.channelsTitle }),
        ...(body.channelsDescription && { channelsDescription: body.channelsDescription }),
        ...(body.channels && { channels: body.channels }),
        ...(body.commitment1 && { commitment1: body.commitment1 }),
        ...(body.commitment2 && { commitment2: body.commitment2 }),
      };
      CmsStore.saveComplaints(updated);
      return NextResponse.json({
        success: true,
        message: "Pengaturan saluran pengaduan berhasil disimpan",
        data: updated,
      });
    }

    // Mode B: Updating ticket status
    if (body.ticketNumber) {
      const data = CmsStore.getComplaints();
      const ticket = data.tickets.find((t: ComplaintTicket) => t.ticketNumber === body.ticketNumber);

      if (!ticket) {
        return NextResponse.json({ error: "Tiket tidak ditemukan" }, { status: 404 });
      }

      const now = new Date();
      const formattedDate = new Intl.DateTimeFormat("id-ID", {
        dateStyle: "full",
        timeStyle: "short",
      }).format(now);

      if (body.status) ticket.status = body.status;
      if (body.statusNotes !== undefined) ticket.statusNotes = body.statusNotes;
      ticket.updatedAt = formattedDate;

      CmsStore.saveComplaints(data);

      return NextResponse.json({
        success: true,
        message: "Tiket pengaduan berhasil diperbarui",
        data: ticket,
      });
    }

    return NextResponse.json({ error: "Payload tidak valid" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update complaint" },
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
    const ticketNumber = searchParams.get("ticketNumber");

    if (!ticketNumber) {
      return NextResponse.json({ error: "Nomor tiket wajib disertakan" }, { status: 400 });
    }

    const data = CmsStore.getComplaints();
    const initialLength = data.tickets.length;
    data.tickets = data.tickets.filter((t: ComplaintTicket) => t.ticketNumber !== ticketNumber);

    if (data.tickets.length === initialLength) {
      return NextResponse.json({ error: "Tiket tidak ditemukan" }, { status: 404 });
    }

    CmsStore.saveComplaints(data);
    return NextResponse.json({ success: true, message: "Tiket pengaduan berhasil dihapus" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete complaint" },
      { status: 500 }
    );
  }
}
