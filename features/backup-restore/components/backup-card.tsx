"use client";

import { Download, FileJson, FileSpreadsheet, Database, Info } from "lucide-react";
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
import { type ExportFormat, type TableOption, type BackupStats } from "../types";

export interface BackupCardProps {
  stats: BackupStats;
  selectedTable: TableOption;
  onTableChange: (table: TableOption) => void;
  selectedFormat: ExportFormat;
  onFormatChange: (format: ExportFormat) => void;
  onDownload: () => void;
}

export function BackupCard({
  stats,
  selectedTable,
  onTableChange,
  selectedFormat,
  onFormatChange,
  onDownload,
}: BackupCardProps) {
  return (
    <Card className="p-6 rounded-xl border border-dashed border-border bg-card shadow-none flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start sm:items-center gap-3 pb-4 border-b border-dashed border-border mb-5">
        <div className="p-2.5 bg-muted rounded-xl text-foreground shrink-0">
          <Download className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-foreground">Cadangkan Data (Backup)</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ekspor data dari database ke format file pilihan Anda.
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Row 1: Target Data Selection */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground/90">Pilih Data yang Dicadangkan</Label>
            <Select
              value={selectedTable}
              onValueChange={(val) => onTableChange(val as TableOption)}
            >
              <SelectTrigger className="border-dashed border-border rounded-xl shadow-none bg-background h-10">
                <SelectValue placeholder="Pilih Tabel" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-dashed">
                <SelectItem value="all">Semua Data (Aset + Jadwal Peminjaman)</SelectItem>
                <SelectItem value="assets">Hanya Data Aset ({stats.assets} data)</SelectItem>
                <SelectItem value="room_bookings">Hanya Data Jadwal Ruangan ({stats.room_bookings} data)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Row 2: Format Selection Grid */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-foreground/90">Format File Ekspor</Label>
              <span className="text-[10px] text-muted-foreground">
                Format aktif: <span className="font-mono uppercase font-bold text-foreground">{selectedFormat}</span>
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2.5 h-[88px]">
              <button
                type="button"
                onClick={() => onFormatChange("json")}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer select-none",
                  selectedFormat === "json"
                    ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary shadow-xs"
                    : "border-dashed border-border bg-muted/30 hover:bg-muted/60 text-muted-foreground"
                )}
              >
                <FileJson className={cn("h-5 w-5 mb-1", selectedFormat === "json" ? "text-primary" : "text-muted-foreground")} />
                <span className="text-xs font-bold leading-tight">JSON</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">Rekomendasi</span>
              </button>

              <button
                type="button"
                onClick={() => onFormatChange("csv")}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer select-none",
                  selectedFormat === "csv"
                    ? "border-emerald-500 bg-emerald-500/10 text-foreground ring-1 ring-emerald-500 shadow-xs"
                    : "border-dashed border-border bg-muted/30 hover:bg-muted/60 text-muted-foreground"
                )}
              >
                <FileSpreadsheet className={cn("h-5 w-5 mb-1", selectedFormat === "csv" ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")} />
                <span className="text-xs font-bold leading-tight">CSV</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">Spreadsheet</span>
              </button>

              <button
                type="button"
                onClick={() => onFormatChange("sql")}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer select-none",
                  selectedFormat === "sql"
                    ? "border-amber-500 bg-amber-500/10 text-foreground ring-1 ring-amber-500 shadow-xs"
                    : "border-dashed border-border bg-muted/30 hover:bg-muted/60 text-muted-foreground"
                )}
              >
                <Database className={cn("h-5 w-5 mb-1", selectedFormat === "sql" ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground")} />
                <span className="text-xs font-bold leading-tight">SQL</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">Query Script</span>
              </button>
            </div>
          </div>

          {/* Row 3: Format Summary & Record Estimation */}
          <div className="p-3 bg-muted/40 rounded-xl border border-dashed border-border text-xs flex items-start gap-2.5 min-h-[58px]">
            <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="font-semibold text-foreground text-xs">
                  {selectedFormat === "json" && "Format JSON (Cadangan Lengkap)"}
                  {selectedFormat === "csv" && "Format Tabel CSV (Excel)"}
                  {selectedFormat === "sql" && "Script Query SQL (PostgreSQL)"}
                </span>
                <span className="text-[10px] text-muted-foreground shrink-0 font-medium">
                  {selectedTable === "all"
                    ? `${stats.assets + stats.room_bookings} total data`
                    : selectedTable === "assets"
                    ? `${stats.assets} aset`
                    : `${stats.room_bookings} jadwal`}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                {selectedFormat === "json" && "Paling aman & komprehensif. Struktur relasi utuh dan dapat dipulihkan kembali otomatis."}
                {selectedFormat === "csv" && "Mudah dibuka dan diolah menggunakan spreadsheet untuk pelaporan inventaris berkala."}
                {selectedFormat === "sql" && "Berisi perintah INSERT baku untuk import langsung melalui database console."}
              </p>
            </div>
          </div>
        </div>

        {/* Row 4: Action Button (Locked to bottom) */}
        <div className="mt-auto pt-4">
          <Button
            onClick={onDownload}
            className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-none font-medium h-10 text-xs"
          >
            <Download className="mr-2 h-4 w-4" />
            Unduh File Backup ({selectedFormat.toUpperCase()})
          </Button>
        </div>
      </div>
    </Card>
  );
}
