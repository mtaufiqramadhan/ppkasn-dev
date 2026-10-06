import { getPublicNews } from "@/features/news/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/layout";
import { NewsDetailView } from "@/features/news";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic="force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getPublicNews().find(article=>article.slug===slug || article.id===slug);

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
  const article = getPublicNews().find(article=>article.slug===slug || article.id===slug);

  if (!article) {
    notFound();
  }

  const relatedNews = getPublicNews().filter(item=>item.id!==article.id).sort((a,b)=>Number(b.category===article.category)-Number(a.category===article.category)).slice(0,3);

  return (
    <PublicShell>
      <div className="leading-loose">
        <NewsDetailView article={article} relatedNews={relatedNews} />
      </div>
    </PublicShell>
  );
}
