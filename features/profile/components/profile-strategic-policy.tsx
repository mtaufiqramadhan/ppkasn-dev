import React from "react";

interface StrategicPillar {
  number: string;
  title: string;
  description: string;
}

const STRATEGIC_PILLARS: StrategicPillar[] = [
  {
    number: "01",
    title: "Competency Development Architect",
    description:
      "Dalam periode 2025–2029, PPKASN Kemensetneg mengimplementasikan Competency Development Architect yang dirancang untuk meningkatkan kapabilitas individu dan kinerja organisasi secara berkelanjutan. Sistem pembelajaran terintegrasi ini menghubungkan enam aspek utama, yaitu perencanaan dan penganggaran, penilaian kinerja, manajemen talenta dan karier, manajemen pengetahuan, teknologi pembelajaran, serta pembentukan budaya belajar berkelanjutan.",
  },
  {
    number: "02",
    title: "Setneg Competency Development Framework (SCDF) Versi 3",
    description:
      "Sebagai landasan implementasi, PPKASN Kemensetneg juga mengembangkan Setneg Competency Development Framework (SCDF) Versi 3 yang mengakomodasi pengembangan kompetensi secara komprehensif, meliputi kompetensi mandatori nasional, manajerial dan tata nilai institusi, kompetensi teknis umum dan penunjang, kompetensi teknis khusus sesuai rumpun jabatan, hingga pengembangan kompetensi pribadi. Kerangka ini memastikan setiap ASN memiliki learning path yang jelas, relevan, dan selaras dengan strategi organisasi di setiap fase perjalanan kariernya.",
  },
  {
    number: "03",
    title: "Integrasi Metode Pembelajaran & Orientasi Dampak",
    description:
      "PPKASN Kemensetneg juga memperkuat pendekatan pembelajaran melalui integrasi berbagai metode pengembangan, seperti pelatihan terstruktur, coaching dan mentoring, project assignment, benchmarking, komunitas belajar, serta praktik knowledge management. Pendekatan ini tidak hanya berorientasi pada pemenuhan jam pelatihan, tetapi pada penciptaan dampak nyata terhadap kinerja dan kontribusi organisasi, yang diukur melalui model evaluasi berjenjang hingga level hasil (result).",
  },
  {
    number: "04",
    title: "Ekosistem Pembelajaran Terbuka & Digital",
    description:
      "Tidak terbatas pada pemangku kepentingan internal, PPKASN Kemensetneg terus berperan aktif dalam ekosistem pengembangan kompetensi nasional melalui kolaborasi dengan kementerian/lembaga, institusi pendidikan, serta mitra strategis lainnya, baik di dalam maupun luar negeri. Pemanfaatan teknologi pembelajaran dan berbagai media alternatif menjadi pengungkit utama untuk memperluas akses, meningkatkan fleksibilitas, dan menjaga relevansi pembelajaran di tengah dinamika organisasi dan keterbatasan sumber daya.",
  },
];

export function ProfileStrategicPolicy() {
  return (
    <section className="pt-10 sm:pt-14 pb-8 sm:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 sm:mb-12 pb-6 border-b border-neutral-200/80 dark:border-neutral-800">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-950 dark:text-white tracking-tight leading-tight">
            Kebijakan dan Program Strategis
          </h2>
          <p className="mt-2 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 w-full leading-loose">
            Sejalan dengan amanat Undang-Undang Republik Indonesia Nomor 20 Tahun 2023 tentang Aparatur Sipil Negara, Pusat Pengembangan Kompetensi Aparatur Sipil Negara (PPKASN) Kementerian Sekretariat Negara melakukan transformasi strategis pengembangan kompetensi melalui penerapan Sistem Pembelajaran Terintegrasi (Corporate University). Pendekatan ini menegaskan peran PPKASN tidak hanya sebagai penyelenggara pelatihan, tetapi sebagai learning center strategis yang terintegrasi dengan kebutuhan organisasi, manajemen talenta, dan arah pembangunan sumber daya manusia aparatur.
          </p>
        </div>


        {/* 4 Strategic Pillars - Highly Legible Sequential Rows */}
        <div className="space-y-6 sm:space-y-8">
          {STRATEGIC_PILLARS.map((pillar) => (
            <div
              key={pillar.number}
              className="group rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-[#141414] p-6 sm:p-8 md:p-10 shadow-none hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                {/* Left Column: Number and Title */}
                <div className="lg:col-span-4">
                  <div className="mb-2.5">
                    <span className="font-mono text-2xl sm:text-3xl font-black text-primary select-none">
                      {pillar.number}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-950 dark:text-white leading-snug">
                    {pillar.title}
                  </h3>
                </div>

                {/* Right Column: Narrative Body */}
                <div className="lg:col-span-8 lg:border-l lg:border-neutral-100 lg:dark:border-neutral-800/80 lg:pl-8">
                  <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-loose font-normal">
                    {pillar.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
