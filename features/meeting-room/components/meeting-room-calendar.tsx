"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { User } from "@supabase/supabase-js";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameDay,
  isSameMonth,
} from "date-fns";
import { id } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Trash2,
  CalendarClock,
  FileDown,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
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
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  UNIT_KERJA_OPTIONS,
  type Room,
  type Booking,
  type DetailState,
} from "../types";
import { bookingService } from "../services/meeting-room-service";
import { useCalendarData } from "../hooks/use-calendar-data";

// --- Sub-Components ---

const DetailRow: React.FC<{
  label: string;
  value: React.ReactNode;
  icon?: React.ElementType;
  fullWidth?: boolean;
}> = ({ label, value, icon: Icon, fullWidth = false }) => (
  <div
    className={cn(
      "flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 py-3 border-b border-dashed border-border last:border-0",
      fullWidth ? "w-full" : ""
    )}
  >
    <div className="flex items-center gap-2 w-[140px] shrink-0">
      {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
    </div>
    <div className="flex-1">
      <span className="text-sm font-medium text-foreground leading-relaxed block">
        {value}
      </span>
    </div>
  </div>
);

interface BookingDetailProps {
  booking: Booking;
  user: User | null;
  onDelete: () => void;
  roomName: string;
}

const BookingDetail: React.FC<BookingDetailProps> = ({
  booking,
  user,
  onDelete,
  roomName,
}) => {
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
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <span className="inline-flex items-center rounded-2xl sm:rounded-3xl bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground mt-2">
            {roomName}
          </span>
        </div>
      </div>

      <Tabs defaultValue="kegiatan" className="w-full">
        <TabsList className="bg-transparent h-auto p-1.5 sm:p-2 grid grid-cols-3 gap-2 w-full rounded-2xl sm:rounded-3xl border border-dashed border-border mb-4 items-center">
          <TabsTrigger
            value="kegiatan"
            className="rounded-2xl sm:rounded-3xl border border-border px-3 py-1.5 text-xs sm:text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary cursor-pointer"
          >
            Detail
          </TabsTrigger>
          <TabsTrigger
            value="peminjam"
            className="rounded-2xl sm:rounded-3xl border border-border px-3 py-1.5 text-xs sm:text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary cursor-pointer"
          >
            Peminjam
          </TabsTrigger>
          <TabsTrigger
            value="catatan"
            className="rounded-2xl sm:rounded-3xl border border-border px-3 py-1.5 text-xs sm:text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary cursor-pointer"
          >
            Catatan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kegiatan" className="mt-0">
          <div className="rounded-2xl sm:rounded-3xl border border-dashed border-border bg-muted/40 p-6 space-y-1">
            <DetailRow label="Tanggal" value={fullDateRange} />
            <DetailRow
              label="Waktu"
              value={`${booking.payload.startTime || "--:--"} - ${
                booking.payload.endTime || "--:--"
              }`}
            />
            <DetailRow
              label="Kegiatan"
              value={booking.payload.purpose}
              fullWidth
            />
          </div>
        </TabsContent>
        <TabsContent value="peminjam" className="mt-0">
          <div className="rounded-2xl sm:rounded-3xl border border-dashed border-border bg-muted/40 p-6 space-y-1">
            <DetailRow label="Nama" value={booking.payload.name} />
            <DetailRow
              label="Unit Kerja"
              value={booking.payload.institutionName}
            />
          </div>
        </TabsContent>
        <TabsContent value="catatan" className="mt-0">
          <div className="rounded-2xl sm:rounded-3xl border border-dashed border-border bg-muted/40 p-6 min-h-[120px]">
            {booking.payload.notes ? (
              <p className="text-sm text-foreground/80 italic">
                {booking.payload.notes}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Tidak ada catatan.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {user && (
        <div className="flex justify-end pt-4 border-t border-dashed border-border">
          <Button
            variant="destructive"
            onClick={onDelete}
            className="rounded-2xl sm:rounded-3xl"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Tolak Peminjaman
          </Button>
        </div>
      )}
    </div>
  );
};

interface MonthOption {
  value: string;
  label: string;
}

const MONTH_OPTIONS: MonthOption[] = Array.from({ length: 12 }, (_, i) => ({
  value: String(i),
  label: format(new Date(2024, i, 1), "MMMM", { locale: id }),
}));

const MeetingRoomLegend = React.memo(() => (
  <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs sm:text-sm">
    {UNIT_KERJA_OPTIONS.map((unit) => {
      let dotColor = "bg-muted-foreground";
      if (unit === "PUSBINTER") dotColor = "bg-blue-500";
      if (unit === "PUSBIN AKS") dotColor = "bg-amber-500";
      if (unit === "PPKASN") dotColor = "bg-red-500";
      if (unit === "Assessment Center") dotColor = "bg-purple-500";

      return (
        <div key={unit} className="flex items-center gap-2">
          <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", dotColor)} />
          <span className="font-medium text-slate-600 dark:text-neutral-300">
            {unit}
          </span>
        </div>
      );
    })}
  </div>
));
MeetingRoomLegend.displayName = "MeetingRoomLegend";

interface CalendarHeaderProps {
  month: number;
  year: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onChangeMonth: (m: number) => void;
  onChangeYear: (y: number) => void;
  onExport: () => void;
  user?: User | null;
  isAdmin?: boolean;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  month,
  year,
  onPrevMonth,
  onNextMonth,
  onChangeMonth,
  onChangeYear,
  onExport,
  isAdmin,
}) => {
  const currentYear = new Date().getFullYear();
  const yearOptions = useMemo(
    () => Array.from({ length: 5 }, (_, i) => String(currentYear - 2 + i)),
    [currentYear]
  );

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrevMonth}
          className="rounded-2xl sm:rounded-3xl hover:bg-slate-100 dark:hover:bg-muted h-11 w-11 text-slate-600 dark:text-neutral-400"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <Select
          value={String(month)}
          onValueChange={(v) => onChangeMonth(Number(v))}
        >
          <SelectTrigger className="w-full sm:w-[140px] h-11 rounded-2xl sm:rounded-3xl border-dashed border-slate-300 dark:border-border shadow-none focus:ring-0 bg-transparent hover:border-slate-400 focus:border-slate-400 text-xs sm:text-sm font-medium">
            <SelectValue placeholder="Bulan" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl sm:rounded-3xl border-dashed border-slate-300 dark:border-border shadow-none">
            {MONTH_OPTIONS.map((m) => (
              <SelectItem
                key={m.value}
                value={m.value}
                className="rounded-2xl sm:rounded-3xl focus:bg-slate-50 dark:focus:bg-muted cursor-pointer text-xs sm:text-sm"
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
          <SelectTrigger className="w-full sm:w-[100px] h-11 rounded-2xl sm:rounded-3xl border-dashed border-slate-300 dark:border-border shadow-none focus:ring-0 bg-transparent hover:border-slate-400 focus:border-slate-400 text-xs sm:text-sm font-medium">
            <SelectValue placeholder="Tahun" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl sm:rounded-3xl border-dashed border-slate-300 dark:border-border shadow-none">
            {yearOptions.map((y) => (
              <SelectItem
                key={y}
                value={y}
                className="rounded-2xl sm:rounded-3xl focus:bg-slate-50 dark:focus:bg-muted cursor-pointer text-xs sm:text-sm"
              >
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="icon"
          onClick={onNextMonth}
          className="rounded-2xl sm:rounded-3xl hover:bg-slate-100 dark:hover:bg-muted h-11 w-11 text-slate-600 dark:text-neutral-400"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <Button
          onClick={onExport}
          variant="outline"
          className="rounded-2xl sm:rounded-3xl border-dashed border-slate-300 dark:border-border hover:bg-slate-50 dark:hover:bg-muted h-11 font-medium shadow-none text-slate-700 dark:text-slate-300 text-xs px-3.5 flex items-center gap-1.5"
        >
          <FileDown className="h-4 w-4" />
          <span>Laporan</span>
        </Button>
        <Button
          asChild
          className="flex items-center justify-center gap-2 text-sm w-full sm:w-auto rounded-2xl sm:rounded-3xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-none border border-transparent font-medium h-11 px-4"
        >
          <Link href={isAdmin ? "/cms/meeting-room/add" : "/meeting-room/add"}>
            <PlusCircle className="h-4 w-4" />
            <span>Booking Jadwal</span>
          </Link>
        </Button>
      </div>
    </div>
  );
};

// --- Color Helper ---

const getInstitutionColor = (institutionName: string): string => {
  const normalized = (institutionName || "").toUpperCase().trim();
  if (normalized.includes("PUSBINTER"))
    return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800";
  if (normalized.includes("PUSBIN AKS"))
    return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800";
  if (normalized.includes("PPKASN"))
    return "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/70 dark:text-red-300 dark:border-red-800";
  if (normalized.includes("ASSESSMENT CENTER"))
    return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800";

  const colors = [
    "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800",
    "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800",
    "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800",
    "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/70 dark:text-orange-300 dark:border-orange-800",
    "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-950/70 dark:text-pink-300 dark:border-pink-800",
    "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/70 dark:text-teal-300 dark:border-teal-800",
    "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800",
    "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-950/70 dark:text-cyan-300 dark:border-cyan-800",
    "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800",
  ];

  let hash = 0;
  for (let i = 0; i < (institutionName || "").length; i++) {
    hash = (institutionName || "").charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

interface CalendarGridProps {
  calendarDays: Date[];
  bookings: Booking[];
  rooms: Room[];
  visibleRoomIds: Set<string>;
  currentMonthDate: Date;
  onDayClick: (date: Date) => void;
  onBookingClick: (booking: Booking, room: Room) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  calendarDays,
  bookings,
  rooms,
  visibleRoomIds,
  currentMonthDate,
  onDayClick,
  onBookingClick,
}) => {
  const getBookingsForDay = (day: Date) => {
    const dayISO = format(day, "yyyy-MM-dd");
    return bookings.filter((b) => {
      const bStart = b.payload.bookingStart.split("T")[0];
      const bEnd = (b.payload.bookingEnd || b.payload.bookingStart).split(
        "T"
      )[0];

      return (
        dayISO >= bStart &&
        dayISO <= bEnd &&
        b.roomIds.some((rid) => visibleRoomIds.has(rid))
      );
    });
  };

  return (
    <div className="min-h-[580px] bg-white dark:bg-card text-card-foreground rounded-2xl sm:rounded-3xl border border-dashed border-slate-300 dark:border-border overflow-hidden flex flex-col shadow-none">
      {/* Days Header */}
      <div className="grid grid-cols-7 border-b border-dashed border-border bg-muted/50">
        {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((day) => (
          <div
            key={day}
            className="py-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider border-r border-dashed border-border last:border-0"
          >
            {day}
          </div>
        ))}
      </div>

      <div
        className="flex-1 grid grid-cols-7 overflow-hidden"
        style={{ gridTemplateRows: `repeat(${calendarDays.length / 7}, 1fr)` }}
      >
        {calendarDays.map((date, i) => {
          const isCurrentMonth = isSameMonth(date, currentMonthDate);
          const dayBookings = getBookingsForDay(date);
          const isToday = isSameDay(date, new Date());

          return (
            <div
              key={date.toISOString()}
              onClick={() => onDayClick(date)}
              className={cn(
                "border-b border-r border-dashed border-border p-2 flex flex-col gap-1 transition-colors hover:bg-muted/40 min-h-0 cursor-pointer group",
                !isCurrentMonth && "bg-muted/20 text-muted-foreground/50",
                (i + 1) % 7 === 0 && "border-r-0"
              )}
            >
              <div className="flex justify-between items-start mb-1 shrink-0">
                <span
                  className={cn(
                    "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full transition-colors group-hover:bg-muted group-hover:text-foreground",
                    isToday
                      ? "bg-primary text-primary-foreground group-hover:bg-primary group-hover:text-primary-foreground"
                      : "text-foreground"
                  )}
                >
                  {format(date, "d")}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto custom-scrollbar min-h-0">
                {dayBookings.map((booking) => {
                  const primaryRoomId =
                    booking.roomIds.find((rid) => visibleRoomIds.has(rid)) ||
                    booking.roomIds[0];
                  const room = rooms.find((r) => r.id === primaryRoomId);

                  if (!room) return null;

                  return (
                    <div
                      role="button"
                      key={booking.id}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onBookingClick(booking, room);
                      }}
                      className={cn(
                        "text-xs px-1.5 py-0.5 rounded-2xl sm:rounded-3xl text-left truncate font-medium border transition-all hover:scale-[1.02] shadow-none shrink-0 cursor-pointer",
                        getInstitutionColor(booking.payload.institutionName)
                      )}
                    >
                      <span className="opacity-75 mr-1 text-[10px] uppercase font-bold tracking-tight">
                        {booking.payload.startTime}
                      </span>
                      {room.name} - {booking.payload.institutionName}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface DailyBookingListProps {
  selectedDay: Date;
  bookings: Booking[];
  rooms: Room[];
  onBookingClick: (booking: Booking, room: Room) => void;
  user?: User | null;
}

const DailyBookingList: React.FC<DailyBookingListProps> = ({
  selectedDay,
  bookings,
  rooms,
  onBookingClick,
  user,
}) => {
  const getBookingsForDate = (date: Date) => {
    const dayISO = format(date, "yyyy-MM-dd");
    return bookings
      .filter((b) => {
        const bStart = b.payload.bookingStart.split("T")[0];
        const bEnd = (
          b.payload.bookingEnd || b.payload.bookingStart
        ).split("T")[0];
        return dayISO >= bStart && dayISO <= bEnd;
      })
      .sort((a, b) =>
        (a.payload.startTime || "").localeCompare(b.payload.startTime || "")
      );
  };

  const dayBookings = getBookingsForDate(selectedDay);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-dashed border-border">
        <h3 className="font-medium text-muted-foreground">
          {format(selectedDay, "EEEE, dd MMMM yyyy", { locale: id })}
        </h3>
      </div>
      {dayBookings.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-2xl sm:rounded-3xl bg-muted/30">
          <p className="text-sm">Tidak ada jadwal pada hari ini</p>
        </div>
      ) : (
        <ScrollArea className="h-[300px] pr-4 -mr-4">
          <div className="space-y-3 pr-4">
            {dayBookings.map((booking) => {
              const primaryRoomId = booking.roomIds[0];
              const room = rooms.find((r) => r.id === primaryRoomId);
              return (
                <div
                  key={booking.id}
                  onClick={() => {
                    if (room) {
                      onBookingClick(booking, room);
                    }
                  }}
                  className="p-3 rounded-2xl sm:rounded-3xl border border-dashed border-border bg-card hover:bg-muted/40 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0",
                        getInstitutionColor(booking.payload.institutionName)
                      )}
                    >
                      {room?.name || "Ruangan"}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <CalendarClock className="w-3 h-3" />
                      {booking.payload.startTime} - {booking.payload.endTime}
                    </span>
                  </div>
                  <h4 className="font-bold text-foreground group-hover:text-primary mb-1 line-clamp-1">
                    {booking.payload.purpose}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{booking.payload.institutionName}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
      {user && (
        <div className="pt-4 border-t border-dashed border-border">
          <Button
            asChild
            className="w-full rounded-2xl sm:rounded-3xl bg-primary text-primary-foreground hover:bg-primary/90 h-10 font-bold shadow-none"
          >
            <Link
              href={`/meeting-room/add?date=${format(selectedDay, "yyyy-MM-dd")}`}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Jadwal Baru
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};

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

export function MeetingRoomCalendar({ isAdmin }: { isAdmin?: boolean } = {}) {
  const user = useAuthUser();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isAdminView =
    (isAdmin !== undefined
      ? isAdmin
      : pathname.startsWith("/cms") || searchParams.get("admin") === "true") &&
    !!user;
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const formattedToday = useMemo(() => new Date(year, month, 1), [year, month]);

  const { rooms, bookings, refresh } = useCalendarData(year, month);

  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [detailState, setDetailState] = useState<DetailState | null>(null);

  const visibleRoomIds = useMemo(
    () => new Set(rooms.map((r) => r.id)),
    [rooms]
  );

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(formattedToday);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { locale: id });
    const endDate = endOfWeek(monthEnd, { locale: id });

    return eachDayOfInterval({
      start: startDate,
      end: endDate,
    });
  }, [formattedToday]);

  const handleNextMonth = () => {
    const next = addMonths(formattedToday, 1);
    setMonth(next.getMonth());
    setYear(next.getFullYear());
  };

  const handlePrevMonth = () => {
    const prev = subMonths(formattedToday, 1);
    setMonth(prev.getMonth());
    setYear(prev.getFullYear());
  };

  const handleDeleteBooking = async () => {
    if (!isAdminView || !detailState) return;
    if (confirm("Apakah Anda yakin ingin menolak/menghapus booking ini?")) {
      try {
        await bookingService.deleteBooking(detailState.booking.id);
        setDetailState(null);
        refresh();
      } catch {
        alert("Gagal menghapus.");
      }
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Laporan Peminjaman Ruang Rapat", 14, 20);
    doc.setFontSize(10);
    doc.text(
      `Periode: ${format(formattedToday, "MMMM yyyy", { locale: id })}`,
      14,
      27
    );

    const reportBookings = bookings
      .filter((b) => {
        const bDate = new Date(b.payload.bookingStart);
        return bDate.getMonth() === month && bDate.getFullYear() === year;
      })
      .sort(
        (a, b) =>
          new Date(a.payload.bookingStart).getTime() -
          new Date(b.payload.bookingStart).getTime()
      );

    const tableData = reportBookings.map((b, i) => {
      const roomNames = b.roomIds
        .map((rid) => rooms.find((r) => r.id === rid)?.name)
        .filter(Boolean)
        .join(", ");

      const startDate = new Date(b.payload.bookingStart);
      const endDate = b.payload.bookingEnd
        ? new Date(b.payload.bookingEnd)
        : startDate;
      const isSame = isSameDay(startDate, endDate);
      const dateStr = isSame
        ? format(startDate, "d MMM yyyy", { locale: id })
        : `${format(startDate, "d MMM")} - ${format(endDate, "d MMM yyyy", {
            locale: id,
          })}`;

      return [
        i + 1,
        b.payload.institutionName || "-",
        b.payload.purpose || "-",
        b.payload.name || "-",
        roomNames || "-",
        dateStr +
          "\n" +
          (b.payload.startTime || "-") +
          " - " +
          (b.payload.endTime || "-"),
        b.payload.notes || "-",
      ];
    });

    autoTable(doc, {
      startY: 40,
      head: [
        [
          "No",
          "Unit Kerja",
          "Kegiatan",
          "Peminjam",
          "Ruangan",
          "Waktu",
          "Catatan",
        ],
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

    doc.save(`laporan-peminjaman-${format(formattedToday, "MM-yyyy")}.pdf`);
  };

  return (
    <div className={isAdmin ? "mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8" : "container max-w-7xl mx-auto py-4 px-3 sm:px-4 md:px-6 mb-6"}>
      <div className="flex flex-col gap-5 sm:gap-6">
        <div className={isAdmin ? "w-full flex items-center justify-start" : "w-full flex items-center justify-center py-2 text-center"}>
          <h1 className={isAdmin ? "text-2xl font-semibold tracking-tight text-foreground" : "text-xl sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight text-center"}>
            Jadwal Ruang Rapat
          </h1>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl border border-dashed border-slate-300 p-4 sm:p-6 shadow-none dark:bg-card dark:border-border">
          <CalendarHeader
            month={month}
            year={year}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onChangeMonth={setMonth}
            onChangeYear={setYear}
            onExport={handleExportPDF}
            user={user}
            isAdmin={isAdminView}
          />
        </div>

        <CalendarGrid
          calendarDays={calendarDays}
          bookings={bookings}
          rooms={rooms}
          visibleRoomIds={visibleRoomIds}
          currentMonthDate={formattedToday}
          onDayClick={setSelectedDay}
          onBookingClick={(booking, room) =>
            setDetailState({ booking, room })
          }
        />

        <div className="flex flex-wrap items-center justify-start gap-4 px-1 py-1">
          <MeetingRoomLegend />
        </div>
      </div>

      <Dialog
        open={!!detailState}
        onOpenChange={(open) => !open && setDetailState(null)}
      >
        <DialogContent className="sm:max-w-md rounded-2xl sm:rounded-3xl bg-card border border-border">
          <DialogHeader>
            <DialogTitle>Detail Booking</DialogTitle>
          </DialogHeader>
          {detailState && (
            <BookingDetail
              booking={detailState.booking}
              user={isAdminView ? user : null}
              onDelete={handleDeleteBooking}
              roomName={detailState.room?.name || "Ruangan"}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!selectedDay}
        onOpenChange={(open) => !open && setSelectedDay(null)}
      >
        <DialogContent className="sm:max-w-md rounded-2xl sm:rounded-3xl bg-card border border-border">
          <DialogHeader>
            <DialogTitle>Jadwal Harian</DialogTitle>
          </DialogHeader>
          {selectedDay && (
            <DailyBookingList
              selectedDay={selectedDay}
              bookings={bookings}
              rooms={rooms}
              user={user}
              onBookingClick={(booking, room) => {
                setDetailState({ booking, room });
                setSelectedDay(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
