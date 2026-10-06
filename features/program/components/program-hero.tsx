"use client";

import React from "react";
import {
  GraduationCap,
  Globe,
  Search,
} from "lucide-react";
import { ProgramCategory, ProgramType } from "../types";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ProgramHeroProps {
  activeType: "all" | ProgramType;
  onTypeChange: (type: "all" | ProgramType) => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  categories: ProgramCategory[];
  stats: {
    total: number;
    diklatCount: number;
    lnCount: number;
    openCount: number;
  };
}

export function ProgramHero({
  activeType,
  onTypeChange,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  categories,
  stats,
}: ProgramHeroProps) {
  return (
    <div className="mb-8 sm:mb-10 pb-6 border-b border-neutral-200/80 dark:border-neutral-800">
      {/* Title & Introduction */}
      <div className="w-full mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight leading-tight">
          Program Pelatihan
        </h1>
        <p
          title="Daftar program pelatihan kediklatan aparatur sipil negara dan beasiswa pelatihan luar negeri yang diselenggarakan oleh PPKASN Kementerian Sekretariat Negara RI bersama mitra strategis dalam dan luar negeri."
          className="mt-2 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-normal line-clamp-1"
        >
          Daftar program pelatihan dalam dan luar negeri
        </p>
      </div>

      {/* Tabs Switcher: Clean and Minimal */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <button
          type="button"
          onClick={() => onTypeChange("all")}
          className={`px-3.5 py-1.5 rounded-2xl sm:rounded-3xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${activeType === "all"
            ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
            : "bg-neutral-100 text-neutral-600 hover:text-neutral-950 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            }`}
        >
          Semua Program ({stats.total})
        </button>

        <button
          type="button"
          onClick={() => onTypeChange("diklat")}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl sm:rounded-3xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${activeType === "diklat"
            ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
            : "bg-neutral-100 text-neutral-600 hover:text-neutral-950 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            }`}
        >
          <GraduationCap className="size-3.5" />
          <span>Pelatihan Diklat ({stats.diklatCount})</span>
        </button>

        <button
          type="button"
          onClick={() => onTypeChange("luar-negeri")}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl sm:rounded-3xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${activeType === "luar-negeri"
            ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
            : "bg-neutral-100 text-neutral-600 hover:text-neutral-950 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            }`}
        >
          <Globe className="size-3.5" />
          <span>Pelatihan Luar Negeri ({stats.lnCount})</span>
        </button>
      </div>

      {/* Filter and Search Bar: Simple & Functional */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
        {/* Search input */}
        <div className="sm:col-span-6 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari judul pelatihan, materi, atau negara..."
            className="pl-9.5 h-10 rounded-2xl sm:rounded-3xl bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-xs sm:text-sm"
          />
        </div>

        {/* Category selector */}
        <div className="sm:col-span-3">
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="h-10 rounded-2xl sm:rounded-3xl bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-xs sm:text-sm">
              <SelectValue placeholder="Semua Kategori" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl sm:rounded-3xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status selector */}
        <div className="sm:col-span-3">
          <Select value={selectedStatus} onValueChange={onStatusChange}>
            <SelectTrigger className="h-10 rounded-2xl sm:rounded-3xl bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-xs sm:text-sm">
              <SelectValue placeholder="Status Pendaftaran" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl sm:rounded-3xl border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="buka">Pendaftaran Buka</SelectItem>
              <SelectItem value="segera">Segera Dibuka</SelectItem>
              <SelectItem value="penuh">Kuota Penuh</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
