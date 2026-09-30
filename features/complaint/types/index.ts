export type ComplaintCategory =
  | "Sarana & Prasarana"
  | "Penyelenggaraan Diklat"
  | "Pelanggaran & Integritas (WBS)"
  | "Saran & Rekomendasi Layanan";

export type ComplaintStatus =
  | "TERKIRIM"
  | "DIVERIFIKASI"
  | "SEDANG_DITINDAKLANJUTI"
  | "SELESAI";

export interface ComplaintTicket {
  ticketNumber: string;
  category: ComplaintCategory;
  title: string;
  description: string;
  isAnonymous: boolean;
  reporterName: string;
  agency?: string;
  submittedAt: string;
  status: ComplaintStatus;
  statusNotes?: string;
  updatedAt?: string;
}

export interface ComplaintChannel {
  name: string;
  description: string;
  actionText: string;
  url: string;
  iconName: "globe" | "mail" | "phone" | "shield";
  badge?: string;
}
