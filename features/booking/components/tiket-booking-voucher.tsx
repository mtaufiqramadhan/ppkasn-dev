"use client";

import React from "react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { QRCodeSVG } from "qrcode.react";
import {
  Building2,
  Calendar,
  Clock,
  MapPin,
  User,
  Building,
  Phone,
  CheckCircle2,
  AlertCircle,
  FileText,
  Mail,
  Users,
  ShieldCheck,
  Check,
} from "lucide-react";
import { SuccessBookingDetails, ChisfisRoom } from "../types";

interface TiketBookingVoucherProps {
  booking: SuccessBookingDetails;
  room?: ChisfisRoom | null;
  className?: string;
}

export const TiketBookingVoucher: React.FC<TiketBookingVoucherProps> = ({
  booking,
  room,
  className = "",
}) => {
  const printDate = new Date();
  const orderId = `PPK-${booking.id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;

  // Amenities list for inclusion section
  const roomAmenities =
    room?.features && room.features.length > 0
      ? room.features
      : [
          "AC Sentral & Pengatur Suhu",
          "Layar Proyektor / Smart TV Display",
          "Sound System & Wireless Microphone",
          "Koneksi Internet Wi-Fi Cepat (PPKASN-Tamu)",
          "Meja & Kursi Ergonomis",
          "Stop Kontak Listrik per Meja",
          "Whiteboard & Spidol Presentasi",
          "Pendampingan Teknisi SARPRAS",
        ];

  return (
    <div
      className={`tiket-voucher-container bg-white text-neutral-900 w-full max-w-4xl mx-auto font-sans text-xs border border-neutral-300 rounded-2xl overflow-hidden shadow-sm print:shadow-none print:border print:rounded-none ${className}`}
      style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}
    >
      {/* 1. TOP BRAND ACCENT BAR (Tiket.com Signature Blue) */}
      <div className="h-2.5 bg-[#0064D2] w-full" />

      <div className="p-6 sm:p-8 space-y-5">
        {/* 2. VOUCHER HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b-2 border-neutral-200">
          {/* Brand & Title */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0064D2] text-white">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-wider text-neutral-900 uppercase leading-none block">
                  SARPRAS PPKASN
                </span>
                <span className="text-[10px] text-neutral-500 font-semibold tracking-wide uppercase">
                  KEMENTERIAN SEKRETARIAT NEGARA RI
                </span>
              </div>
            </div>
            <div className="pt-1">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 uppercase">
                E-TIKET / VOUCHER RESERVASI
              </h1>
              <p className="text-[11px] text-neutral-500 font-medium">
                Bukti Konfirmasi Resmi Peminjaman Fasilitas &amp; Sarana Prasarana
              </p>
            </div>
          </div>

          {/* Status & Order Identifiers */}
          <div className="flex flex-col sm:items-end space-y-1 bg-neutral-50 p-3 rounded-xl border border-neutral-200 min-w-[220px]">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-extrabold text-[11px] uppercase tracking-wide border border-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>STATUS: TERKONFIRMASI</span>
            </div>
            <div className="text-[11px] pt-1 text-right w-full">
              <div className="flex justify-between sm:justify-end gap-3 text-neutral-600">
                <span className="text-neutral-400 font-semibold">No. Pesanan:</span>
                <span className="font-mono font-bold text-neutral-900">{orderId}</span>
              </div>
              <div className="flex justify-between sm:justify-end gap-3 text-neutral-600">
                <span className="text-neutral-400 font-semibold">Kode Booking:</span>
                <span className="font-mono font-bold text-neutral-900">{booking.id}</span>
              </div>
              <div className="flex justify-between sm:justify-end gap-3 text-neutral-500 text-[10px] pt-0.5">
                <span>Diterbitkan:</span>
                <span>{format(printDate, "dd MMM yyyy, HH:mm", { locale: localeId })} WIB</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. IMPORTANT NOTICE ALERT (Tiket.com Style Notice) */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-950">
          <ShieldCheck className="h-5 w-5 text-[#0064D2] shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <span className="font-bold text-[#0064D2]">PENTING: </span>
            Tunjukkan e-voucher resmi ini kepada petugas SARPRAS saat memasuki area Gedung PPKASN Kemensetneg.
            Pemegang reservasi wajib mematuhi seluruh tata tertib dan prosedur operasional fasilitas negara yang berlaku.
          </div>
        </div>

        {/* 4. DETAIL PEMESAN & KONTAK (Guest & Contact Details) */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 pb-1 border-b border-neutral-200">
            <User className="h-4 w-4 text-[#0064D2]" />
            <h2 className="font-bold text-xs uppercase tracking-wider text-neutral-800">
              Data Penanggung Jawab &amp; Pemohon
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
                Nama Pemesan
              </span>
              <span className="text-xs font-bold text-neutral-900 block mt-0.5 truncate">
                {booking.name}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
                No. Telepon / WhatsApp
              </span>
              <span className="text-xs font-semibold text-neutral-900 block mt-0.5 truncate">
                {booking.phoneNumber || "-"}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
                Unit Kerja / Instansi
              </span>
              <span className="text-xs font-semibold text-neutral-900 block mt-0.5 truncate">
                {booking.institutionName}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
                Kategori Instansi
              </span>
              <span className="text-xs font-semibold text-neutral-900 block mt-0.5">
                {booking.institutionType || "Kemensetneg"}
              </span>
            </div>
          </div>
        </div>

        {/* 5. JADWAL PENGGUNAAN (Check-in & Check-out - Tiket.com Schedule Blocks) */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 pb-1 border-b border-neutral-200">
            <Calendar className="h-4 w-4 text-[#0064D2]" />
            <h2 className="font-bold text-xs uppercase tracking-wider text-neutral-800">
              Rincian Waktu &amp; Sesi Pemakaian
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Check-in / Mulai */}
            <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                <span>Mulai Akses (Check-in)</span>
                <Clock className="h-3.5 w-3.5 text-[#0064D2]" />
              </div>
              <p className="text-xs font-bold text-neutral-900">
                {format(new Date(booking.startDate), "EEEE, dd MMMM yyyy", { locale: localeId })}
              </p>
              <p className="text-sm font-black text-[#0064D2]">
                Pukul {booking.startTime} WIB
              </p>
            </div>

            {/* Check-out / Selesai */}
            <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                <span>Selesai Akses (Check-out)</span>
                <Clock className="h-3.5 w-3.5 text-neutral-500" />
              </div>
              <p className="text-xs font-bold text-neutral-900">
                {format(new Date(booking.endDate), "EEEE, dd MMMM yyyy", { locale: localeId })}
              </p>
              <p className="text-sm font-black text-neutral-800">
                Pukul {booking.endTime} WIB
              </p>
            </div>

            {/* Ringkasan Durasi & Kapasitas */}
            <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                Alokasi Peserta &amp; Tata Ruang
              </span>
              <p className="text-xs font-bold text-neutral-900">
                {booking.attendees ? `${booking.attendees} Orang Peserta` : `${room?.capacity || "-"} Orang Kapasitas`}
              </p>
              <p className="text-xs font-semibold text-neutral-600">
                Layout: {booking.roomSetup || "Standar / Fleksibel"}
              </p>
            </div>
          </div>
        </div>

        {/* 6. DETAIL FASILITAS & KEGIATAN */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 pb-1 border-b border-neutral-200">
            <Building className="h-4 w-4 text-[#0064D2]" />
            <h2 className="font-bold text-xs uppercase tracking-wider text-neutral-800">
              Informasi Fasilitas &amp; Agenda Acara
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
            <div className="space-y-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
                  Nama Ruangan / Fasilitas
                </span>
                <span className="text-sm font-extrabold text-neutral-900 block mt-0.5">
                  {booking.roomName}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
                  Lokasi Gedung
                </span>
                <span className="text-xs font-medium text-neutral-700 block mt-0.5 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#0064D2] shrink-0" />
                  Gedung PPKASN Kemensetneg, Lantai {room?.floor || "1"}, Jl. Gaharu I No. 1, Cilandak, Jakarta Selatan
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
                  Agenda / Nama Kegiatan
                </span>
                <span className="text-xs font-bold text-neutral-900 block mt-0.5">
                  {booking.purpose}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
                  Catatan / Kebutuhan Khusus
                </span>
                <span className="text-xs text-neutral-600 block mt-0.5 italic">
                  {booking.notes || "Tidak ada catatan tambahan."}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 7. FASILITAS TERMASUK (INCLUSIONS - Tiket.com "Fasilitas yang Anda Dapatkan") */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 pb-1 border-b border-neutral-200">
            <CheckCircle2 className="h-4 w-4 text-[#0064D2]" />
            <h2 className="font-bold text-xs uppercase tracking-wider text-neutral-800">
              Kelengkapan Fasilitas Termasuk
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
            {roomAmenities.map((amenity, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-[11px] text-neutral-800">
                <Check className="h-3.5 w-3.5 text-[#0064D2] shrink-0 mt-0.5" />
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 8. MANIFEST PESERTA (JIKA ASRAMA ATAU ADA DAFTAR PESERTA) */}
        {booking.participants && booking.participants.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#0064D2]" />
                <h2 className="font-bold text-xs uppercase tracking-wider text-neutral-800">
                  Daftar Tamu &amp; Peserta ({booking.participants.length} Orang)
                </h2>
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 overflow-hidden">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-neutral-100 text-neutral-600 font-bold uppercase text-[10px] border-b border-neutral-200">
                  <tr>
                    <th className="py-2 px-3 w-10">No</th>
                    <th className="py-2 px-3">Nama Lengkap</th>
                    <th className="py-2 px-3 w-20">Gender</th>
                    <th className="py-2 px-3">Unit Kerja</th>
                    <th className="py-2 px-3">Instansi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 bg-white">
                  {booking.participants.map((p, idx) => (
                    <tr key={p.id || idx}>
                      <td className="py-1.5 px-3 font-semibold text-neutral-500">{idx + 1}</td>
                      <td className="py-1.5 px-3 font-bold text-neutral-900">{p.name}</td>
                      <td className="py-1.5 px-3">
                        <span className="font-bold text-neutral-700">
                          {p.gender === "P" ? "Perempuan" : "Laki-laki"}
                        </span>
                      </td>
                      <td className="py-1.5 px-3 text-neutral-700">{p.unitKerja}</td>
                      <td className="py-1.5 px-3 text-neutral-700">{p.instansi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 9. TATA TERTIB & KETENTUAN FASILITAS (Check-in Policy & Terms) */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 pb-1 border-b border-neutral-200">
            <FileText className="h-4 w-4 text-[#0064D2]" />
            <h2 className="font-bold text-xs uppercase tracking-wider text-neutral-800">
              Tata Tertib &amp; Ketentuan Penggunaan Fasilitas
            </h2>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1.5 text-[10.5px] text-neutral-700 leading-relaxed">
            <div className="flex items-start gap-2">
              <span className="font-bold text-[#0064D2] min-w-[16px]">1.</span>
              <span>
                <strong>Konfirmasi Kehadiran:</strong> Penanggung jawab kegiatan diharapkan hadir minimal 15–30 menit sebelum sesi dimulai untuk pemeriksaan kesiapan ruangan bersama teknisi SARPRAS.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-[#0064D2] min-w-[16px]">2.</span>
              <span>
                <strong>Pengoperasian Alat:</strong> Penggunaan perangkat tata suara (sound system), proyektor, pencahayaan, dan AC sentral wajib didampingi atau dikoordinasikan dengan teknisi SARPRAS.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-[#0064D2] min-w-[16px]">3.</span>
              <span>
                <strong>Ketertiban &amp; Kebersihan:</strong> Dilarang merokok di seluruh area ruangan dan gedung. Seluruh peserta wajib menjaga kebersihan dan membuang sampah pada tempat yang disediakan.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-[#0064D2] min-w-[16px]">4.</span>
              <span>
                <strong>Area Konsumsi:</strong> Penyajian konsumsi rapat/makan siang hanya diperkenankan di selasar atau area pantry yang telah dialokasikan demi menjaga kebersihan fasilitas.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-[#0064D2] min-w-[16px]">5.</span>
              <span>
                <strong>Perubahan &amp; Pembatalan:</strong> Setiap penyesuaian jadwal atau pembatalan wajib dilaporkan kepada pengelola SARPRAS selambat-lambatnya 1 (satu) hari kerja sebelum jadwal.
              </span>
            </div>
          </div>
        </div>

        {/* 10. LAYANAN BANTUAN & CUSTOMER CARE (Tiket.com Style Helpdesk) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 text-[11px]">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0064D2] flex items-center gap-1">
              <Phone className="h-3 w-3" />
              Helpdesk Telepon
            </span>
            <p className="font-bold text-neutral-900">(021) 769-3265 / 769-3266</p>
            <p className="text-neutral-500 text-[10px]">Hari kerja: 08:00 - 16:30 WIB</p>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0064D2] flex items-center gap-1">
              <Phone className="h-3 w-3" />
              WhatsApp Pengelola
            </span>
            <p className="font-bold text-neutral-900">0812-8899-2026 (SARPRAS)</p>
            <p className="text-neutral-500 text-[10px]">Layanan pesan &amp; konfirmasi</p>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0064D2] flex items-center gap-1">
              <Mail className="h-3 w-3" />
              Email &amp; Lokasi
            </span>
            <p className="font-bold text-neutral-900">sarpras.ppkasn@setneg.go.id</p>
            <p className="text-neutral-500 text-[10px]">Gedung PPKASN, Cilandak, Jaksel</p>
          </div>
        </div>

        {/* 11. FOOTER OTENTIKASI DIGITAL, QR CODE & BARCODE */}
        <div className="pt-4 border-t-2 border-dashed border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white border border-neutral-300 rounded-lg shadow-xs shrink-0">
              <QRCodeSVG
                value={`https://ruangan-gaharu.ppkasn.setneg.go.id/booking/verify?id=${booking.id}`}
                size={64}
                level="M"
              />
            </div>
            <div className="space-y-0.5 text-left">
              <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block">
                Verifikasi Tiket Digital
              </span>
              <p className="text-[10.5px] font-semibold text-neutral-800 max-w-sm leading-snug">
                Dokumen ini merupakan bukti reservasi resmi yang sah dari Sistem Informasi Ruangan Gaharu PPKASN Kemensetneg RI.
              </p>
              <p className="text-[9.5px] text-neutral-400 font-mono">
                Security Hash: SHA256:{booking.id.replace(/-/g, "").slice(0, 16)}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-end space-y-1">
            <div className="flex items-center gap-[2px] h-8 px-2 bg-neutral-100 rounded border border-neutral-300">
              {[2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 1, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2].map(
                (w, i) => (
                  <span
                    key={i}
                    className="h-full bg-neutral-900 inline-block"
                    style={{ width: `${w * 1.5}px` }}
                  />
                )
              )}
            </div>
            <span className="text-[9px] font-mono tracking-widest text-neutral-500 font-bold">
              * {booking.id.toUpperCase()} *
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
