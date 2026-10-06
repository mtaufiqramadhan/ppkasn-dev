"use client";

import React from "react";
import type { CmsComplaintChannel } from "../services/complaint-service";

export interface ComplaintChannelsProps {
  channelsTitle?: string;
  channelsDescription?: string;
  channels?: CmsComplaintChannel[];
  commitment1?: string;
  commitment2?: string;
}

const DEFAULT_CHANNELS: CmsComplaintChannel[] = [
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
];

export function ComplaintChannels({
  channelsTitle = "Saluran Resmi Pengaduan",
  channelsDescription = "Pilih saluran pengaduan resmi di bawah ini untuk menyampaikan saran, masukan, keluhan, atau laporan kendala Anda:",
  channels = DEFAULT_CHANNELS,
  commitment1 = "Kami sangat menghargai setiap masukan yang Anda berikan dan berkomitmen untuk terus meningkatkan mutu pelayanan kami.",
  commitment2 = "Terima kasih telah berpartisipasi dalam upaya kami untuk menjadi lebih baik.",
}: ComplaintChannelsProps) {
  const activeChannels = channels.filter((c) => c.isActive !== false);

  return (
    <section className="pt-2 sm:pt-4">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Section Header */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-white tracking-tight leading-tight">
            {channelsTitle}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-300 w-full leading-loose">
            {channelsDescription}
          </p>
        </div>

        {/* Dynamic Grid of Channels */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeChannels.map((channel) => (
            <div
              key={channel.id}
              className="group rounded-2xl sm:rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#141414] p-6 sm:p-7 shadow-none hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200 flex flex-col justify-between h-full"
            >
              <div>
                <div className="mb-3.5">
                  <span className="font-mono text-[11px] font-bold text-neutral-400 dark:text-neutral-500 block mb-1">
                    {channel.number}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-neutral-950 dark:text-white leading-snug">
                    {channel.name}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-loose mb-5 font-normal">
                  {channel.description}
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800/80 mt-auto">
                <a
                  href={channel.actionUrl}
                  target={channel.type === "external" || channel.type === "whatsapp" ? "_blank" : undefined}
                  rel={channel.type === "external" || channel.type === "whatsapp" ? "noopener noreferrer" : undefined}
                  className="inline-flex items-center text-xs font-semibold px-4 py-2 rounded-2xl sm:rounded-3xl bg-primary text-white hover:bg-primary/90 transition-colors shadow-none"
                >
                  {channel.actionText}
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Commitment Banner */}
        <div className="rounded-2xl sm:rounded-3xl border border-neutral-200/70 dark:border-neutral-800/70 bg-neutral-50/70 dark:bg-neutral-900/40 p-4 sm:p-5 text-center space-y-1">
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-loose">
            {commitment1}
          </p>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-loose">
            {commitment2}
          </p>
        </div>
      </div>
    </section>
  );
}
