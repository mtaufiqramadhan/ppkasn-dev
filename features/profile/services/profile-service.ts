import { apiClient } from "@/lib/api-client";
import type { CmsProfileData, CmsStrategicPillar } from "@/lib/cms-store";

export type { CmsProfileData, CmsStrategicPillar };

const DEFAULT_PROFILE_FALLBACK: CmsProfileData = {
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

export const ProfileService = {
  async getProfileData(): Promise<CmsProfileData> {
    try {
      const res = await apiClient<{ success: boolean; data: CmsProfileData }>("/api/cms/profile");
      if (res.data && res.data.orgStructure && res.data.strategicPolicy) {
        return res.data;
      }
    } catch (err) {
      console.warn("Failed to fetch profile from API, using static fallback:", err);
    }
    return DEFAULT_PROFILE_FALLBACK;
  },

  async updateProfileData(payload: Partial<CmsProfileData>): Promise<void> {
    await apiClient("/api/cms/profile", {
      method: "PUT",
      body: payload as unknown as Record<string, unknown>,
    });
  },
};
