"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink } from "lucide-react";

interface SocialItem {
  id: string;
  name: string;
  handle: string;
  url: string;
  hoverClass: string;
  icon: (props: { className?: string }) => React.ReactNode;
}

const SOCIAL_ITEMS: SocialItem[] = [
  {
    id: "instagram",
    name: "Instagram",
    handle: "@ppkasn.kemensetneg",
    url: "https://www.instagram.com/ppkasn.kemensetneg/",
    hoverClass:
      "hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:text-white hover:border-transparent",
    icon: ({ className }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
  },
  {
    id: "youtube",
    name: "YouTube",
    handle: "@ppkasnkemensetneg",
    url: "https://www.youtube.com/@ppkasnkemensetneg",
    hoverClass:
      "hover:bg-[#FF0000] hover:text-white hover:border-transparent",
    icon: ({ className }) => (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
      >
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.376.55 9.376.55s7.505 0 9.377-.55a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    id: "whatsapp",
    name: "WhatsApp Halo Gaharu",
    handle: "+62 821-1000-2114",
    url: "https://wa.me/6282110002114",
    hoverClass:
      "hover:bg-[#25D366] hover:text-white hover:border-transparent",
    icon: ({ className }) => (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
];

export function useSocialVisibility() {
  const [isPastHero, setIsPastHero] = useState(false);
  const [isAtFooter, setIsAtFooter] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // 1. Check if past hero slider (threshold: 40% of viewport height)
      const heroThreshold = window.innerHeight * 0.4;
      setIsPastHero(window.scrollY > heroThreshold);

      // 2. Check if reached footer section
      const footerEl =
        document.getElementById("landing-footer-container") ||
        document.querySelector("footer");
      if (footerEl) {
        const rect = footerEl.getBoundingClientRect();
        setIsAtFooter(rect.top < window.innerHeight * 0.9);
      } else {
        const scrollBottom = window.innerHeight + window.scrollY;
        const totalHeight = document.documentElement.scrollHeight;
        setIsAtFooter(totalHeight - scrollBottom < 400);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return { isPastHero, isAtFooter };
}

export function useIsPastHero() {
  const { isPastHero } = useSocialVisibility();
  return isPastHero;
}

export function SocialWidget({ isFlat = false }: { isFlat?: boolean }) {
  return (
    <div
      className={`flex items-center transition-colors duration-300 ${
        isFlat
          ? "flex-row gap-2 sm:gap-2.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-black/75 border border-white/25 text-white shadow-none"
          : "flex-col gap-2 p-1.5 sm:p-2 rounded-full bg-white dark:bg-[#141414] border border-neutral-200/80 dark:border-neutral-800/80 shadow-none text-neutral-600 dark:text-neutral-300"
      }`}
    >
      {/* Label: Horizontal in hero slider ("Sosial Media"), tiny vertical on floating sidebar ("Sosial") */}
      {isFlat ? (
        <div className="flex items-center">
          <span className="text-[10px] sm:text-xs font-mono font-bold tracking-wider uppercase text-white/80 select-none pl-1">
            Sosial Media
          </span>
          <div className="w-px h-3.5 sm:h-4 bg-white/25 ml-2.5 mr-1.5 shrink-0" />
        </div>
      ) : (
        <div className="hidden sm:flex flex-col items-center pt-1 pb-0.5">
          <span className="text-[8px] font-mono font-bold tracking-widest uppercase rotate-180 [writing-mode:vertical-rl] select-none text-neutral-400 dark:text-neutral-500">
            Sosial
          </span>
          <div className="w-2.5 h-px mt-1.5 bg-neutral-200 dark:bg-neutral-800" />
        </div>
      )}

      {/* Social Icons List */}
      <div className={`flex items-center ${isFlat ? "flex-row gap-1.5 sm:gap-2" : "flex-col gap-2"}`}>
        {SOCIAL_ITEMS.map((item, idx) => {
          const Icon = item.icon;
          const isLast = idx === SOCIAL_ITEMS.length - 1;

          return (
            <div key={item.id} className="relative group/social-btn flex items-center">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${item.name}: ${item.handle}`}
                className={`size-7.5 sm:size-8.5 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                  isFlat
                    ? "text-white/90 bg-white/15 hover:bg-white/30 border border-white/30 hover:border-white/60"
                    : "text-neutral-600 dark:text-neutral-300 bg-neutral-100/80 dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700/60"
                } ${item.hoverClass}`}
              >
                <Icon className="size-3.5 sm:size-4" />
              </a>

              {/* Individual Flyout Tooltip / Label (Appears strictly when THIS button is hovered) */}
              <div
                className={`absolute hidden sm:flex flex-col px-2.5 py-1 rounded-xl shadow-none pointer-events-none opacity-0 group-hover/social-btn:opacity-100 transition-all duration-200 z-50 border whitespace-nowrap ${
                  isFlat
                    ? isLast
                      ? "bottom-full mb-2.5 right-0 translate-y-1 group-hover/social-btn:translate-y-0 bg-neutral-950 text-white border-white/20"
                      : "bottom-full mb-2.5 left-1/2 -translate-x-1/2 translate-y-1 group-hover/social-btn:translate-y-0 bg-neutral-950 text-white border-white/20"
                    : "right-full mr-2.5 top-1/2 -translate-y-1/2 translate-x-1 group-hover/social-btn:translate-x-0 bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-neutral-800 dark:border-neutral-200"
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-bold tracking-tight">
                    {item.name}
                  </span>
                  <ExternalLink className="size-2.5 opacity-60" />
                </div>
                <span
                  className={`text-[10px] font-mono ${
                    isFlat
                      ? "text-neutral-300"
                      : "text-neutral-400 dark:text-neutral-500"
                  }`}
                >
                  {item.handle}
                </span>

                {/* Arrow Tip */}
                <span
                  className={`absolute border-4 border-transparent ${
                    isFlat
                      ? isLast
                        ? "top-full right-3.5 border-t-neutral-950"
                        : "top-full left-1/2 -translate-x-1/2 border-t-neutral-950"
                      : "left-full top-1/2 -translate-y-1/2 border-l-neutral-950 dark:border-l-white"
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function LandingSocial() {
  const { isPastHero, isAtFooter } = useSocialVisibility();

  return (
    <AnimatePresence>
      {isPastHero && !isAtFooter && (
        <motion.aside
          aria-label="Media Sosial Resmi PPKASN"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="fixed right-2 sm:right-3 md:right-4 top-1/2 -translate-y-1/2 z-40 pointer-events-auto"
        >
          <SocialWidget isFlat={false} />
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
