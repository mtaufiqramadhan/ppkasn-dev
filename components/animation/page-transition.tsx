"use client";

import React from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Universal PageTransition Component
 * Emulates the signature smooth cinematic entrance animation of Beranda
 * with hardware-accelerated opacity & vertical translation using the
 * fluid cubic-bezier curve [0.16, 1, 0.3, 1].
 */
export function PageTransition({
  children,
  className = "flex-1 flex flex-col w-full",
}: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
