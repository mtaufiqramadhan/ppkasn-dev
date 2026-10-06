export type ProgramType = "diklat" | "luar-negeri";

export type ProgramCategory =
  | "Kepemimpinan & Manajerial"
  | "Teknis Kepresidenan & Protokoler"
  | "Transformasi Digital & AI"
  | "Hukum & Legal Drafting"
  | "Diplomasi & Kerja Sama Internasional"
  | "Pelayanan Publik & Komunikasi"
  | "Tata Kelola & Kebijakan Publik";

export type ProgramStatus = "buka" | "segera" | "penuh" | "selesai";

export type ProgramMethod =
  | "Blended Learning"
  | "Tatap Muka"
  | "Virtual Synchronous"
  | "On-site Internasional";

export interface ProgramCurriculumModule {
  title: string;
  duration?: string;
  description: string;
}

export interface SubPelatihanItem {
  id: string;
  code?: string;
  title: string;
  duration?: string;
  hours?: number;
  description: string;
  objectives?: string[];
  curriculum?: ProgramCurriculumModule[];
  quota?: number;
  enrolledCount?: number;
  startDate?: string;
  endDate?: string;
  registrationDeadline?: string;
  status?: ProgramStatus;
  method?: ProgramMethod;
  location?: string;
  country?: string;
  targetAudience?: string;
  requirements?: string[];
  facilities?: string[];
  fundingScheme?: string;
  contactPerson?: ProgramContactPerson;
}

export interface ProgramContactPerson {
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface ProgramItem {
  id: string;
  slug: string;
  type: ProgramType;
  title: string;
  category: ProgramCategory;
  organizer: string;
  batch: string;
  duration: string;
  hours: number; // JP (Jam Pelajaran)
  method: ProgramMethod;
  location: string;
  country?: string;
  countryFlag?: string; // Emoji or short code
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  status: ProgramStatus;
  quota: number;
  enrolledCount: number;
  targetAudience: string;
  shortDescription: string;
  fullDescription: string;
  objectives: string[];
  curriculum: ProgramCurriculumModule[];
  subPelatihan?: SubPelatihanItem[];
  requirements: string[];
  facilities: string[];
  fundingScheme: string; // e.g., "Dibiayai Penuh APBN", "Full International Scholarship"
  contactPerson: ProgramContactPerson;
  tags: string[];
  accentColor?: string;
}

export interface ProgramFilterOptions {
  type?: "all" | ProgramType;
  category?: string;
  status?: string;
  search?: string;
}

import type { SupportingDocumentItem } from "../schemas/program-schema";
export type { SupportingDocumentItem };

export interface RegistrationSubmission {
  registrationCode: string;
  submittedAt: string;
  programId: string;
  programTitle: string;
  programType: ProgramType;
  fullName: string;
  nip: string;
  whatsapp: string;
  phone: string;
  subPelatihan?: string;
  subPelatihanId?: string;
  memoFileName: string;
  memoNumber?: string;
  memoNotes?: string;
  supportingDocuments: SupportingDocumentItem[];
  // Optional / backwards-compatibility fields
  institution?: string;
  workUnit?: string;
  position?: string;
  rankGrade?: string;
  email?: string;
  englishScore?: string;
  motivation?: string;
  recommendationFileName?: string;
  commitmentFileName?: string;
  status: "Menunggu Seleksi Administrasi" | "Terverifikasi" | "Ditolak";
}

