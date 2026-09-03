"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Loader2,
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { User } from "@supabase/supabase-js";

import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  SupabaseRoomRepository,
  SupabaseBookingRepository,
  type Room,
  type Booking,
} from "@/features/dorm";
import { createClient } from "@/lib/supabase/client";

type BookingPayload = Booking["payload"];
type Participant = NonNullable<BookingPayload["participants"]>[number];

interface BookingDetailState {
  roomId?: string;
  items: Booking[];
  title?: string;
  rooms?: Room[];
}

type BookingsMap = Record<string, Record<string, Booking[]>>;

interface MonthOption {
  value: string;
  label: string;
}

const MONTH_OPTIONS: MonthOption[] = Array.from({ length: 12 }, (_, i) => ({
  value: String(i),
  label: format(new Date(2024, i, 1), "MMMM"),
}));

const ID_LOCALE = "id-ID";

const getMonthBounds = (year: number, month: number) => {
  const start = startOfMonth(new Date(year, month, 1));
  const end = endOfMonth(start);
  return { start, end };
};

const extractRoomNumber = (roomName: string): string => {
  const match = roomName.match(/\d+/);
  return match ? match[0] : roomName;
};

const collator = new Intl.Collator("id", {
  numeric: true,
  sensitivity: "base",
});

function parseFloor(
  v: number | string
): { kind: "num"; num: number } | { kind: "text"; text: string } {
  if (typeof v === "number" && Number.isFinite(v)) return { kind: "num", num: v };
  const s = String(v ?? "").trim();
  const n = Number(s);
  if (s && Number.isFinite(n)) return { kind: "num", num: n };
  const match = s.match(/\d+/);
  if (match) return { kind: "num", num: Number(match[0]) };
  return { kind: "text", text: s || "—" };
}

function compareRooms(a: Room, b: Room): number {
  const fa = parseFloor(a.floor);
  const fb = parseFloor(b.floor);

  if (fa.kind === "num" && fb.kind === "num") {
    if (fa.num !== fb.num) return fa.num - fb.num;
  } else if (fa.kind === "num" && fb.kind === "text") return -1;
  else if (fa.kind === "text" && fb.kind === "num") return 1;
  else if (fa.kind === "text" && fb.kind === "text") {
    const c = collator.compare(fa.text, fb.text);
    if (c !== 0) return c;
  }
  return collator.compare(a.name, b.name);
}

function buildBookingsMap(
  bookings: Booking[],
  monthStart: Date,
  monthEnd: Date
): BookingsMap {
  const map: BookingsMap = {};
  for (const b of bookings) {
    const start = new Date(b.payload.bookingStart);
    const end = new Date(b.payload.bookingEnd ?? b.payload.bookingStart);
    const rangeStart = start < monthStart ? monthStart : start;
    const rangeEnd = end > monthEnd ? monthEnd : end;
    const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd });

    for (const roomId of b.roomIds) {
      if (!map[roomId]) map[roomId] = {};
      for (const day of days) {
        const key = format(day, "yyyy-MM-dd");
        (map[roomId][key] ||= []).push(b);
      }
    }
  }
  return map;
}

function formatDateID(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(ID_LOCALE, options).format(new Date(date));
}

const PdfService = {
  exportCheckInOut(booking: Booking, sortedRooms: Room[]) {
    const { payload, roomIds } = booking;
    const participants = payload.participants || [];
    const roomAssignments = payload.roomAssignments || {};
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 12;
    const maxWidth = pageWidth - 2 * margin;
    let y = margin;

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("DAFTAR CHECK IN DAN CHECK OUT", pageWidth / 2, y + 10, { align: "center" });
    y += 20;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const eventLines = doc.splitTextToSize(payload.purpose || "—", maxWidth);
    doc.text(eventLines, pageWidth / 2, y, { align: "center" });
    y += eventLines.length * 5 + 5;

    const start = new Date(payload.bookingStart);
    const end = payload.bookingEnd ? new Date(payload.bookingEnd) : start;
    const range = `${formatDateID(start, { dateStyle: "long" })}${payload.bookingEnd && payload.bookingEnd !== payload.bookingStart
      ? ` s.d. ${formatDateID(end, { dateStyle: "long" })}`
      : ""
      }`;
    const rangeLines = doc.splitTextToSize(range, maxWidth);
    doc.text(rangeLines, pageWidth / 2, y, { align: "center" });
    y += rangeLines.length * 5 + 12;

    if (!participants.length) {
      doc.setFontSize(12);
      doc.text("Tidak ada data peserta.", margin, y);
      doc.save(`checkin_checkout_${format(new Date(), "yyyyMMdd")}.pdf`);
      return;
    }

    interface ParticipantRow {
      no: number;
      name: string;
      roomNumber: string;
      floor: string;
    }

    const rows: ParticipantRow[] = [];
    let no = 1;

    const getRoomInfo = (roomId: string) => {
      const room = sortedRooms.find((r) => r.id === roomId);
      if (!room) return { number: "—", floor: "—" };
      return { number: extractRoomNumber(room.name), floor: String(room.floor || "-") };
    };

    const sortedRoomIds = [...roomIds].sort((a, b) => {
      const ra = sortedRooms.find((r) => r.id === a);
      const rb = sortedRooms.find((r) => r.id === b);
      if (!ra || !rb) return 0;
      return compareRooms(ra, rb);
    });

    const allParticipantsWithRoom: Array<{
      participant: Participant;
      roomId: string;
      roomInfo: { number: string; floor: string };
    }> = [];

    sortedRoomIds.forEach((roomId) => {
      const assignedIds = roomAssignments[roomId] || [];
      const roomInfo = getRoomInfo(roomId);
      assignedIds.forEach((pid) => {
        const p = participants.find((part) => part.id === pid);
        if (p) allParticipantsWithRoom.push({ participant: p, roomId, roomInfo });
      });
    });

    const allAssignedIds = Object.values(roomAssignments).flat();
    participants.forEach((p) => {
      if (!allAssignedIds.includes(p.id)) {
        allParticipantsWithRoom.push({
          participant: p,
          roomId: "",
          roomInfo: { number: "-", floor: "—" },
        });
      }
    });

    allParticipantsWithRoom.sort((a, b) =>
      a.participant.name.localeCompare(b.participant.name, "id", { sensitivity: "base" })
    );

    allParticipantsWithRoom.forEach(({ participant, roomInfo }) => {
      rows.push({
        no: no++,
        name: participant.name,
        roomNumber: roomInfo.number,
        floor: roomInfo.floor,
      });
    });

    autoTable(doc, {
      head: [["No", "Nama", "Kamar", "Lantai", "Tgl Check In", "Waktu", "TTD", "Tgl Check Out", "Waktu", "TTD"]],
      body: rows.map((r) => [r.no, r.name, r.roomNumber, r.floor, "", "", "", "", "", ""]),
      startY: y,
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 9,
        cellPadding: 3,
        overflow: "linebreak",
        halign: "center",
        valign: "middle",
        lineWidth: 0.3,
        lineColor: [0, 0, 0],
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: 0,
        fontStyle: "bold",
        halign: "center",
        lineWidth: 0.3,
      },
      columnStyles: {
        0: { cellWidth: 12, halign: "center" },
        1: { cellWidth: 75, halign: "left" },
        2: { cellWidth: 22 },
        3: { cellWidth: 15 },
        4: { cellWidth: 28 },
        5: { cellWidth: 18 },
        6: { cellWidth: 28 },
        7: { cellWidth: 28 },
        8: { cellWidth: 18 },
        9: { cellWidth: 28 },
      },
      theme: "grid",
    });

    doc.save(`checkin_checkout_${format(new Date(), "yyyyMMdd")}.pdf`);
  },

  exportRoomSign(booking: Booking, sortedRooms: Room[]) {
    const { payload, roomIds } = booking;
    const participants = payload.participants || [];
    const roomAssignments = payload.roomAssignments || {};
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 15;
    const gap = 8;
    const cardH = (pageH - 2 * margin - gap) / 2;
    const contentW = pageW - 2 * margin;

    const sorted = [...roomIds].sort((a, b) => {
      const ra = sortedRooms.find((r) => r.id === a);
      const rb = sortedRooms.find((r) => r.id === b);
      if (!ra || !rb) return 0;
      return compareRooms(ra, rb);
    });

    let idx = 0;
    sorted.forEach((roomId) => {
      const assigned = roomAssignments[roomId] ?? [];
      const inRoom = participants.filter((p) => assigned.includes(p.id));
      if (!inRoom.length) return;

      const room = sortedRooms.find((r) => r.id === roomId);
      const name = room?.name ?? `Kamar ${roomId}`;
      const top = idx % 2 === 0;
      const y = top ? margin : margin + cardH + gap;

      if (idx % 2 === 0 && idx > 0) doc.addPage();

      doc.setDrawColor(0);
      doc.setLineWidth(0.5);
      doc.setLineDashPattern([2, 2], 0);
      doc.rect(margin - 2, y - 2, contentW + 4, cardH + 4, "S");
      doc.setLineDashPattern([], 0);

      const startDate = new Date(payload.bookingStart);
      const endDate = payload.bookingEnd ? new Date(payload.bookingEnd) : startDate;
      const dateRange = `${formatDateID(startDate, { day: "numeric", month: "long", year: "numeric" })}${payload.bookingEnd && payload.bookingEnd !== payload.bookingStart
        ? ` – ${formatDateID(endDate, { day: "numeric", month: "long", year: "numeric" })}`
        : ""
        }`;

      const cy = y;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text(payload.purpose || "Kegiatan Asrama", pageW / 2, cy + 12, { align: "center" });
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(dateRange, pageW / 2, cy + 20, { align: "center" });

      doc.setLineWidth(1);
      doc.rect(margin, cy + 29, contentW, 20, "S");

      doc.setFontSize(28);
      doc.setFont("helvetica", "bold");
      doc.text(name, pageW / 2, cy + 42, { align: "center" });

      const names = inRoom.slice(0, 6);
      doc.setFontSize(30);
      doc.setFont("helvetica", "normal");
      names.forEach((p, i) => {
        doc.text(p.name, pageW / 2, cy + 65 + i * 20, { align: "center" });
      });

      const picY = y + cardH - 12;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(
        `PIC LAYANAN ASRAMA: ${payload.name} (${payload.phoneNumber})`,
        margin + 5,
        picY + 7
      );
      idx++;
    });

    doc.save(`nomor-kamar_${format(new Date(), "yyyyMMdd")}.pdf`);
  },
};

const ErrorBanner = React.memo(({ message }: { message: string }) => (
  <div className="mt-4 rounded-xl border border-dashed border-red-200 bg-red-50/50 px-4 py-3 text-sm text-red-700">
    {message}
  </div>
));
ErrorBanner.displayName = "ErrorBanner";

const Legend = React.memo(() => (
  <div className="flex items-center gap-3 text-xs sm:text-sm">
    <div className="flex items-center gap-2">
      <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
      <span className="font-medium text-slate-600">Terisi</span>
    </div>
  </div>
));
Legend.displayName = "Legend";

const CalendarControls = React.memo(({
  month,
  year,
  today,
  onPrevMonth,
  onNextMonth,
  onMonthChange,
  onYearChange,
}: {
  month: number;
  year: number;
  today: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onMonthChange: (m: number) => void;
  onYearChange: (y: number) => void;
}) => (
  <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 w-full justify-end">
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" onClick={onPrevMonth} className="rounded-xl hover:bg-slate-100 h-9 w-9">
        <ChevronLeft className="h-5 w-5 text-slate-600" />
      </Button>

      <Select value={String(month)} onValueChange={(v) => onMonthChange(Number(v))}>
        <SelectTrigger className="w-full sm:w-[140px] h-9 rounded-xl border-dashed border-slate-300 shadow-none focus:ring-0 bg-transparent  focus:border-slate-400">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-dashed border-slate-300 shadow-none">
          {MONTH_OPTIONS.map((m) => (
            <SelectItem key={m.value} value={m.value} className="rounded-lg focus:bg-slate-50 cursor-pointer">
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={String(year)} onValueChange={(v) => onYearChange(Number(v))}>
        <SelectTrigger className="w-full sm:w-[100px] h-9 rounded-xl border-dashed border-slate-300 shadow-none focus:ring-0 bg-transparent  focus:border-slate-400">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-dashed border-slate-300 shadow-none">
          {Array.from({ length: 5 }, (_, i) => {
            const y = today.getFullYear() - 2 + i;
            return (
              <SelectItem key={y} value={String(y)} className="rounded-lg focus:bg-slate-50 cursor-pointer">
                {y}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      <Button variant="ghost" size="icon" onClick={onNextMonth} className="rounded-xl hover:bg-slate-100 h-9 w-9">
        <ChevronRight className="h-5 w-5 text-slate-600" />
      </Button>
    </div>

    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto ml-2 pl-2 border-l border-dashed border-slate-200">
      <Button asChild className="flex items-center justify-center gap-2 text-sm w-full sm:w-auto rounded-xl bg-black text-white hover:bg-slate-800 shadow-none border border-transparent font-medium">
        <Link href="/dorm/add">
          <PlusCircle className="h-4 w-4" />
          <span>Booking Jadwal</span>
        </Link>
      </Button>
    </div>
  </div>
));
CalendarControls.displayName = "CalendarControls";

interface CalendarTableProps {
  rooms: Room[];
  bookingsMap: BookingsMap;
  daysInMonth: number;
  year: number;
  month: number;
  loading: boolean;
  onOpenDetail: (roomId?: string, items?: Booking[], title?: string) => void;
}

const CalendarTable = React.memo(({
  rooms,
  bookingsMap,
  daysInMonth,
  year,
  month,
  loading,
  onOpenDetail,
}: CalendarTableProps) => {
  const getCells = useCallback(
    (roomId: string) => {
      const cells: { startDay: number; span: number; items: Booking[] }[] = [];
      let day = 1;

      while (day <= daysInMonth) {
        const key = format(new Date(year, month, day), "yyyy-MM-dd");
        const items = bookingsMap[roomId]?.[key] ?? [];
        if (!items.length) {
          cells.push({ startDay: day, span: 1, items: [] });
          day++;
          continue;
        }

        let span = 1;
        const currentKeyStr = items.map((b) => b.id).sort().join("|");

        while (day + span <= daysInMonth) {
          const nextKey = format(new Date(year, month, day + span), "yyyy-MM-dd");
          const nextItems = bookingsMap[roomId]?.[nextKey] ?? [];
          if (!nextItems.length) break;
          const nextKeyStr = nextItems.map((b) => b.id).sort().join("|");
          if (currentKeyStr !== nextKeyStr) break;
          span++;
        }
        cells.push({ startDay: day, span, items });
        day += span;
      }
      return cells;
    },
    [daysInMonth, year, month, bookingsMap]
  );

  if (loading) {
    return (
      <TableWrapper daysInMonth={daysInMonth}>
        <tr>
          <td colSpan={3 + daysInMonth} className="p-6 text-center text-gray-500">
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" /> Memuat…
            </span>
          </td>
        </tr>
      </TableWrapper>
    );
  }

  if (rooms.length === 0) {
    return (
      <TableWrapper daysInMonth={daysInMonth}>
        <tr>
          <td colSpan={3 + daysInMonth} className="p-6 text-center text-gray-500">
            Tidak ada data asrama
          </td>
        </tr>
      </TableWrapper>
    );
  }

  return (
    <TableWrapper daysInMonth={daysInMonth}>
      {rooms.map((room, idx) => (
        <tr key={room.id} className="hover:bg-gray-50 transition-colors duration-150 align-top">
          <td className="border-b border-r border-dashed border-slate-200 p-2 text-center text-xs font-mono text-slate-400 align-middle">
            {idx + 1}
          </td>
          <td className="border-b border-r border-dashed border-slate-200 p-2 truncate font-medium text-slate-900 align-middle text-sm" title={room.name}>
            {room.name}
          </td>
          <td className="border-b border-r border-dashed border-slate-200 p-2 text-center text-xs text-slate-500 align-middle">
            {room.floor}
          </td>
          {getCells(room.id).map(({ startDay, span, items }) => {
            const has = items.length > 0;
            return (
              <td
                key={`${room.id}-${startDay}`}
                colSpan={span}
                className={cn(
                  "border p-2 text-center transition-all duration-150 align-top relative",
                  has ? "bg-red-50 hover:bg-red-100" : "bg-white hover:bg-gray-50"
                )}
              >
                <div className="w-full h-10 text-xs flex items-center justify-center">
                  {has && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => onOpenDetail(room.id, items, room.name)}
                            className="inline-flex items-center gap-1 bg-red-50 border border-dashed border-red-200 text-red-700 px-2 py-0.5 rounded-full text-xs font-bold cursor-pointer hover:bg-red-100 transition-colors"
                          >
                            {items.reduce((acc, b) => {
                              const roomParts = b.payload.roomAssignments?.[room.id] || [];
                              return acc + roomParts.length;
                            }, 0)}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          {items.map((b) => (
                            <div key={b.id} className="mb-2 last:mb-0">
                              <div className="font-semibold text-sm">{b.payload.institutionName}</div>
                              <div className="text-xs text-gray-300 mt-1">{b.payload.purpose ?? "-"}</div>
                            </div>
                          ))}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </td>
            );
          })}
        </tr>
      ))}
    </TableWrapper>
  );
});
CalendarTable.displayName = "CalendarTable";

const TableWrapper = ({ daysInMonth, children }: { daysInMonth: number; children: React.ReactNode }) => (
  <table className="table-fixed text-sm border-collapse w-full">
    <thead className="bg-slate-50 border-b border-dashed border-slate-200 sticky top-0 z-20">
      <tr>
        <th className="border-r border-dashed border-slate-200 p-3 w-10 text-center font-bold text-xs text-slate-500 uppercase tracking-wider">No</th>
        <th className="border-r border-dashed border-slate-200 p-3 w-36 text-left font-bold text-xs text-slate-500 uppercase tracking-wider">Nama Ruangan</th>
        <th className="border-r border-dashed border-slate-200 p-3 w-16 text-center font-bold text-xs text-slate-500 uppercase tracking-wider">Lantai</th>
        {Array.from({ length: daysInMonth }, (_, i) => (
          <th
            key={i}
            className="border-l border-dashed border-slate-200 first:border-l-0 p-2 text-center text-xs text-slate-500 font-bold select-none"
            style={{ width: `calc((100% - 14rem - 3.5rem - 5rem) / ${daysInMonth})` }}
          >
            {i + 1}
          </th>
        ))}
      </tr>
    </thead>
    <tbody className="bg-white">{children}</tbody>
  </table>
);

const BookingDetailList = React.memo(({
  detail,
  user,
  onSelectBooking,
}: {
  detail: BookingDetailState;
  user: User | null;
  onSelectBooking: (b: Booking) => void;
}) => {
  return (
    <div className="space-y-6">
      {detail.items.map((b) => (
        <div
          key={b.id}
          className="space-y-4 border-b border-dashed border-slate-200 last:border-0 pb-6 mb-6 last:pb-0 last:mb-0 cursor-pointer group"
          onClick={() => onSelectBooking(b)}
        >
          <div className="space-y-3">
            <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-white  transition-colors">
              <div className="text-sm mb-2 text-slate-900">
                <strong className="font-bold text-slate-500 uppercase text-xs tracking-wider mr-2">Tanggal:</strong>{" "}
                {formatDateID(b.payload.bookingStart, { dateStyle: "long" })} -{" "}
                {formatDateID(b.payload.bookingEnd || b.payload.bookingStart, { dateStyle: "long" })}
              </div>
              <div className="text-sm text-slate-900">
                <strong className="font-bold text-slate-500 uppercase text-xs tracking-wider mr-2">Waktu:</strong> {b.payload.startTime} - {b.payload.endTime}
              </div>
            </div>

            <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-white  transition-colors">
              <div className="text-sm mb-3 pb-3 border-b border-dashed border-slate-200">
                <div className="font-bold text-slate-500 uppercase text-xs tracking-wider mb-1">Nama Peminjam</div>
                <div className="font-medium text-slate-900 text-base">{b.payload.name}</div>
              </div>

              <div className="text-sm mb-3">
                <div className="font-bold text-slate-500 uppercase text-xs tracking-wider mb-1">Institusi / Unit Kerja</div>
                <div className="text-slate-900">
                  {b.payload.institutionName} <span className="text-slate-400">({b.payload.institutionType})</span>
                </div>
              </div>

              {user && (
                <div className="text-sm mb-3">
                  <div className="font-bold text-slate-500 uppercase text-xs tracking-wider mb-1">Nomor Whatsapp</div>
                  <div className="text-slate-900">{b.payload.phoneNumber}</div>
                </div>
              )}

              <div className="text-sm">
                <div className="font-bold text-slate-500 uppercase text-xs tracking-wider mb-1">Kegiatan</div>
                <div className="text-slate-900">{b.payload.purpose || "-"}</div>
              </div>
            </div>
          </div>

          <BookingParticipants booking={b} detail={detail} />
        </div>
      ))}
    </div>
  );
});
BookingDetailList.displayName = "BookingDetailList";

const BookingParticipants = ({ booking, detail }: { booking: Booking; detail: BookingDetailState }) => {
  const participants = booking.payload.participants;
  if (!participants?.length) {
    return (
      <div className="text-sm text-slate-400 italic py-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
        Tidak ada data peserta
      </div>
    );
  }

  const roomAssignments = booking.payload.roomAssignments;
  const hasAssignments = roomAssignments && Object.keys(roomAssignments).length > 0;

  return (
    <div className="mt-4">
      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3 pl-1">
        Total Peserta ({participants.length} orang)
      </h4>

      {hasAssignments ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {booking.roomIds.map((roomId) => {
            const assigned = roomAssignments[roomId] || [];
            const parts = participants.filter((p) => assigned.includes(p.id));
            if (!parts.length) return null;
            const room = detail.rooms?.find((r) => r.id === roomId);

            return (
              <div key={roomId} className="rounded-xl p-4 border border-dashed border-slate-300 bg-slate-50/30">
                <div className="font-bold text-sm mb-3 text-slate-900 flex items-center justify-between">
                  <span>{room?.name || `Kamar ${roomId}`}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                    {parts.length}/3
                  </span>
                </div>
                <div className="space-y-2">
                  {parts.map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{p.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">{p.unitKerja}</span>
                        <span className={cn(
                          "w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold",
                          p.gender === "L" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"
                        )}>
                          {p.gender === "L" ? "L" : "P"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {(() => {
            const allAssigned = Object.values(roomAssignments).flat();
            const un = participants.filter((p) => !allAssigned.includes(p.id));
            if (!un.length) return null;
            return (
              <div className="bg-amber-50 rounded-xl p-4 border border-dashed border-amber-200">
                <div className="font-bold text-sm mb-3 text-amber-900">Belum Ditempatkan ({un.length})</div>
                <div className="text-xs text-gray-700">{un.map((p) => p.name).join(", ")}</div>
              </div>
            );
          })()}
        </div>
      ) : (
        <div className="bg-slate-50 rounded-xl p-4 border border-dashed border-slate-200">
          <div className="text-xs space-y-2">
            {participants.map((p) => (
              <div key={p.id} className="flex items-center justify-between">
                <span className="font-medium text-slate-700">{p.name}</span>
                <span className="text-slate-500">{p.unitKerja}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function RoomCalendarPage() {
  const [today] = useState(() => new Date());
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookingsMap, setBookingsMap] = useState<BookingsMap>({});
  const [detail, setDetail] = useState<BookingDetailState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const { start: monthStart, end: monthEnd } = useMemo(() => getMonthBounds(year, month), [year, month]);
  const daysInMonth = monthEnd.getDate();

  const roomRepo = useMemo(() => new SupabaseRoomRepository(), []);
  const bookingRepo = useMemo(() => new SupabaseBookingRepository(), []);
  const sortedRooms = useMemo(() => [...rooms].sort(compareRooms), [rooms]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [loadedRooms, bookings] = await Promise.all([
          roomRepo.getRoomsForRange(),
          bookingRepo.listBookingsOverlapping(monthStart.toISOString(), monthEnd.toISOString()),
        ]);
        if (!mounted) return;
        setRooms(loadedRooms);
        setBookingsMap(buildBookingsMap(bookings, monthStart, monthEnd));
      } catch {
        if (mounted) {
          setError("Gagal memuat data booking.");
          setBookingsMap({});
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [month, year, monthStart, monthEnd, roomRepo, bookingRepo]);

  const handleDeleteBooking = useCallback(async (id: string) => {
    try {
      await bookingRepo.deleteBooking(id);
      const bookings = await bookingRepo.listBookingsOverlapping(monthStart.toISOString(), monthEnd.toISOString());
      setBookingsMap(buildBookingsMap(bookings, monthStart, monthEnd));
      setDetail((prev) => (prev ? { ...prev, items: prev.items.filter((b) => b.id !== id) } : prev));
      setDeleteTarget(null);
      setSelectedBooking(null);
    } catch {
      alert("Gagal menghapus booking");
    }
  }, [bookingRepo, monthStart, monthEnd]);

  const handlePrevMonth = useCallback(() => {
    const prev = subMonths(new Date(year, month, 1), 1);
    setYear(prev.getFullYear());
    setMonth(prev.getMonth());
  }, [year, month]);

  const handleNextMonth = useCallback(() => {
    const next = addMonths(new Date(year, month, 1), 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  }, [year, month]);

  const handleOpenDetail = useCallback((roomId?: string, items?: Booking[], title?: string) => {
    setDetail({ roomId, items: items ?? [], title, rooms: sortedRooms });
    setSelectedBooking(items?.[0] ?? null);
  }, [sortedRooms]);

  return (
    <div className="container mx-auto py-6 px-3 sm:px-4 md:px-6 mb-6">
      <div className="flex flex-col">
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-5 shadow-none">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Legend />
            <CalendarControls
              month={month}
              year={year}
              today={today}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onMonthChange={setMonth}
              onYearChange={setYear}
            />
          </div>
        </div>

        {error && <ErrorBanner message={error} />}

        <div className="mt-6 rounded-xl border border-dashed border-slate-300 overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <div className="w-full">
              <CalendarTable
                rooms={sortedRooms}
                bookingsMap={bookingsMap}
                daysInMonth={daysInMonth}
                year={year}
                month={month}
                loading={loading}
                onOpenDetail={handleOpenDetail}
              />
            </div>
          </div>
        </div>
      </div>

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="w-full max-w-md shadow-none border-dashed border-slate-300 rounded-xl sm:rounded-xl">
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Hapus booking <strong>{deleteTarget?.payload.institutionName}</strong> pada{" "}
            {deleteTarget && formatDateID(deleteTarget.payload.bookingStart, { dateStyle: "long" })}?
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={() => deleteTarget && handleDeleteBooking(deleteTarget.id)}>
              Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="flex flex-col max-h-[90vh] w-full max-w-lg p-0 shadow-none border-dashed border-slate-300 rounded-xl sm:rounded-xl">
          <DialogHeader className="px-4 pt-6 pb-2">
            <DialogTitle>Detail Booking</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-4">
            {detail && <BookingDetailList detail={detail} user={user} onSelectBooking={setSelectedBooking} />}
          </div>
          {user && selectedBooking && (
            <div className="border-t p-4 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button size="lg" onClick={() => PdfService.exportCheckInOut(selectedBooking, sortedRooms)}>
                  Form Check In
                </Button>
                <Button size="lg" onClick={() => PdfService.exportRoomSign(selectedBooking, sortedRooms)}>
                  Cetak Nomor Kamar
                </Button>
              </div>
              <Button
                variant="destructive"
                size="lg"
                className="w-full"
                onClick={() => setDeleteTarget(selectedBooking)}
              >
                Tolak Peminjaman
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
