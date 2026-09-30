"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SocialWidget, useIsPastHero } from "./landing-social";

interface HeroSlide {
  id: string;
  label: string;
  imageUrl: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "gedung-ppkasn",
    label: "Gedung PPKASN Kemensetneg",
    imageUrl: "/images/hero-gedung-ppkasn.webp",
  },
];

export function LandingHero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const isPastHero = useIsPastHero();

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const scrollToContent = () => {
    const el = document.getElementById("berita-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const activeSlideData = HERO_SLIDES[currentSlide];

  return (
    <section className="relative w-full bg-white dark:bg-[#0d0d0d] overflow-hidden">
      {/* Story Progress Keyframe Definition */}
      <style>{`
        @keyframes storyProgress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>

      {/* ============================================================ */}
      {/* 100DVH FULLSCREEN FIRST FOLD (HERO SLIDER + COMPACT SCROLL)  */}
      {/* ============================================================ */}
      <div className="relative w-full h-[100dvh] min-h-[500px] flex flex-col justify-between overflow-hidden">
        {/* Main Hero Slider Frame - Dynamically fills viewport */}
        <div
          className="relative w-full flex-1 min-h-0 rounded-t-none rounded-b-[2.5rem] sm:rounded-b-[3.5rem] md:rounded-b-[4.5rem] overflow-hidden border-b border-neutral-200/60 dark:border-neutral-800/80 bg-neutral-950 shadow-none group/hero"
          onClick={(e) => {
            if (HERO_SLIDES.length <= 1) return;
            if ((e.target as HTMLElement).closest("button, a")) return;
            setIsPaused((prev) => !prev);
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlideData.id}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 w-full h-full"
            >
              {/* Background Image - Pure & Unobstructed (Optimized WebP) */}
              <img
                src={activeSlideData.imageUrl}
                alt={activeSlideData.label}
                fetchPriority="high"
                decoding="async"
                className="w-full h-full object-cover object-center select-none"
              />

              {/* Top Vignette for Transparent Navbar Legibility */}
              <div className="absolute inset-x-0 top-0 h-32 sm:h-44 bg-gradient-to-b from-black/80 via-black/35 to-transparent pointer-events-none z-10" />

              {/* Bottom Contrast Vignette */}
              <div className="absolute inset-x-0 bottom-0 h-32 sm:h-40 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none z-10" />
            </motion.div>
          </AnimatePresence>

          {/* Progress Indicator (Bottom Left - Instagram Story Style) */}
          {HERO_SLIDES.length > 1 && (
            <div className="absolute bottom-5 sm:bottom-8 left-5 sm:left-8 z-20 pointer-events-auto flex items-center gap-2 sm:gap-2.5">
              {/* Slide Counter */}
              <div className="flex items-center px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-black/70 border border-white/20 text-white font-mono text-[11px] sm:text-xs font-semibold select-none shadow-none">
                <span>0{currentSlide + 1}</span>
                <span className="opacity-35 mx-1">/</span>
                <span className="opacity-60">0{HERO_SLIDES.length}</span>
              </div>

              {/* Instagram Story Progress Stepper */}
              <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-full bg-black/70 border border-white/20 shadow-none">
                {HERO_SLIDES.map((slide, idx) => {
                  const isActive = currentSlide === idx;
                  const isPassed = idx < currentSlide;

                  return (
                    <button
                      key={slide.id}
                      onClick={() => {
                        setCurrentSlide(idx);
                        setIsPaused(false);
                      }}
                      className="group/step py-0.5 cursor-pointer focus:outline-none"
                      title={`Slide ${idx + 1}: ${slide.label}`}
                      aria-label={`Pindah ke slide ${idx + 1}: ${slide.label}`}
                    >
                      <div className="w-10 sm:w-14 md:w-18 h-1 sm:h-1.5 rounded-full bg-white/25 overflow-hidden relative transition-all group-hover/step:bg-white/40">
                        {isActive ? (
                          <div
                            key={`story-${currentSlide}`}
                            className="h-full bg-white rounded-full"
                            style={{
                              animation: "storyProgress 5.5s linear forwards",
                              animationPlayState: isPaused ? "paused" : "running",
                            }}
                            onAnimationEnd={nextSlide}
                          />
                        ) : isPassed ? (
                          <div className="h-full w-full bg-white rounded-full" />
                        ) : (
                          <div className="h-full w-0 bg-transparent" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Social Widget (Bottom Right - Flat horizontal design) */}
          <div className="absolute bottom-5 sm:bottom-8 right-5 sm:right-8 z-20 pointer-events-auto">
            <AnimatePresence>
              {!isPastHero && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                >
                  <SocialWidget isFlat={true} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Compact Proportional Branding/Scroll Text Area (Symmetrical top & bottom space) */}
        <div className="w-full h-11 sm:h-12 md:h-14 shrink-0 flex items-center justify-center">
          <button
            onClick={scrollToContent}
            className="group inline-flex items-center justify-center text-[11px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-neutral-400 hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-white transition-all cursor-pointer focus:outline-none py-1 px-3 rounded-full hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60"
            aria-label="PPKASN Kemensetneg"
          >
            <span>PPKASN Kemensetneg</span>
          </button>
        </div>
      </div>
    </section>
  );
}
