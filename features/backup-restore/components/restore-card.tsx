"use client";

import type { FormEvent, ChangeEvent } from "react";
import { Upload, RefreshCw, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { type TableOption } from "../types";

export interface RestoreStatusState {
  type: "success" | "error" | null;
  message: string;
  details?: { assets?: number; room_bookings?: number };
}

export interface RestoreCardProps {
  selectedTable: TableOption;
  onTableChange: (table: TableOption) => void;
  selectedFile: File | null;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  isRestoring: boolean;
  restoreStatus: RestoreStatusState;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

export function RestoreCard({
  selectedTable,
  onTableChange,
  selectedFile,
  onFileChange,
  isRestoring,
  restoreStatus,
  onSubmit,
}: RestoreCardProps) {
  return (
    <Card className="p-6 rounded-xl border border-dashed border-border bg-card shadow-none flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start sm:items-center gap-3 pb-4 border-b border-dashed border-border mb-5">
        <div className="p-2.5 bg-muted rounded-xl text-foreground shrink-0">
          <Upload className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-foreground">Pulihkan Data (Restore)</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Impor file backup sebelumnya untuk mengembalikan data ke database.
          </p>
        </div>
      </div>

      {/* Body Form */}
      <form onSubmit={onSubmit} className="flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Row 1: Target Tabel */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground/90">Target Tabel Pemulihan</Label>
            <Select
              value={selectedTable}
              onValueChange={(val) => onTableChange(val as TableOption)}
            >
              <SelectTrigger className="border-dashed border-border rounded-xl shadow-none bg-background h-10">
                <SelectValue placeholder="Pilih Tabel" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-dashed">
                <SelectItem value="all">Otomatis / Semua Tabel dalam File</SelectItem>
                <SelectItem value="assets">Hanya Tabel Aset</SelectItem>
                <SelectItem value="room_bookings">Hanya Tabel Jadwal Ruangan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Row 2: Upload Dropzone Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-foreground/90">Pilih File Cadangan</Label>
              <span className="text-[10px] text-muted-foreground">Maksimal 10MB</span>
            </div>
            <div className="relative border-2 border-dashed border-border hover:border-foreground/40 rounded-xl px-3 py-2 text-center cursor-pointer transition-colors bg-muted/30 h-[88px] flex flex-col items-center justify-center">
              <input
                type="file"
                accept=".json,.csv,.sql"
                onChange={onFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center gap-1">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground truncate max-w-[260px] sm:max-w-[320px]">
                  {selectedFile ? selectedFile.name : "Klik atau seret file cadangan ke sini"}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Mendukung format .json, .csv, .sql
                </span>
              </div>
            </div>
          </div>

          {/* Row 3: Status / File Info Box */}
          {restoreStatus.type ? (
            <div
              className={cn(
                "p-3 rounded-xl border border-dashed text-xs flex items-start gap-2.5 min-h-[58px]",
                restoreStatus.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                  : "bg-destructive/10 border-destructive/30 text-destructive dark:text-red-400"
              )}
            >
              {restoreStatus.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{restoreStatus.message}</div>
                {restoreStatus.details && (
                  <div className="text-[11px] mt-0.5 opacity-90">
                    Rincian: {restoreStatus.details.assets ?? 0} aset, {restoreStatus.details.room_bookings ?? 0} jadwal peminjaman.
                  </div>
                )}
              </div>
            </div>
          ) : selectedFile ? (
            <div className="p-3 bg-muted/40 rounded-xl border border-dashed border-border text-xs flex items-start gap-2.5 min-h-[58px]">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-primary mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground text-xs flex items-center justify-between">
                  <span className="truncate">{selectedFile.name}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0 font-mono ml-2">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                  File siap dipulihkan ke database. Klik tombol di bawah untuk mulai proses restore.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-muted/40 rounded-xl border border-dashed border-border text-xs flex items-start gap-2.5 min-h-[58px]">
              <Info className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground text-xs">Petunjuk Pemulihan Data</div>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                  Pilih file cadangan yang sesuai. Data akan disinkronkan ke dalam database sistem.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Row 4: Action Button (Locked to bottom) */}
        <div className="mt-auto pt-4">
          <Button
            type="submit"
            disabled={isRestoring || !selectedFile}
            className="w-full rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-none font-medium h-10 text-xs disabled:opacity-50"
          >
            {isRestoring ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Sedang Memulihkan Data...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Mulai Proses Pemulihan (Restore)
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
