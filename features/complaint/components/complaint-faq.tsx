import React from "react";
import { HelpCircle } from "lucide-react";

const FAQS = [
  {
    q: "Apakah identitas saya aman jika mengirimkan pengaduan?",
    a: "Sangat aman. PPKASN Kemensetneg menjamin perlindungan kerahasiaan identitas pelapor sesuai ketentuan perlindungan saksi dan whistleblower kenegaraan. Anda juga dapat memilih opsi 'Lapor Secara Anonim'.",
  },
  {
    q: "Berapa lama laporan saya akan ditindaklanjuti?",
    a: "Verifikasi awal kelengkapan laporan dilakukan dalam 1x24 jam kerja. Penanganan substantif berkoordinasi dengan unit terkait rata-rata memakan waktu 3 hingga 5 hari kerja tergantung kompleksitas permasalahan.",
  },
  {
    q: "Bagaimana cara saya memantau perkembangan penanganan pengaduan?",
    a: "Setelah formulir terkirim, Anda akan mendapatkan kode tiket unik (contoh: PPK-2026-XXXX). Masukkan kode tersebut pada tab 'Lacak Status' di halaman ini untuk melihat tahapan penanganan secara langsung.",
  },
  {
    q: "Laporan seperti apa saja yang dapat diajukan ke PPKASN?",
    a: "Kritik atau keluhan seputar fasilitas ruang kelas, aula, asrama, penyelenggaraan diklat, pelayanan widyaiswara/narasumber, dugaan pelanggaran kode etik/integritas, serta saran perbaikan mutu.",
  },
];

export function ComplaintFaq() {
  return (
    <section className="mt-12 sm:mt-16 pt-10 sm:pt-14 border-t border-neutral-200/80 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="size-4 text-neutral-400" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Pertanyaan Umum
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-neutral-950 dark:text-white mb-8">
          Seputar Layanan Pengaduan &amp; Aspirasi
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/70 dark:border-neutral-800/70 space-y-2"
            >
              <h3 className="text-sm font-bold text-neutral-950 dark:text-white">
                {faq.q}
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
