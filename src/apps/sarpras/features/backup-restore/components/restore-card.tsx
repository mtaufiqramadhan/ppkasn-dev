"use client";

import type { FormEvent, ChangeEvent } from "react";
import { Upload, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
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
    <Card className="p-6 rounded-xl border border-dashed border-slate-300 bg-white shadow-none">
      <div className="flex items-center gap-3 pb-4 border-b border-dashed border-slate-200 mb-5">
        <div className="p-2.5 bg-slate-100 rounded-xl text-slate-700">
          <Upload className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-900">Pulihkan Data (Restore)</h2>
          <p className="text-xs text-slate-500">
            Impor file backup sebelumnya untuk mengembalikan data ke database.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-700">Target Tabel Pemulihan</Label>
          <Select
            value={selectedTable}
            onValueChange={(val) => onTableChange(val as TableOption)}
          >
            <SelectTrigger className="border-dashed border-slate-300 rounded-xl shadow-none">
              <SelectValue placeholder="Pilih Tabel" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-dashed">
              <SelectItem value="all">Otomatis / Semua Tabel dalam File</SelectItem>
              <SelectItem value="assets">Hanya Tabel Aset</SelectItem>
              <SelectItem value="room_bookings">Hanya Tabel Jadwal Ruangan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-700">Pilih File Cadangan</Label>
          <div className="relative border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-50/50">
            <input
              type="file"
              accept=".json,.csv,.sql"
              onChange={onFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center gap-1.5">
              <Upload className="h-6 w-6 text-slate-400" />
              <span className="text-xs font-medium text-slate-700">
                {selectedFile ? selectedFile.name : "Klik atau seret file ke sini"}
              </span>
              <span className="text-[10px] text-slate-400">
                Mendukung format .json, .csv, .sql (Maks. 10MB)
              </span>
            </div>
          </div>
        </div>

        {/* Restore Status Alert */}
        {restoreStatus.type && (
          <div
            className={`p-3 rounded-xl border border-dashed text-xs flex items-start gap-2 ${
              restoreStatus.type === "success"
                ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                : "bg-red-50 border-red-300 text-red-800"
            }`}
          >
            {restoreStatus.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
            )}
            <div>
              <div className="font-semibold">{restoreStatus.message}</div>
              {restoreStatus.details && (
                <div className="text-[11px] mt-1 text-emerald-700">
                  Rincian: {restoreStatus.details.assets ?? 0} aset, {restoreStatus.details.room_bookings ?? 0} jadwal peminjaman.
                </div>
              )}
            </div>
          </div>
        )}

        <Button
          type="submit"
          disabled={isRestoring || !selectedFile}
          className="w-full mt-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-none font-medium h-10 text-xs"
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
      </form>
    </Card>
  );
}
