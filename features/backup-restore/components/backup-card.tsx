"use client";

import { Download } from "lucide-react";
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
    <Card className="p-6 rounded-xl border border-dashed border-slate-300 bg-white shadow-none">
      <div className="flex items-center gap-3 pb-4 border-b border-dashed border-slate-200 mb-5">
        <div className="p-2.5 bg-slate-100 rounded-xl text-slate-700">
          <Download className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-900">Cadangkan Data (Backup)</h2>
          <p className="text-xs text-slate-500">
            Ekspor data dari database ke format file pilihan Anda.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-700">Pilih Data yang Dicadangkan</Label>
          <Select
            value={selectedTable}
            onValueChange={(val) => onTableChange(val as TableOption)}
          >
            <SelectTrigger className="border-dashed border-slate-300 rounded-xl shadow-none">
              <SelectValue placeholder="Pilih Tabel" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-dashed">
              <SelectItem value="all">Semua Data (Aset + Jadwal Peminjaman)</SelectItem>
              <SelectItem value="assets">Hanya Data Aset ({stats.assets} data)</SelectItem>
              <SelectItem value="room_bookings">Hanya Data Jadwal Ruangan ({stats.room_bookings} data)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-700">Format File Ekspor</Label>
          <Select
            value={selectedFormat}
            onValueChange={(val) => onFormatChange(val as ExportFormat)}
          >
            <SelectTrigger className="border-dashed border-slate-300 rounded-xl shadow-none">
              <SelectValue placeholder="Pilih Format" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-dashed">
              <SelectItem value="json">JSON (.json) - Direkomendasikan untuk Restore</SelectItem>
              <SelectItem value="csv">CSV (.csv) - Kompatibel dengan Excel / Spreadsheet</SelectItem>
              <SelectItem value="sql">SQL (.sql) - Script INSERT Query Database</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-600 space-y-1">
          <div className="font-semibold text-slate-700">Catatan Backup:</div>
          <ul className="list-disc list-inside space-y-0.5 text-slate-500">
            <li>File backup berisi seluruh data aktif saat ini.</li>
            <li>Format JSON paling aman dan cepat saat dipulihkan kembali.</li>
          </ul>
        </div>

        <Button
          onClick={onDownload}
          className="w-full mt-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-none font-medium h-10 text-xs"
        >
          <Download className="mr-2 h-4 w-4" />
          Unduh File Backup ({selectedFormat.toUpperCase()})
        </Button>
      </div>
    </Card>
  );
}
