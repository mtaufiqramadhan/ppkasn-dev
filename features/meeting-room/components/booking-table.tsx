"use client";

import { format, isSameDay, isValid } from "date-fns";
import { id } from "date-fns/locale";
import {
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TablePagination } from "@/components/ui/table-pagination";
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

export interface BookingTableProps {
  bookings: Booking[];
  rooms: Room[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalEntries: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size:number)=>void;
  onEdit: (booking: Booking) => void;
  onDelete: (id: string) => void;
}

export function BookingTable({
  bookings,
  rooms,
  loading,
  currentPage,
  itemsPerPage,
  totalEntries,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
}: BookingTableProps) {

  return (
    <>
      <div className="px-4 pb-4 sm:px-6 sm:pb-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="[&_th]:h-14! [&_th]:py-4!">
              <TableRow className="border-b border-dashed border-border hover:bg-transparent">
                <TableHead className="w-14">No</TableHead>
                <TableHead className="min-w-48">Peminjam</TableHead>
                <TableHead className="min-w-64">Kegiatan &amp; Catatan</TableHead>
                <TableHead className="min-w-44">Ruangan</TableHead>
                <TableHead className="min-w-52">Jadwal</TableHead>
                <TableHead className="w-16 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Memuat data...
                    </div>
                  </TableCell>
                </TableRow>
              ) : bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <p className="text-sm font-medium">Tidak ada data peminjaman</p>
                      <p className="text-xs">Coba ubah filter bulan atau pencarian Anda.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking, index) => {
                  const roomNames = booking.roomIds.map((roomId) => ({
                    id: roomId,
                    name: rooms.find((room) => room.id === roomId)?.name || "Ruangan tidak tersedia",
                  }));
                  const startDate = new Date(booking.payload.bookingStart);
                  const endDate = booking.payload.bookingEnd ? new Date(booking.payload.bookingEnd) : startDate;
                  const dateStr = !isValid(startDate) || !isValid(endDate)
                    ? "Tanggal belum tersedia"
                    : isSameDay(startDate, endDate)
                    ? format(startDate, "d MMM yyyy", { locale: id })
                    : `${format(startDate, "d MMM yyyy", { locale: id })} – ${format(endDate, "d MMM yyyy", { locale: id })}`;
                  const timeStr = booking.payload.startTime && booking.payload.endTime
                    ? `${booking.payload.startTime} – ${booking.payload.endTime}`
                    : booking.payload.startTime
                    ? `Mulai ${booking.payload.startTime}`
                    : booking.payload.endTime
                    ? `Sampai ${booking.payload.endTime}`
                    : "Jam belum tersedia";

                  return (
                    <TableRow
                      key={booking.id}
                      className="border-b border-dashed border-border align-top! transition-colors hover:bg-muted/50 last:border-0"
                    >
                      <TableCell className="w-14 align-top! tabular-nums text-muted-foreground">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </TableCell>
                      <TableCell className="align-top! whitespace-normal">
                        <div className="max-w-60 space-y-1">
                          <p className="break-words text-sm font-medium text-foreground">{booking.payload.name || "Nama belum tersedia"}</p>
                          <p className="break-words text-sm leading-relaxed text-muted-foreground">{booking.payload.institutionName || "Unit kerja belum tersedia"}</p>
                        </div>
                      </TableCell>
                      <TableCell className="align-top! whitespace-normal">
                        <div className="max-w-80 space-y-2">
                          <p className="break-words text-sm font-medium leading-relaxed text-foreground">{booking.payload.purpose || "Kegiatan belum diisi"}</p>
                          {booking.payload.notes && <p className="break-words text-sm leading-relaxed text-muted-foreground"><span className="font-medium">Catatan: </span>{booking.payload.notes}</p>}
                        </div>
                      </TableCell>
                      <TableCell className="align-top! whitespace-normal">
                        {roomNames.length > 0 ? (
                          <ul className="max-w-56 space-y-1.5 text-sm leading-relaxed text-foreground">
                            {roomNames.map((room) => <li key={room.id} className="break-words">{room.name}</li>)}
                          </ul>
                        ) : <span className="text-sm text-muted-foreground">Belum ada ruangan</span>}
                      </TableCell>
                      <TableCell className="align-top! whitespace-normal">
                        <div className="max-w-60 space-y-1.5">
                          <p className="text-sm font-medium leading-relaxed text-foreground">{dateStr}</p>
                          <p className="flex items-center gap-1.5 text-sm tabular-nums text-muted-foreground">
                            <Clock className="size-3.5 shrink-0" aria-hidden="true" />
                            {timeStr}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Aksi peminjaman {booking.payload.name}</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-[160px] rounded-2xl sm:rounded-3xl border-dashed border-border shadow-none"
                          >
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onEdit(booking)}>
                              <Pencil className="mr-2 h-3.5 w-3.5" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onDelete(booking.id)}
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
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
      </div>

      <div className="px-4 sm:px-6"><TablePagination page={currentPage} pageSize={itemsPerPage} totalItems={totalEntries} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} itemLabel="peminjaman" /></div>
    </>
  );
}
