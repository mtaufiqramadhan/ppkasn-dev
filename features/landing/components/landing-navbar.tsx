"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  CalendarDays,
  ChevronDown,
  Search,
  DoorOpen,
  Bed,
  CalendarCheck,
  GraduationCap,
  Building2,
  Newspaper,
  MessageSquareWarning,
  Clock,
} from "lucide-react";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LandingSearchDialog } from "./landing-search-dialog";

export interface LandingNavbarProps {
  className?: string;
}

export function LandingNavbar({ className }: LandingNavbarProps = {}) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const isHomePage = pathname === "/";
  const isFloatingPill = isScrolled;
  const isHomeActive = pathname === "/";
  const isProgramActive = pathname === "/program" || pathname?.startsWith("/program/");
  const isProfilActive = pathname === "/profil" || pathname?.startsWith("/profil/");
  const isPengaduanActive = pathname === "/pengaduan" || pathname?.startsWith("/pengaduan/");
  const isSarprasActive =
    pathname?.startsWith("/booking") ||
    pathname?.startsWith("/meeting-room") ||
    pathname?.startsWith("/room") ||
    pathname?.startsWith("/dorm");
  const isBeritaActive = pathname?.startsWith("/berita");

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 w-full transition-all duration-300 ${
          isFloatingPill
            ? "py-2 sm:py-2.5 md:py-3 px-3 sm:px-4 md:px-6 pointer-events-none bg-transparent border-b-transparent shadow-none"
            : isHomePage
            ? "py-3.5 sm:py-4 md:py-5 px-4 sm:px-6 lg:px-8 pointer-events-none bg-transparent border-b-transparent shadow-none"
            : "py-3 sm:py-3.5 px-4 sm:px-6 lg:px-8 pointer-events-auto bg-white dark:bg-[#121212] border-b border-neutral-200/80 dark:border-neutral-800 shadow-none"
        } ${className ?? ""}`}
      >
        <div
          className={`w-full transition-all duration-300 ease-out grid grid-cols-2 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center pointer-events-auto ${
            isFloatingPill
              ? "max-w-5xl mx-auto rounded-full bg-white dark:bg-[#141414] border border-neutral-200/85 dark:border-neutral-800/85 shadow-none py-2 sm:py-2.5 px-4 sm:px-5 md:px-6 gap-2 sm:gap-4"
              : "max-w-7xl mx-auto bg-transparent border-0 shadow-none p-0 gap-4"
          }`}
        >
          {/* Left: Kemensetneg Official Logo Emblem (Without text) */}
          <div className="flex items-center justify-start shrink-0">
            <Link href="/" className="flex items-center group focus:outline-none" aria-label="Beranda PPKASN Kemensetneg">
              <img
                src="/setneg-emblem.webp"
                alt="Logo Kemensetneg RI"
                className={`w-auto object-contain transition-all duration-300 group-hover:scale-105 ${
                  isFloatingPill
                    ? "h-8 sm:h-9 md:h-9.5"
                    : isHomePage
                    ? "h-9.5 sm:h-10.5 md:h-11.5 lg:h-12.5 brightness-0 invert"
                    : "h-8.5 sm:h-9.5 md:h-10"
                }`}
              />
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <div className="hidden lg:flex items-center justify-center">
            <nav
              className={`flex items-center transition-all duration-300 ${
                isFloatingPill
                  ? "gap-0.5 bg-neutral-100/60 dark:bg-neutral-800/40 p-1 rounded-full border border-neutral-200/50 dark:border-neutral-800/50"
                  : "gap-5 xl:gap-7 bg-transparent p-0 border-0 shadow-none"
              }`}
            >
              <Link
                href="/"
                className={`transition-all ${
                  isFloatingPill
                    ? isHomeActive
                      ? "font-semibold rounded-full px-3 py-1.5 text-[13px] text-neutral-950 dark:text-white bg-white dark:bg-neutral-900 shadow-none"
                      : "font-medium rounded-full px-3 py-1.5 text-[13px] text-neutral-700 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60"
                    : isHomePage
                    ? isHomeActive
                      ? "font-semibold relative py-1 text-sm text-white after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-[2px] after:bg-white after:rounded-full"
                      : "font-medium relative py-1 text-sm text-white/80 hover:text-white after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-[2px] after:bg-white/0 hover:after:bg-white/70 after:transition-all after:rounded-full"
                    : isHomeActive
                    ? "font-semibold relative py-1 text-sm text-neutral-950 dark:text-white after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-[2px] after:bg-neutral-950 dark:after:bg-white after:rounded-full"
                    : "font-medium relative py-1 text-sm text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-[2px] after:bg-transparent hover:after:bg-neutral-300 after:transition-all after:rounded-full"
                }`}
              >
                Beranda
              </Link>
              <Link
                href="/program"
                className={`transition-all ${
                  isFloatingPill
                    ? isProgramActive
                      ? "font-semibold rounded-full px-3 py-1.5 text-[13px] text-neutral-950 dark:text-white bg-white dark:bg-neutral-900 shadow-none"
                      : "font-medium rounded-full px-3 py-1.5 text-[13px] text-neutral-700 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60"
                    : isHomePage
                    ? isProgramActive
                      ? "font-semibold relative py-1 text-sm text-white after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-[2px] after:bg-white after:rounded-full"
                      : "font-medium relative py-1 text-sm text-white/80 hover:text-white after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-[2px] after:bg-white/0 hover:after:bg-white/70 after:transition-all after:rounded-full"
                    : isProgramActive
                    ? "font-semibold relative py-1 text-sm text-neutral-950 dark:text-white after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-[2px] after:bg-neutral-950 dark:after:bg-white after:rounded-full"
                    : "font-medium relative py-1 text-sm text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-[2px] after:bg-transparent hover:after:bg-neutral-300 after:transition-all after:rounded-full"
                }`}
              >
                Program
              </Link>
              <Link
                href="/profil"
                className={`transition-all ${
                  isFloatingPill
                    ? isProfilActive
                      ? "font-semibold rounded-full px-3 py-1.5 text-[13px] text-neutral-950 dark:text-white bg-white dark:bg-neutral-900 shadow-none"
                      : "font-medium rounded-full px-3 py-1.5 text-[13px] text-neutral-700 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60"
                    : isHomePage
                    ? isProfilActive
                      ? "font-semibold relative py-1 text-sm text-white after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-[2px] after:bg-white after:rounded-full"
                      : "font-medium relative py-1 text-sm text-white/80 hover:text-white after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-[2px] after:bg-white/0 hover:after:bg-white/70 after:transition-all after:rounded-full"
                    : isProfilActive
                    ? "font-semibold relative py-1 text-sm text-neutral-950 dark:text-white after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-[2px] after:bg-neutral-950 dark:after:bg-white after:rounded-full"
                    : "font-medium relative py-1 text-sm text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-[2px] after:bg-transparent hover:after:bg-neutral-300 after:transition-all after:rounded-full"
                }`}
              >
                Profil
              </Link>
              <Link
                href="/berita"
                className={`transition-all ${
                  isFloatingPill
                    ? isBeritaActive
                      ? "font-semibold rounded-full px-3 py-1.5 text-[13px] text-neutral-950 dark:text-white bg-white dark:bg-neutral-900 shadow-none"
                      : "font-medium rounded-full px-3 py-1.5 text-[13px] text-neutral-700 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60"
                    : isHomePage
                    ? "relative py-1 text-sm text-white/80 hover:text-white after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-[2px] after:bg-white/0 hover:after:bg-white/70 after:transition-all after:rounded-full"
                    : isBeritaActive
                    ? "font-semibold relative py-1 text-sm text-neutral-950 dark:text-white after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-[2px] after:bg-neutral-950 dark:after:bg-white after:rounded-full"
                    : "font-medium relative py-1 text-sm text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-[2px] after:bg-transparent hover:after:bg-neutral-300 after:transition-all after:rounded-full"
                }`}
              >
                Berita
              </Link>

              {/* Sarpras Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`transition-all inline-flex items-center gap-1.5 cursor-pointer outline-none group/sarpras ${
                      isFloatingPill
                        ? isSarprasActive
                          ? "font-semibold rounded-full px-3 py-1.5 text-[13px] text-neutral-950 dark:text-white bg-white dark:bg-neutral-900 shadow-none"
                          : "font-medium rounded-full px-3 py-1.5 text-[13px] text-neutral-700 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60"
                        : isHomePage
                        ? "font-medium relative py-1 text-sm text-white/80 hover:text-white after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-[2px] after:bg-white/0 hover:after:bg-white/70 after:transition-all after:rounded-full"
                        : isSarprasActive
                        ? "font-semibold relative py-1 text-sm text-neutral-950 dark:text-white after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-[2px] after:bg-neutral-950 dark:after:bg-white after:rounded-full"
                        : "font-medium relative py-1 text-sm text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-[2px] after:bg-transparent hover:after:bg-neutral-300 after:transition-all after:rounded-full"
                    }`}
                  >
                    <span>Sarpras</span>
                    <ChevronDown
                      className={`size-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180 ${
                        isFloatingPill
                          ? "text-neutral-400"
                          : isHomePage
                          ? "text-white/70 group-hover/sarpras:text-white"
                          : "text-neutral-500 group-hover/sarpras:text-neutral-800 dark:group-hover/sarpras:text-neutral-100"
                      }`}
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="center"
                  className="w-56 rounded-2xl sm:rounded-3xl p-1.5 shadow-none border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-[#171717] animate-in fade-in-50 zoom-in-95 duration-150"
                >
                  <div className="px-2.5 py-1 mb-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      Layanan Sarpras
                    </p>
                  </div>

                  <DropdownMenuItem asChild className={`rounded-2xl sm:rounded-3xl p-2 cursor-pointer ${pathname?.startsWith("/booking") ? "bg-neutral-100 dark:bg-neutral-800 font-semibold" : "focus:bg-neutral-100 dark:focus:bg-neutral-800"}`}>
                    <Link href="/booking" className="flex items-center gap-2.5">
                      <div className="size-7 rounded-2xl sm:rounded-3xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center shrink-0">
                        <CalendarCheck className="size-3.5" />
                      </div>
                      <span className="text-xs text-neutral-900 dark:text-neutral-100">
                        Halaman Booking
                      </span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="my-1.5 bg-neutral-200/70 dark:bg-neutral-800" />

                  <DropdownMenuItem asChild className={`rounded-2xl sm:rounded-3xl p-2 cursor-pointer ${pathname?.startsWith("/meeting-room") ? "bg-neutral-100 dark:bg-neutral-800 font-semibold" : "focus:bg-neutral-100 dark:focus:bg-neutral-800"}`}>
                    <Link href="/meeting-room" className="flex items-center gap-2.5">
                      <div className="size-7 rounded-2xl sm:rounded-3xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center shrink-0">
                        <CalendarDays className="size-3.5" />
                      </div>
                      <span className="text-xs text-neutral-900 dark:text-neutral-100">
                        Jadwal Ruang Rapat
                      </span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className={`rounded-2xl sm:rounded-3xl p-2 cursor-pointer ${pathname?.startsWith("/room") ? "bg-neutral-100 dark:bg-neutral-800 font-semibold" : "focus:bg-neutral-100 dark:focus:bg-neutral-800"}`}>
                    <Link href="/room" className="flex items-center gap-2.5">
                      <div className="size-7 rounded-2xl sm:rounded-3xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center shrink-0">
                        <DoorOpen className="size-3.5" />
                      </div>
                      <span className="text-xs text-neutral-900 dark:text-neutral-100">
                        Jadwal Ruangan
                      </span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className={`rounded-2xl sm:rounded-3xl p-2 cursor-pointer ${pathname?.startsWith("/dorm") ? "bg-neutral-100 dark:bg-neutral-800 font-semibold" : "focus:bg-neutral-100 dark:focus:bg-neutral-800"}`}>
                    <Link href="/dorm" className="flex items-center gap-2.5">
                      <div className="size-7 rounded-2xl sm:rounded-3xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center shrink-0">
                        <Bed className="size-3.5" />
                      </div>
                      <span className="text-xs text-neutral-900 dark:text-neutral-100">
                        Jadwal Asrama
                      </span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link
                href="/pengaduan"
                className={`transition-all ${
                  isFloatingPill
                    ? isPengaduanActive
                      ? "font-semibold rounded-full px-3 py-1.5 text-[13px] text-neutral-950 dark:text-white bg-white dark:bg-neutral-900 shadow-none"
                      : "font-medium rounded-full px-3 py-1.5 text-[13px] text-neutral-700 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60"
                    : isHomePage
                    ? isPengaduanActive
                      ? "font-semibold relative py-1 text-sm text-white after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-[2px] after:bg-white after:rounded-full"
                      : "font-medium relative py-1 text-sm text-white/80 hover:text-white after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-[2px] after:bg-white/0 hover:after:bg-white/70 after:transition-all after:rounded-full"
                    : isPengaduanActive
                    ? "font-semibold relative py-1 text-sm text-neutral-950 dark:text-white after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-[2px] after:bg-neutral-950 dark:after:bg-white after:rounded-full"
                    : "font-medium relative py-1 text-sm text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-[2px] after:bg-transparent hover:after:bg-neutral-300 after:transition-all after:rounded-full"
                }`}
              >
                Pengaduan
              </Link>
            </nav>
          </div>

          {/* Right Action Group: Adaptive for all viewports */}
          <div className="flex items-center justify-end gap-3 sm:gap-4 shrink-0">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className={`flex items-center font-medium transition-all cursor-pointer rounded-full ${
                isFloatingPill
                  ? "p-2 sm:px-3.5 sm:py-1.5 text-xs gap-2 text-neutral-600 dark:text-neutral-300 bg-neutral-100/80 dark:bg-neutral-800/80 hover:bg-neutral-200/80 dark:hover:bg-neutral-700/80 border border-neutral-200/70 dark:border-neutral-700/70 shadow-none"
                  : isHomePage
                  ? "px-3 py-1.5 sm:px-3.5 sm:py-1.5 text-xs sm:text-sm gap-2.5 text-white/90 hover:text-white bg-transparent hover:bg-white/10 border border-white/40 hover:border-white/70 shadow-none"
                  : "px-3 py-1.5 sm:px-3.5 sm:py-1.5 text-xs sm:text-sm gap-2.5 text-neutral-700 dark:text-neutral-200 bg-neutral-100/90 dark:bg-neutral-800/90 hover:bg-neutral-200/90 border border-neutral-200/90 dark:border-neutral-700 shadow-none"
              }`}
              title="Cari Cepat (⌘K)"
              aria-label="Buka Pencarian Cepat"
            >
              <Search className="size-4" />
              <span className="hidden md:inline text-xs sm:text-sm font-medium">Cari</span>
              <kbd className={`hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono ${
                isFloatingPill
                  ? "text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-none"
                  : isHomePage
                  ? "text-white/80 border border-white/35 bg-white/10"
                  : "text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-none"
              }`}>
                ⌘K
              </kbd>
            </button>

            {/* BerAKHLAK Emblem - ALWAYS COLORED ON SUBPAGES, INVERTED ON LANDING HERO */}
            <div className="flex items-center pl-1 sm:pl-2 shrink-0">
              <img
                src="/logo-bangga-melayani-bangsa.webp"
                alt="Logo BerAKHLAK Bangga Melayani Bangsa"
                className={`w-auto object-contain shrink-0 opacity-95 hover:opacity-100 transition-all ${
                  isFloatingPill
                    ? "h-10 sm:h-11 md:h-12"
                    : isHomePage
                    ? "h-12 sm:h-14 md:h-16 lg:h-17 brightness-0 invert"
                    : "h-9.5 sm:h-10.5 md:h-11"
                }`}
              />
            </div>

            {/* Mobile / Tablet Hamburger Toggle Button (Visible on < 1024px) */}
            <div className="flex lg:hidden shrink-0">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`cursor-pointer transition-all ${
                  isFloatingPill
                    ? "p-2 rounded-2xl sm:rounded-3xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
                    : isHomePage
                    ? "p-2 rounded-full border border-white/35 text-white hover:text-white/80 bg-transparent hover:bg-white/10"
                    : "p-2 rounded-2xl sm:rounded-3xl border border-neutral-200/90 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100/90"
                }`}
                aria-label={isMobileMenuOpen ? "Tutup Menu" : "Buka Menu"}
              >
                {isMobileMenuOpen ? (
                  <X className="size-6.5 sm:size-7" />
                ) : (
                  <Menu className="size-6.5 sm:size-7" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu backdrop */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-neutral-950/50 z-40 lg:hidden pointer-events-auto"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Responsive Mobile Drawer & Sheet */}
        {isMobileMenuOpen && (
          <div
            className={`lg:hidden fixed inset-x-3 z-50 pointer-events-auto max-w-lg mx-auto rounded-2xl sm:rounded-3xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-[#141414] p-4 sm:p-5 shadow-none space-y-4 max-h-[85vh] overflow-y-auto animate-in fade-in slide-in-from-top-3 duration-200 ${
              isFloatingPill || !isHomePage ? "top-16 sm:top-18" : "top-18 sm:top-22"
            }`}
          >
            {/* Search trigger inside mobile menu */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setSearchOpen(true);
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl sm:rounded-3xl bg-neutral-100 dark:bg-neutral-800/90 text-neutral-500 text-xs font-medium border border-neutral-200/50 dark:border-neutral-700/50"
            >
              <div className="flex items-center gap-2.5">
                <Search className="size-4 text-neutral-400" />
                <span>Cari program diklat, jadwal, berita...</span>
              </div>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
                ⌘K
              </kbd>
            </button>

            {/* Primary Navigation Grid */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-3 block mb-1">
                Menu Utama
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-2xl sm:rounded-3xl text-xs font-semibold text-neutral-950 dark:text-white bg-neutral-100 dark:bg-neutral-800 flex items-center gap-2"
                >
                  <Building2 className="size-3.5 text-neutral-500" />
                  Beranda
                </Link>
                <Link
                  href="/program"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-2xl sm:rounded-3xl text-xs font-medium flex items-center justify-between border transition-all ${
                    isProgramActive
                      ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white font-semibold border-neutral-300 dark:border-neutral-700"
                      : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 border-neutral-100 dark:border-neutral-800"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <GraduationCap className="size-3.5 text-neutral-500" />
                    Program
                  </span>
                </Link>
                <Link
                  href="/profil"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-2xl sm:rounded-3xl text-xs font-medium flex items-center justify-between border transition-all ${
                    isProfilActive
                      ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white font-semibold border-neutral-300 dark:border-neutral-700"
                      : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 border-neutral-100 dark:border-neutral-800"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Building2 className="size-3.5 text-neutral-500" />
                    Profil
                  </span>
                </Link>
                <Link
                  href="/berita"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-2xl sm:rounded-3xl text-xs font-medium flex items-center justify-between border transition-all ${
                    isBeritaActive
                      ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white font-semibold border-neutral-300 dark:border-neutral-700"
                      : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 border-neutral-100 dark:border-neutral-800"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Newspaper className="size-3.5 text-neutral-500" />
                    Berita &amp; Publikasi
                  </span>
                </Link>
              </div>
            </div>

            {/* Sarpras Service Cards inside mobile menu */}
            <div className="rounded-2xl sm:rounded-3xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/70 dark:border-neutral-800/70 p-3 space-y-2">
              <span className="text-[10px] font-bold text-neutral-400 block uppercase tracking-wider px-1">
                Layanan Sarana &amp; Prasarana:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                <Link
                  href="/booking"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2.5 rounded-2xl sm:rounded-3xl bg-white dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60 flex items-center gap-2.5 shadow-none"
                >
                  <div className="size-7 rounded-2xl sm:rounded-3xl bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 flex items-center justify-center shrink-0">
                    <CalendarCheck className="size-3.5" />
                  </div>
                  <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                    Halaman Booking
                  </span>
                </Link>

                <div className="my-1 border-b border-neutral-200/70 dark:border-neutral-700/70" />

                <Link
                  href="/meeting-room"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2.5 rounded-2xl sm:rounded-3xl bg-white dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60 flex items-center gap-2.5 shadow-none"
                >
                  <div className="size-7 rounded-2xl sm:rounded-3xl bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 flex items-center justify-center shrink-0">
                    <CalendarDays className="size-3.5" />
                  </div>
                  <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                    Jadwal Ruang Rapat
                  </span>
                </Link>

                <Link
                  href="/room"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2.5 rounded-2xl sm:rounded-3xl bg-white dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60 flex items-center gap-2.5 shadow-none"
                >
                  <div className="size-7 rounded-2xl sm:rounded-3xl bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 flex items-center justify-center shrink-0">
                    <DoorOpen className="size-3.5" />
                  </div>
                  <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                    Jadwal Ruangan
                  </span>
                </Link>

                <Link
                  href="/dorm"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2.5 rounded-2xl sm:rounded-3xl bg-white dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60 flex items-center gap-2.5 shadow-none"
                >
                  <div className="size-7 rounded-2xl sm:rounded-3xl bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 flex items-center justify-center shrink-0">
                    <Bed className="size-3.5" />
                  </div>
                  <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                    Jadwal Asrama
                  </span>
                </Link>
              </div>
            </div>

            {/* Kanal Pengaduan link */}
            <Link
              href="/pengaduan"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`px-3 py-2.5 rounded-2xl sm:rounded-3xl text-xs font-medium flex items-center justify-between border transition-all ${
                isPengaduanActive
                  ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white font-semibold border-neutral-300 dark:border-neutral-700"
                  : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 border-neutral-100 dark:border-neutral-800"
              }`}
            >
              <span className="flex items-center gap-2">
                <MessageSquareWarning className="size-3.5 text-neutral-500" />
                Layanan Pengaduan
              </span>
            </Link>



            {/* Footer details in mobile menu */}
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between text-[10px] text-neutral-400">
              <div className="flex items-center gap-1.5">
                <Clock className="size-3" />
                <span>Senin - Jumat 07.30 - 16.00 WIB</span>
              </div>
              <img
                src="https://ppkasn.setneg.go.id/wp-content/uploads/2024/05/pngtree-logo-berakhlak-png-dan-bangga-melayani-bangsa-png-image_8081466-1024x1024.png"
                alt="Logo BerAKHLAK"
                className="h-5 w-auto object-contain opacity-70"
              />
            </div>
          </div>
        )}
      </header>

      {/* Global Quick Command Palette Modal */}
      <LandingSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
