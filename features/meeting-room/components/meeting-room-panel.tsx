"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { format, isSameDay } from "date-fns";
import { id } from "date-fns/locale";
import { Search, FileDown, PlusCircle } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  type Booking,
  type BookingPayload,
  useCalendarData,
  bookingService,
} from "@/features/meeting-room";
import { BookingTable } from "./booking-table";
import { BookingEditDialog } from "./booking-edit-dialog";

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - 2 + i);

export function MeetingRoomPanel() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { rooms, bookings, loading, refresh } = useCalendarData(
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
    newDate.setMonth(parseInt(monthIndex, 10));
    setCurrentDate(newDate);
  };

  const handleYearChange = (yearStr: string) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(parseInt(yearStr, 10));
    setCurrentDate(newDate);
  };

  const filteredBookings = useMemo(() => {
    return bookings
      .filter((b) => {
        const bookingDate = new Date(b.payload.bookingStart);
        const isSameMonth = bookingDate.getMonth() === currentDate.getMonth();
        const isSameYear = bookingDate.getFullYear() === currentDate.getFullYear();

        const matchesSearch =
          b.payload.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.payload.institutionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (b.payload.purpose &&
            b.payload.purpose.toLowerCase().includes(searchTerm.toLowerCase()));

        return isSameMonth && isSameYear && matchesSearch;
      })
      .sort(
        (a, b) =>
          new Date(b.payload.bookingStart).getTime() -
          new Date(a.payload.bookingStart).getTime()
      );
  }, [bookings, searchTerm, currentDate]);

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, currentDate]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await bookingService.deleteBooking(deletingId);
      toast.success("Booking berhasil dihapus");
      refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Gagal menghapus booking";
      toast.error(message);
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
    } catch (e) {
      const message = e instanceof Error ? e.message : "Gagal mengupdate booking";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  // Export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Laporan Peminjaman Ruang Rapat", 14, 20);
    doc.setFontSize(10);
    doc.text(
      `Periode: ${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`,
      14,
      27
    );
    doc.text(
      `Dicetak pada: ${format(new Date(), "dd MMM yyyy HH:mm", { locale: id })}`,
      14,
      32
    );

    const tableData = filteredBookings.map((b, i) => {
      const roomNames = b.roomIds
        .map((rid) => rooms.find((r) => r.id === rid)?.name)
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
        b.payload.notes || "-",
      ];
    });

    autoTable(doc, {
      startY: 40,
      head: [
        ["No", "Unit Kerja", "Kegiatan", "Peminjam", "Ruangan", "Waktu", "Catatan"],
      ],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 25 },
        2: { cellWidth: 40 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 },
        5: { cellWidth: 30 },
        6: { cellWidth: "auto" },
      },
    });

    doc.save(`laporan-peminjaman-${format(currentDate, "MM-yyyy")}.pdf`);
  };

  return (
    <div className="container mx-auto py-6 px-3 sm:px-4 md:px-6 mb-6 max-w-7xl">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
        <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-dashed border-slate-300 shadow-none">
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
                  <SelectItem
                    key={month}
                    value={index.toString()}
                    className="rounded-lg focus:bg-slate-50 cursor-pointer"
                  >
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-28">
            <Select
              value={currentDate.getFullYear().toString()}
              onValueChange={handleYearChange}
            >
              <SelectTrigger className="h-9 rounded-xl border-dashed border-slate-300 shadow-none focus:ring-0 bg-transparent hover:border-slate-400 focus:border-slate-400">
                <SelectValue placeholder="Tahun" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-dashed border-slate-300 shadow-none">
                {YEARS.map((year) => (
                  <SelectItem
                    key={year}
                    value={year.toString()}
                    className="rounded-lg focus:bg-slate-50 cursor-pointer"
                  >
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            className="h-10 border-dashed border-slate-300 rounded-xl hover:bg-slate-50 flex items-center gap-2 text-slate-700 shadow-none"
          >
            <FileDown className="h-4 w-4" />
            <span>Export PDF</span>
          </Button>
          <Button
            asChild
            className="h-10 rounded-xl bg-black text-white hover:bg-slate-800 shadow-none flex items-center gap-2 text-sm font-medium border border-transparent"
          >
            <Link href="/meeting-room/add">
              <PlusCircle className="h-4 w-4" />
              <span>Booking Jadwal</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Table Content */}
      <BookingTable
        bookings={paginatedBookings}
        rooms={rooms}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalEntries={filteredBookings.length}
        onPageChange={setCurrentPage}
        onEdit={startEdit}
        onDelete={(id) => setDeletingId(id)}
      />

      {/* Edit Dialog */}
      <BookingEditDialog
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        form={editForm}
        onFormChange={setEditForm}
        onSave={handleSaveEdit}
        isSaving={isSaving}
      />

      {/* Delete Alert */}
      <AlertDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <AlertDialogContent className="rounded-xl border border-dashed border-slate-300 shadow-none">
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Booking akan dihapus permanen dari sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-dashed border-slate-300 shadow-none">
              Batal
            </AlertDialogCancel>
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
