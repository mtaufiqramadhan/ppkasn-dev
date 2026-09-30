import React from "react";

export function ComplaintChannels() {
  return (
    <section className="pt-2 sm:pt-4">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Section Header */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight leading-tight">
            Saluran Resmi Pengaduan
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-300 w-full leading-loose">
            Pilih saluran pengaduan resmi di bawah ini untuk menyampaikan saran, masukan, keluhan, atau laporan kendala Anda:
          </p>
        </div>

        {/* Row 1: 01 WhatsApp Halo Gaharu & 02 Kontak & Email Pengaduan (2 Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: WhatsApp Pengaduan Halo Gaharu */}
          <div className="group rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#141414] p-6 sm:p-7 shadow-none hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200 flex flex-col justify-between h-full">
            <div>
              <div className="mb-3.5">
                <span className="font-mono text-[11px] font-bold text-neutral-400 dark:text-neutral-500 block mb-1">
                  01
                </span>
                <h3 className="text-base sm:text-lg font-bold text-neutral-950 dark:text-white leading-snug">
                  WhatsApp Halo Gaharu
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-loose mb-5 font-normal">
                Sampaikan keluhan atau pertanyaan Anda secara langsung lewat chat WhatsApp Halo Gaharu di nomor +62 821-1000-2114. Layanan ini aktif pada hari kerja (Senin–Jumat) pukul 09.00 s.d. 15.00 WIB.
              </p>
            </div>

            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800/80 mt-auto">
              <a
                href="https://wa.me/6282110002114"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs font-semibold px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors shadow-none"
              >
                Kirim Pesan WhatsApp
              </a>
            </div>
          </div>

          {/* Card 2: Kontak & Email Pengaduan Langsung */}
          <div className="group rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#141414] p-6 sm:p-7 shadow-none hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200 flex flex-col justify-between h-full">
            <div>
              <div className="mb-3.5">
                <span className="font-mono text-[11px] font-bold text-neutral-400 dark:text-neutral-500 block mb-1">
                  02
                </span>
                <h3 className="text-base sm:text-lg font-bold text-neutral-950 dark:text-white leading-snug">
                  Kontak &amp; Email Pengaduan
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-loose mb-5 font-normal">
                Bagi Anda yang memerlukan koordinasi langsung atau ingin mengirimkan berkas pengaduan, silakan kirimkan pesan ke email resmi kami di ppkasn@setneg.go.id.
              </p>
            </div>

            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800/80 mt-auto">
              <a
                href="mailto:ppkasn@setneg.go.id"
                className="inline-flex items-center text-xs font-semibold px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors shadow-none"
              >
                Kirim Pesan Email
              </a>
            </div>
          </div>
        </div>

        {/* Row 2: 03 Gratifikasi Online, 04 Whistleblowing System, 05 SP4N-LAPOR! (3 Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 3: Gratifikasi Online (GOL KPK) */}
          <div className="group rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#141414] p-6 sm:p-7 shadow-none hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200 flex flex-col justify-between h-full">
            <div>
              <div className="mb-3.5">
                <span className="font-mono text-[11px] font-bold text-neutral-400 dark:text-neutral-500 block mb-1">
                  03
                </span>
                <h3 className="text-base sm:text-lg font-bold text-neutral-950 dark:text-white leading-snug">
                  Gratifikasi Online (GOL KPK)
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-loose mb-5 font-normal">
                Kanal resmi KPK untuk melaporkan penerimaan maupun penolakan gratifikasi dalam bentuk apa pun, demi menjaga integritas serta mencegah tindak pidana korupsi.
              </p>
            </div>

            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800/80 mt-auto">
              <a
                href="https://gol.kpk.go.id"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs font-semibold px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors shadow-none"
              >
                Kunjungi Portal GOL KPK
              </a>
            </div>
          </div>

          {/* Card 4: Whistleblowing System (WBS) */}
          <div className="group rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#141414] p-6 sm:p-7 shadow-none hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200 flex flex-col justify-between h-full">
            <div>
              <div className="mb-3.5">
                <span className="font-mono text-[11px] font-bold text-neutral-400 dark:text-neutral-500 block mb-1">
                  04
                </span>
                <h3 className="text-base sm:text-lg font-bold text-neutral-950 dark:text-white leading-snug">
                  Whistleblowing System (WBS)
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-loose mb-5 font-normal">
                Kanal khusus bagi Anda untuk melaporkan dugaan pelanggaran disiplin, penyimpangan kedinasan, atau benturan kepentingan dengan jaminan kerahasiaan identitas pelapor.
              </p>
            </div>

            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800/80 mt-auto">
              <a
                href="https://wbs.lkpp.go.id/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs font-semibold px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors shadow-none"
              >
                Kunjungi Portal WBS
              </a>
            </div>
          </div>

          {/* Card 5: SP4N-LAPOR! */}
          <div className="group rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#141414] p-6 sm:p-7 shadow-none hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200 flex flex-col justify-between h-full">
            <div>
              <div className="mb-3.5">
                <span className="font-mono text-[11px] font-bold text-neutral-400 dark:text-neutral-500 block mb-1">
                  05
                </span>
                <h3 className="text-base sm:text-lg font-bold text-neutral-950 dark:text-white leading-snug">
                  SP4N-LAPOR!
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-loose mb-5 font-normal">
                Kanal pengaduan pelayanan publik nasional yang terhubung langsung dengan seluruh instansi pemerintah di Indonesia untuk menampung keluhan masyarakat terkait pelayanan publik.
              </p>
            </div>

            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800/80 mt-auto">
              <a
                href="https://www.lapor.go.id/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs font-semibold px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors shadow-none"
              >
                Kunjungi Portal SP4N-LAPOR!
              </a>
            </div>
          </div>
        </div>

        {/* Commitment Banner */}
        <div className="rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 bg-neutral-50/70 dark:bg-neutral-900/40 p-4 sm:p-5 text-center space-y-1">
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-loose">
            Kami sangat menghargai setiap masukan yang Anda berikan dan berkomitmen untuk terus meningkatkan mutu pelayanan kami.
          </p>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-loose">
            Terima kasih telah berpartisipasi dalam upaya kami untuk menjadi lebih baik.
          </p>
        </div>
      </div>
    </section>
  );
}
