import type { NewsArticle, NewsCategory, NewsFilterParams } from "../types";
import { NEWS_ARTICLES } from "./news-data";

export class NewsService {
  /**
   * Mengambil semua artikel berita dengan opsi filter dan pencarian
   */
  static getAllNews(params: NewsFilterParams = {}): NewsArticle[] {
    const { category, search, sort = "terbaru", limit } = params;

    let result = [...NEWS_ARTICLES];

    // Filter berdasarkan Kategori
    if (category && category !== "Semua") {
      const normalizedCat = category.toLowerCase().trim();
      result = result.filter(
        (article) => article.category.toLowerCase().trim() === normalizedCat
      );
    }

    // Filter berdasarkan Kata Kunci Pencarian
    if (search && search.trim()) {
      const query = search.toLowerCase().trim();
      result = result.filter((article) => {
        const titleMatch = article.title.toLowerCase().includes(query);
        const excerptMatch = article.excerpt.toLowerCase().includes(query);
        const tagMatch = article.tags.some((tag) => tag.toLowerCase().includes(query));
        const authorMatch = article.author.name.toLowerCase().includes(query);
        return titleMatch || excerptMatch || tagMatch || authorMatch;
      });
    }

    // Sorting
    if (sort === "terbaru") {
      result.sort(
        (a, b) =>
          new Date(b.publishedDateIso).getTime() - new Date(a.publishedDateIso).getTime()
      );
    } else if (sort === "terlama") {
      result.sort(
        (a, b) =>
          new Date(a.publishedDateIso).getTime() - new Date(b.publishedDateIso).getTime()
      );
    } else if (sort === "populer") {
      result.sort((a, b) => (b.viewsCount ?? 0) - (a.viewsCount ?? 0));
    }

    if (typeof limit === "number" && limit > 0) {
      result = result.slice(0, limit);
    }

    return result;
  }

  /**
   * Mengambil artikel utama yang di-highlight / headline
   */
  static getFeaturedNews(): NewsArticle | undefined {
    return (
      NEWS_ARTICLES.find((article) => article.isFeatured) || NEWS_ARTICLES[0]
    );
  }

  /**
   * Mengambil artikel berdasarkan slug atau id unik
   */
  static getNewsBySlug(slugOrId: string): NewsArticle | undefined {
    if (!slugOrId) return undefined;
    const clean = decodeURIComponent(slugOrId).toLowerCase().trim();
    return NEWS_ARTICLES.find(
      (article) =>
        article.slug.toLowerCase() === clean || article.id.toLowerCase() === clean
    );
  }

  /**
   * Mengambil daftar artikel terkait untuk halaman detail
   */
  static getRelatedNews(currentSlugOrId: string, limit: number = 3): NewsArticle[] {
    const current = this.getNewsBySlug(currentSlugOrId);
    if (!current) {
      return NEWS_ARTICLES.slice(0, limit);
    }

    // Prioritaskan kategori yang sama, kecualikan artikel yang sedang dibaca
    const sameCategory = NEWS_ARTICLES.filter(
      (a) => a.id !== current.id && a.category === current.category
    );

    if (sameCategory.length >= limit) {
      return sameCategory.slice(0, limit);
    }

    const others = NEWS_ARTICLES.filter(
      (a) => a.id !== current.id && a.category !== current.category
    );

    return [...sameCategory, ...others].slice(0, limit);
  }

  /**
   * Mengambil seluruh daftar kategori beserta jumlah artikelnya
   */
  static getCategoriesWithCount(): { name: NewsCategory; count: number }[] {
    const categories: NewsCategory[] = [
      "Semua",
      "Forum & Kebijakan",
      "Kepemimpinan",
      "Transformasi Digital",
      "Sarpras & Kediklatan",
      "Prestasi & Akreditasi",
    ];

    return categories.map((cat) => {
      if (cat === "Semua") {
        return { name: cat, count: NEWS_ARTICLES.length };
      }
      const count = NEWS_ARTICLES.filter((a) => a.category === cat).length;
      return { name: cat, count };
    });
  }

  /**
   * Mengambil semua slug unik untuk keperluan static metadata / generateStaticParams
   */
  static getAllSlugs(): string[] {
    return NEWS_ARTICLES.map((a) => a.slug);
  }
}
