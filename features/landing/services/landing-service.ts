import { apiClient } from "@/lib/api-client";
import type {
  CmsLandingData,
  CmsHeroSlide,
  CmsSpbeApp,
  CmsGeneralInfoItem,
  CmsSocialLink,
} from "@/lib/cms-store";

export type {
  CmsLandingData,
  CmsHeroSlide,
  CmsSpbeApp,
  CmsGeneralInfoItem,
  CmsSocialLink,
};

export const LandingService = {
  async getLandingData(): Promise<CmsLandingData> {
    try {
      const res = await apiClient<{ success: boolean; data: CmsLandingData }>("/api/cms/landing");
      return res.data;
    } catch (err) {
      console.warn("Failed to fetch landing data from API, using default fallback:", err);
      return {
        heroSlides: [
          {
            id: "gedung-ppkasn",
            label: "Gedung PPKASN Kemensetneg",
            imageUrl: "/images/hero-gedung-ppkasn.webp",
            tagline: "Pusat Pengembangan Kompetensi Aparatur Sipil Negara Berkelas Dunia",
            isActive: true,
          },
        ],
        spbeApps: [],
        generalInfo: [],
        socials: [],
      };
    }
  },

  async updateLandingData(data: CmsLandingData): Promise<void> {
    await apiClient("/api/cms/landing", {
      method: "PUT",
      body: data as unknown as Record<string, unknown>,
    });
  },
};
