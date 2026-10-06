"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SocialWidget } from "./landing-social";
import { cn } from "@/lib/utils";

interface HeroSlide {
  id: string;
  label: string;
  imageUrl: string;
  tagline?: string;
  isActive?: boolean;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: "gedung-ppkasn",
    label: "Gedung PPKASN Kemensetneg",
    imageUrl: "/images/hero-gedung-ppkasn.webp",
    tagline: "Pusat Pengembangan Kompetensi Aparatur Sipil Negara Berkelas Dunia",
    isActive: true,
  },
];

export function LandingHero() {
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Fetch dynamic slides
    fetch("/api/cms/landing")
      .then((res) => res.json())
      .then((json) => {
        if (json?.data?.heroSlides && Array.isArray(json.data.heroSlides)) {
          const active = json.data.heroSlides.filter((s: HeroSlide) => s.isActive !== false);
          if (active.length > 0) {
            setSlides(active);
          }
        }
      })
      .catch((err) => console.warn("Using fallback hero slides:", err));
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const activeSlideData = slides[currentSlide] || slides[0] || DEFAULT_SLIDES[0];

  return (
    <section className="relative w-full bg-white dark:bg-[#0d0d0d]">
      {/* Fullscreen Hero Container: Edge-to-edge at top, transforms to rounded bottom on scroll */}
      <div
        className={cn(
          "relative w-full h-[100dvh] min-h-[500px] overflow-hidden bg-neutral-950 isolate [transform:translateZ(0)] transition-all duration-700 ease-out",
          isScrolled
            ? "rounded-b-[2.5rem] sm:rounded-b-[3.5rem] md:rounded-b-[4.5rem] border-b border-neutral-200/60 dark:border-neutral-800/80 shadow-sm"
            : "rounded-b-none border-b-transparent shadow-none"
        )}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlideData.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Background Image */}
            <img
              src={activeSlideData.imageUrl}
              alt={activeSlideData.label}
              fetchPriority="high"
              decoding="async"
              className="w-full h-full object-cover object-center select-none"
            />

            {/* Gradient overlays for navbar and footer legibility */}
            <div className="absolute inset-x-0 top-0 h-32 sm:h-44 bg-gradient-to-b from-black/75 via-black/30 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-32 sm:h-44 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          </motion.div>
        </AnimatePresence>

        {/* Minimal Slide Indicator (only shown if multi-slide) */}
        {slides.length > 1 && (
          <div className="absolute bottom-44 left-5 sm:bottom-24 sm:left-8 z-20 pointer-events-auto flex items-center gap-2">
            {slides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  currentSlide === idx ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Social links stay clear of the accessibility control on the right. */}
        <div className="absolute bottom-28 left-5 sm:bottom-8 sm:left-8 z-20 pointer-events-auto">
          <SocialWidget isFlat={true} />
        </div>
      </div>
    </section>
  );
}
