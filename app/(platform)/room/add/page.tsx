"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch, Controller, UseFormReturn, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  CalendarClock,
  Building2,
  NotebookPen,
  User,
  XCircle,
  Info,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
} from "@/components/ui/field";

const WORKING_HOURS = { start: 8, end: 20 } as const;
const TIME_REGEX = /^\d{2}:\d{2}$/;

const DateUtils = {
  toISODate: (d?: Date | null): string | null =>
    d ? new Date(d).toISOString() : null,

  isoDateOnly: (iso: string): string => iso.split("T")[0],

  parseTimeToMinutes: (t: string): number => {
    const [hh, mm] = t.split(":").map((s) => parseInt(s, 10));
    return (Number.isNaN(hh) ? 0 : hh) * 60 + (Number.isNaN(mm) ? 0 : mm);
  },

  dateRangesOverlap: (
    aStartISO: string,
    aEndISO: string,
    bStartISO: string,
    bEndISO: string
  ): boolean => {
    const aStart = new Date(DateUtils.isoDateOnly(aStartISO));
    const aEnd = new Date(DateUtils.isoDateOnly(aEndISO));
    const bStart = new Date(DateUtils.isoDateOnly(bStartISO));
    const bEnd = new Date(DateUtils.isoDateOnly(bEndISO));
    return !(aEnd < bStart || bEnd < aStart);
  },

  timesOverlap: (
    aStartTime: string,
    aEndTime: string,
    bStartTime: string,
    bEndTime: string
  ): boolean => {
    const aS = DateUtils.parseTimeToMinutes(aStartTime);
    const aE = DateUtils.parseTimeToMinutes(aEndTime);
    const bS = DateUtils.parseTimeToMinutes(bStartTime);
    const bE = DateUtils.parseTimeToMinutes(bEndTime);
    return !(aE <= bS || bE <= aS);
  },
};

export type RoomStatus = "available" | "booked" | "selected";

export interface Room {
  readonly id: string;
  readonly name: string;
  readonly floor: number;
  readonly capacity: number;
  readonly features: string[];
  readonly status: RoomStatus;
}

export type InstitutionType = "Kemensetneg" | "Non-Kemensetneg";
export type RoomSetup = "Island" | "U-shape" | "Classroom";

export interface BookingPayload {
  bookingStart: string;
  bookingEnd: string;
  startTime: string;
  endTime: string;
  name: string;
  institutionName: string;
  phoneNumber: string;
  purpose: string;
  notes?: string;
  institutionType: InstitutionType;
  roomSetup: RoomSetup;
  attendees: number;
}

export interface Booking {
  readonly id: string;
  readonly roomIds: string[];
  readonly createdAt: string;
  readonly status: "confirmed" | "cancelled";
  readonly payload: BookingPayload;
}

const PHONE_REGEX = /^[0-9+\-() ]{8,20}$/;

const bookingSchema = z
  .object({
    bookingStart: z.instanceof(Date, { message: "Tanggal mulai wajib diisi" }).nullable().optional(),
    bookingEnd: z.instanceof(Date).nullable().optional(),
    startTime: z.string().regex(TIME_REGEX, "Format waktu mulai tidak valid (HH:MM)"),
    endTime: z.string().regex(TIME_REGEX, "Format waktu selesai tidak valid (HH:MM)"),
    name: z.string().trim().min(1, "Nama wajib diisi").max(150, "Nama maksimal 150 karakter"),
    institutionName: z.string().trim().min(1, "Nama instansi wajib diisi").max(150, "Nama instansi maksimal 150 karakter"),
    phoneNumber: z
      .string()
      .trim()
      .min(1, "Nomor telepon wajib diisi")
      .max(20, "Nomor telepon maksimal 20 karakter")
      .regex(PHONE_REGEX, "Nomor telepon tidak valid (hanya angka, +, -, (), dan spasi, 8-20 karakter)"),
    purpose: z.string().trim().min(1, "Nama Kegiatan wajib diisi").max(500, "Nama Kegiatan maksimal 500 karakter"),
    notes: z.string().trim().max(1000, "Catatan maksimal 1000 karakter").optional(),
    institutionType: z.enum(["Kemensetneg", "Non-Kemensetneg"]),
    roomSetup: z.enum(["Island", "U-shape", "Classroom"]),
    attendees: z.coerce.number().int().min(1, "Jumlah peserta minimal 1").max(10000, "Jumlah peserta maksimal 10.000"),
  })
  .superRefine((data, ctx) => {
    const [sh, sm] = data.startTime.split(":").map(Number);
    const [eh, em] = data.endTime.split(":").map(Number);

    if (Number.isNaN(sh) || Number.isNaN(eh)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid time" });
      return;
    }
    if (eh < sh || (eh === sh && em <= sm)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "End time must be after start time",
      });
    }
    if (sh < WORKING_HOURS.start || eh > WORKING_HOURS.end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: `Booking hours must be between ${WORKING_HOURS.start}:00 and ${WORKING_HOURS.end}:00`,
      });
    }

    if (
      data.bookingStart &&
      data.bookingEnd &&
      data.bookingStart > data.bookingEnd
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["bookingEnd"],
        message: "Booking start must be before or equal to booking end",
      });
    }
  });

export type BookingFormData = z.infer<typeof bookingSchema>;

interface IRoomRepository {
  getRoomsForRange(start?: Date | null, end?: Date | null): Promise<Room[]>;
}

interface IBookingRepository {
  createBooking(
    data: Omit<Booking, "id" | "createdAt" | "status">
  ): Promise<string>;
  listBookingsOverlapping(startISO: string, endISO: string): Promise<Booking[]>;
}

interface DBAssetRow {
  id: string;
  name: string | null;
  floor: number | string | null;
  capacity: number | string | null;
  facilities: string[] | string | null;
}

interface DBRoomBookingRow {
  id: string;
  room_ids: string[] | null;
  created_at: string;
  status: string;
  payload: Partial<BookingPayload> | null;
}

class SupabaseRoomRepository implements IRoomRepository {
  private supabase = createClient();

  async getRoomsForRange(start?: Date | null, end?: Date | null): Promise<Room[]> {
    void start;
    void end;
    const { data, error } = await this.supabase
      .from("assets")
      .select("id, name, floor, capacity, facilities")
      .in("type", ["ruangan", "ruang"]);

    if (error) {
      console.error("Error fetching rooms:", error);
      return [];
    }

    const rows = (data || []) as DBAssetRow[];
    return rows.map((d) => this.mapToEntity(d));
  }

  private mapToEntity(d: DBAssetRow): Room {
    const rowFloor = Number(d.floor);
    const floor = Number.isFinite(rowFloor) ? rowFloor : 1;
    let features: string[] = [];

    if (Array.isArray(d.facilities)) {
      features = d.facilities.filter(
        (s: unknown): s is string => typeof s === "string"
      );
    } else if (typeof d.facilities === "string" && d.facilities.length > 0) {
      features = d.facilities
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
    }

    return {
      id: d.id,
      name: d.name ?? "Unknown Room",
      floor,
      capacity: Number.isFinite(Number(d.capacity)) ? Number(d.capacity) : 0,
      features,
      status: "available",
    };
  }
}

class SupabaseBookingRepository implements IBookingRepository {
  private supabase = createClient();

  async createBooking(
    data: Omit<Booking, "id" | "createdAt" | "status">
  ): Promise<string> {
    const newBooking = {
      room_ids: data.roomIds,
      payload: data.payload,
      created_at: new Date().toISOString(),
      status: "confirmed",
    };

    const { data: inserted, error } = await this.supabase
      .from("room_bookings")
      .insert(newBooking)
      .select()
      .single();

    if (error) {
      console.error("Booking persistence failed:", error);
      throw new Error(error.message);
    }

    return inserted.id;
  }

  async listBookingsOverlapping(
    startISO: string,
    endISO: string
  ): Promise<Booking[]> {
    const { data, error } = await this.supabase
      .from("room_bookings")
      .select("id, room_ids, created_at, status, payload");

    if (error || !data) {
      console.error("Error fetching bookings:", error);
      return [];
    }

    const rows = data as DBRoomBookingRow[];
    const results: Booking[] = rows.map((d) => this.mapToEntity(d));

    return results.filter((b) => {
      try {
        return DateUtils.dateRangesOverlap(
          startISO,
          endISO,
          b.payload.bookingStart,
          b.payload.bookingEnd
        );
      } catch {
        return false;
      }
    });
  }

  private mapToEntity(d: DBRoomBookingRow): Booking {
    const p = d.payload || {};
    const payload: BookingPayload = {
      bookingStart: p.bookingStart ?? "",
      bookingEnd: p.bookingEnd ?? "",
      startTime: p.startTime ?? "",
      endTime: p.endTime ?? "",
      name: p.name ?? "",
      institutionName: p.institutionName ?? "",
      phoneNumber: p.phoneNumber ?? "",
      purpose: p.purpose ?? "",
      notes: p.notes ?? "",
      institutionType: p.institutionType ?? "Non-Kemensetneg",
      roomSetup: p.roomSetup ?? "Island",
      attendees: Number(p.attendees) || 0,
    };

    return {
      id: d.id,
      roomIds: Array.isArray(d.room_ids) ? d.room_ids : [],
      createdAt: d.created_at,
      status: d.status === "cancelled" ? "cancelled" : "confirmed",
      payload,
    };
  }
}

type Services = {
  roomRepo: IRoomRepository;
  bookingRepo: IBookingRepository;
};

const defaultServices: Services = {
  roomRepo: new SupabaseRoomRepository(),
  bookingRepo: new SupabaseBookingRepository(),
};

const ServicesContext = createContext<Services>(defaultServices);

const ServicesProvider: React.FC<{
  services?: Partial<Services>;
  children: ReactNode;
}> = ({ services = {}, children }) => {
  const merged = useMemo(
    () => ({ ...defaultServices, ...services }),
    [services]
  );
  return (
    <ServicesContext.Provider value={merged}>
      {children}
    </ServicesContext.Provider>
  );
};

const useServices = () => useContext(ServicesContext);

const useBookingOverlapChecker = () => {
  return useCallback(
    (
      startISO: string,
      endISO: string,
      sTime: string,
      eTime: string,
      booking: Booking
    ) => {
      const {
        bookingStart: bStart,
        bookingEnd: bEnd,
        startTime: bSTime,
        endTime: bETime,
      } = booking.payload;

      if (!DateUtils.dateRangesOverlap(startISO, endISO, bStart, bEnd))
        return false;
      return DateUtils.timesOverlap(sTime, eTime, bSTime, bETime);
    },
    []
  );
};

const useRoomManager = (
  bookingStart: Date | null | undefined,
  bookingEnd: Date | null | undefined,
  startTime: string,
  endTime: string
) => {
  const { roomRepo, bookingRepo } = useServices();
  const checkOverlap = useBookingOverlapChecker();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [bookedRoomIds, setBookedRoomIds] = useState<Set<string>>(new Set());

  const detectConflicts = async (
    startISO: string,
    endISO: string,
    startT: string,
    endT: string,
    targetRoomIds: string[]
  ) => {
    try {
      const existing = await bookingRepo.listBookingsOverlapping(
        startISO,
        endISO
      );
      for (const b of existing) {
        if (b.roomIds.some((r) => targetRoomIds.includes(r))) {
          if (checkOverlap(startISO, endISO, startT, endT, b)) return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (!bookingStart) return;
    let mounted = true;

    const syncAvailability = async () => {
      try {
        setIsLoading(true);
        setSelectedRooms([]);

        const [fetchedRooms, existingBookings] = await Promise.all([
          roomRepo.getRoomsForRange(bookingStart, bookingEnd),
          (async () => {
            const sISO = DateUtils.toISODate(bookingStart)!;
            const eISO = DateUtils.toISODate(bookingEnd ?? bookingStart)!;
            return bookingRepo.listBookingsOverlapping(sISO, eISO);
          })(),
        ]);

        if (!mounted) return;

        const sISO = DateUtils.toISODate(bookingStart)!;
        const eISO = DateUtils.toISODate(bookingEnd ?? bookingStart)!;

        const booked = new Set<string>();
        existingBookings.forEach((b) => {
          (b.roomIds || []).forEach((rid) => {
            if (
              checkOverlap(
                sISO,
                eISO,
                startTime || "00:00",
                endTime || "23:59",
                b
              )
            ) {
              booked.add(rid);
            }
          });
        });

        const mappedRooms: Room[] = fetchedRooms.map((r) => ({
          ...r,
          status: booked.has(r.id) ? "booked" : "available",
        }));

        setRooms(mappedRooms);
        setBookedRoomIds(booked);
      } catch (error) {
        console.error("Failed to load rooms:", error);
        toast.error("Gagal memuat data ruangan.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    syncAvailability();
    return () => {
      mounted = false;
    };
  }, [
    bookingStart,
    bookingEnd,
    startTime,
    endTime,
    roomRepo,
    bookingRepo,
    checkOverlap,
  ]);

  const toggleRoom = useCallback(
    (id: string) => {
      if (bookedRoomIds.has(id)) {
        toast.error("Ruangan sudah dibooking pada jam tersebut");
        return;
      }
      setSelectedRooms((prev) =>
        prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
      );
    },
    [bookedRoomIds]
  );

  return {
    rooms,
    selectedRooms,
    bookedRoomIds,
    isLoading,
    toggleRoom,
    detectConflicts,
    setRooms,
    setBookedRoomIds,
    setSelectedRooms,
  };
};

const RoomCard: React.FC<{
  room: Room;
  isSelected: boolean;
  onSelect: (id: string) => void;
}> = React.memo(({ room, isSelected, onSelect }) => {
  const isBooked = room.status === "booked";

  const baseClasses =
    "p-6 rounded-xl border transition-all duration-200 select-none relative group overflow-hidden flex items-center justify-between";
  const statusClasses = {
    available:
      "bg-white border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 cursor-pointer",
    booked:
      "bg-slate-50 border-dashed border-slate-200 opacity-50 cursor-not-allowed",
    selected:
      "bg-slate-50 border-2 border-black border-dashed ring-0 cursor-pointer",
  };

  const containerClass = cn(
    baseClasses,
    isBooked
      ? statusClasses.booked
      : isSelected
        ? statusClasses.selected
        : statusClasses.available
  );

  return (
    <div
      role="button"
      aria-disabled={isBooked}
      data-room-id={room.id}
      onClick={() => !isBooked && onSelect(room.id)}
      className={containerClass}
    >
      <div className="flex flex-col gap-1 relative z-10">
        <h3
          className={cn(
            "font-bold text-lg tracking-tight",
            isSelected ? "text-black" : "text-slate-900"
          )}
        >
          {room.name}
        </h3>
      </div>

      <div className="flex items-center gap-2 relative z-10">
        <Badge
          variant="secondary"
          className={cn(
            "font-medium text-xs border border-dashed rounded-lg shadow-none px-3 py-1.5 shrink-0",
            isSelected
              ? "bg-black text-white border-transparent"
              : "bg-slate-100 text-slate-600 border-slate-300"
          )}
        >
          {room.capacity} pax
          {isBooked && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="flex items-center text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-dashed border-slate-300">
                <XCircle className="h-3.5 w-3.5 mr-1.5" />
                Booked
              </div>
            </div>
          )}
        </Badge>
      </div>
    </div>
  );
});
RoomCard.displayName = "RoomCard";

const RoomSelector: React.FC<{
  rooms: Room[];
  selectedRooms: string[];
  onToggle: (id: string) => void;
  loading: boolean;
  hasDate: boolean;
}> = React.memo(({ rooms, selectedRooms, onToggle, loading, hasDate }) => {
  const floors = useMemo(
    () => Array.from(new Set(rooms.map((r) => r.floor))).sort((a, b) => a - b),
    [rooms]
  );

  const floorsWithRooms = useMemo(
    () =>
      floors.map((floor) => ({
        floor,
        rooms: rooms
          .filter((r) => r.floor === floor)
          .sort((a, b) => a.name.localeCompare(b.name)),
      })),
    [floors, rooms]
  );

  if (!hasDate) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border border-dashed border-slate-300 rounded-xl bg-slate-50 text-slate-500">
        <CalendarClock
          className="h-10 w-10 mb-3 text-slate-300"
          strokeWidth={1.5}
        />
        <p className="font-medium">
          Silahkan pilih tanggal dan waktu terlebih dahulu
        </p>
        <p className="text-sm text-slate-400">
          Daftar ruangan akan muncul setelah Anda menentukan waktu.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[2, 3, 4].map((floor) => (
          <div key={floor} className="space-y-3">
            <Skeleton className="h-9 w-24 rounded-full" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const availableFloors = floors.length > 0 ? floors : [1];

  return (
    <Tabs defaultValue={availableFloors[0]?.toString()} className="w-full">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <TabsList className="bg-transparent h-auto p-0 flex flex-wrap gap-2 justify-start w-full sm:w-auto px-4 py-4">
          {availableFloors.map((floor) => (
            <TabsTrigger
              key={floor}
              value={String(floor)}
              className="rounded-xl border border-dashed border-slate-300 data-[state=active]:border-black data-[state=active]:bg-black data-[state=active]:text-white data-[state=inactive]:text-slate-500 hover:text-slate-900 hover:border-slate-400 px-4 py-2.5 font-bold text-sm transition-all bg-white"
            >
              Lantai {floor}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {floorsWithRooms.map(({ floor, rooms: floorRooms }) => (
        <TabsContent key={floor} value={String(floor)} className="mt-0">
          <div className="space-y-4">
            <div className="flex justify-end items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <div className="w-2 h-2 rounded-full border border-slate-300 bg-white" />
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-900">
                  <div className="w-2 h-2 rounded-full bg-black border border-black" />
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-slate-100 border border-dashed border-slate-300" />
                  <span>Booked</span>
                </div>
              </div>
            </div>
            {floorRooms.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {floorRooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    isSelected={selectedRooms.includes(room.id)}
                    onSelect={onToggle}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <Info className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>Tidak ada ruangan tersedia di lantai ini</p>
              </div>
            )}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
});
RoomSelector.displayName = "RoomSelector";

const ActivityTimeSection: React.FC<{
  form: UseFormReturn<BookingFormData>;
}> = ({ form }) => {
  const {
    control,
    register,
    formState: { errors },
    setValue,
    watch,
  } = form;
  const [openStart, setOpenStart] = useState(false);
  const [openEnd, setOpenEnd] = useState(false);
  const bookingStart = watch("bookingStart");

  return (
    <Card className="border border-dashed border-slate-300 shadow-none bg-white rounded-xl overflow-hidden h-fit">
      <CardHeader className="bg-white border-b border-dashed border-slate-300 pb-6 pt-3 px-6 items-center">
        <CardTitle className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          <CalendarClock className="w-6 h-6 text-black" strokeWidth={1.5} />
          Waktu & Kegiatan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field>
            <FieldLabel>
              Tanggal Mulai <span className="text-red-500">*</span>
            </FieldLabel>
            <FieldContent>
              <Controller
                control={control}
                name="bookingStart"
                render={({ field }) => (
                  <Popover open={openStart} onOpenChange={setOpenStart}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-slate-50 border-dashed border-slate-300 hover:bg-slate-100 hover:border-slate-400 focus:border-solid focus:border-black focus:ring-0 rounded-lg h-11",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd MMMM yyyy")
                        ) : (
                          <span>Pilih tanggal</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <ShadcnCalendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={(date) => {
                          field.onChange(date);
                          setOpenStart(false);
                          if (!watch("bookingEnd")) setValue("bookingEnd", date);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              <FieldError errors={[errors.bookingStart]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>Tanggal Selesai (Opsional)</FieldLabel>
            <FieldContent>
              <Controller
                control={control}
                name="bookingEnd"
                render={({ field }) => (
                  <Popover open={openEnd} onOpenChange={setOpenEnd}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-slate-50 border-dashed border-slate-300 hover:bg-slate-100 hover:border-slate-400 focus:border-solid focus:border-black focus:ring-0 rounded-lg h-11",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd MMMM yyyy")
                        ) : (
                          <span>Pilih tanggal</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <ShadcnCalendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={(date) => {
                          field.onChange(date);
                          setOpenEnd(false);
                        }}
                        disabled={(date) => !!bookingStart && date < bookingStart}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              <FieldError errors={[errors.bookingEnd]} />
            </FieldContent>
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field>
            <FieldLabel>
              Jam Mulai <span className="text-red-500">*</span>
            </FieldLabel>
            <FieldContent>
              <Input
                type="time"
                {...register("startTime")}
                className="bg-slate-50 border-dashed border-slate-300 focus:border-solid focus:border-black focus:ring-0 rounded-lg h-11"
              />
              <FieldError errors={[errors.startTime]} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>
              Jam Selesai <span className="text-red-500">*</span>
            </FieldLabel>
            <FieldContent>
              <Input
                type="time"
                {...register("endTime")}
                className="bg-slate-50 border-dashed border-slate-300 focus:border-solid focus:border-black focus:ring-0 rounded-lg h-11"
              />
              <FieldError errors={[errors.endTime]} />
            </FieldContent>
          </Field>
        </div>

        <Field>
          <FieldLabel>
            Nama Kegiatan <span className="text-red-500">*</span>
          </FieldLabel>
          <FieldContent>
            <Input
              {...register("purpose")}
              placeholder="Contoh: Rapat Koordinasi Tahunan"
              className="bg-slate-50 border-dashed border-slate-300 focus:border-solid focus:border-black focus:ring-0 rounded-lg h-11"
            />
            <FieldError errors={[errors.purpose]} />
          </FieldContent>
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field>
            <FieldLabel>
              Jumlah Peserta <span className="text-red-500">*</span>
            </FieldLabel>
            <FieldContent>
              <Input
                type="number"
                {...register("attendees")}
                placeholder="0"
                className="bg-slate-50 border-dashed border-slate-300 focus:border-solid focus:border-black focus:ring-0 rounded-lg h-11"
              />
              <FieldError errors={[errors.attendees]} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>
              Layout Ruangan <span className="text-red-500">*</span>
            </FieldLabel>
            <FieldContent>
              <Controller
                control={control}
                name="roomSetup"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="bg-slate-50 border-dashed border-slate-300 focus:border-solid focus:border-black focus:ring-0 rounded-lg h-11">
                      <SelectValue placeholder="Pilih layout" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Island">Island</SelectItem>
                      <SelectItem value="U-shape">U-shape</SelectItem>
                      <SelectItem value="Classroom">Classroom</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError errors={[errors.roomSetup]} />
            </FieldContent>
          </Field>
        </div>
      </CardContent>
    </Card>
  );
};

const UserInfoSection: React.FC<{
  form: UseFormReturn<BookingFormData>;
}> = ({ form }) => {
  const {
    control,
    register,
    formState: { errors },
  } = form;

  return (
    <Card className="border border-dashed border-slate-300 shadow-none bg-white rounded-xl overflow-hidden h-fit">
      <CardHeader className="bg-white border-b border-dashed border-slate-300 pb-6 pt-3 px-6 items-center">
        <CardTitle className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          <User className="w-6 h-6 text-black" strokeWidth={1.5} />
          Informasi Peminjam
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <Field>
          <FieldLabel>
            Nama Peminjam <span className="text-red-500">*</span>
          </FieldLabel>
          <FieldContent>
            <Input
              {...register("name")}
              placeholder="Nama lengkap peminjam"
              className="bg-slate-50 border-dashed border-slate-300 focus:border-solid focus:border-black focus:ring-0 rounded-lg h-11"
            />
            <FieldError errors={[errors.name]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>
            Nomor Telepon/WA <span className="text-red-500">*</span>
          </FieldLabel>
          <FieldContent>
            <Input
              {...register("phoneNumber")}
              placeholder="Nomor Telepon/WA Peminjam"
              className="bg-slate-50 border-dashed border-slate-300 focus:border-solid focus:border-black focus:ring-0 rounded-lg h-11"
            />
            <FieldError errors={[errors.phoneNumber]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>
            Nama Instansi <span className="text-red-500">*</span>
          </FieldLabel>
          <FieldContent>
            <Input
              {...register("institutionName")}
              placeholder="Nama unit/instansi"
              className="bg-slate-50 border-dashed border-slate-300 focus:border-solid focus:border-black focus:ring-0 rounded-lg h-11"
            />
            <FieldError errors={[errors.institutionName]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>
            Jenis Instansi <span className="text-red-500">*</span>
          </FieldLabel>
          <FieldContent>
            <Controller
              control={control}
              name="institutionType"
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="bg-slate-50 border-dashed border-slate-300 focus:border-solid focus:border-black focus:ring-0 rounded-lg h-11">
                    <SelectValue placeholder="Pilih jenis instansi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kemensetneg">Kemensetneg</SelectItem>
                    <SelectItem value="Non-Kemensetneg">
                      Non-Kemensetneg
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.institutionType]} />
          </FieldContent>
        </Field>
      </CardContent>
    </Card>
  );
};

const RoomBookingSystem: React.FC = () => {
  const router = useRouter();
  const { bookingRepo } = useServices();
  const checkOverlap = useBookingOverlapChecker();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      bookingStart: null,
      bookingEnd: null,
      startTime: "08:00",
      endTime: "20:00",
      name: "",
      institutionName: "",
      phoneNumber: "",
      purpose: "",
      notes: "",
      institutionType: "Kemensetneg",
      roomSetup: "Island",
      attendees: 1,
    },
  });

  const {
    handleSubmit,
    setError,
    reset,
    formState: { isSubmitting },
  } = form;

  const [bookingStart, bookingEnd, startTime, endTime] = useWatch({
    control: form.control,
    name: ["bookingStart", "bookingEnd", "startTime", "endTime"],
  });

  const {
    rooms,
    selectedRooms,
    isLoading,
    toggleRoom,
    detectConflicts,
    setRooms,
    setBookedRoomIds,
    setSelectedRooms,
  } = useRoomManager(bookingStart, bookingEnd, startTime, endTime);

  useEffect(() => {
    if (!startTime || !endTime) return;
    const sh = parseInt(startTime.split(":")[0], 10);
    const eh = parseInt(endTime.split(":")[0], 10);

    if (Number.isNaN(sh) || Number.isNaN(eh)) return;

    if (eh <= sh) {
      setError("endTime", {
        type: "manual",
        message: "End time must be after start time",
      });
    } else if (sh < WORKING_HOURS.start || eh > WORKING_HOURS.end) {
      setError("endTime", {
        type: "manual",
        message: `Booking hours must be between ${WORKING_HOURS.start}:00 and ${WORKING_HOURS.end}:00`,
      });
    }
  }, [startTime, endTime, setError]);

  const onSubmit: SubmitHandler<BookingFormData> = async (data) => {
    if (selectedRooms.length === 0) {
      toast.error("Mohon pilih setidaknya satu ruangan");
      return;
    }

    const startISO =
      DateUtils.toISODate(data.bookingStart) ||
      DateUtils.toISODate(new Date());
    const endISO = DateUtils.toISODate(data.bookingEnd) || startISO;
    const startT = data.startTime;
    const endT = data.endTime;

    if (!startISO || !endISO) return;

    try {

      const hasConflict = await detectConflicts(
        startISO,
        endISO,
        startT,
        endT,
        selectedRooms
      );

      if (hasConflict) {
        toast.error(
          "Salah satu ruangan yang dipilih sudah dibooking pada jam tersebut."
        );

        const latest = await bookingRepo.listBookingsOverlapping(
          startISO,
          endISO
        );
        const newBooked = new Set<string>();
        latest.forEach((b) =>
          (b.roomIds || []).forEach((rid) => {
            if (checkOverlap(startISO, endISO, startT, endT, b))
              newBooked.add(rid);
          })
        );
        setBookedRoomIds(newBooked);
        setRooms((prev) =>
          prev.map((r) => ({
            ...r,
            status: newBooked.has(r.id) ? "booked" : r.status,
          }))
        );
        setSelectedRooms((prev) => prev.filter((id) => !newBooked.has(id)));
        return;
      }

      const payload: Omit<Booking, "id" | "createdAt" | "status"> = {
        roomIds: selectedRooms,
        payload: {
          bookingStart: startISO,
          bookingEnd: endISO,
          startTime: startT,
          endTime: endT,
          name: data.name,
          institutionName: data.institutionName,
          phoneNumber: data.phoneNumber,
          purpose: data.purpose,
          notes: data.notes,
          institutionType: data.institutionType,
          roomSetup: data.roomSetup,
          attendees: data.attendees,
        },
      };

      await bookingRepo.createBooking(payload);
      toast.success("Booking Berhasil Disimpan!");
      router.push("/room");

      reset();
      setSelectedRooms([]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal membuat booking";
      toast.error(msg);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tambah Jadwal</h1>
        <p className="text-gray-500">Ajukan jadwal peminjaman ruangan</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ActivityTimeSection form={form} />
          <UserInfoSection form={form} />
        </div>

        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border border-dashed border-slate-300 shadow-none bg-white rounded-xl overflow-hidden">
            <CardHeader className="bg-white border-b border-dashed border-slate-300 pb-6 pt-3 px-6 items-center">
              <CardTitle className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                <Building2 className="w-6 h-6 text-black" strokeWidth={1.5} />
                Pilih Ruangan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <RoomSelector
                rooms={rooms}
                selectedRooms={selectedRooms}
                onToggle={toggleRoom}
                loading={isLoading}
                hasDate={!!bookingStart}
              />
              <div className="flex items-center justify-between mt-6 p-4 bg-slate-50 border border-dashed border-slate-300 rounded-lg">
                <span className="text-sm font-semibold text-slate-900 tracking-tight">
                  Ruangan Terpilih:
                </span>
                <Badge
                  variant="default"
                  className="bg-black text-white hover:bg-zinc-900 border-none rounded-md px-4 py-1.5 font-bold shadow-none"
                >
                  {selectedRooms.length}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border border-dashed border-slate-300 shadow-none bg-white rounded-xl overflow-hidden">
            <CardHeader className="bg-white border-b border-dashed border-slate-300 pb-6 pt-3 px-6 items-center">
              <CardTitle className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                <NotebookPen className="w-6 h-6 text-black" strokeWidth={1.5} />
                Catatan Tambahan
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Field>
                <FieldContent>
                  <Textarea
                    {...form.register("notes")}
                    placeholder="Kebutuhan tambahan seperti sound system, proyektor, dll."
                    className="min-h-[120px] bg-slate-50 border-dashed border-slate-300 focus:border-solid focus:border-black focus:ring-0 rounded-lg p-4"
                  />
                </FieldContent>
              </Field>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-6 pb-20">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-10 bg-black hover:bg-zinc-800 text-white shadow-none hover:opacity-90 transition-all rounded-full font-bold h-12 text-base"
          >
            {isSubmitting ? "Memproses..." : "Konfirmasi Booking"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default function RoomBookingPage() {
  return (
    <ServicesProvider>
      <RoomBookingSystem />
    </ServicesProvider>
  );
}
