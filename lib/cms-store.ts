import fs from "fs";
import path from "path";
import { MOCK_PROGRAMS } from "@/features/program/data/mock-programs";
import type { ComplaintTicket } from "@/features/complaint/types";
import type { ProgramItem, RegistrationSubmission } from "@/features/program/types";

const DATA_DIR = path.join(process.cwd(), "data", "cms");

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJsonFile<T>(filename: string, defaultValue: T): T {
  ensureDirectoryExists();
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), "utf-8");
      return defaultValue;
    }
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content) as T;
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return defaultValue;
  }
}

function writeJsonFile<T>(filename: string, data: T): void {
  ensureDirectoryExists();
  const filePath = path.join(DATA_DIR, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    throw error;
  }
}

// -------------------------------------------------------------
// 1. BERANDA (Landing Page)
// -------------------------------------------------------------
export interface CmsHeroSlide {
  id: string;
  label: string;
  imageUrl: string;
  tagline?: string;
  isActive: boolean;
}

export interface CmsSpbeApp {
  id: string;
  name: string;
  fullName: string;
  description: string;
  image?: string;
  isBookingLogo?: boolean;
  link: string;
  isExternal: boolean;
  tag: string;
  status: string;
}

export interface CmsGeneralInfoItem {
  id: string;
  title: string;
  desc: string;
  actionType: "download" | "detail";
  link: string;
  type: "dokumen" | "link";
  category?: string;
}

export interface CmsSocialLink {
  id: string;
  name: string;
  handle: string;
  url: string;
}

export interface CmsLandingData {
  heroSlides: CmsHeroSlide[];
  spbeApps: CmsSpbeApp[];
  generalInfo: CmsGeneralInfoItem[];
  socials: CmsSocialLink[];
  announcement?: {
    enabled: boolean;
    text: string;
    link?: string;
  };
}

const DEFAULT_LANDING_DATA: CmsLandingData = {
  heroSlides: [
    {
      id: "gedung-ppkasn",
      label: "Gedung PPKASN Kemensetneg",
      imageUrl: "/images/hero-gedung-ppkasn.webp",
      tagline: "Pusat Pengembangan Kompetensi Aparatur Sipil Negara Berkelas Dunia",
      isActive: true,
    },
  ],
  spbeApps: [
    {
      id: "pionir",
      name: "PIONIR",
      fullName: "PIONIR Kemensetneg",
      description: "Portal digital integrasi administrasi dan layanan kediklatan ASN Kemensetneg RI.",
      image:
        "https://ppkasn.setneg.go.id/wp-content/uploads/elementor/thumbs/2-ri92ef2oxyv1ujx7r6pq7jtlf78166kwmqhi9g53z0.png",
      link: "https://pionir.setneg.go.id/",
      isExternal: true,
      tag: "E-Office & Layanan",
      status: "Aktif",
    },
    {
      id: "poster",
      name: "POSTER",
      fullName: "POSTER PPKASN",
      description: "Portal asesmen kompetensi dan pemetaan potensi aparatur sipil negara terpadu.",
      image: "https://ppkasn.setneg.go.id/wp-content/uploads/2026/01/1.png",
      link: "https://poster.setneg.go.id/",
      isExternal: true,
      tag: "Assessment Center",
      status: "Aktif",
    },
    {
      id: "pintar",
      name: "PINTAR",
      fullName: "PINTAR Kemensetneg",
      description: "Learning Management System (LMS) kediklatan dan pengembangan kapasitas aparatur.",
      image:
        "https://ppkasn.setneg.go.id/wp-content/uploads/elementor/thumbs/3-ri92ebbc6mpwk42od537xkrr1nqkbe5za7vkccaonw.png",
      link: "https://pintar.setneg.go.id/",
      isExternal: true,
      tag: "LMS Kediklatan",
      status: "Aktif",
    },
    {
      id: "sarpras",
      name: "SARPRAS",
      fullName: "SARPRAS PPKASN",
      description: "Sistem reservasi ruang rapat, aula, kelas diklat, dan wisma asrama secara real-time.",
      isBookingLogo: true,
      link: "/meeting-room",
      isExternal: false,
      tag: "Reservasi Fasilitas",
      status: "Portal Ini",
    },
  ],
  generalInfo: [
    {
      id: "jadwal-ppkasn",
      title: "Jadwal PPKASN",
      desc: "Jadwal PPKASN Kemensetneg Tahun 2026",
      actionType: "download",
      link: "https://scloud.setneg.go.id/s/gFSjTsZdtYWzb6r",
      type: "dokumen",
      category: "Jadwal",
    },
    {
      id: "standar-pelayanan",
      title: "Standar Pelayanan",
      desc: "Dokumen Standar Pelayanan PPKASN Kemensetneg",
      actionType: "download",
      link: "https://scloud.setneg.go.id/s/wwCbFmwaHNPQgCQ",
      type: "dokumen",
      category: "Pelayanan",
    },
    {
      id: "maklumat-pelayanan",
      title: "Maklumat Pelayanan",
      desc: "Maklumat Pelayanan PPKASN Kemensetneg",
      actionType: "detail",
      link: "https://lh3.googleusercontent.com/u/0/d/1nQSsCVudLbhayns9kLeu4Sa2fjnYCbMC",
      type: "dokumen",
      category: "Pelayanan",
    },
    {
      id: "hasil-survei",
      title: "Hasil Survei",
      desc: "Informasi Hasil Survei Kepuasan PPKASN",
      actionType: "detail",
      link: "https://ppkasn.setneg.go.id/hasil-survei-ppkasn/",
      type: "link",
      category: "Survei",
    },
    {
      id: "pemenuhan-pkasn",
      title: "Pemenuhan PKASN",
      desc: "Informasi Pemenuhan Kewajiban PKASN Tahun 2026",
      actionType: "detail",
      link: "https://ppkasn.setneg.go.id/pemenuhan-hak-pkasn/",
      type: "link",
      category: "Informasi",
    },
    {
      id: "ikm",
      title: "IKM",
      desc: "Indeks Kepuasan Masyarakat terhadap Layanan PPKASN",
      actionType: "detail",
      link: "https://ppkasn.setneg.go.id/penyampaian-hasil-survei-ppkasn/",
      type: "link",
      category: "Survei",
    },
    {
      id: "tarif-pelatihan",
      title: "Daftar Tarif Pelatihan",
      desc: "Informasi Tarif Pelatihan PPKASN Tahun 2026",
      actionType: "detail",
      link: "https://ppkasn.setneg.go.id/daftar-tarif-pelatihan/",
      type: "link",
      category: "Tarif",
    },
    {
      id: "tarif-ruangan",
      title: "Daftar Tarif Ruangan",
      desc: "Informasi Tarif Peminjaman Ruangan PPKASN Tahun 2026",
      actionType: "detail",
      link: "https://ppkasn.setneg.go.id/daftar-tarif-ruangan/",
      type: "link",
      category: "Tarif",
    },
    {
      id: "kompensasi",
      title: "Kompensasi Pelayanan",
      desc: "Kompensasi apabila terjadi ketidaksesuaian layanan",
      actionType: "detail",
      link: "https://ppkasn.setneg.go.id/kompensasi/",
      type: "link",
      category: "Pelayanan",
    },
  ],
  socials: [
    {
      id: "instagram",
      name: "Instagram",
      handle: "@ppkasn.kemensetneg",
      url: "https://www.instagram.com/ppkasn.kemensetneg/",
    },
    {
      id: "youtube",
      name: "YouTube",
      handle: "@ppkasnkemensetneg",
      url: "https://www.youtube.com/@ppkasnkemensetneg",
    },
    {
      id: "whatsapp",
      name: "WhatsApp Halo Gaharu",
      handle: "+62 821-1000-2114",
      url: "https://wa.me/6282110002114",
    },
  ],
  announcement: {
    enabled: true,
    text: "Pendaftaran Diklat Kepemimpinan dan Pelatihan Luar Negeri Angkatan 2026 telah dibuka!",
    link: "/program",
  },
};

// -------------------------------------------------------------
// 2. PROFIL PPKASN (Profile Page) - Exactly Matches /profil
// -------------------------------------------------------------
export interface CmsStrategicPillar {
  number: string;
  title: string;
  description: string;
}

export interface CmsProfileData {
  orgStructure: {
    title: string;
    subtitle: string;
    imageUrl: string;
  };
  strategicPolicy: {
    title: string;
    intro: string;
    pillars: CmsStrategicPillar[];
  };
}

const DEFAULT_PROFILE_DATA: CmsProfileData = {
  orgStructure: {
    title: "Struktur Organisasi",
    subtitle: "Pusat Pengembangan Kompetensi Aparatur Sipil Negara Kementerian Sekretariat Negara",
    imageUrl: "/images/struktur-organisasi.webp",
  },
  strategicPolicy: {
    title: "Kebijakan dan Program Strategis",
    intro:
      "Sejalan dengan amanat Undang-Undang Republik Indonesia Nomor 20 Tahun 2023 tentang Aparatur Sipil Negara, Pusat Pengembangan Kompetensi Aparatur Sipil Negara (PPKASN) Kementerian Sekretariat Negara melakukan transformasi strategis pengembangan kompetensi melalui penerapan Sistem Pembelajaran Terintegrasi (Corporate University). Pendekatan ini menegaskan peran PPKASN tidak hanya sebagai penyelenggara pelatihan, tetapi sebagai learning center strategis yang terintegrasi dengan kebutuhan organisasi, manajemen talenta, dan arah pembangunan sumber daya manusia aparatur.",
    pillars: [
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
    ],
  },
};

// -------------------------------------------------------------
// 3. LAYANAN PENGADUAN (Complaints Page) - Exactly Matches /pengaduan
// -------------------------------------------------------------
export interface CmsComplaintChannel {
  id: string;
  number: string;
  name: string;
  description: string;
  actionText: string;
  actionUrl: string;
  type: "whatsapp" | "email" | "external";
  isActive: boolean;
}

export interface CmsComplaintsData {
  hero: {
    title: string;
    description: string;
  };
  bannerUrl: string;
  channelsTitle: string;
  channelsDescription: string;
  channels: CmsComplaintChannel[];
  commitment1: string;
  commitment2: string;
  tickets: ComplaintTicket[];
}

const DEFAULT_COMPLAINTS_DATA: CmsComplaintsData = {
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

// -------------------------------------------------------------
// CMS STORE FACADE
// -------------------------------------------------------------
export const CmsStore = {
  // Beranda
  getLandingData(): CmsLandingData {
    return readJsonFile<CmsLandingData>("landing.json", DEFAULT_LANDING_DATA);
  },
  saveLandingData(data: CmsLandingData): void {
    writeJsonFile("landing.json", data);
  },

  // Programs
  getPrograms(): ProgramItem[] {
    return readJsonFile<ProgramItem[]>("programs.json", MOCK_PROGRAMS);
  },
  savePrograms(data: ProgramItem[]): void {
    writeJsonFile("programs.json", data);
  },

  // Program Registrations
  getRegistrations(): RegistrationSubmission[] {
    return readJsonFile<RegistrationSubmission[]>("registrations.json", []);
  },
  saveRegistrations(data: RegistrationSubmission[]): void {
    writeJsonFile("registrations.json", data);
  },

  // Profile (Struktur Organisasi & Kebijakan Strategis)
  getProfileData(): CmsProfileData {
    return readJsonFile<CmsProfileData>("profile.json", DEFAULT_PROFILE_DATA);
  },
  saveProfileData(data: CmsProfileData): void {
    writeJsonFile("profile.json", data);
  },

  // Complaints (Layanan Pengaduan & Saluran Resmi)
  getComplaints(): CmsComplaintsData {
    return readJsonFile<CmsComplaintsData>("complaints.json", DEFAULT_COMPLAINTS_DATA);
  },
  saveComplaints(data: CmsComplaintsData): void {
    writeJsonFile("complaints.json", data);
  },
};
