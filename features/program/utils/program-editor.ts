import type { ProgramItem, SubPelatihanItem } from "../types";
import { getProgramSubPelatihanList } from "./sub-pelatihan";

const MONTHS = ["januari", "februari", "maret", "april", "mei", "juni", "juli", "agustus", "september", "oktober", "november", "desember"];
function toInputDate(value: string): string {
  const match = value.trim().toLowerCase().match(/^(\d{1,2}) ([a-z]+) (\d{4})$/);
  if (!match) return value;
  const month = MONTHS.indexOf(match[2]);
  return month < 0 ? value : `${match[3]}-${String(month + 1).padStart(2, "0")}-${match[1].padStart(2, "0")}`;
}

/** Shared inheritance rules for the public detail and CMS drafts. */
export function resolveSubPelatihanDetails(program: ProgramItem, sub?: SubPelatihanItem): ProgramItem {
  if (!sub) return program;
  return {
    ...program,
    fullDescription: sub.description,
    duration: sub.duration ?? program.duration, hours: sub.hours ?? program.hours,
    objectives: sub.objectives ?? program.objectives, curriculum: sub.curriculum ?? program.curriculum,
    quota: sub.quota ?? program.quota, enrolledCount: sub.enrolledCount ?? program.enrolledCount,
    startDate: sub.startDate || program.startDate, endDate: sub.endDate || program.endDate,
    registrationDeadline: sub.registrationDeadline || program.registrationDeadline,
    status: sub.status ?? program.status, method: sub.method ?? program.method,
    location: sub.location ?? program.location, country: sub.country ?? program.country,
    targetAudience: sub.targetAudience ?? program.targetAudience,
    requirements: sub.requirements ?? program.requirements, facilities: sub.facilities ?? program.facilities,
    fundingScheme: sub.fundingScheme ?? program.fundingScheme, contactPerson: sub.contactPerson ?? program.contactPerson,
  };
}

export function prepareProgramForEditor(program: ProgramItem): ProgramItem & { subPelatihan: SubPelatihanItem[] } {
  return structuredClone({
    ...program, startDate: toInputDate(program.startDate), endDate: toInputDate(program.endDate), registrationDeadline: toInputDate(program.registrationDeadline),
    subPelatihan: getProgramSubPelatihanList(program).map(sub => {
      const details = resolveSubPelatihanDetails(program, sub);
      return {
        ...sub, duration: details.duration, hours: details.hours, objectives: details.objectives, curriculum: details.curriculum,
        quota: details.quota, enrolledCount: details.enrolledCount, startDate: toInputDate(details.startDate), endDate: toInputDate(details.endDate),
        registrationDeadline: toInputDate(details.registrationDeadline), status: details.status, method: details.method,
        location: details.location, country: details.country, targetAudience: details.targetAudience,
        requirements: details.requirements, facilities: details.facilities, fundingScheme: details.fundingScheme,
        contactPerson: details.contactPerson,
      };
    }),
  });
}

export function createProgramDraft(): ProgramItem & { subPelatihan: SubPelatihanItem[] } {
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: `prog-${crypto.randomUUID()}`, slug: "", type: "diklat", title: "", category: "Kepemimpinan & Manajerial",
    organizer: "Pusat Pengembangan Kompetensi ASN Kemensetneg", batch: "", duration: "", hours: 0,
    method: "Tatap Muka", location: "", startDate: today, endDate: today, registrationDeadline: today,
    status: "segera", quota: 0, enrolledCount: 0, targetAudience: "", shortDescription: "", fullDescription: "",
    objectives: [], curriculum: [], subPelatihan: [], requirements: [], facilities: [], fundingScheme: "",
    contactPerson: {name: "", role: "", email: "", phone: ""}, tags: [],
  };
}

export function createSubPelatihanDraft(program: ProgramItem): SubPelatihanItem {
  const {subPelatihan: [sub]} = prepareProgramForEditor({...program, subPelatihan: [{id: `sub-${crypto.randomUUID()}`, title: "", description: "", objectives: [], curriculum: []}]});
  return sub;
}
