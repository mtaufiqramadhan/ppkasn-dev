"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  CalendarCheck,
  DoorOpen,
  Bed,
  GraduationCap,
  Globe,
  ExternalLink,
  CornerDownLeft,
  Newspaper,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SearchItem {
  id: string;
  title: string;
  description: string;
  category: "Program" | "Sarpras" | "Informasi";
  url: string;
  isExternal?: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

const SEARCH_ITEMS: SearchItem[] = [
  {
    id: "program-diklat",
    title: "Program Diklat",
    description: "Jadwal dan info agenda pelatihan teknis maupun fungsional ASN",
    category: "Program",
    url: "https://ppkasn.setneg.go.id/program/",
    isExternal: true,
    icon: GraduationCap,
  },
  {
    id: "pelatihan-ln",
    title: "Pelatihan Luar Negeri",
    description: "Info beasiswa, kursus singkat, dan program studi ke luar negeri",
    category: "Program",
    url: "https://ppkasn.setneg.go.id/pelatihan-luar-negeri/",
    isExternal: true,
    icon: Globe,
  },
  {
    id: "berita",
    title: "Berita & Publikasi",
    description: "Kabar terkini seputar kegiatan kediklatan dan artikel ASN",
    category: "Informasi",
    url: "/berita",
    icon: Newspaper,
  },
  {
    id: "booking-sarpras",
    title: "Booking Sarpras",
    description: "Reservasi ruang rapat, kelas diklat, aula, dan wisma asrama",
    category: "Sarpras",
    url: "/booking",
    icon: CalendarCheck,
  },
  {
    id: "jadwal-ruangan",
    title: "Jadwal Ruangan",
    description: "Lihat agenda pemakaian ruang kelas diklat dan aula pertemuan",
    category: "Sarpras",
    url: "/room",
    icon: DoorOpen,
  },
  {
    id: "jadwal-asrama",
    title: "Jadwal Asrama",
    description: "Cek ketersediaan kamar wisma dan asrama peserta diklat",
    category: "Sarpras",
    url: "/dorm",
    icon: Bed,
  },
];

interface LandingSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LandingSearchDialog({ open, onOpenChange }: LandingSearchDialogProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  // Keyboard shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return SEARCH_ITEMS;
    const lower = query.toLowerCase();
    return SEARCH_ITEMS.filter(
      (item) =>
        item.title.toLowerCase().includes(lower) ||
        item.description.toLowerCase().includes(lower) ||
        item.category.toLowerCase().includes(lower)
    );
  }, [query]);

  const handleSelect = (item: SearchItem) => {
    onOpenChange(false);
    if (item.isExternal) {
      window.open(item.url, "_blank", "noopener,noreferrer");
    } else {
      router.push(item.url);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="p-0 sm:max-w-xl overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141414] shadow-none"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Pencarian PPKASN Kemensetneg</DialogTitle>
        </DialogHeader>

        {/* Mobbin style search input header */}
        <div className="flex items-center px-4 py-3.5 border-b border-neutral-100 dark:border-neutral-800/80 gap-3">
          <Search className="size-4 text-neutral-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari program diklat, jadwal, atau berita..."
            className="flex-1 bg-transparent text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 outline-none border-none focus:outline-none"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-medium text-neutral-400 bg-neutral-100 dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-neutral-100/60 dark:divide-neutral-800/40">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-neutral-500">
              <p>Tidak ada hasil untuk &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-neutral-400 mt-1">Coba cari kata kunci lain seperti rapat, asrama, diklat, atau beasiswa</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/60 text-left transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60 flex items-center justify-center text-neutral-700 dark:text-neutral-200 shrink-0 group-hover:bg-neutral-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-neutral-900 transition-colors">
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 group-hover:text-neutral-950 dark:group-hover:text-white truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-200/50 dark:border-neutral-700/50">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 truncate max-w-sm sm:max-w-md">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 pl-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.isExternal ? (
                      <ExternalLink className="size-3.5 text-neutral-400" />
                    ) : (
                      <CornerDownLeft className="size-3.5 text-neutral-400" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Mobbin style footer hint */}
        <div className="px-4 py-2 bg-neutral-50/80 dark:bg-neutral-900/80 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
          <span>Navigasi</span>
          <span className="flex items-center gap-1">
            Tekan <kbd className="font-mono bg-neutral-200 dark:bg-neutral-800 px-1 py-0.2 rounded text-[9px]">Enter</kbd> untuk membuka
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
