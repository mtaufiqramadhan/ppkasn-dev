import { MOCK_PROGRAMS } from "../data/mock-programs";
import {
  ProgramCategory,
  ProgramFilterOptions,
  ProgramItem,
  RegistrationSubmission,
} from "../types";
import { ProgramRegistrationFormValues } from "../schemas/program-schema";
import { apiClient } from "@/lib/api-client";

const STORAGE_KEY = "ppkasn_program_registrations";

let programsCache: ProgramItem[] = [...MOCK_PROGRAMS];

export const ProgramService = {
  // Sync accessor for existing UI components
  getAllPrograms(filters?: ProgramFilterOptions): ProgramItem[] {
    let result = [...programsCache];

    if (filters?.type && filters.type !== "all") {
      result = result.filter((item) => item.type === filters.type);
    }

    if (filters?.category && filters.category !== "all") {
      result = result.filter((item) => item.category === filters.category);
    }

    if (filters?.status && filters.status !== "all") {
      result = result.filter((item) => item.status === filters.status);
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.organizer.toLowerCase().includes(q) ||
          item.shortDescription.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          (item.country && item.country.toLowerCase().includes(q)) ||
          item.location.toLowerCase().includes(q) ||
          item.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    return result;
  },

  // Async loader that pulls live data from API and updates local memory cache
  async fetchLivePrograms(filters?: ProgramFilterOptions): Promise<ProgramItem[]> {
    try {
      const res = await apiClient<{ success: boolean; data: ProgramItem[] }>("/api/cms/programs", {
        params: {
          type: filters?.type !== "all" ? filters?.type : undefined,
          category: filters?.category !== "all" ? filters?.category : undefined,
          status: filters?.status !== "all" ? filters?.status : undefined,
          search: filters?.search || undefined,
        },
      });
      if (res.data && Array.isArray(res.data)) {
        if (!filters || (!filters.type && !filters.category && !filters.status && !filters.search)) {
          programsCache = res.data;
        }
        return res.data;
      }
    } catch (err) {
      console.warn("Failed to fetch live programs from API, using cached data:", err);
    }
    return this.getAllPrograms(filters);
  },

  getProgramById(id: string): ProgramItem | undefined {
    return programsCache.find((p) => p.id === id);
  },

  getProgramBySlug(slug: string): ProgramItem | undefined {
    return programsCache.find((p) => p.slug === slug);
  },

  getProgramBySlugOrId(identifier: string): ProgramItem | undefined {
    return (
      programsCache.find((p) => p.slug === identifier) ||
      programsCache.find((p) => p.id === identifier)
    );
  },

  getAllSlugs(): string[] {
    return programsCache.map((p) => p.slug);
  },

  getCategories(): ProgramCategory[] {
    const set = new Set<ProgramCategory>();
    programsCache.forEach((p) => set.add(p.category));
    return Array.from(set);
  },

  getStats() {
    const total = programsCache.length;
    const diklatCount = programsCache.filter((p) => p.type === "diklat").length;
    const lnCount = programsCache.filter((p) => p.type === "luar-negeri").length;
    const openCount = programsCache.filter((p) => p.status === "buka").length;
    return {
      total,
      diklatCount,
      lnCount,
      openCount,
    };
  },

  async fetchCmsPrograms(): Promise<ProgramItem[]> {
    const response = await apiClient<{ data: ProgramItem[] }>("/api/cms/programs", { cache: "no-store" });
    return response.data;
  },

  // CMS Mutators
  async createProgram(payload: Partial<ProgramItem>): Promise<ProgramItem> {
    const res = await apiClient<{ success: boolean; data: ProgramItem }>("/api/cms/programs", {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
    });
    programsCache.unshift(res.data);
    return res.data;
  },

  async updateProgram(payload: ProgramItem): Promise<ProgramItem> {
    const res = await apiClient<{ success: boolean; data: ProgramItem }>("/api/cms/programs", {
      method: "PUT",
      body: payload as unknown as Record<string, unknown>,
    });
    const index = programsCache.findIndex((p) => p.id === payload.id);
    if (index !== -1) {
      programsCache[index] = res.data;
    }
    return res.data;
  },

  async deleteProgram(id: string): Promise<void> {
    await apiClient(`/api/cms/programs?id=${id}`, {
      method: "DELETE",
    });
    programsCache = programsCache.filter((p) => p.id !== id);
  },

  // Registrations
  async submitRegistration(
    values: ProgramRegistrationFormValues
  ): Promise<RegistrationSubmission> {
    const registrationCode = `REG-PPKASN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const formattedDate = new Intl.DateTimeFormat("id-ID", {
      dateStyle: "full",
      timeStyle: "short",
    }).format(now);

    const submissionPhone = values.whatsapp || values.phone || "";
    const memoFile = values.memoFileName || values.recommendationFileName || "Memo_Surat_Usulan_Resmi.pdf";

    const submission: RegistrationSubmission = {
      registrationCode,
      submittedAt: formattedDate,
      programId: values.programId,
      programTitle: values.programTitle,
      programType: values.programType,
      fullName: values.fullName,
      nip: values.nip,
      subPelatihan: values.subPelatihan,
      subPelatihanId: values.subPelatihanId,
      whatsapp: submissionPhone,
      phone: submissionPhone,
      memoFileName: memoFile,
      memoNumber: values.memoNumber,
      memoNotes: values.memoNotes,
      supportingDocuments: values.supportingDocuments || [],
      institution: values.institution,
      workUnit: values.workUnit,
      position: values.position,
      rankGrade: values.rankGrade,
      email: values.email,
      englishScore: values.englishScore,
      motivation: values.motivation,
      recommendationFileName: memoFile,
      commitmentFileName: values.commitmentFileName,
      status: "Menunggu Seleksi Administrasi",
    };

    // Save to server API
    try {
      await apiClient("/api/cms/programs/registrations", {
        method: "POST",
        body: submission as unknown as Record<string, unknown>,
      });
    } catch (err) {
      console.warn("Failed to persist registration to server API, using local storage fallback:", err);
    }

    // Save to local storage for user's personal history
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const list: RegistrationSubmission[] = stored ? JSON.parse(stored) : [];
        list.unshift(submission);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      } catch (err) {
        console.error("Gagal menyimpan riwayat pendaftaran ke local storage", err);
      }
    }

    return submission;
  },

  async getAllRegistrations(): Promise<RegistrationSubmission[]> {
    try {
      const res = await apiClient<{ success: boolean; data: RegistrationSubmission[] }>(
        "/api/cms/programs/registrations"
      );
      return res.data;
    } catch (err) {
      console.warn("Failed to fetch registrations from API:", err);
      return this.getUserRegistrations();
    }
  },

  async updateRegistrationStatus(
    registrationCode: string,
    status: "Menunggu Seleksi Administrasi" | "Terverifikasi" | "Ditolak"
  ): Promise<void> {
    await apiClient("/api/cms/programs/registrations", {
      method: "PATCH",
      body: { registrationCode, status },
    });
  },

  getUserRegistrations(): RegistrationSubmission[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },
};
