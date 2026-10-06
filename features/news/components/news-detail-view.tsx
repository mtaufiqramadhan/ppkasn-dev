import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { NewsArticle } from "../types";
import { NewsCard } from "./news-card";
import { NewsReadingProgress } from "./news-reading-progress";

export interface NewsDetailViewProps {
  article: NewsArticle;
  relatedNews: NewsArticle[];
}

export function NewsDetailView({ article, relatedNews }: NewsDetailViewProps) {
  return (
    <article className="w-full pb-6 sm:pb-10 leading-loose">
      <NewsReadingProgress />
      {/* Top Reading Container */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        {/* Simple Back Navigation */}
        <div className="mb-6 sm:mb-8">
          <Link
            href="/berita"
            className="inline-flex items-center gap-2 text-xs font-medium text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white transition-colors group"
          >
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Kembali ke Berita</span>
          </Link>
        </div>

        {/* Main Headline */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight leading-normal mb-6">
          {article.title}
        </h1>

        {/* Minimal Author Line */}
        <div className="flex items-center gap-3 py-4 border-y border-neutral-100 dark:border-neutral-800/80 mb-8">
          <div className="size-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
            P
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-white truncate">
              {article.author.name}
            </p>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
              {article.author.department ?? "PPKASN Kemensetneg RI"}
            </p>
          </div>
        </div>

        {/* Hero Image */}
        <figure className="mb-8 sm:mb-10">
          <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800/60">
            <img
              src={article.image || "/empty-news.webp"}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
          {article.imageCaption && (
            <figcaption className="mt-2 text-center text-xs text-neutral-500 dark:text-neutral-400 italic leading-loose">
              {article.imageCaption}
            </figcaption>
          )}
        </figure>

        {/* Article Content */}
        <div className="space-y-6 sm:space-y-7 text-neutral-800 dark:text-neutral-200 text-base sm:text-[17px] leading-loose">
          {/* Lead Paragraph */}
          <p className="text-lg sm:text-xl font-medium text-neutral-900 dark:text-neutral-100 leading-loose">
            {article.content.lead}
          </p>

          {/* Key Takeaways (Clean Minimal Box) */}
          {article.content.keyTakeaways && article.content.keyTakeaways.length > 0 && (
            <div className="my-6 rounded-2xl sm:rounded-3xl p-5 bg-neutral-50 dark:bg-[#151515] border border-neutral-200/70 dark:border-neutral-800">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
                Poin Penting
              </p>
              <ul className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300 leading-loose">
                {article.content.keyTakeaways.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="size-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sections */}
          {article.content.sections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-4 pt-2">
              {section.heading && (
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-950 dark:text-white tracking-tight pt-3 leading-loose">
                  {section.heading}
                </h2>
              )}

              {section.paragraphs.map((p, pIdx) => (
                <p key={pIdx} className="leading-loose">{p}</p>
              ))}

              {/* Minimal Pullquote */}
              {section.quote && (
                <blockquote className="my-6 border-l-2 border-primary pl-5 py-1 text-base sm:text-lg italic font-serif text-neutral-800 dark:text-neutral-200 leading-loose">
                  <p className="mb-2 leading-loose">&ldquo;{section.quote.text}&rdquo;</p>
                  <cite className="not-italic text-xs font-sans text-neutral-500 dark:text-neutral-400 block font-medium leading-loose">
                    — {section.quote.speaker}
                    {section.quote.speakerRole ? `, ${section.quote.speakerRole}` : ""}
                  </cite>
                </blockquote>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Related News Section (Clean 3-Card Grid) */}
      {relatedNews.length > 0 && (
        <aside className="max-w-5xl mx-auto px-4 sm:px-6 pt-14 sm:pt-16 mt-14 sm:mt-16 border-t border-neutral-200/70 dark:border-neutral-800/70 leading-loose">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base sm:text-lg font-bold text-neutral-950 dark:text-white leading-loose">
              Berita Terkait
            </h3>
            <Link
              href="/berita"
              className="text-xs font-medium text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white transition-colors"
            >
              Lihat Semua
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {relatedNews.map((item) => (
              <NewsCard key={item.id} article={item} />
            ))}
          </div>
        </aside>
      )}
    </article>
  );
}
