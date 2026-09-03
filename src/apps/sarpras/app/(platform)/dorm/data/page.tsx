"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { format, isSameDay } from "date-fns";
import { id } from "date-fns/locale";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  Search,
  Users,
  FileDown,
  Bed,
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
import { Textarea } from "@/components/ui/textarea";
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
import { createClient } from "@/lib/supabase/client";
import { UNIT_KERJA_OPTIONS } from "@/features/meeting-room";

interface Room {
  id: string;
  name: string;
  floor?: number | string | null;
  capacity?: number;
}

interface Participant {
  id: string;
  name: string;
  gender?: "L" | "P";
  unitKerja?: string;
}

interface BookingPayload {
  bookingStart: string;
  bookingEnd?: string;
  startTime?: string;
  endTime?: string;
  name: string;
  institutionName: string;
  purpose?: string;
  notes?: string;
  phoneNumber?: string;
  participants?: Participant[];
  roomAssignments?: Record<string, string[]>;
}

interface Booking {
  id: string;
  roomIds: string[];
  payload: BookingPayload;
  created_at?: string;
}

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - 2 + i);

const INSTITUTION_COLORS: Record<string, string> = {
  "Biro Umum": "bg-blue-50 text-blue-700 border-blue-200",
  "Biro SDM": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Biro Keuangan": "bg-amber-50 text-amber-700 border-amber-200",
  "Biro Hukum": "bg-purple-50 text-purple-700 border-purple-200",
  "Biro Perencanaan": "bg-rose-50 text-rose-700 border-rose-200",
  "Pusdatin": "bg-cyan-50 text-cyan-700 border-cyan-200",
  "Inspektorat": "bg-indigo-50 text-indigo-700 border-indigo-200",
};

const getInstitutionColor = (institution: string) => {
  if (INSTITUTION_COLORS[institution]) {
    return INSTITUTION_COLORS[institution];
  }
  const colors = [
    "bg-sky-50 text-sky-700 border-sky-200",
    "bg-teal-50 text-teal-700 border-teal-200",
    "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
    "bg-orange-50 text-orange-700 border-orange-200",
    "bg-lime-50 text-lime-700 border-lime-200",
  ];
  let hash = 0;
  for (let i = 0; i < institution.length; i++) {
    hash = institution.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export default function DormBookingsDataPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

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

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      // Fetch asrama rooms
      const { data: roomsData, error: roomsError } = await supabase
        .from("assets")
        .select("id, name, floor, capacity")
        .eq("type", "asrama")
        .order("name", { ascending: true });

      if (roomsError) throw roomsError;
      const loadedRooms: Room[] = (roomsData || []).map((r) => ({
        id: r.id,
        name: r.name ?? "—",
        floor: r.floor,
        capacity: r.capacity,
      }));
      setRooms(loadedRooms);

      const roomIdsSet = new Set(loadedRooms.map((r) => r.id));

      // Fetch bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("room_bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (bookingsError) throw bookingsError;

      const loadedBookings: Booking[] = (bookingsData || [])
        .map((b) => ({
          id: b.id,
          roomIds: b.room_ids || [],
          payload: {
            bookingStart: b.payload?.bookingStart ?? "",
            bookingEnd: b.payload?.bookingEnd,
            startTime: b.payload?.startTime,
            endTime: b.payload?.endTime,
            name: b.payload?.name ?? "",
            institutionName: b.payload?.institutionName ?? "",
            purpose: b.payload?.purpose,
            notes: b.payload?.notes,
            phoneNumber: b.payload?.phoneNumber,
            participants: b.payload?.participants || [],
            roomAssignments: b.payload?.roomAssignments || {},
          },
          created_at: b.created_at,
        }))
        // Only include bookings associated with asrama rooms
        .filter((b) => b.roomIds.some((id: string) => roomIdsSet.has(id)));

      setBookings(loadedBookings);
    } catch (err) {
      console.error("Error loading dorm bookings:", err);
      toast.error("Gagal memuat data peminjaman asrama");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
          (b.payload.purpose && b.payload.purpose.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (b.payload.participants &&
            b.payload.participants.some((p) =>
              p.name.toLowerCase().includes(searchTerm.toLowerCase())
            ));

        return isSameMonth && isSameYear && matchesSearch;
      })
      .sort((a, b) => new Date(b.payload.bookingStart).getTime() - new Date(a.payload.bookingStart).getTime());
  }, [bookings, searchTerm, currentDate]);

  // Reset pagination when filters change
  useEffect(() => {
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
      const supabase = createClient();
      const { error } = await supabase.from("room_bookings").delete().eq("id", deletingId);
      if (error) throw error;

      toast.success("Data peminjaman asrama berhasil dihapus");
      loadData();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Gagal menghapus data";
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
      phoneNumber: booking.payload.phoneNumber,
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingBooking) return;
    setIsSaving(true);
    try {
      const supabase = createClient();
      const { data: existing, error: fetchErr } = await supabase
        .from("room_bookings")
        .select("payload")
        .eq("id", editingBooking.id)
        .single();

      if (fetchErr || !existing) throw new Error("Data peminjaman tidak ditemukan");

      const newPayload = { ...((existing.payload as Record<string, unknown>) || {}), ...editForm };

      const { error: updateErr } = await supabase
        .from("room_bookings")
        .update({ payload: newPayload })
        .eq("id", editingBooking.id);

      if (updateErr) throw updateErr;

      toast.success("Data peminjaman asrama berhasil diperbarui");
      setIsEditOpen(false);
      loadData();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Gagal memperbarui data peminjaman";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  // Export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Add Title
    doc.setFontSize(16);
    doc.text("Laporan Data Reservasi Asrama", 14, 20);
    doc.setFontSize(10);
    doc.text(`Periode: ${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`, 14, 27);
    doc.text(`Dicetak pada: ${format(new Date(), "dd MMM yyyy HH:mm", { locale: id })}`, 14, 32);

    // Prepare Table Data
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

      const participantCount = b.payload.participants ? `${b.payload.participants.length} orang` : "-";

      return [
        i + 1,
        b.payload.institutionName || "-",
        b.payload.purpose || "-",
        `${b.payload.name || "-"}\n${b.payload.phoneNumber || ""}`,
        roomNames || "-",
        dateStr,
        participantCount,
        b.payload.notes || "-",
      ];
    });

    autoTable(doc, {
      startY: 40,
      head: [["No", "Unit Kerja", "Kegiatan", "PIC / Pemohon", "Kamar Asrama", "Periode", "Peserta", "Catatan"]],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 25 },
        2: { cellWidth: 35 },
        3: { cellWidth: 30 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 },
        6: { cellWidth: 18 },
        7: { cellWidth: "auto" },
      },
    });

    doc.save(`laporan-peminjaman-asrama-${format(currentDate, "MM-yyyy")}.pdf`);
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
                  <SelectItem key={month} value={index.toString()} className="rounded-lg focus:bg-slate-50 cursor-pointer">
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
                  <SelectItem key={year} value={year.toString()} className="rounded-lg focus:bg-slate-50 cursor-pointer">
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
              placeholder="Cari PIC, kegiatan, peserta..."
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
        </div>
      </div>

      {/* Table Content */}
      <Card className="border border-dashed border-slate-300 shadow-none bg-white flex flex-col overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-b border-dashed border-slate-200">
                <TableHead className="w-[50px] h-10 font-bold text-slate-400 uppercase tracking-wider text-[10px]">No</TableHead>
                <TableHead className="h-10 font-bold text-slate-400 uppercase tracking-wider text-[10px]">Unit Kerja</TableHead>
                <TableHead className="h-10 font-bold text-slate-400 uppercase tracking-wider text-[10px]">Kegiatan</TableHead>
                <TableHead className="h-10 font-bold text-slate-400 uppercase tracking-wider text-[10px]">Nama PIC</TableHead>
                <TableHead className="h-10 font-bold text-slate-400 uppercase tracking-wider text-[10px]">Kamar Asrama</TableHead>
                <TableHead className="h-10 font-bold text-slate-400 uppercase tracking-wider text-[10px]">Periode</TableHead>
                <TableHead className="h-10 font-bold text-slate-400 uppercase tracking-wider text-[10px]">Peserta</TableHead>
                <TableHead className="h-10 font-bold text-slate-400 uppercase tracking-wider text-[10px]">Catatan</TableHead>
                <TableHead className="text-right h-10 font-bold text-slate-400 uppercase tracking-wider text-[10px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Memuat data...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                      <p className="text-sm font-medium">Tidak ada data peminjaman asrama</p>
                      <p className="text-xs">Coba ubah filter bulan atau kata kunci pencarian Anda.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedBookings.map((booking, index) => {
                  const roomNames = booking.roomIds
                    .map((rid) => rooms.find((r) => r.id === rid)?.name)
                    .filter(Boolean)
                    .join(", ");

                  // Format Date
                  const startDate = new Date(booking.payload.bookingStart);
                  const endDate = booking.payload.bookingEnd
                    ? new Date(booking.payload.bookingEnd)
                    : startDate;
                  const isSame = isSameDay(startDate, endDate);
                  const dateStr = isSame
                    ? format(startDate, "d MMM yyyy", { locale: id })
                    : `${format(startDate, "d MMM")} - ${format(endDate, "d MMM yyyy", { locale: id })}`;

                  const participantCount = booking.payload.participants?.length || 0;

                  return (
                    <TableRow
                      key={booking.id}
                      className="group hover:bg-slate-50 transition-colors border-b border-dashed border-slate-200 last:border-0"
                    >
                      <TableCell className="font-medium text-slate-500 w-[50px]">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "text-[10px] font-bold px-2.5 py-1 rounded-md border border-dashed shadow-none whitespace-nowrap",
                            getInstitutionColor(booking.payload.institutionName)
                          )}
                        >
                          {booking.payload.institutionName || "Umum"}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[180px]" title={booking.payload.purpose}>
                        <span className="font-semibold text-slate-900 line-clamp-2">
                          {booking.payload.purpose || "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-700">
                            {booking.payload.name}
                          </span>
                          {booking.payload.phoneNumber && (
                            <span className="text-xs text-slate-400">
                              {booking.payload.phoneNumber}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 border border-dashed border-slate-300 px-2 py-1 text-xs font-medium text-slate-600">
                          <Bed className="h-3 w-3 text-slate-400" />
                          {roomNames || "Kamar tidak ditentukan"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-semibold text-slate-900">
                          {dateStr}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 border border-dashed border-slate-300 px-2 py-1 text-xs font-medium text-slate-700">
                          <Users className="h-3 w-3 text-slate-500" />
                          {participantCount} orang
                        </span>
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
                          <DropdownMenuContent
                            align="end"
                            className="w-[160px] rounded-xl border-dashed border-slate-300 shadow-none"
                          >
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
        <DialogContent className="sm:max-w-[425px] rounded-xl border border-dashed border-slate-300 shadow-none bg-white">
          <DialogHeader>
            <DialogTitle>Edit Reservasi Asrama</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="bookingStart" className="text-xs font-semibold">Tanggal Check In</Label>
                <Input
                  id="bookingStart"
                  type="date"
                  className="rounded-xl border-dashed border-slate-300 shadow-none focus:ring-0 focus:border-slate-400 text-xs h-9"
                  value={editForm.bookingStart ? String(editForm.bookingStart).split("T")[0] : ""}
                  onChange={(e) => setEditForm({ ...editForm, bookingStart: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bookingEnd" className="text-xs font-semibold">Tanggal Check Out</Label>
                <Input
                  id="bookingEnd"
                  type="date"
                  className="rounded-xl border-dashed border-slate-300 shadow-none focus:ring-0 focus:border-slate-400 text-xs h-9"
                  value={
                    editForm.bookingEnd
                      ? String(editForm.bookingEnd).split("T")[0]
                      : editForm.bookingStart
                      ? String(editForm.bookingStart).split("T")[0]
                      : ""
                  }
                  onChange={(e) => setEditForm({ ...editForm, bookingEnd: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-xs font-semibold">Nama Pemohon / PIC</Label>
              <Input
                id="name"
                className="rounded-xl border-dashed border-slate-300 shadow-none focus:ring-0 focus:border-slate-400 text-xs h-9"
                value={editForm.name || ""}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phoneNumber" className="text-xs font-semibold">No. HP / WhatsApp PIC</Label>
              <Input
                id="phoneNumber"
                className="rounded-xl border-dashed border-slate-300 shadow-none focus:ring-0 focus:border-slate-400 text-xs h-9"
                value={editForm.phoneNumber || ""}
                onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="unit" className="text-xs font-semibold">Unit Kerja</Label>
              <Select
                value={editForm.institutionName}
                onValueChange={(val) => setEditForm({ ...editForm, institutionName: val })}
              >
                <SelectTrigger className="rounded-xl border-dashed border-slate-300 shadow-none focus:ring-0 focus:border-slate-400 text-xs h-9">
                  <SelectValue placeholder="Pilih unit kerja" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-dashed border-slate-300 shadow-none">
                  {UNIT_KERJA_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt} className="rounded-lg focus:bg-slate-50 cursor-pointer text-xs">
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="purpose" className="text-xs font-semibold">Kegiatan</Label>
              <Input
                id="purpose"
                className="rounded-xl border-dashed border-slate-300 shadow-none focus:ring-0 focus:border-slate-400 text-xs h-9"
                value={editForm.purpose || ""}
                onChange={(e) => setEditForm({ ...editForm, purpose: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes" className="text-xs font-semibold">Catatan</Label>
              <Textarea
                id="notes"
                rows={3}
                className="rounded-xl border-dashed border-slate-300 shadow-none focus:ring-0 focus:border-slate-400 text-xs"
                value={editForm.notes || ""}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(false)}
              className="rounded-xl border-dashed border-slate-300 shadow-none hover:bg-slate-50 text-xs h-9"
            >
              Batal
            </Button>
            <Button
              size="sm"
              onClick={handleSaveEdit}
              disabled={isSaving}
              className="rounded-xl shadow-none bg-black hover:bg-slate-800 text-white text-xs h-9"
            >
              {isSaving && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Simpan Perubahan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent className="rounded-xl border border-dashed border-slate-300 shadow-none bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Data reservasi asrama akan dihapus permanen dari sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-dashed border-slate-300 shadow-none text-xs h-9">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 rounded-xl shadow-none text-white border-transparent text-xs h-9"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
