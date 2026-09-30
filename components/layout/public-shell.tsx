"use client";

import React, { useRef, useState, useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { LandingNavbar, LandingFooter } from "@/features/landing";
import { PageTransition } from "@/components/animation";

const emptySubscribe = () => () => { };
const useIsMounted = () => useSyncExternalStore(emptySubscribe, () => true, () => false);

interface PublicShellProps {
  children: React.ReactNode;
}

export function PublicShell({ children }: PublicShellProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const footerContainerRef = useRef<HTMLDivElement>(null);
  const footerContentRef = useRef<HTMLDivElement>(null);
  const [footerHeight, setFooterHeight] = useState<number>(0);
  const isMounted = useIsMounted();

  useEffect(() => {
    const node = footerContentRef.current;
    if (!node) return;

    const updateHeight = () => {
      setFooterHeight(node.offsetHeight);
    };

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setFooterHeight(entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height);
      }
    });

    resizeObserver.observe(node);
    window.addEventListener("resize", updateHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, [pathname]);

  // Parallax scroll tracking for footer reveal across all public pages
  const { scrollYProgress } = useScroll({
    target: footerContainerRef,
    offset: ["start end", "end end"],
  });

  const footerY = useTransform(scrollYProgress, [0, 1], ["-4%", "0%"]);
  const footerOpacity = useTransform(scrollYProgress, [0, 0.4, 1], [0.65, 0.9, 1]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0b0b] text-foreground selection:bg-primary/20 selection:text-primary relative overflow-x-clip">
      {/* Upper Content Sheet (Curtain rolling up over the parallax footer with signature rounded corners) */}
      <div className="relative z-10 bg-background rounded-b-[2.5rem] sm:rounded-b-[3.5rem] md:rounded-b-[4.5rem] border-b border-neutral-200/60 dark:border-neutral-800/80 min-h-[calc(100vh-200px)] flex flex-col">
        <LandingNavbar />
        <main
          className={`flex-1 flex flex-col rounded-b-[2.5rem] sm:rounded-b-[3.5rem] md:rounded-b-[4.5rem] overflow-hidden ${
            isHome ? "" : "pt-16 sm:pt-20 pb-12 sm:pb-16 md:pb-20"
          }`}
        >
          <PageTransition className="flex-1 flex flex-col w-full">
            {children}
          </PageTransition>
        </main>
      </div>

      {/* Parallax Reveal Footer Container */}
      <div
        id="public-footer-container"
        ref={footerContainerRef}
        className="relative w-full z-0"
        style={{
          clipPath: isMounted ? "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" : undefined,
          height: isMounted && footerHeight > 0 ? `${footerHeight}px` : "auto",
        }}
      >
        <div
          ref={footerContentRef}
          className={
            isMounted
              ? "fixed bottom-0 left-0 right-0 w-full z-0 pointer-events-auto"
              : "relative w-full"
          }
        >
          {isMounted ? (
            <motion.div
              style={{
                y: footerY,
                opacity: footerOpacity,
              }}
              className="w-full"
            >
              <LandingFooter />
            </motion.div>
          ) : (
            <LandingFooter />
          )}
        </div>
      </div>
    </div>
  );
}
