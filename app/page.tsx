"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Loader2,
  Trash2,
  CalendarClock,
  Filter,
  FileDown,
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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const UNIT_KERJA_OPTIONS = [
  "PUSBINTER",
  "PUSBIN AKS",
  "PPKASN",
  "Assessment Center",
] as const;

// --- Types ---

export type ISOString = string;
export type RoomId = string;
export type BookingId = string;

export interface Room {
  readonly id: RoomId;
  readonly name: string;
  readonly floor: number;
  readonly capacity: number;
  readonly features: string[]; // e.g., facilities
  readonly location?: string; // kept for compatibility if needed
}

export interface BookingPayload {
  readonly bookingStart: ISOString;
  readonly bookingEnd?: ISOString;
  readonly startTime?: string;
  readonly endTime?: string;
  readonly name: string;
  readonly institutionName: string;
  readonly purpose?: string;
  readonly notes?: string;
  readonly userId?: string;
}

export type BookingStatus = "confirmed" | "cancelled";

export interface Booking {
  readonly id: BookingId;
  readonly payload: BookingPayload;
  readonly roomIds: RoomId[];
  readonly createdAt?: string;
  readonly status?: BookingStatus;
}

export interface DetailState {
  readonly booking: Booking;
  readonly room?: Room;
}

// --- Services ---

class SupabaseRoomService {
  private supabase = createClient();

  // Color palette for rooms

  async fetchAllRooms(): Promise<Room[]> {
    const { data, error } = await this.supabase
      .from("assets")
      .select("*")
      .eq("type", "ruang_rapat")
      .order("name", { ascending: true });

    if (error) {
      console.error("SupabaseRoomService: fetchAllRooms error:", error);
      return [];
    }

    const rooms: Room[] = (data || []).map((d: any) => ({
      id: d.id,
      name: d.name ?? "—",
      floor: Number(d.floor) || 1, // Default to 1 if missing
      location: d.location,
      capacity: Number(d.capacity) || 0,
      features: Array.isArray(d.facilities)
        ? d.facilities
        : typeof d.facilities === "string" && d.facilities
          ? d.facilities.split(",")
          : [],
    }));

    return rooms;
  }
}

class SupabaseBookingService {
  private supabase = createClient();

  // Helper to check date overlap
  private dateRangesOverlap(
    aStartISO: string,
    aEndISO: string,
    bStartISO: string,
    bEndISO: string
  ): boolean {
    const aStart = new Date(aStartISO.split("T")[0]);
    const aEnd = new Date(aEndISO.split("T")[0]);
    const bStart = new Date(bStartISO.split("T")[0]);
    const bEnd = new Date(bEndISO.split("T")[0]);
    return !(aEnd < bStart || bEnd < aStart);
  }

  async fetchBookings(startISO: string, endISO: string): Promise<Booking[]> {
    const { data, error } = await this.supabase
      .from("room_bookings")
      .select("*");

    if (error) {
      console.error(
        "SupabaseBookingService: fetchBookings error:",
        error.message
      );
      return [];
    }

    const results: Booking[] = (data || []).map((d: any) => ({
      id: d.id,
      payload: {
        bookingStart: d.payload?.bookingStart ?? "",
        bookingEnd: d.payload?.bookingEnd,
        startTime: d.payload?.startTime,
        endTime: d.payload?.endTime,
        name: d.payload?.name ?? "",
        institutionName: d.payload?.institutionName ?? "",
        purpose: d.payload?.purpose,
        notes: d.payload?.notes,
        userId: d.payload?.userId,
      },
      roomIds: d.room_ids || [],
      createdAt: d.created_at,
      status: d.status,
    }));

    // Client-side overlap filter (efficient enough for current scale)
    return results.filter((b) => {
      try {
        const bs = String(b.payload.bookingStart);
        const be = String(b.payload.bookingEnd ?? b.payload.bookingStart);
        return this.dateRangesOverlap(startISO, endISO, bs, be);
      } catch {
        return false;
      }
    });
  }

  async createBooking(
    data: Omit<Booking, "id" | "createdAt" | "status">
  ): Promise<string> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    // Enrich payload with userId if not present
    const payload = {
      ...data.payload,
      userId: data.payload.userId || user?.id,
    };

    const newBooking = {
      room_ids: data.roomIds,
      payload,
      created_at: new Date().toISOString(),
      status: "confirmed",
    };

    const { data: inserted, error } = await this.supabase
      .from("room_bookings")
      .insert(newBooking)
      .select()
      .single();

    if (error) {
      console.error("SupabaseBookingService: createBooking error:", error);
      throw new Error(error.message);
    }

    return inserted.id;
  }

  async updateBooking(id: string, updates: Partial<BookingPayload>): Promise<void> {
    const { data: existing, error: fetchError } = await this.supabase
      .from("room_bookings")
      .select("payload")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      throw new Error("Booking not found");
    }

    const currentPayload = existing.payload || {};
    const newPayload = { ...currentPayload, ...updates };

    const { error } = await this.supabase
      .from("room_bookings")
      .update({ payload: newPayload })
      .eq("id", id);

    if (error) {
      throw new Error("Gagal mengupdate booking: " + error.message);
    }
  }

  async deleteBooking(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("room_bookings")
      .delete()
      .eq("id", id);
    if (error) {
      throw new Error("Gagal menghapus booking: " + error.message);
    }
  }
}

// --- Hooks ---

export const roomService = new SupabaseRoomService();
export const bookingService = new SupabaseBookingService();

export function useCalendarData(year: number, month: number) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { start: monthStart, end: monthEnd } = useMemo(
    () => ({
      start: startOfMonth(new Date(year, month, 1)),
      end: endOfMonth(new Date(year, month, 1)),
    }),
    [year, month]
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch simpler range: 1 week before start to 1 week after end to cover grid edges
      const fetchStart = subMonths(monthStart, 1).toISOString();
      const fetchEnd = addMonths(monthEnd, 1).toISOString();

      const [fetchedRooms, fetchedBookings] = await Promise.all([
        roomService.fetchAllRooms(),
        bookingService.fetchBookings(fetchStart, fetchEnd),
      ]);
      setRooms(fetchedRooms);
      setBookings(fetchedBookings);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data booking. Periksa koneksi Supabase.");
    } finally {
      setLoading(false);
    }
  }, [monthStart, monthEnd]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { rooms, bookings, loading, error, refresh };
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

// --- Sub-Components ---

const DetailRow: React.FC<{
  label: string;
  value: React.ReactNode;
  icon?: React.ElementType;
  fullWidth?: boolean;
}> = ({ label, value, icon: Icon, fullWidth = false }) => (
  <div
    className={cn(
      "flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 py-3 border-b border-dashed border-slate-200 last:border-0",
      fullWidth ? "w-full" : ""
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
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800 mt-2">
            {roomName}
          </span>
        </div>
      </div>

      <Tabs defaultValue="kegiatan" className="w-full">
        <TabsList className="bg-transparent h-auto p-4 flex flex-wrap gap-2 justify-start w-full border-slate-300 sm:w-auto pb-4">
          <TabsTrigger
            value="kegiatan"
            className="rounded-full border border-slate-200 px-4 py-1.5 text-sm font-medium data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:border-black"
          >
            Detail
          </TabsTrigger>
          <TabsTrigger
            value="peminjam"
            className="rounded-full border border-slate-200 px-4 py-1.5 text-sm font-medium data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:border-black"
          >
            Peminjam
          </TabsTrigger>
          <TabsTrigger
            value="catatan"
            className="rounded-full border border-slate-200 px-4 py-1.5 text-sm font-medium data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:border-black"
          >
            Catatan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kegiatan" className="mt-0">
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 space-y-1">
            <DetailRow
              label="Tanggal"
              value={fullDateRange}
            />
            <DetailRow
              label="Waktu"
              value={`${booking.payload.startTime || "--:--"} - ${booking.payload.endTime || "--:--"
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
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 space-y-1">
            <DetailRow
              label="Nama"
              value={booking.payload.name}
            />
            <DetailRow
              label="Unit Kerja"
              value={booking.payload.institutionName}
            />
          </div>
        </TabsContent>
        <TabsContent value="catatan" className="mt-0">
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 min-h-[120px]">
            {booking.payload.notes ? (
              <p className="text-sm text-slate-700 italic">
                {booking.payload.notes}
              </p>
            ) : (
              <p className="text-sm text-slate-400 italic">
                Tidak ada catatan.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {user && user.id === booking.payload.userId && (
        <div className="flex justify-end pt-4 border-t border-dashed border-slate-200">
          <Button
            variant="destructive"
            onClick={onDelete}
            className="rounded-xl"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Tolak Peminjaman
          </Button>
        </div>
      )}
    </div>
  );
};

interface RoomFilterProps {
  rooms: Room[];
  loading: boolean;
  visibleRoomIds: Set<string>;
  toggleRoomVisibility: (id: string) => void;
  toggleAllRooms: (visible: boolean) => void;
}

const RoomFilter: React.FC<RoomFilterProps> = ({
  rooms,
  loading,
  visibleRoomIds,
  toggleRoomVisibility,
  toggleAllRooms,
}) => {
  return (
    <div className="w-64 shrink-0 hidden md:flex flex-col gap-4 overflow-hidden">
      <Card className="h-full border border-dashed border-slate-300 shadow-none bg-white flex flex-col overflow-hidden rounded-xl">
        <CardHeader className="py-4 px-4 border-b border-dashed border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter Ruangan
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] px-2 text-slate-500 hover:text-black border border-dashed"
                onClick={() => toggleAllRooms(true)}
              >
                All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] px-2 text-slate-500 hover:text-black border border-dashed"
                onClick={() => toggleAllRooms(false)}
              >
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {loading && rooms.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  <span className="text-xs">Memuat...</span>
                </div>
              ) : (
                rooms.map((room) => (
                  <div key={room.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={room.id}
                      checked={visibleRoomIds.has(room.id)}
                      onCheckedChange={() => toggleRoomVisibility(room.id)}
                      className={cn(
                        "data-[state=checked]:bg-black data-[state=checked]:border-black",
                        visibleRoomIds.has(room.id) ? "" : "opacity-50"
                      )}
                    />
                    <label
                      htmlFor={room.id}
                      className="text-sm font-medium py-2 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none flex-1 truncate"
                    >
                      {room.name}
                    </label>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onExport: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onToday,
  onExport,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onPrevMonth}
            className="h-9 w-9 rounded-xl border-dashed"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={onToday}
            className="h-9 rounded-xl border-dashed px-4 font-medium"
          >
            Hari Ini
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onNextMonth}
            className="h-9 w-9 rounded-xl border-dashed"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <h2 className="text-xl font-bold min-w-[200px]">
          {format(currentDate, "MMMM yyyy", { locale: id })}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={onExport}
          variant="outline"
          className="rounded-xl border-dashed border-slate-300 bg-white text-slate-700 hover:bg-slate-50 h-10 font-medium shadow-none"
        >
          <FileDown className="mr-2 h-4 w-4" />
          Laporan
        </Button>
        <Button
          asChild
          className="rounded-xl bg-black text-white hover:bg-zinc-800 h-10 font-medium shadow-none"
        >
          <Link href="/booking">
            <PlusCircle className="mr-2 h-4 w-4" />
            Booking Ruangan
          </Link>
        </Button>
      </div>
    </div>
  );
};

// --- Color Helper ---

const getInstitutionColor = (institutionName: string): string => {
  const normalized = institutionName.toUpperCase().trim();
  if (normalized.includes("PUSBINTER")) return "bg-blue-100 text-blue-700 border-blue-200";
  if (normalized.includes("PUSBIN AKS")) return "bg-yellow-100 text-yellow-700 border-yellow-200";
  if (normalized.includes("PPKASN")) return "bg-red-100 text-red-700 border-red-200";
  if (normalized.includes("ASSESSMENT CENTER")) return "bg-purple-100 text-purple-700 border-purple-200";

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

  let hash = 0;
  for (let i = 0; i < institutionName.length; i++) {
    hash = institutionName.charCodeAt(i) + ((hash << 5) - hash);
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
      // Simple day check (multi-day spanning logic: verify overlap)
      const bStart = b.payload.bookingStart.split("T")[0];
      const bEnd = (b.payload.bookingEnd || b.payload.bookingStart).split(
        "T"
      )[0];

      // Check if day is within range [bStart, bEnd]
      return (
        dayISO >= bStart &&
        dayISO <= bEnd &&
        // Check if ANY of the booking's rooms are visible
        b.roomIds.some((rid) => visibleRoomIds.has(rid))
      );
    });
  };

  return (
    <div className="flex-1 bg-white rounded-xl border border-dashed border-slate-300 overflow-hidden flex flex-col shadow-none">
      {/* Days Header */}
      <div className="grid grid-cols-7 border-b border-dashed border-slate-300 bg-slate-50/50">
        {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((day) => (
          <div
            key={day}
            className="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider border-r border-dashed border-slate-200 last:border-0"
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
                "border-b border-r border-dashed border-slate-200 p-2 flex flex-col gap-1 transition-colors hover:bg-slate-50/50 min-h-0 cursor-pointer group",
                !isCurrentMonth && "bg-slate-50/30 text-slate-400",
                (i + 1) % 7 === 0 && "border-r-0"
              )}
            >
              <div className="flex justify-between items-start mb-1 shrink-0">
                <span
                  className={cn(
                    "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full transition-colors group-hover:bg-slate-200 group-hover:text-black",
                    isToday
                      ? "bg-black text-white group-hover:bg-black group-hover:text-white"
                      : "text-slate-700"
                  )}
                >
                  {format(date, "d")}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto custom-scrollbar min-h-0">
                {dayBookings.map((booking) => {
                  // Try to find the primary room for color (just take the first visible one for simplicity)
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
                        "text-xs px-1 rounded-md text-left truncate font-medium border transition-all hover:scale-[1.02] shadow-none shrink-0 cursor-pointer",
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
}

const DailyBookingList: React.FC<DailyBookingListProps> = ({
  selectedDay,
  bookings,
  rooms,
  onBookingClick,
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
      <div className="flex items-center justify-between pb-2 border-b border-dashed border-slate-200">
        <h3 className="font-medium text-slate-500">
          {format(selectedDay, "EEEE, dd MMMM yyyy", { locale: id })}
        </h3>
      </div>
      {dayBookings.length === 0 ? (
        <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <p className="text-sm">Tidak ada jadwal pada hari ini</p>
        </div>
      ) : (
        <ScrollArea className="h-[300px] pr-4 -mr-4">
          <div className="space-y-3 pr-4">
            {dayBookings.map((booking) => {
              // Find visible or first room
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
                  className="p-3 rounded-xl border border-dashed border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0",
                        getInstitutionColor(booking.payload.institutionName)
                      )}
                    >
                      {room?.name || "Unknown"}
                    </span>
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                      <CalendarClock className="w-3 h-3" />
                      {booking.payload.startTime} - {booking.payload.endTime}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 group-hover:text-black mb-1 line-clamp-1">
                    {booking.payload.purpose}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{booking.payload.institutionName}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
      <div className="pt-4 border-t border-dashed border-slate-200">
        <Button
          asChild
          className="w-full rounded-xl bg-black text-white hover:bg-zinc-800 h-10 font-bold shadow-none"
        >
          <Link
            href={`/booking?date=${format(selectedDay, "yyyy-MM-dd")}`}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Jadwal Baru
          </Link>
        </Button>
      </div>
    </div>
  );
};

// --- Main Page Component ---

export default function MeetingRoomPage() {
  const router = useRouter();
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const formattedToday = useMemo(() => new Date(year, month, 1), [year, month]);

  const { rooms, bookings, loading, error, refresh } = useCalendarData(
    year,
    month
  );
  const user = useAuthUser();

  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [visibleRoomIds, setVisibleRoomIds] = useState<Set<string>>(new Set());
  const [detailState, setDetailState] = useState<DetailState | null>(null);

  // Initialize all rooms as visible when rooms are fetched
  useEffect(() => {
    if (rooms.length > 0 && visibleRoomIds.size === 0) {
      setVisibleRoomIds(new Set(rooms.map((r) => r.id)));
    }
  }, [rooms]);

  const toggleRoomVisibility = (roomId: string) => {
    setVisibleRoomIds((prev) => {
      const next = new Set(prev);
      if (next.has(roomId)) next.delete(roomId);
      else next.add(roomId);
      return next;
    });
  };

  const toggleAllRooms = (visible: boolean) => {
    if (visible) setVisibleRoomIds(new Set(rooms.map((r) => r.id)));
    else setVisibleRoomIds(new Set());
  };

  // Calendar Grid Logic
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

  const handleToday = () => {
    const now = new Date();
    setMonth(now.getMonth());
    setYear(now.getFullYear());
  };

  const handleDeleteBooking = async () => {
    if (!detailState) return;
    if (confirm("Apakah Anda yakin ingin menolak/menghapus booking ini?")) {
      try {
        await bookingService.deleteBooking(detailState.booking.id);
        setDetailState(null);
        refresh();
      } catch (e) {
        alert("Gagal menghapus.");
      }
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Add Title
    doc.setFontSize(16);
    doc.text("Laporan Peminjaman Ruang Rapat", 14, 20);
    doc.setFontSize(10);
    doc.text(`Periode: ${format(formattedToday, "MMMM yyyy", { locale: id })}`, 14, 27);

    // Filter bookings for current month only for the report
    const reportBookings = bookings.filter(b => {
      const bDate = new Date(b.payload.bookingStart);
      return bDate.getMonth() === month && bDate.getFullYear() === year;
    }).sort((a, b) => new Date(a.payload.bookingStart).getTime() - new Date(b.payload.bookingStart).getTime());

    // Prepare Table Data
    const tableData = reportBookings.map((b, i) => {
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

    doc.save(`laporan-peminjaman-${format(formattedToday, "MM-yyyy")}.pdf`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-1rem)] gap-4 mt-4 bg-white p-4">
      <div className="flex items-center justify-center">
        <h1 className="text-2xl font-black text-slate-900 uppercase">
          PENGGUNAAN RUANG RAPAT
        </h1>
      </div>
      {/* Header */}
      <CalendarHeader
        currentDate={formattedToday}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
        onExport={handleExportPDF}
      />

      <div className="flex flex-1 gap-6 min-h-0 overflow-hidden">
        {/* Sidebar Filter */}
        {/* <RoomFilter
          rooms={rooms}
          loading={loading}
          visibleRoomIds={visibleRoomIds}
          toggleRoomVisibility={toggleRoomVisibility}
          toggleAllRooms={toggleAllRooms}
        /> */}

        {/* Calendar Grid */}
        <div className="flex-1 flex flex-col min-h-0 gap-4">
          <CalendarGrid
            calendarDays={calendarDays}
            bookings={bookings}
            rooms={rooms}
            visibleRoomIds={visibleRoomIds}
            currentMonthDate={formattedToday}
            onDayClick={setSelectedDay}
            onBookingClick={(booking, room) => setDetailState({ booking, room })}
          />

          {/* Legend */}
          <div className="flex flex-wrap items-start justify-start gap-3 px-4 bg-white rounded-xl">
            {UNIT_KERJA_OPTIONS.map((unit) => {
              let dotColor = "bg-slate-300";
              if (unit === "PUSBINTER") dotColor = "bg-blue-500";
              if (unit === "PUSBIN AKS") dotColor = "bg-yellow-500";
              if (unit === "PPKASN") dotColor = "bg-red-500";
              if (unit === "Assessment Center") dotColor = "bg-purple-500";

              return (
                <div key={unit} className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded-full", dotColor)} />
                  <span className="text-xs font-medium text-slate-600 font-bold uppercase tracking-wider text-[10px]">{unit}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Dialog
        open={!!detailState}
        onOpenChange={(open) => !open && setDetailState(null)}
      >
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Detail Booking</DialogTitle>
          </DialogHeader>
          {detailState && (
            <BookingDetail
              booking={detailState.booking}
              user={user}
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
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Jadwal Harian</DialogTitle>
          </DialogHeader>
          {selectedDay && (
            <DailyBookingList
              selectedDay={selectedDay}
              bookings={bookings}
              rooms={rooms}
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
