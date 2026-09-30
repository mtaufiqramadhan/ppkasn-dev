import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/layout";
import { NewsDetailView, NewsService } from "@/features/news";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = NewsService.getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = NewsService.getNewsBySlug(slug);

  if (!article) {
    return {
      title: "Berita Tidak Ditemukan | PPKASN Kemensetneg RI",
      description: "Artikel berita yang Anda cari tidak ditemukan atau telah dipindahkan.",
    };
  }

  return {
    title: `${article.title} | PPKASN Kemensetneg RI`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [
        {
          url: article.image,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
      type: "article",
      publishedTime: article.publishedDateIso,
      authors: [article.author.name],
      tags: article.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: [article.image],
    },
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = NewsService.getNewsBySlug(slug);

  if (!article) {
    notFound();
  }

  const relatedNews = NewsService.getRelatedNews(article.slug, 3);

  return (
    <PublicShell>
      <div className="leading-loose">
        <NewsDetailView article={article} relatedNews={relatedNews} />
      </div>
    </PublicShell>
  );
}
