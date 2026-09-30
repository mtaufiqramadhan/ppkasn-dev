export interface ProfileVisionMission {
  vision: string;
  missions: string[];
}

export interface ProfileCoreValue {
  acronym: string;
  keyword: string;
  tagline: string;
  description: string;
  behaviors: string[];
}

export interface ProfileLeadership {
  name: string;
  role: string;
  nip?: string;
  bio: string;
  image: string;
}

export interface ProfileFacility {
  id: string;
  name: string;
  category: "Ruang Belajar" | "Ruang Pertemuan" | "Akomodasi" | "Penunjang";
  capacity: string;
  description: string;
  features: string[];
  image: string;
}

export interface ProfileMilestone {
  year: string;
  title: string;
  description: string;
}
