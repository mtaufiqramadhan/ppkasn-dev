import { apiClient } from "@/lib/api-client";
import type { CmsComplaintsData, CmsComplaintChannel } from "@/lib/cms-store";
import type { ComplaintTicket, ComplaintStatus } from "../types";

export type { CmsComplaintsData, CmsComplaintChannel };

const DEFAULT_COMPLAINTS_FALLBACK: CmsComplaintsData = {
  hero: {
    title: "Layanan Pengaduan",
    description:
      "Selamat datang di laman Pengaduan Kami. Kami berkomitmen untuk memberikan pelayanan terbaik bagi masyarakat. Oleh karena itu, kami menyediakan beberapa saluran pengaduan untuk memudahkan Anda menyampaikan saran, keluhan, atau melaporkan permasalahan yang Anda temui. Layanan ini terbuka untuk umum dan kami menjamin kerahasiaan identitas pelapor.",
  },
  bannerUrl: "/images/pengaduan-banner.webp",
  channelsTitle: "Saluran Resmi Pengaduan",
  channelsDescription:
    "Pilih saluran pengaduan resmi di bawah ini untuk menyampaikan saran, masukan, keluhan, atau laporan kendala Anda:",
  channels: [
    {
      id: "ch-01",
      number: "01",
      name: "WhatsApp Halo Gaharu",
      description:
        "Sampaikan keluhan anda melalui WhatsApp Halo Gaharu di nomor +62 821-1000-2114. Layanan ini aktif pada hari kerja (Senin–Jumat) pukul 09.00 s.d. 15.00 WIB.",
      actionText: "Kirim Pesan WhatsApp",
      actionUrl: "https://wa.me/6282110002114",
      type: "whatsapp",
      isActive: true,
    },
    {
      id: "ch-02",
      number: "02",
      name: "Kontak & Email Pengaduan",
      description:
        "Bagi Anda yang memerlukan koordinasi langsung atau ingin mengirimkan berkas pengaduan, silakan kirimkan pesan ke email resmi kami di ppkasn@setneg.go.id.",
      actionText: "Kirim Pesan Email",
      actionUrl: "mailto:ppkasn@setneg.go.id",
      type: "email",
      isActive: true,
    },
    {
      id: "ch-03",
      number: "03",
      name: "Gratifikasi Online (GOL KPK)",
      description:
        "Kanal resmi KPK untuk melaporkan penerimaan maupun penolakan gratifikasi dalam bentuk apa pun, demi menjaga integritas serta mencegah tindak pidana korupsi.",
      actionText: "Kunjungi Portal GOL KPK",
      actionUrl: "https://gol.kpk.go.id",
      type: "external",
      isActive: true,
    },
    {
      id: "ch-04",
      number: "04",
      name: "Whistleblowing System (WBS)",
      description:
        "Kanal khusus bagi Anda untuk melaporkan dugaan pelanggaran disiplin, penyimpangan kedinasan, atau benturan kepentingan dengan jaminan kerahasiaan identitas pelapor.",
      actionText: "Kunjungi Portal WBS",
      actionUrl: "https://wbs.lkpp.go.id/",
      type: "external",
      isActive: true,
    },
    {
      id: "ch-05",
      number: "05",
      name: "SP4N-LAPOR!",
      description:
        "Kanal pengaduan pelayanan publik nasional yang terhubung langsung dengan seluruh instansi pemerintah di Indonesia untuk menampung keluhan masyarakat terkait pelayanan publik.",
      actionText: "Kunjungi Portal SP4N-LAPOR!",
      actionUrl: "https://www.lapor.go.id/",
      type: "external",
      isActive: true,
    },
  ],
  commitment1:
    "Kami sangat menghargai setiap masukan yang Anda berikan dan berkomitmen untuk terus meningkatkan mutu pelayanan kami.",
  commitment2: "Terima kasih telah berpartisipasi dalam upaya kami untuk menjadi lebih baik.",
  tickets: [],
};

export const ComplaintService = {
  async getComplaintsData(): Promise<CmsComplaintsData> {
    try {
      const res = await apiClient<{ success: boolean; data: CmsComplaintsData }>(
        "/api/public/content/complaints"
      );
      if (res.data && res.data.channels) {
        return res.data;
      }
    } catch (err) {
      console.warn("Failed to load complaints from API, using fallback:", err);
    }
    return DEFAULT_COMPLAINTS_FALLBACK;
  },

  async updateComplaintsData(payload: Partial<CmsComplaintsData>): Promise<void> {
    await apiClient("/api/cms/complaints", {
      method: "PUT",
      body: Object.fromEntries(Object.entries(payload).filter(([key]) => key !== "tickets")),
    });
  },

  async getAllComplaints(): Promise<CmsComplaintsData> {
    const res = await apiClient<{ data: CmsComplaintsData }>("/api/cms/complaints");
    return res.data;
  },

  async trackTicket(ticketNumber: string): Promise<ComplaintTicket | null> {
    const clean = ticketNumber.trim().toUpperCase();
    try {
      const res = await apiClient<{ success: boolean; data: ComplaintTicket }>(
        "/api/public/complaints/track",
        { method: "POST", body: { ticketNumber: clean } }
      );
      if (res.data) {
        return res.data;
      }
    } catch {
      return null;
    }
    return null;
  },

  async submitComplaint(
    payload: Partial<ComplaintTicket>
  ): Promise<ComplaintTicket> {
    const res = await apiClient<{ success: boolean; data: ComplaintTicket }>(
      "/api/public/complaints",
      {
        method: "POST",
        body: payload as unknown as Record<string, unknown>,
      }
    );
    return res.data;
  },

  async updateTicketStatus(
    ticketNumber: string,
    status: ComplaintStatus,
    statusNotes?: string
  ): Promise<ComplaintTicket> {
    const res = await apiClient<{ success: boolean; data: ComplaintTicket }>(
      "/api/cms/complaints",
      {
        method: "PUT",
        body: { ticketNumber, status, statusNotes },
      }
    );
    return res.data;
  },

  async deleteTicket(ticketNumber: string): Promise<void> {
    await apiClient(`/api/cms/complaints?ticketNumber=${encodeURIComponent(ticketNumber)}`, {
      method: "DELETE",
    });
  },
};
