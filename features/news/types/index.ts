export type NewsCategory =
  | "Semua"
  | "Forum & Kebijakan"
  | "Kepemimpinan"
  | "Transformasi Digital"
  | "Sarpras & Kediklatan"
  | "Prestasi & Akreditasi"
  | "Pengumuman";

export interface NewsAuthor {
  name: string;
  role: string;
  avatar?: string;
  department?: string;
}

export interface NewsArticleSection {
  heading?: string;
  paragraphs: string[];
  quote?: {
    text: string;
    speaker: string;
    speakerRole?: string;
  };
}

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: {
    lead: string;
    sections: NewsArticleSection[];
    keyTakeaways?: string[];
  };
  category: Exclude<NewsCategory, "Semua">;
  author: NewsAuthor;
  publishedAt: string;
  publishedDateIso: string;
  readTimeMinutes: number;
  image: string;
  imageCaption?: string;
  tags: string[];
  isFeatured?: boolean;
  viewsCount?: number;
}

export interface NewsFilterParams {
  category?: string;
  search?: string;
  sort?: "terbaru" | "terlama" | "populer";
  limit?: number;
}
