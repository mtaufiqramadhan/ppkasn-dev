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
  Info,
  User as UserIcon,
  NotebookPen,
  Trash2,
  CalendarClock,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { User } from "@supabase/supabase-js";

import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

type ISOString = string;
type RoomId = string;
type BookingId = string;

interface Room {
  readonly id: RoomId;
  readonly name: string;
  readonly floor: number | string;
}

interface BookingPayload {
  readonly bookingStart: ISOString;
  readonly bookingEnd?: ISOString;
  readonly startTime?: string;
  readonly endTime?: string;
  readonly name: string;
  readonly institutionType: string;
  readonly institutionName: string;
  readonly phoneNumber: string;
  readonly purpose?: string;
  readonly notes?: string;
  readonly roomSetup: "Island" | "U-shape";
  readonly attendees: number;
}

interface Booking {
  readonly id: BookingId;
  readonly payload: BookingPayload;
  readonly roomIds: RoomId[];
}

interface DetailState {
  readonly roomId?: RoomId;
  readonly items: Booking[];
  readonly title?: string;
}

type BookingsMap = Record<RoomId, Record<string, Booking[]>>;

interface CalendarCell {
  readonly startDay: number;
  readonly span: number;
  readonly items: Booking[];
}

interface SupabaseRoomRow {
  id: string;
  name: string | null;
  floor: number | null;
  location: string | null;
}

interface SupabaseBookingPayload {
  bookingStart?: string;
  bookingEnd?: string;
  startTime?: string;
  endTime?: string;
  name?: string;
  institutionType?: string;
  institutionName?: string;
  phoneNumber?: string;
  purpose?: string;
  notes?: string;
  roomSetup?: "Island" | "U-shape";
  attendees?: number;
}

interface SupabaseBookingRow {
  id: string;
  room_ids: string[] | null;
  payload: SupabaseBookingPayload | null;
}

const COLLATOR = new Intl.Collator("id", {
  numeric: true,
  sensitivity: "base",
});

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i),
  label: format(new Date(2024, i, 1), "MMMM"),
}));

const toDateOnly = (iso: string): Date => new Date(iso.split("T")[0]);

const getMonthBounds = (year: number, month: number) => {
  const start = startOfMonth(new Date(year, month, 1));
  const end = endOfMonth(start);
  return { start, end };
};

const dateRangesOverlap = (
  aStartISO: string,
  aEndISO: string,
  bStartISO: string,
  bEndISO: string
): boolean => {
  const aStart = toDateOnly(aStartISO);
  const aEnd = toDateOnly(aEndISO);
  const bStart = toDateOnly(bStartISO);
  const bEnd = toDateOnly(bEndISO);
  return !(aEnd < bStart || bEnd < aStart);
};

const parseFloor = (value: number | string) => {
  if (typeof value === "number" && Number.isFinite(value))
    return { kind: "num", num: value } as const;
  const s = String(value ?? "").trim();
  const asNum = Number(s);
  if (s !== "" && Number.isFinite(asNum))
    return { kind: "num", num: asNum } as const;
  return { kind: "text", text: s || "—" } as const;
};

const compareRooms = (a: Room, b: Room): number => {
  const fa = parseFloor(a.floor);
  const fb = parseFloor(b.floor);

  if (fa.kind === "num" && fb.kind === "num") return fa.num - fb.num;
  if (fa.kind === "num") return -1;
  if (fb.kind === "num") return 1;

  const floorCmp = COLLATOR.compare(fa.text, fb.text);
  return floorCmp !== 0 ? floorCmp : COLLATOR.compare(a.name, b.name);
};

const buildBookingsMap = (
  bookings: Booking[],
  monthStart: Date,
  monthEnd: Date
): BookingsMap => {
  const map: BookingsMap = {};

  for (const booking of bookings) {
    const start = new Date(booking.payload.bookingStart);
    const end = new Date(
      booking.payload.bookingEnd ?? booking.payload.bookingStart
    );

    const rangeStart = start < monthStart ? monthStart : start;
    const rangeEnd = end > monthEnd ? monthEnd : end;

    const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd });

    for (const roomId of booking.roomIds) {
      if (!map[roomId]) map[roomId] = {};
      for (const day of days) {
        const key = format(day, "yyyy-MM-dd");
        if (!map[roomId][key]) map[roomId][key] = [];
        map[roomId][key].push(booking);
      }
    }
  }
  return map;
};

const getBookingListSignature = (bookings: Booking[]): string =>
  bookings.length === 0 ? "" : bookings.map((b) => b.id).sort().join("|");

const getCalendarCells = (
  roomId: RoomId,
  daysInMonth: number,
  year: number,
  month: number,
  bookingsMap: BookingsMap
): CalendarCell[] => {
  const result: CalendarCell[] = [];
  let day = 1;

  while (day <= daysInMonth) {
    const dateKey = format(new Date(year, month, day), "yyyy-MM-dd");
    const items = bookingsMap[roomId]?.[dateKey] ?? [];

    if (items.length === 0) {
      result.push({ startDay: day, span: 1, items: [] });
      day += 1;
      continue;
    }

    let span = 1;
    const currentSignature = getBookingListSignature(items);

    while (day + span <= daysInMonth) {
      const nextDateKey = format(
        new Date(year, month, day + span),
        "yyyy-MM-dd"
      );
      const nextItems = bookingsMap[roomId]?.[nextDateKey] ?? [];
      const nextSignature = getBookingListSignature(nextItems);

      if (nextItems.length === 0 || nextSignature !== currentSignature) {
        break;
      }
      span++;
    }
    result.push({ startDay: day, span, items });
    day += span;
  }

  return result;
};

const fetchRooms = async (): Promise<Room[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("assets")
    .select("id, name, floor, location")
    .eq("type", "ruangan");

  if (error) {
    console.error("fetchRooms error:", error);
    return [];
  }

  const rows = (data || []) as unknown as SupabaseRoomRow[];

  return rows.map((d) => ({
    id: d.id,
    name: d.name ?? "—",
    floor: d.floor ?? d.location ?? "-",
  }));
};

const fetchBookings = async (
  startISO: string,
  endISO: string
): Promise<Booking[]> => {
  const supabase = createClient();

  const { data, error } = await supabase.from("room_bookings").select("*");

  if (error) {
    console.error("fetchBookings error:", error.message);
    return [];
  }

  const rows = (data || []) as unknown as SupabaseBookingRow[];

  const results: Booking[] = rows.map((d) => {
    const p = d.payload || {};
    return {
      id: d.id,
      payload: {
        bookingStart: p.bookingStart ?? "",
        bookingEnd: p.bookingEnd,
        startTime: p.startTime,
        endTime: p.endTime,
        name: p.name ?? "",
        institutionType: p.institutionType ?? "Kemensetneg",
        institutionName: p.institutionName ?? "",
        phoneNumber: p.phoneNumber ?? "",
        purpose: p.purpose,
        notes: p.notes,
        roomSetup: p.roomSetup ?? "Island",
        attendees: p.attendees ?? 0,
      },
      roomIds: d.room_ids || [],
    };
  });

  return results.filter((b) => {
    try {
      const bs = String(b.payload.bookingStart);
      const be = String(b.payload.bookingEnd ?? b.payload.bookingStart);
      return dateRangesOverlap(startISO, endISO, bs, be);
    } catch {
      return false;
    }
  });
};

const deleteBooking = async (id: string): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase.from("room_bookings").delete().eq("id", id);
  if (error) throw new Error("Gagal menghapus booking: " + error.message);
};

const generatePDF = (
  rooms: Room[],
  bookingsMap: BookingsMap,
  year: number,
  month: number
) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  doc.setFontSize(16);
  doc.text(
    `Jadwal Kegiatan ${format(new Date(year, month, 1), "MMMM yyyy")}`,
    14,
    20
  );

  const roomMap = new Map(rooms.map((r) => [r.id, r.name]));
  const uniqueBookings = new Map<string, Booking>();

  for (const roomId in bookingsMap) {
    const roomBookings = bookingsMap[roomId];
    for (const dateKey in roomBookings) {
      const list = roomBookings[dateKey];
      list.forEach((b) => uniqueBookings.set(b.id, b));
    }
  }

  const sortedBookings = Array.from(uniqueBookings.values()).sort(
    (a, b) =>
      new Date(a.payload.bookingStart).getTime() -
      new Date(b.payload.bookingStart).getTime()
  );

  const rows = sortedBookings.map((booking, idx) => {
    const start = new Date(booking.payload.bookingStart);
    const end = booking.payload.bookingEnd
      ? new Date(booking.payload.bookingEnd)
      : null;
    const dateFormatter = new Intl.DateTimeFormat("id-ID", {
      dateStyle: "long",
    });
    const dateRange =
      end && end.getTime() !== start.getTime()
        ? `${dateFormatter.format(start)} - ${dateFormatter.format(end)}`
        : dateFormatter.format(start);

    const roomNames = booking.roomIds
      .map((id) => roomMap.get(id) || "Unknown")
      .join(", ");

    const keterangan = [
      `Peminjam: ${booking.payload.name}`,
      `Institusi: ${booking.payload.institutionName} (${booking.payload.institutionType})`,
      `Waktu: ${booking.payload.startTime || "-"} - ${booking.payload.endTime || "-"}`,
      `Peserta: ${booking.payload.attendees} orang`,
      `Setup: ${booking.payload.roomSetup}`,
      `Catatan: ${booking.payload.notes || "-"}`,
    ].join("\n");

    return [
      idx + 1,
      booking.payload.purpose || "-",
      dateRange,
      roomNames,
      keterangan,
    ];
  });

  autoTable(doc, {
    startY: 30,
    head: [["No", "Kegiatan", "Tanggal", "Ruangan", "Keterangan"]],
    body: rows,
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" },
    headStyles: {
      fillColor: [200, 200, 200],
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 40 },
      2: { cellWidth: 40 },
      3: { cellWidth: 30 },
      4: { cellWidth: 70 },
    },
    margin: { left: 10, right: 10 },
  });

  doc.save(
    `jadwal_kegiatan_${String(month + 1).padStart(2, "0")}_${year}.pdf`
  );
};

function useCalendarData(year: number, month: number) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookingsMap, setBookingsMap] = useState<BookingsMap>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { start: monthStart, end: monthEnd } = useMemo(
    () => getMonthBounds(year, month),
    [year, month]
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedRooms, fetchedBookings] = await Promise.all([
        fetchRooms(),
        fetchBookings(monthStart.toISOString(), monthEnd.toISOString()),
      ]);
      setRooms(fetchedRooms);
      setBookingsMap(buildBookingsMap(fetchedBookings, monthStart, monthEnd));
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data booking. Periksa koneksi Supabase.");
      setBookingsMap({});
    } finally {
      setLoading(false);
    }
  }, [monthStart, monthEnd]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const sortedRooms = useMemo(() => [...rooms].sort(compareRooms), [rooms]);
  const daysInMonth = monthEnd.getDate();

  return {
    rooms: sortedRooms,
    bookingsMap,
    loading,
    error,
    refresh,
    daysInMonth,
  };
}

function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return user;
}

const Legend: React.FC = () => (
  <div className="flex flex-row items-center gap-3 text-xs sm:text-sm">
    <div className="flex items-center gap-2">
      <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
      <span className="font-medium text-slate-600">Terisi</span>
    </div>
  </div>
);

const ErrorBanner: React.FC<{ message: string }> = ({ message }) => (
  <div className="mt-4 rounded-xl border border-dashed border-red-200 bg-red-50/50 px-4 py-3 text-sm text-red-700">
    {message}
  </div>
);

interface CalendarControlsProps {
  readonly month: number;
  readonly year: number;
  readonly today: Date;
  readonly onChangeMonth: (m: number) => void;
  readonly onChangeYear: (y: number) => void;
  readonly onExport: () => void;
}

const CalendarControls: React.FC<CalendarControlsProps> = ({
  month,
  year,
  today,
  onChangeMonth,
  onChangeYear,
  onExport,
}) => {
  const handlePrev = () => {
    const prev = subMonths(new Date(year, month, 1), 1);
    onChangeYear(prev.getFullYear());
    onChangeMonth(prev.getMonth());
  };

  const handleNext = () => {
    const next = addMonths(new Date(year, month, 1), 1);
    onChangeYear(next.getFullYear());
    onChangeMonth(next.getMonth());
  };

  const yearOptions = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => today.getFullYear() - 2 + i).map(
        String
      ),
    [today]
  );

  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 w-full justify-end">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrev}
          className="rounded-xl hover:bg-slate-100 h-9 w-9"
        >
          <ChevronLeft className="h-5 w-5 text-slate-600" />
        </Button>

        <Select
          value={String(month)}
          onValueChange={(v) => onChangeMonth(Number(v))}
        >
          <SelectTrigger className="w-full sm:w-[140px] h-9 rounded-xl border-dashed border-slate-300 shadow-none focus:ring-0 bg-transparent hover:border-slate-400 focus:border-slate-400">
            <SelectValue placeholder="Bulan" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-dashed border-slate-300 shadow-none">
            {MONTH_OPTIONS.map((m) => (
              <SelectItem
                key={m.value}
                value={m.value}
                className="rounded-lg focus:bg-slate-50 cursor-pointer"
              >
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={String(year)}
          onValueChange={(v) => onChangeYear(Number(v))}
        >
          <SelectTrigger className="w-full sm:w-[100px] h-9 rounded-xl border-dashed border-slate-300 shadow-none focus:ring-0 bg-transparent hover:border-slate-400 focus:border-slate-400">
            <SelectValue placeholder="Tahun" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-dashed border-slate-300 shadow-none">
            {yearOptions.map((y) => (
              <SelectItem
                key={y}
                value={y}
                className="rounded-lg focus:bg-slate-50 cursor-pointer"
              >
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleNext}
          className="rounded-xl hover:bg-slate-100 h-9 w-9"
        >
          <ChevronRight className="h-5 w-5 text-slate-600" />
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto ml-2 pl-2 border-l border-dashed border-slate-200">
        <Button
          variant="outline"
          className="flex items-center gap-2 w-full sm:w-auto rounded-xl border-dashed border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-none text-slate-700 bg-transparent"
          onClick={onExport}
        >
          Laporan Kegiatan
        </Button>

        <Button
          asChild
          className="flex items-center justify-center gap-2 text-sm w-full sm:w-auto rounded-xl bg-black text-white hover:bg-slate-800 shadow-none border border-transparent font-medium"
        >
          <Link href="/room/add">
            <PlusCircle className="h-4 w-4" />
            <span>Booking Jadwal</span>
          </Link>
        </Button>
      </div>
    </div>
  );
};

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ElementType;
  fullWidth?: boolean;
  className?: string;
}

const DetailRow: React.FC<DetailRowProps> = ({
  label,
  value,
  icon: Icon,
  fullWidth = false,
  className,
}) => (
  <div
    className={cn(
      "flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 py-3 border-b border-dashed border-slate-200 last:border-0",
      fullWidth ? "w-full" : "",
      className
    )}
  >
    <div className="flex items-center gap-2 w-[140px] shrink-0">
      {Icon && <Icon className="h-3.5 w-3.5 text-slate-400" />}
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </span>
    </div>
    <div className="flex-1">
      <span className="text-sm font-medium text-slate-900 leading-relaxed block">
        {value}
      </span>
    </div>
  </div>
);

const BookingItemCard: React.FC<{
  booking: Booking;
  user: User | null;
  onDelete: () => void;
  showAction?: boolean;
}> = ({ booking, user, onDelete, showAction = true }) => {
  const dateFormatter = new Intl.DateTimeFormat("id-ID", { dateStyle: "long" });
  const startDate = new Date(booking.payload.bookingStart);
  const endDate = new Date(
    booking.payload.bookingEnd || booking.payload.bookingStart
  );
  const dateStr = dateFormatter.format(startDate);
  const endDateStr = dateFormatter.format(endDate);
  const fullDateRange =
    dateStr === endDateStr ? dateStr : `${dateStr} - ${endDateStr}`;

  return (
    <div className="relative space-y-4">
      <Tabs defaultValue="kegiatan" className="w-full">
        <TabsList className="bg-transparent h-auto p-0 flex flex-wrap gap-2 justify-start w-full border-slate-300 sm:w-auto px-4 py-4">
          <TabsTrigger
            value="kegiatan"
            className="rounded-xl border border-dashed border-slate-300 data-[state=active]:border-black data-[state=active]:bg-black data-[state=active]:text-white data-[state=inactive]:text-slate-500 hover:text-slate-900 hover:border-slate-400 px-4 py-2.5 font-bold text-sm transition-all bg-white"
          >
            <CalendarClock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kegiatan</span>
          </TabsTrigger>
          <TabsTrigger
            value="peminjam"
            className="rounded-xl border border-dashed border-slate-300 data-[state=active]:border-black data-[state=active]:bg-black data-[state=active]:text-white data-[state=inactive]:text-slate-500 hover:text-slate-900 hover:border-slate-400 px-4 py-2.5 font-bold text-sm transition-all bg-white"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Peminjam</span>
          </TabsTrigger>
          <TabsTrigger
            value="catatan"
            className="rounded-xl border border-dashed border-slate-300 data-[state=active]:border-black data-[state=active]:bg-black data-[state=active]:text-white data-[state=inactive]:text-slate-500 hover:text-slate-900 hover:border-slate-400 px-4 py-2.5 font-bold text-sm transition-all bg-white"
          >
            <NotebookPen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Catatan</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="kegiatan"
          className="mt-4 focus-visible:outline-none focus-visible:ring-0 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <div className="rounded-xl border border-dashed border-slate-300 bg-white overflow-hidden p-6">
            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-6 border-b border-dashed border-slate-200 pb-3">
              <CalendarClock className="w-4 h-4 text-slate-500" />
              Detail Waktu & Kegiatan
            </h4>
            <div className="flex flex-col">
              <DetailRow label="Tanggal" value={fullDateRange} />
              <DetailRow
                label="Waktu"
                value={
                  <span>
                    {booking.payload.startTime || "--:--"} —{" "}
                    {booking.payload.endTime || "--:--"}
                  </span>
                }
              />
              <DetailRow
                label="Kegiatan"
                value={booking.payload.purpose}
                fullWidth
              />
              <DetailRow label="Setup" value={booking.payload.roomSetup} />
              <DetailRow
                label="Peserta"
                value={`${booking.payload.attendees} Orang`}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="peminjam"
          className="mt-4 focus-visible:outline-none focus-visible:ring-0 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <div className="rounded-xl border border-dashed border-slate-300 bg-white overflow-hidden p-6">
            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-6 border-b border-dashed border-slate-200 pb-3">
              <UserIcon className="w-4 h-4 text-slate-500" />
              Informasi Peminjam
            </h4>
            <div className="flex flex-col">
              <DetailRow label="Nama" value={booking.payload.name} />
              {user && (
                <DetailRow
                  label="Kontak"
                  value={booking.payload.phoneNumber || "-"}
                />
              )}
              <DetailRow
                label="Instansi"
                value={
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {booking.payload.institutionName}
                    </span>
                    <span className="text-xs text-slate-400 mt-0.5 uppercase tracking-wider font-bold">
                      {booking.payload.institutionType}
                    </span>
                  </div>
                }
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="catatan"
          className="mt-4 focus-visible:outline-none focus-visible:ring-0 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <div className="rounded-xl border border-dashed border-slate-300 bg-white overflow-hidden p-6 min-h-[200px]">
            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-6 border-b border-dashed border-slate-200 pb-3">
              <NotebookPen className="w-4 h-4 text-slate-500" />
              Catatan Tambahan
            </h4>
            <div className="p-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
              {booking.payload.notes ? (
                <p className="text-sm text-slate-700 italic leading-relaxed whitespace-pre-wrap">
                  "{booking.payload.notes}"
                </p>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                  <Info className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-xs uppercase font-bold tracking-widest">
                    Tidak ada catatan
                  </span>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {user && showAction && (
        <div className="pt-2 flex justify-end">
          <Button
            variant="destructive"
            size="sm"
            className="h-9 px-4 text-xs font-bold uppercase tracking-wide rounded-lg shadow-none border border-dashed border-red-200 text-red-600 bg-white hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all flex items-center justify-center"
            onClick={onDelete}
          >
            <Trash2 className="w-3.5 h-3.5 mr-2" />
            Tolak Peminjaman
          </Button>
        </div>
      )}
    </div>
  );
};

interface BookingDetailListProps {
  readonly detail: DetailState | null;
  readonly user: User | null;
  readonly onRequestDelete: (b: Booking) => void;
}

const BookingDetailList: React.FC<BookingDetailListProps> = ({
  detail,
  user,
  onRequestDelete,
}) => {
  if (!detail) return null;
  const isSingleItem = detail.items.length === 1;

  return (
    <div className="flex flex-col h-[64vh] -mx-4 sm:-mx-6">
      <div className="flex-1 overflow-y-auto px-4 sm:px-6">
        <div className="space-y-6">
          {detail.items.length === 0 ? (
            <div className="flex flex-col h-[64vh] items-center justify-center py-12 px-4 border border-dashed border-slate-300 rounded-xl bg-slate-50/50 text-center">
              <Info className="h-8 w-8 text-slate-300 mb-3" />
              <p className="text-slate-600 font-medium">
                Tidak ada detail booking
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Slot waktu ini masih kosong
              </p>
            </div>
          ) : (
            detail.items.map((item) => (
              <BookingItemCard
                key={item.id}
                booking={item}
                user={user}
                onDelete={() => onRequestDelete(item)}
                showAction={!isSingleItem}
              />
            ))
          )}
        </div>
      </div>

      {isSingleItem && user && detail.items.length > 0 && (
        <div className="shrink-0 p-4 sm:px-6 sm:py-4 flex justify-end z-10">
          <Button
            variant="destructive"
            size="sm"
            className="px-6 text-xs font-bold uppercase tracking-wide rounded-lg shadow-none transition-all flex items-center"
            onClick={() => onRequestDelete(detail.items[0])}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Tolak Peminjaman
          </Button>
        </div>
      )}
    </div>
  );
};

interface RoomRowProps {
  readonly room: Room;
  readonly index: number;
  readonly daysInMonth: number;
  readonly bookingsMap: BookingsMap;
  readonly year: number;
  readonly month: number;
  readonly onCellClick: (
    roomId: string,
    items: Booking[],
    title: string
  ) => void;
}

const RoomRow: React.FC<RoomRowProps> = React.memo(
  ({
    room,
    index,
    daysInMonth,
    bookingsMap,
    year,
    month,
    onCellClick,
  }) => {
    const cells = useMemo(
      () => getCalendarCells(room.id, daysInMonth, year, month, bookingsMap),
      [room.id, daysInMonth, year, month, bookingsMap]
    );

    return (
      <tr className="group">
        <td className="border-b border-r border-dashed border-slate-200 p-3 text-center text-xs font-mono text-slate-400 bg-white group-hover:bg-slate-50 transition-colors">
          {index + 1}
        </td>
        <td className="border-b border-r border-dashed border-slate-200 p-3 text-sm font-medium text-slate-900 truncate bg-white group-hover:bg-slate-50 transition-colors">
          {room.name}
        </td>
        <td className="border-b border-r border-dashed border-slate-200 p-3 text-center text-xs text-slate-500 bg-white group-hover:bg-slate-50 transition-colors">
          {String(room.floor).match(/^\d+$/) ? `${room.floor}` : room.floor}
        </td>
        {cells.map((cell, cIdx) => {
          const hasBooking = cell.items.length > 0;
          return (
            <td
              key={cIdx}
              colSpan={cell.span}
              className={cn(
                "border-b border-l border-dashed border-slate-200 p-0 relative transition-all duration-200 h-10",
                hasBooking
                  ? "bg-red-50/50 hover:bg-red-50 cursor-pointer"
                  : "hover:bg-slate-50"
              )}
              onClick={() => {
                if (hasBooking) onCellClick(room.id, cell.items, room.name);
              }}
            >
              {hasBooking && (
                <div className="w-full h-full flex items-center justify-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="w-full h-full flex items-center justify-center group/cell">
                          <div className="h-2 w-2 rounded-full bg-red-400 group-hover/cell:scale-125 transition-transform" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="border-dashed border-slate-300 shadow-none py-3">
                        <div className="text-xs space-y-1">
                          {cell.items.map((b) => (
                            <div key={b.id} className="font-medium">
                              {b.payload.institutionName}
                            </div>
                          ))}
                          {cell.items.map((b) => (
                            <div key={b.id} className="font-xs text-slate-300">
                              {b.payload.purpose}
                            </div>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </td>
          );
        })}
      </tr>
    );
  }
);

RoomRow.displayName = "RoomRow";

const RoomCalendarPage: React.FC = () => {
  const today = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  const { rooms, bookingsMap, loading, error, refresh, daysInMonth } =
    useCalendarData(year, month);
  const user = useAuthUser();

  const [detail, setDetail] = useState<DetailState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Booking | null>(null);

  const handleExport = useCallback(() => {
    generatePDF(rooms, bookingsMap, year, month);
  }, [rooms, bookingsMap, year, month]);

  const handleDeleteBooking = async (id: string) => {
    try {
      await deleteBooking(id);
      await refresh();
      setDetail((prev) =>
        prev
          ? {
            ...prev,
            items: prev.items.filter((b) => b.id !== id),
          }
          : null
      );
      setDeleteTarget(null);
    } catch {
      alert("Gagal menghapus booking");
    }
  };

  const handleOpenDetail = useCallback(
    (roomId: string | undefined, items: Booking[], title?: string) => {
      setDetail({ roomId, items, title });
    },
    []
  );

  return (
    <div className="w-full mx-auto py-6 px-3 sm:px-4 md:px-6 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col">
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-5 shadow-none">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Legend />
            <CalendarControls
              month={month}
              year={year}
              today={today}
              onChangeMonth={setMonth}
              onChangeYear={setYear}
              onExport={handleExport}
            />
          </div>
        </div>

        {error && <ErrorBanner message={error} />}

        <div className="mt-6 rounded-xl border border-dashed border-slate-300 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="w-full">
              <table className="table-auto text-sm border-collapse w-full">
                <thead className="bg-white border-b border-dashed border-slate-300">
                  <tr>
                    <th className="border-r border-dashed border-slate-200 p-3 text-center font-medium text-slate-700 whitespace-nowrap w-[40px]">
                      No
                    </th>
                    <th className="border-r border-dashed border-slate-200 p-3 text-left font-medium text-slate-700 whitespace-nowrap min-w-[150px]">
                      Nama Ruangan
                    </th>
                    <th className="border-r border-dashed border-slate-200 p-3 text-center font-medium text-slate-700 whitespace-nowrap">
                      Lantai
                    </th>
                    {Array.from({ length: daysInMonth }, (_, i) => (
                      <th
                        key={i}
                        className="border-r border-dashed border-slate-200 p-1 text-center text-xs text-slate-600 font-normal min-w-[24px]"
                      >
                        {i + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={daysInMonth + 3} className="text-center p-8">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <Loader2 className="h-8 w-8 animate-spin mb-2" />
                          <p>Memuat jadwal...</p>
                        </div>
                      </td>
                    </tr>
                  ) : rooms.length === 0 ? (
                    <tr>
                      <td colSpan={daysInMonth + 3} className="text-center p-8">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <p>Tidak ada data ruangan</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    rooms.map((room, idx) => (
                      <RoomRow
                        key={room.id}
                        room={room}
                        index={idx}
                        daysInMonth={daysInMonth}
                        bookingsMap={bookingsMap}
                        year={year}
                        month={month}
                        onCellClick={handleOpenDetail}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="w-full max-w-md border-2 border-dashed border-slate-300 shadow-none rounded-xl">
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Apakah kamu yakin ingin menghapus booking{" "}
            <span className="font-semibold">
              {deleteTarget?.payload.institutionName}
            </span>{" "}
            pada tanggal{" "}
            {deleteTarget &&
              new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(
                new Date(deleteTarget.payload.bookingStart)
              )}
            ?
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              className="border-dashed border-slate-300 hover:bg-slate-50 shadow-none"
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteTarget && handleDeleteBooking(deleteTarget.id)
              }
            >
              Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="w-full max-w-lg px-4 sm:w-[90vw] shadow-none rounded-xl">
          <DialogHeader className="py-2">
            <DialogTitle>Detail Booking</DialogTitle>
          </DialogHeader>
          <BookingDetailList
            detail={detail}
            user={user}
            onRequestDelete={(b) => setDeleteTarget(b)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomCalendarPage;
