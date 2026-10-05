import { MOCK_PROGRAMS } from "../data/mock-programs";
import {
  ProgramCategory,
  ProgramFilterOptions,
  ProgramItem,
  RegistrationSubmission,
} from "../types";
import { ProgramRegistrationFormValues } from "../schemas/program-schema";

const STORAGE_KEY = "ppkasn_program_registrations";

export const ProgramService = {
  getAllPrograms(filters?: ProgramFilterOptions): ProgramItem[] {
    let result = [...MOCK_PROGRAMS];

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

  getProgramById(id: string): ProgramItem | undefined {
    return MOCK_PROGRAMS.find((p) => p.id === id);
  },

  getProgramBySlug(slug: string): ProgramItem | undefined {
    return MOCK_PROGRAMS.find((p) => p.slug === slug);
  },

  getProgramBySlugOrId(identifier: string): ProgramItem | undefined {
    return (
      MOCK_PROGRAMS.find((p) => p.slug === identifier) ||
      MOCK_PROGRAMS.find((p) => p.id === identifier)
    );
  },

  getAllSlugs(): string[] {
    return MOCK_PROGRAMS.map((p) => p.slug);
  },

  getCategories(): ProgramCategory[] {
    const set = new Set<ProgramCategory>();
    MOCK_PROGRAMS.forEach((p) => set.add(p.category));
    return Array.from(set);
  },

  getStats() {
    const total = MOCK_PROGRAMS.length;
    const diklatCount = MOCK_PROGRAMS.filter((p) => p.type === "diklat").length;
    const lnCount = MOCK_PROGRAMS.filter((p) => p.type === "luar-negeri").length;
    const openCount = MOCK_PROGRAMS.filter((p) => p.status === "buka").length;
    return {
      total,
      diklatCount,
      lnCount,
      openCount,
    };
  },

  async submitRegistration(
    values: ProgramRegistrationFormValues
  ): Promise<RegistrationSubmission> {
    // Simulate network delay for realistic enterprise feel
    await new Promise((resolve) => setTimeout(resolve, 800));

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
      // Backwards compatibility
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
