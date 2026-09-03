"use client";

import { format, isSameDay } from "date-fns";
import { id } from "date-fns/locale";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { type Booking, type Room } from "../types";

const INSTITUTION_COLORS: Record<string, string> = {
  "Biro Umum": "bg-blue-50 text-blue-700 border-blue-200",
  "Biro SDM": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Biro Keuangan": "bg-amber-50 text-amber-700 border-amber-200",
  "Biro Hukum": "bg-purple-50 text-purple-700 border-purple-200",
  "Biro Perencanaan": "bg-rose-50 text-rose-700 border-rose-200",
  Pusdatin: "bg-cyan-50 text-cyan-700 border-cyan-200",
  Inspektorat: "bg-indigo-50 text-indigo-700 border-indigo-200",
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

export interface BookingTableProps {
  bookings: Booking[];
  rooms: Room[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalEntries: number;
  onPageChange: (page: number) => void;
  onEdit: (booking: Booking) => void;
  onDelete: (id: string) => void;
}

export function BookingTable({
  bookings,
  rooms,
  loading,
  currentPage,
  totalPages,
  itemsPerPage,
  totalEntries,
  onPageChange,
  onEdit,
  onDelete,
}: BookingTableProps) {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  return (
    <>
      <Card className="border border-dashed border-slate-300 shadow-none bg-white flex flex-col overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
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
                  <TableCell colSpan={8} className="h-24 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Memuat data...
                    </div>
                  </TableCell>
                </TableRow>
              ) : bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                      <p className="text-sm font-medium">Tidak ada data peminjaman</p>
                      <p className="text-xs">Coba ubah filter bulan atau pencarian Anda.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking, index) => {
                  const roomNames = booking.roomIds
                    .map((rid) => rooms.find((r) => r.id === rid)?.name)
                    .filter(Boolean)
                    .join(", ");

                  const startDate = new Date(booking.payload.bookingStart);
                  const endDate = booking.payload.bookingEnd ? new Date(booking.payload.bookingEnd) : startDate;
                  const isSame = isSameDay(startDate, endDate);
                  const dateStr = isSame
                    ? format(startDate, "d MMM yyyy", { locale: id })
                    : `${format(startDate, "d MMM")} - ${format(endDate, "d MMM yyyy", { locale: id })}`;

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
                          {booking.payload.institutionName}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[200px]" title={booking.payload.purpose}>
                        <span className="font-semibold text-slate-900 line-clamp-2">
                          {booking.payload.purpose}
                        </span>
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
                          <DropdownMenuContent
                            align="end"
                            className="w-[160px] rounded-xl border-dashed border-slate-300 shadow-none"
                          >
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onEdit(booking)}>
                              <Pencil className="mr-2 h-3.5 w-3.5" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onDelete(booking.id)}
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
          Showing {startIndex + 1} to {Math.min(endIndex, totalEntries)} of {totalEntries} entries
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
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
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0 rounded-lg border-dashed border-slate-300 shadow-none"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}
