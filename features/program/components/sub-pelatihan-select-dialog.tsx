"use client";

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProgramItem, SubPelatihanItem } from "../types";
import { getProgramSubPelatihanList } from "../utils/sub-pelatihan";

export interface SubPelatihanSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  program: ProgramItem;
  selectedId?: string;
  selectedTitle?: string;
  onSelect: (subPelatihan: SubPelatihanItem) => void;
}

export function SubPelatihanSelectDialog({
  open,
  onOpenChange,
  program,
  selectedId,
  selectedTitle,
  onSelect,
}: SubPelatihanSelectDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const subPelatihanList = useMemo(() => {
    return getProgramSubPelatihanList(program);
  }, [program]);

  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return subPelatihanList;
    const q = searchQuery.toLowerCase().trim();
    return subPelatihanList.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.code && item.code.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q))
    );
  }, [subPelatihanList, searchQuery]);

  const handleSelectItem = (item: SubPelatihanItem) => {
    onSelect(item);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-lg w-[92vw] p-0 rounded-2xl overflow-hidden border border-border shadow-lg"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Pilih Sub Pelatihan</DialogTitle>
          <DialogDescription>{program.title}</DialogDescription>
        </DialogHeader>

        {/* Clean Search Input Header */}
        <div className="flex items-center px-4 py-3 border-b border-border gap-2.5">
          <Search className="size-4 text-muted-foreground shrink-0" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari sub pelatihan..."
            className="flex-1 h-8 text-xs border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0 bg-transparent placeholder:text-muted-foreground"
            autoFocus
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors"
              aria-label="Bersihkan pencarian"
            >
              <X className="size-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted rounded border border-border">
            ESC
          </kbd>
        </div>

        {/* List Content */}
        <div className="max-h-[340px] overflow-y-auto p-2 space-y-1">
          {filteredList.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Tidak ada sub pelatihan yang cocok.
            </div>
          ) : (
            filteredList.map((item, idx) => {
              const isSelected =
                (selectedId && item.id === selectedId) ||
                (selectedTitle && item.title === selectedTitle);

              return (
                <button
                  key={item.id || `sub-${idx}`}
                  type="button"
                  onClick={() => handleSelectItem(item)}
                  className={cn(
                    "w-full text-left p-3 rounded-xl transition-colors flex items-start justify-between gap-3 cursor-pointer",
                    isSelected
                      ? "bg-primary/10 text-foreground"
                      : "hover:bg-muted/60 text-foreground"
                  )}
                >
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="text-xs sm:text-sm font-medium leading-snug truncate"
                        title={item.title}
                      >
                        {item.title}
                      </span>
                    </div>
                    {item.description && (
                      <p
                        className="text-[11px] text-muted-foreground truncate leading-relaxed"
                        title={item.description}
                      >
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-0.5">
                      {item.duration && <span className="font-mono">{item.duration}</span>}
                      {item.curriculum && item.curriculum.length > 0 && (
                        <span>• {item.curriculum.length} Modul Pembelajaran</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-0.5">
                    {isSelected && <Check className="size-4 text-primary" />}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
