"use client";

import { useState, useEffect, useCallback, type FormEvent, type ChangeEvent } from "react";
import { Database, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BackupRestoreService } from "../services/backup-restore-service";
import { type ExportFormat, type TableOption, type BackupStats } from "../types";
import { BackupCard } from "./backup-card";
import { RestoreCard, type RestoreStatusState } from "./restore-card";

export function BackupRestorePanel() {
  const [selectedTable, setSelectedTable] = useState<TableOption>("all");
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("json");
  const [isRestoring, setIsRestoring] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [stats, setStats] = useState<BackupStats>({
    assets: 0,
    room_bookings: 0,
    total: 0,
  });
  const [restoreStatus, setRestoreStatus] = useState<RestoreStatusState>({
    type: null,
    message: "",
  });

  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const data = await BackupRestoreService.getStats();
      if (data) setStats(data);
    } catch (err) {
      console.error("Gagal mengambil statistik:", err);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleDownloadBackup = () => {
    const url = BackupRestoreService.getDownloadUrl(selectedFormat, selectedTable);
    toast.info(`Mengunduh data backup (${selectedFormat.toUpperCase()})...`);
    window.location.href = url;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setRestoreStatus({ type: null, message: "" });
    }
  };

  const handleRestore = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Pilih file backup terlebih dahulu");
      return;
    }

    setRestoreStatus({ type: null, message: "" });
    setIsRestoring(true);

    try {
      const result = await BackupRestoreService.restoreFromFile(selectedFile, selectedTable);

      setRestoreStatus({
        type: "success",
        message: result.message || "Data berhasil dipulihkan ke database!",
        details: result.details,
      });
      toast.success("Data berhasil dipulihkan!");
      fetchStats();
      setSelectedFile(null);
      e.currentTarget.reset();
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Gagal memulihkan data";
      setRestoreStatus({ type: "error", message: errMsg });
      toast.error(errMsg);
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-3 sm:px-4 md:px-6 mb-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-dashed border-slate-300 mb-6 shadow-none">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Backup & Restore Data</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadangkan data sistem ke file lokal atau pulihkan data dari cadangan sebelumnya.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-500 bg-slate-50 border border-dashed border-slate-300 rounded-lg px-3 py-1.5 flex items-center gap-2">
            <Database className="h-3.5 w-3.5 text-slate-600" />
            <span>
              {isLoadingStats ? "Memuat..." : `${stats.assets} Aset • ${stats.room_bookings} Jadwal`}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStats}
            disabled={isLoadingStats}
            className="border-dashed border-slate-300 h-8 rounded-lg shadow-none text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoadingStats ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline ml-1">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BackupCard
          stats={stats}
          selectedTable={selectedTable}
          onTableChange={setSelectedTable}
          selectedFormat={selectedFormat}
          onFormatChange={setSelectedFormat}
          onDownload={handleDownloadBackup}
        />
        <RestoreCard
          selectedTable={selectedTable}
          onTableChange={setSelectedTable}
          selectedFile={selectedFile}
          onFileChange={handleFileChange}
          isRestoring={isRestoring}
          restoreStatus={restoreStatus}
          onSubmit={handleRestore}
        />
      </div>
    </div>
  );
}
