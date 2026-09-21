"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Calendar, LayoutDashboard, Moon, Sun, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const BookingHeader: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    // Sync initial theme
    const isDarkMode =
      document.documentElement.classList.contains("dark") ||
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);
    if (nextTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 bg-white/90 backdrop-blur-md transition-colors dark:border-neutral-800 dark:bg-neutral-950/80">
      <div className="container mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-4">
          <Link href="/booking" className="group flex items-center gap-3 focus:outline-none">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/20 transition-transform group-hover:scale-105">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                  Gaharu
                </span>
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
                  STAYS
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Sistem Peminjaman Ruangan PPKASN
              </p>
            </div>
          </Link>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/booking"
            className="flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-900 transition-colors dark:bg-neutral-800 dark:text-neutral-100"
          >
            <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            Eksplorasi Ruangan
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          >
            <Calendar className="h-4 w-4" />
            Jadwal Kalender
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Quick Info Badge */}
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Kemensetneg Terverifikasi</span>
          </div>

          <Link href="/auth/login">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-neutral-300 px-4 text-xs font-semibold text-neutral-800 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              Masuk Admin
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
