"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  ArrowLeft,
  FileText,
  Eye,
  Check,
  X,
  Clock,
  Loader2,
} from "lucide-react";
import { TablePagination } from "@/components/ui/table-pagination";
import { useTablePagination } from "@/hooks/use-table-pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { ProgramService } from "../services/program-service";
import type { RegistrationSubmission } from "../types";

export function CmsRegistrationsView() {
  const [registrations, setRegistrations] = useState<RegistrationSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSub, setSelectedSub] = useState<RegistrationSubmission | null>(null);

  const loadRegistrations = async () => {
    setIsLoading(true);
    try {
      const data = await ProgramService.getAllRegistrations();
      setRegistrations(data);
    } catch {
      toast.error("Gagal memuat data pendaftar");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, []);

  const handleUpdateStatus = async (
    code: string,
    newStatus: "Menunggu Seleksi Administrasi" | "Terverifikasi" | "Ditolak"
  ) => {
    try {
      await ProgramService.updateRegistrationStatus(code, newStatus);
      setRegistrations((prev) =>
        prev.map((r) => (r.registrationCode === code ? { ...r, status: newStatus } : r))
      );
      if (selectedSub && selectedSub.registrationCode === code) {
        setSelectedSub({ ...selectedSub, status: newStatus });
      }
      toast.success(`Status pendaftaran diperbarui menjadi "${newStatus}"`);
    } catch {
      toast.error("Gagal memperbarui status pendaftaran");
    }
  };

  const filtered = registrations.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        r.fullName.toLowerCase().includes(q) ||
        r.nip.toLowerCase().includes(q) ||
        r.programTitle.toLowerCase().includes(q) ||
        r.registrationCode.toLowerCase().includes(q)
      );
    }
    return true;
  });
  const pagination=useTablePagination(filtered.length,`${search}|${statusFilter}`);

  const getStatusBadge = (status: RegistrationSubmission["status"]) => {
    switch (status) {
      case "Terverifikasi":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border border-dashed border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
            Terverifikasi
          </span>
        );
      case "Ditolak":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border border-dashed border-rose-300 bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
            Ditolak
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border border-dashed border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
            Menunggu Seleksi
          </span>
        );
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Data Pendaftar Program
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/cms/program">
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-white dark:bg-card border-dashed border-slate-300 dark:border-neutral-700 hover:bg-slate-50 shadow-none text-xs rounded-2xl sm:rounded-3xl h-10"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali ke Daftar Program</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-dashed border-border bg-card">
      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between border-b border-dashed border-border p-4 sm:p-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama peserta, NIP, kode registrasi, atau program..."
            className="pl-9 h-10 bg-white dark:bg-card border-dashed border-slate-300 dark:border-neutral-700 rounded-2xl sm:rounded-3xl shadow-none text-xs"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 text-xs pl-3 pr-9 rounded-2xl sm:rounded-3xl border border-dashed border-slate-300 dark:border-neutral-700 bg-white dark:bg-card shadow-none cursor-pointer"
          >
            <option value="all">Semua Status</option>
            <option value="Menunggu Seleksi Administrasi">Menunggu Seleksi</option>
            <option value="Terverifikasi">Terverifikasi</option>
            <option value="Ditolak">Ditolak</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="px-4 pb-4 sm:px-6 sm:pb-6">
        {isLoading ? (
          <div className="py-20 text-center text-gray-500 flex flex-col items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin mb-2 text-slate-600 dark:text-neutral-400" />
            <p className="text-sm">Memuat data pendaftar...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Users className="h-8 w-8 mx-auto mb-2 text-slate-400" />
            <p className="text-sm font-semibold">Belum ada usulan pendaftaran yang masuk.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-neutral-900/60 border-b border-dashed border-slate-200 dark:border-neutral-800">
              <TableRow>
                <TableHead className="w-40 text-xs font-semibold text-slate-600 dark:text-slate-400">Kode &amp; Tanggal</TableHead>
                <TableHead className="w-56 text-xs font-semibold text-slate-600 dark:text-slate-400">Nama Peserta / NIP</TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 dark:text-slate-400">Program Pelatihan</TableHead>
                <TableHead className="w-48 text-xs font-semibold text-slate-600 dark:text-slate-400">Instansi</TableHead>
                <TableHead className="w-36 text-xs font-semibold text-slate-600 dark:text-slate-400">Status</TableHead>
                <TableHead className="w-20 text-right text-xs font-semibold text-slate-600 dark:text-slate-400">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.slice(pagination.startIndex,pagination.endIndex).map((item) => (
                <TableRow
                  key={item.registrationCode}
                  className="hover:bg-slate-50/50 dark:hover:bg-neutral-900/40 border-b border-dashed border-slate-200 dark:border-neutral-800 last:border-0"
                >
                  <TableCell className="py-3">
                    <p className="font-mono text-xs font-semibold text-gray-900 dark:text-white">
                      {item.registrationCode}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.submittedAt}</p>
                  </TableCell>
                  <TableCell className="py-3">
                    <p className="font-semibold text-xs text-gray-900 dark:text-white">
                      {item.fullName}
                    </p>
                    <p className="font-mono text-[11px] text-slate-500 mt-0.5">NIP: {item.nip}</p>
                  </TableCell>
                  <TableCell className="py-3">
                    <p className="font-medium text-xs text-slate-800 dark:text-neutral-200 line-clamp-1">
                      {item.programTitle}
                    </p>
                    {item.subPelatihan && (
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        Sub: {item.subPelatihan}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="py-3">
                    <span className="text-xs text-slate-700 dark:text-neutral-300">
                      {item.institution || item.workUnit || "-"}
                    </span>
                  </TableCell>
                  <TableCell className="py-3">{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedSub(item)}
                      className="h-8 text-xs font-medium text-gray-600 border border-dashed border-slate-300 dark:border-neutral-700 hover:bg-slate-100 rounded-2xl sm:rounded-3xl shadow-none px-2.5"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      Detail
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      </div>

      {!isLoading && <TablePagination {...pagination} itemLabel="pendaftar" />}
      {/* Detail Modal */}
      <Dialog open={!!selectedSub} onOpenChange={() => setSelectedSub(null)}>
        {selectedSub && (
          <DialogContent className="shadow-none border border-slate-200 dark:border-neutral-800 max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-sm font-semibold flex items-center justify-between">
                <span>Rincian Pendaftar Program</span>
                <span className="font-mono text-xs text-slate-500 font-normal">
                  {selectedSub.registrationCode}
                </span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              <div className="p-3.5 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900/60 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Status Saat Ini:</span>
                  {getStatusBadge(selectedSub.status)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Waktu Usulan:</span>
                  <span className="font-semibold text-slate-800 dark:text-neutral-200">
                    {selectedSub.submittedAt}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500 block mb-0.5">Nama Lengkap</span>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">
                    {selectedSub.fullName}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">NIP</span>
                  <p className="font-mono font-medium">{selectedSub.nip}</p>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Kontak WhatsApp</span>
                  <p className="font-medium">{selectedSub.whatsapp || selectedSub.phone || "-"}</p>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Instansi Asal</span>
                  <p className="font-medium">{selectedSub.institution || selectedSub.workUnit || "-"}</p>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-neutral-800 pt-3">
                <span className="text-slate-500 block mb-1">Program yang Dipilih</span>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">
                  {selectedSub.programTitle}
                </p>
                {selectedSub.subPelatihan && (
                  <p className="text-slate-500 mt-0.5">Modul: {selectedSub.subPelatihan}</p>
                )}
              </div>

              <div className="border-t border-slate-200 dark:border-neutral-800 pt-3">
                <span className="text-slate-500 block mb-1">Berkas Memo / Surat Usulan</span>
                <div className="flex items-center gap-2 p-2.5 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-card">
                  <FileText className="h-4 w-4 text-slate-600" />
                  <span className="font-medium flex-1 truncate">{selectedSub.memoFileName}</span>
                  {selectedSub.memoNumber && (
                    <span className="text-[11px] text-slate-500 font-mono">No: {selectedSub.memoNumber}</span>
                  )}
                </div>
              </div>

              {selectedSub.memoNotes && (
                <div>
                  <span className="text-slate-500 block mb-1">Catatan Tambahan Pengusul</span>
                  <p className="p-2.5 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-neutral-700 bg-slate-50/50 dark:bg-neutral-900/40 text-slate-700 dark:text-neutral-300">
                    {selectedSub.memoNotes}
                  </p>
                </div>
              )}

              {/* Status Action Buttons */}
              <div className="border-t border-slate-200 dark:border-neutral-800 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Perbarui Status Berkas:
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleUpdateStatus(selectedSub.registrationCode, "Menunggu Seleksi Administrasi")
                    }
                    className="text-xs h-8 border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-2xl sm:rounded-3xl shadow-none"
                  >
                    Menunggu
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      handleUpdateStatus(selectedSub.registrationCode, "Terverifikasi")
                    }
                    className="text-xs h-8 border border-emerald-500 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl sm:rounded-3xl shadow-none gap-1"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Lolos
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() =>
                      handleUpdateStatus(selectedSub.registrationCode, "Ditolak")
                    }
                    className="text-xs h-8 rounded-2xl sm:rounded-3xl shadow-none border border-rose-300 gap-1"
                  >
                    <X className="h-3.5 w-3.5" />
                    Tolak
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
