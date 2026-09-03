"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface FadeInStaggerProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  faster?: boolean;
}

export function FadeInStagger({
  children,
  className,
  faster = false,
  ...props
}: FadeInStaggerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      viewport={{ once: true }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: faster ? 0.05 : 0.1,
          },
        },
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
