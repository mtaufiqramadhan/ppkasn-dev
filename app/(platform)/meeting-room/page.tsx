"use client";

import React, { useState, useMemo } from "react";
import { format, addMonths, subMonths, isSameDay } from "date-fns";
import { id } from "date-fns/locale";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  Search,
  PlusCircle,
  Clock,
  FileDown,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
// Import interfaces and hooks
import {
  useCalendarData,
  bookingService
} from "@/app/page";
import { Booking, BookingPayload } from "@/app/page";

const UNIT_KERJA_OPTIONS = [
  "PUSBINTER",
  "PUSBIN AKS",
  "PPKASN",
] as const;

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 1 + i);




// Helper to get color (copied from main page to keep self-contained or import if exported)
const getInstitutionColor = (institutionName: string): string => {
  // Use same logic as main page or simplified since we just need the class
  // For consistency, let's copy the explicit map or hash logic
  const colors = [
    "bg-blue-100 text-blue-700 border-blue-200",
    "bg-green-100 text-green-700 border-green-200",
    "bg-purple-100 text-purple-700 border-purple-200",
    "bg-orange-100 text-orange-700 border-orange-200",
    "bg-pink-100 text-pink-700 border-pink-200",
    "bg-teal-100 text-teal-700 border-teal-200",
    "bg-indigo-100 text-indigo-700 border-indigo-200",
    "bg-cyan-100 text-cyan-700 border-cyan-200",
    "bg-rose-100 text-rose-700 border-rose-200",
    "bg-lime-100 text-lime-700 border-lime-200",
  ];

  if (institutionName === "PUSBINTER") return "bg-blue-100 text-blue-700 border-blue-200";
  if (institutionName === "PUSBIN AKS") return "bg-yellow-100 text-yellow-700 border-yellow-200";
  if (institutionName === "PPKASN") return "bg-red-100 text-red-700 border-red-200";

  let hash = 0;
  for (let i = 0; i < institutionName.length; i++) {
    hash = institutionName.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export default function MeetingRoomPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Note: ensure useCalendarData is exported from app/page.tsx or move it to a shared hook file.
  // Assuming it is exported based on previous context, otherwise I might need to fix imports.
  // Ideally, useCalendarData should probably be refactored into a separate hook file, but for now assuming it works.
  const { rooms, bookings, loading, error, refresh } = useCalendarData(
    currentDate.getFullYear(),
    currentDate.getMonth()
  );

  // Edit State
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editForm, setEditForm] = useState<Partial<BookingPayload>>({});
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter State
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleMonthChange = (monthIndex: string) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(parseInt(monthIndex));
    setCurrentDate(newDate);
  };

  const handleYearChange = (yearStr: string) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(parseInt(yearStr));
    setCurrentDate(newDate);
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const bookingDate = new Date(b.payload.bookingStart);
      const isSameMonth = bookingDate.getMonth() === currentDate.getMonth();
      const isSameYear = bookingDate.getFullYear() === currentDate.getFullYear();

      const matchesSearch =
        b.payload.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.payload.institutionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.payload.purpose && b.payload.purpose.toLowerCase().includes(searchTerm.toLowerCase()));

      return isSameMonth && isSameYear && matchesSearch;
    }).sort((a, b) => new Date(b.payload.bookingStart).getTime() - new Date(a.payload.bookingStart).getTime());
  }, [bookings, searchTerm, currentDate]);

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, currentDate]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await bookingService.deleteBooking(deletingId);
      toast.success("Booking berhasil dihapus");
      refresh();
    } catch (e: any) {
      toast.error(e.message || "Gagal menghapus booking");
    } finally {
      setDeletingId(null);
    }
  };

  const startEdit = (booking: Booking) => {
    setEditingBooking(booking);
    setEditForm({
      name: booking.payload.name,
      institutionName: booking.payload.institutionName,
      purpose: booking.payload.purpose,
      notes: booking.payload.notes,
      bookingStart: booking.payload.bookingStart,
      bookingEnd: booking.payload.bookingEnd,
      startTime: booking.payload.startTime,
      endTime: booking.payload.endTime,
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingBooking) return;
    setIsSaving(true);
    try {
      await bookingService.updateBooking(editingBooking.id, editForm);
      toast.success("Booking berhasil diupdate");
      setIsEditOpen(false);
      refresh();
    } catch (e: any) {
      toast.error(e.message || "Gagal mengupdate booking");
    } finally {
      setIsSaving(false);
    }
  };

  // Export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Add Title
    doc.setFontSize(16);
    doc.text("Laporan Peminjaman Ruang Rapat", 14, 20);
    doc.setFontSize(10);
    doc.text(`Periode: ${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`, 14, 27);
    doc.text(`Dicetak pada: ${format(new Date(), "dd MMM yyyy HH:mm", { locale: id })}`, 14, 32);

    // Prepare Table Data
    const tableData = filteredBookings.map((b, i) => {
      const roomNames = b.roomIds
        .map(rid => rooms.find(r => r.id === rid)?.name)
        .filter(Boolean)
        .join(", ");

      const startDate = new Date(b.payload.bookingStart);
      const endDate = b.payload.bookingEnd ? new Date(b.payload.bookingEnd) : startDate;
      const isSame = isSameDay(startDate, endDate);
      const dateStr = isSame
        ? format(startDate, "d MMM yyyy", { locale: id })
        : `${format(startDate, "d MMM")} - ${format(endDate, "d MMM yyyy", { locale: id })}`;

      return [
        i + 1,
        b.payload.institutionName || "-",
        b.payload.purpose || "-",
        b.payload.name || "-",
        roomNames || "-",
        dateStr + "\n" + (b.payload.startTime || "-") + " - " + (b.payload.endTime || "-"),
        b.payload.notes || "-"
      ];
    });

    autoTable(doc, {
      startY: 40,
      head: [['No', 'Unit Kerja', 'Kegiatan', 'Peminjam', 'Ruangan', 'Waktu', 'Catatan']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] }, // Black header
      columnStyles: {
        0: { cellWidth: 10 }, // No
        1: { cellWidth: 25 }, // Unit
        2: { cellWidth: 40 }, // Kegiatan
        3: { cellWidth: 30 }, // Peminjam
        4: { cellWidth: 30 }, // Ruangan
        5: { cellWidth: 30 }, // Waktu
        6: { cellWidth: 'auto' } // Catatan
      }
    });

    doc.save(`laporan-peminjaman-${format(currentDate, "MM-yyyy")}.pdf`);
  };

  // Removed onNextMonth, onPrevMonth, onToday since they are no longer used by controls

  return (
    <div className="flex flex-col h-screen">
      <div className="container py-6 gap-4">

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-dashed border-slate-200 shadow-none">
              <div className="w-40">
                <Select
                  value={currentDate.getMonth().toString()}
                  onValueChange={handleMonthChange}
                >
                  <SelectTrigger className="h-9 rounded-xl border-dashed border-slate-300 shadow-none focus:ring-0 bg-transparent hover:border-slate-400 focus:border-slate-400">
                    <SelectValue placeholder="Bulan" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-dashed border-slate-300 shadow-none">
                    {MONTHS.map((month, index) => (
                      <SelectItem key={index} value={index.toString()} className="rounded-lg focus:bg-slate-50 cursor-pointer">{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-32">
                <Select
                  value={currentDate.getFullYear().toString()}
                  onValueChange={handleYearChange}
                >
                  <SelectTrigger className="h-9 rounded-xl border-dashed border-slate-300 shadow-none focus:ring-0 bg-transparent hover:border-slate-400 focus:border-slate-400">
                    <SelectValue placeholder="Tahun" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-dashed border-slate-300 shadow-none">
                    {YEARS.map((year) => (
                      <SelectItem key={year} value={year.toString()} className="rounded-lg focus:bg-slate-50 cursor-pointer">{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari peminjam, kegiatan..."
                className="pl-9 h-10 bg-white border-dashed border-slate-300 focus:border-slate-400 focus:ring-0 transition-all rounded-xl shadow-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <Card className="flex-1 border border-dashed border-slate-300 shadow-none bg-white flex flex-col overflow-hidden rounded-xl">
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50/50 sticky top-0 z-10">
              <TableRow className="hover:bg-transparent border-b border-dashed border-slate-200">
                <TableHead className="w-[50px] h-10 font-bold text-slate-400 uppercase tracking-wider text-[10px]">No</TableHead>
                <TableHead className="h-10 font-bold text-slate-400 uppercase tracking-wider text-[10px]">Unit Kerja</TableHead>
                <TableHead className="h-10 font-bold text-slate-400 uppercase tracking-wider text-[10px]">Kegiatan</TableHead>
                <TableHead className="h-10 font-bold text-slate-400 uppercase tracking-wider text-[10px]">Nama Peminjam</TableHead>
                <TableHead className="h-10 font-bold text-slate-400 uppercase tracking-wider text-[10px]">Ruangan</TableHead>
                <TableHead className="h-10 font-bold text-slate-400 uppercase tracking-wider text-[10px]">Waktu</TableHead>
                <TableHead className="h-10 font-bold text-slate-400 uppercase tracking-wider text-[10px]">Catatan</TableHead>
                <TableHead className="text-right h-10 font-bold text-slate-400 uppercase tracking-wider text-[10px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Memuat data...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                      <p className="text-sm font-medium">Tidak ada data peminjaman</p>
                      <p className="text-xs">Coba ubah filter bulan atau pencarian Anda.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedBookings.map((booking, index) => {
                  const roomNames = booking.roomIds
                    .map(rid => rooms.find(r => r.id === rid)?.name)
                    .filter(Boolean)
                    .join(", ");

                  // Format Date
                  const startDate = new Date(booking.payload.bookingStart);
                  const endDate = booking.payload.bookingEnd ? new Date(booking.payload.bookingEnd) : startDate;
                  const isSame = isSameDay(startDate, endDate);
                  const dateStr = isSame
                    ? format(startDate, "d MMM yyyy", { locale: id })
                    : `${format(startDate, "d MMM")} - ${format(endDate, "d MMM yyyy", { locale: id })}`;

                  return (
                    <TableRow key={booking.id} className="group hover:bg-slate-50 transition-colors border-b border-dashed border-slate-200 last:border-0">
                      <TableCell className="font-medium text-slate-500 w-[50px]">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          "text-[10px] font-bold px-2.5 py-1 rounded-md border border-dashed shadow-none whitespace-nowrap",
                          getInstitutionColor(booking.payload.institutionName)
                        )}>
                          {booking.payload.institutionName}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[200px]" title={booking.payload.purpose}>
                        <span className="font-semibold text-slate-900 line-clamp-2">{booking.payload.purpose}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-700">{booking.payload.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-md bg-slate-50 border border-dashed border-slate-300 px-2 py-1 text-xs font-medium text-slate-600">
                          {roomNames || "Tidak ada ruangan"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-semibold text-slate-900">{dateStr}</span>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Clock className="w-3 h-3" />
                            {booking.payload.startTime} - {booking.payload.endTime}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[150px]">
                        <span className="text-slate-500 text-xs line-clamp-2 italic">
                          {booking.payload.notes || "-"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[160px] rounded-xl border-dashed border-slate-300 shadow-none">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => startEdit(booking)}>
                              <Pencil className="mr-2 h-3.5 w-3.5" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeletingId(booking.id)}
                              className="text-red-600 focus:text-red-600 focus:bg-red-50"
                            >
                              <Trash2 className="mr-2 h-3.5 w-3.5" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2 py-4">
        <div className="text-sm text-slate-500">
          Showing {startIndex + 1} to {Math.min(endIndex, filteredBookings.length)} of {filteredBookings.length} entries
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0 rounded-lg border-dashed border-slate-300 shadow-none"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium text-slate-900">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0 rounded-lg border-dashed border-slate-300 shadow-none"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-xl border border-dashed border-slate-300 shadow-none">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="bookingStart">Tanggal Mulai</Label>
                <Input
                  id="bookingStart"
                  type="date"
                  className="rounded-xl border-dashed border-slate-300 shadow-none focus:ring-0 focus:border-slate-400"
                  value={editForm.bookingStart ? String(editForm.bookingStart).split('T')[0] : ""}
                  onChange={(e) => setEditForm({ ...editForm, bookingStart: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bookingEnd">Tanggal Selesai</Label>
                <Input
                  id="bookingEnd"
                  type="date"
                  className="rounded-xl border-dashed border-slate-300 shadow-none focus:ring-0 focus:border-slate-400"
                  value={editForm.bookingEnd ? String(editForm.bookingEnd).split('T')[0] : (editForm.bookingStart ? String(editForm.bookingStart).split('T')[0] : "")}
                  onChange={(e) => setEditForm({ ...editForm, bookingEnd: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime">Waktu Mulai</Label>
                <Input
                  id="startTime"
                  type="time"
                  className="rounded-xl border-dashed border-slate-300 shadow-none focus:ring-0 focus:border-slate-400"
                  value={editForm.startTime || ""}
                  onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">Waktu Selesai</Label>
                <Input
                  id="endTime"
                  type="time"
                  className="rounded-xl border-dashed border-slate-300 shadow-none focus:ring-0 focus:border-slate-400"
                  value={editForm.endTime || ""}
                  onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Nama Peminjam</Label>
              <Input
                id="name"
                className="rounded-xl border-dashed border-slate-300 shadow-none focus:ring-0 focus:border-slate-400"
                value={editForm.name || ""}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="unit">Unit Kerja</Label>
              <Select
                value={editForm.institutionName}
                onValueChange={(val) => setEditForm({ ...editForm, institutionName: val })}
              >
                <SelectTrigger className="rounded-xl border-dashed border-slate-300 shadow-none focus:ring-0 focus:border-slate-400">
                  <SelectValue placeholder="Pilih unit kerja" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-dashed border-slate-300 shadow-none">
                  {UNIT_KERJA_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt} className="rounded-lg focus:bg-slate-50 cursor-pointer">{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="purpose">Kegiatan</Label>
              <Input
                id="purpose"
                className="rounded-xl border-dashed border-slate-300 shadow-none focus:ring-0 focus:border-slate-400"
                value={editForm.purpose || ""}
                onChange={(e) => setEditForm({ ...editForm, purpose: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Catatan</Label>
              <Textarea
                id="notes"
                className="rounded-xl border-dashed border-slate-300 shadow-none focus:ring-0 focus:border-slate-400"
                value={editForm.notes || ""}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsEditOpen(false)} className="rounded-xl border-dashed border-slate-300 shadow-none hover:bg-slate-50">Batal</Button>
            <Button onClick={handleSaveEdit} disabled={isSaving} className="rounded-xl shadow-none bg-black hover:bg-slate-800 text-white">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Perubahan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent className="rounded-xl border border-dashed border-slate-300 shadow-none">
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Booking akan dihapus permanen dari sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-dashed border-slate-300 shadow-none">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 rounded-xl shadow-none text-white border-transparent"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
