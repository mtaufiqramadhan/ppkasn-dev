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
      const res = await apiClient<{ success: boolean; data: ProgramItem[] }>("/api/public/content/programs", {
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
    const response = await apiClient<{ data: RegistrationSubmission }>("/api/public/registrations", {
      method: "POST",
      body: values as unknown as Record<string, unknown>,
    });
    return response.data;
  },

  async getAllRegistrations(): Promise<RegistrationSubmission[]> {
    try {
      const res = await apiClient<{ success: boolean; data: RegistrationSubmission[] }>(
        "/api/cms/programs/registrations"
      );
      return res.data;
    } catch (err) {
      console.warn("Failed to fetch registrations from API:", err);
      throw err;
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
