import { ProgramItem, SubPelatihanItem } from "../types";

/**
 * Returns sub pelatihan list for a program.
 * Alur: Pelatihan -> didalamnya ada banyak Sub Pelatihan -> di dalam Sub Pelatihan ada kurikulum & silabus modul tersendiri.
 */
export function getProgramSubPelatihanList(program: ProgramItem): SubPelatihanItem[] {
  if (program.subPelatihan && program.subPelatihan.length > 0) {
    return program.subPelatihan;
  }

  // Predefined realistic sub-pelatihan based on program ID or Category
  if (program.id === "diklat-pka-2026-1" || program.category === "Kepemimpinan & Manajerial") {
    return [
      {
        id: `${program.id}-sub-1`,
        code: "SUB-PKA-01",
        title: "Sub Pelatihan Manajemen Kinerja & Pelayanan Publik",
        duration: "3 Bulan (908 JP)",
        hours: 908,
        description:
          "Fokus pada peningkatan kapabilitas kepemimpinan operasional, manajemen akuntabilitas kinerja unit kerja, dan standardisasi pelayanan prima di instansi pemerintah.",
        objectives: [
          "Menerapkan kepemimpinan transformasional dalam tata kelola pelayanan publik.",
          "Menyusun strategi pencapaian target kinerja unit kerja berbasis akuntabilitas.",
          "Mengeksekusi proyek aksi perubahan peningkatan mutu layanan instansi.",
        ],
        curriculum: [
          {
            title: "Modul 1: Kepemimpinan Pancasila & Integritas Kinerja Pelayanan",
            duration: "18 JP",
            description: "Wawasan kebangsaan, etika birokrasi, dan penguatan nilai ASN BerAKHLAK.",
          },
          {
            title: "Modul 2: Diagnosis Organisasi & Inovasi Layanan Publik",
            duration: "108 JP",
            description: "Teknik pemetaan hambatan kinerja dan formulasi gagasan terobosan layanan.",
          },
          {
            title: "Modul 3: Manajemen Mutu & Pelayanan Publik Digital",
            duration: "162 JP",
            description: "Penerapan sistem penjaminan mutu dan pemanfaatan platform digital instansi.",
          },
          {
            title: "Modul 4: Aksi Perubahan Kinerja Pelayanan Publik",
            duration: "620 JP",
            description: "Implementasi, monitoring, dan seminar evaluasi proyek perubahan nyata.",
          },
        ],
      },
      {
        id: `${program.id}-sub-2`,
        code: "SUB-PKA-02",
        title: "Sub Pelatihan Transformasi Tata Kelola Digital & Sistem Informasi",
        duration: "3 Bulan (908 JP)",
        hours: 908,
        description:
          "Dirancang khusus untuk administrator yang memimpin modernisasi sistem kerja birokrasi, integrasi data SPBE, dan kepemimpinan digital (Digital Leadership).",
        objectives: [
          "Menguasai arsitektur SPBE dan interoperabilitas data pemerintahan.",
          "Memimpin transformasi budaya kerja birokrasi digital yang agile dan adaptif.",
          "Merancang Aksi Perubahan digitalisasi proses bisnis unit organisasi.",
        ],
        curriculum: [
          {
            title: "Modul 1: Digital Leadership & Budaya Kerja Kolaboratif",
            duration: "24 JP",
            description: "Konsep kepemimpinan digital dalam era disrupsi dan perubahan eksponensial.",
          },
          {
            title: "Modul 2: Arsitektur SPBE & Integrasi Layanan Pemerintahan",
            duration: "102 JP",
            description: "Penyelarasan proses bisnis, tata kelola data, dan keamanan informasi SPBE.",
          },
          {
            title: "Modul 3: Manajemen Proyek Digital & Pengelolaan Risiko TI",
            duration: "162 JP",
            description: "Metodologi agile, manajemen vendor/mitra teknologi, dan kepatuhan regulasi.",
          },
          {
            title: "Modul 4: Aksi Perubahan Sistem Kerja Digital",
            duration: "620 JP",
            description: "Implementasi prototipe inovasi digital dan evaluasi dampaknya pada efisiensi kerja.",
          },
        ],
      },
      {
        id: `${program.id}-sub-3`,
        code: "SUB-PKA-03",
        title: "Sub Pelatihan Manajemen Risiko & Akuntabilitas Anggaran",
        duration: "3 Bulan (908 JP)",
        hours: 908,
        description:
          "Berorientasi pada kepemimpinan pengawasan internal, mitigasi fraud, kepatuhan pengelolaan anggaran negara, dan akuntabilitas keuangan unit kerja.",
        objectives: [
          "Membangun kerangka manajemen risiko organisasi terintegrasi (MRI).",
          "Mencegah kebocoran anggaran dan meningkatkan transparansi pengadaan.",
          "Merumuskan Aksi Perubahan tata kelola kepatuhan dan efisiensi belanja instansi.",
        ],
        curriculum: [
          {
            title: "Modul 1: Integritas Keuangan Negara & Etika Pengelolaan Anggaran",
            duration: "20 JP",
            description: "Prinsip akuntabilitas APBN, sistem pengendalian intern pemerintah (SPIP).",
          },
          {
            title: "Modul 2: Identifikasi Risiko & Mitigasi Fraud Pengadaan",
            duration: "106 JP",
            description: "Metode audit kinerja, pemetaan risiko korupsi, dan whistleblowing system.",
          },
          {
            title: "Modul 3: Optimalisasi Kinerja Anggaran Berbasis Outcome",
            duration: "162 JP",
            description: "Perencanaan belanja strategis, evaluasi SAKIP, dan efisiensi operasional.",
          },
          {
            title: "Modul 4: Aksi Perubahan Penguatan Akuntabilitas & Kepatuhan",
            duration: "620 JP",
            description: "Uji coba perbaikan tata kelola pengawasan internal di unit kerja peserta.",
          },
        ],
      },
    ];
  }

  if (program.id === "diklat-protokoler-2026" || program.category === "Teknis Kepresidenan & Protokoler") {
    return [
      {
        id: `${program.id}-sub-1`,
        code: "SUB-PROT-01",
        title: "Sub Pelatihan Keprotokolan Acara Resmi Kenegaraan & Pengawalan VVIP",
        duration: "5 Hari Kerja (40 JP)",
        hours: 40,
        description:
          "Membekali petugas protokol dengan standar penanganan tata tempat, tata upacara, dan pergerakan rombongan resmi Presiden dan Wakil Presiden RI.",
        objectives: [
          "Menguasai regulasi UU No. 9 Tahun 2010 tentang Keprotokolan secara mendalam.",
          "Mampu menyusun rundown acara kenegaraan dengan tingkat presisi detik.",
          "Melakukan koordinasi taktis pengawalan pergerakan VVIP bersama Paspampres.",
        ],
        curriculum: [
          {
            title: "Modul 1: Landasan Yuridis & Standar Acara Kenegaraan",
            duration: "8 JP",
            description: "Tata tempat pejabat negara, lambang kenegaraan, dan etiket upacara resmi.",
          },
          {
            title: "Modul 2: Perencanaan Operasional & Tactical Floor Game (TFG)",
            duration: "12 JP",
            description: "Simulasi denah, rute pergerakan, dan mitigasi kontingensi di lapangan.",
          },
          {
            title: "Modul 3: Koordinasi Lintas Instansi & Pengamanan Terpadu",
            duration: "10 JP",
            description: "Sinergi dengan Paspampres, Sekretariat Militer Presiden, dan kepolisian.",
          },
          {
            title: "Modul 4: Simulasi Kunjungan Kerja Lapangan VVIP",
            duration: "10 JP",
            description: "Praktik langsung penanganan tamu kenegaraan di Istana Kepresidenan.",
          },
        ],
      },
      {
        id: `${program.id}-sub-2`,
        code: "SUB-PROT-02",
        title: "Sub Pelatihan Jamuan Kenegaraan & Etiket Diplomatik Internasional",
        duration: "5 Hari Kerja (40 JP)",
        hours: 40,
        description:
          "Fokus pada tata cara penyelenggaraan santap resmi VVIP (State Banquet), pairing menu, etiket internasional, dan penanganan delegasi negara sahabat.",
        objectives: [
          "Menguasai standar internasional Table Manners dan Service Protocol.",
          "Menyusun seating arrangement jamuan kenegaraan multi-negara.",
          "Memahami diplomasi budaya dan protokol lintas bangsa.",
        ],
        curriculum: [
          {
            title: "Modul 1: Tata Cara & Filosofi State Banquet",
            duration: "8 JP",
            description: "Sejarah, kaidah diplomatik, dan aturan protokoler jamuan makan resmi kenegaraan.",
          },
          {
            title: "Modul 2: Seating Arrangement & Protocol Precedence",
            duration: "10 JP",
            description: "Kaidah penataan tempat duduk kepala negara, menteri, dan duta besar.",
          },
          {
            title: "Modul 3: Praktik Table Manners & Menu Pairing Internasional",
            duration: "12 JP",
            description: "Pelayanan jamuan santap multi-course berstandar istana kepresidenan.",
          },
          {
            title: "Modul 4: Etiket Budaya Internasional & Penanganan Krisis Jamuan",
            duration: "10 JP",
            description: "Adaptasi pantangan makanan, etiket busana diplomatik, dan penanganan situasi darurat.",
          },
        ],
      },
      {
        id: `${program.id}-sub-3`,
        code: "SUB-PROT-03",
        title: "Sub Pelatihan Master of Ceremony (MC) & Pemandu Acara Kepresidenan",
        duration: "5 Hari Kerja (40 JP)",
        hours: 40,
        description:
          "Pelatihan intensif vokal, artikulasi, dan psikologi panggung khusus bagi pembawa acara resmi yang dihadiri Presiden, Wakil Presiden, dan tamu VVIP kenegaraan.",
        objectives: [
          "Menguasai teknik vocal projection, intonasi wibawa, dan penekanan kata kenegaraan.",
          "Menyusun naskah pemandu acara bilingual (Bahasa Indonesia & Bahasa Inggris).",
          "Mengatasi perubahan skenario mendadak dengan tenang dan profesional.",
        ],
        curriculum: [
          {
            title: "Modul 1: Olah Vokal, Diksi, & Karakter Suara Protokol",
            duration: "10 JP",
            description: "Pernapasan diafragma, intonasi sakral, dan artikulasi baku bahasa Indonesia.",
          },
          {
            title: "Modul 2: Teknik Penyusunan Naskah MC Resmi & Diplomatik",
            duration: "10 JP",
            description: "Struktur naskah, sebutan kehormatan resmi pejabat, dan format naskah bilingual.",
          },
          {
            title: "Modul 3: Stage Presence, Gestur, & Pengendalian Emosi",
            duration: "10 JP",
            description: "Bahasa tubuh formal, eye contact, mikrofon etiquette, dan busana panggung.",
          },
          {
            title: "Modul 4: Simulasi Live MC Acara Kenegaraan",
            duration: "10 JP",
            description: "Uji performa langsung di podium dengan umpan balik dari MC Kepresidenan senior.",
          },
        ],
      },
    ];
  }

  // Generic fallback: Generate 3 distinct and meaningful sub pelatihan tracks
  return [
    {
      id: `${program.id}-sub-1`,
      code: "SUB-01",
      title: `${program.title} - Kelas Utama & Implementasi Praktik`,
      duration: program.duration,
      hours: program.hours,
      description: `Mendalami kompetensi inti ${program.title} dengan kurikulum terstruktur yang menitikberatkan pada penguasaan teori fundamental, simulasi kasus riil, dan implementasi langsung di instansi.`,
      curriculum: program.curriculum && program.curriculum.length > 0
        ? program.curriculum
        : [
            {
              title: "Modul 1: Fondasi & Kebijakan Strategis",
              duration: "12 JP",
              description: "Pengantar kerangka regulasi dan prinsip dasar pelaksanaan program.",
            },
            {
              title: "Modul 2: Praktik & Studi Kasus Terapan",
              duration: "18 JP",
              description: "Simulasi pemecahan masalah dan analisis kasus riil di lapangan.",
            },
            {
              title: "Modul 3: Evaluasi & Rencana Tindak Lanjut",
              duration: "10 JP",
              description: "Penyusunan action plan dan presentasi hasil pembelajaran.",
            },
          ],
    },
    {
      id: `${program.id}-sub-2`,
      code: "SUB-02",
      title: `${program.title} - Kelas Khusus Akselerasi & Inovasi`,
      duration: program.duration,
      hours: program.hours,
      description: `Dirancang bagi peserta yang ingin memfokuskan pembelajaran pada terobosan inovasi, metodologi akselerasi hasil, dan pemanfaatan perangkat digital pendukung.`,
      curriculum: [
        {
          title: "Modul 1: Desain Inovasi & Pendekatan Berpikir Solutif",
          duration: "14 JP",
          description: "Metodologi design thinking untuk merumuskan terobosan efisiensi kerja.",
        },
        {
          title: "Modul 2: Pemanfaatan Teknologi & Automasi Proses",
          duration: "16 JP",
          description: "Penerapan alat bantu digital untuk mempercepat output kerja birokrasi.",
        },
        {
          title: "Modul 3: Showcase Proyek Inovasi Terapan",
          duration: "10 JP",
          description: "Pengujian prototipe inovasi dan penyusunan rekomendasi kebijakan unit kerja.",
        },
      ],
    },
  ];
}
