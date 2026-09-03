"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CheckCircle,
  XCircle,
  Download,
  CalendarClock,
  Building2,
  Users,
  Plus,
  Search,
  Trash2,
  GripVertical,
} from "lucide-react";

import {
  SupabaseRoomRepository,
  SupabaseBookingRepository,
  type Room,
  type Booking,
} from "@/features/dorm";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const WORKING_HOURS = { start: 8, end: 20 } as const;
const TIME_REGEX = /^\d{2}:\d{2}$/;

type RoomStatus = "available" | "booked" | "selected";
type Participant = {
  id: string;
  name: string;
  gender: "L" | "P";
  unitKerja: string;
  instansi: string;
};

const PHONE_REGEX = /^[0-9+\-() ]{8,20}$/;

const sanitizeExcelCell = (val: string): string => {
  let str = String(val || "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim();
  // Strip formula triggers
  if (/^[=+\-@\t\r]/.test(str)) {
    str = str.replace(/^[=+\-@\t\r]+/, "");
  }
  return str;
};

const bookingSchema = z
  .object({
    bookingStart: z.instanceof(Date, { message: "Tanggal mulai wajib diisi" }).nullable(),
    bookingEnd: z.instanceof(Date).nullable().optional(),
    startTime: z.string().regex(TIME_REGEX, "Format waktu mulai tidak valid (HH:MM)"),
    endTime: z.string().regex(TIME_REGEX, "Format waktu selesai tidak valid (HH:MM)"),
    name: z.string().trim().min(1, "Nama peminjam wajib diisi").max(150, "Nama maksimal 150 karakter"),
    institutionName: z.string().trim().min(1, "Nama instansi wajib diisi").max(150, "Nama instansi maksimal 150 karakter"),
    phoneNumber: z
      .string()
      .trim()
      .min(1, "Nomor telepon wajib diisi")
      .max(20, "Nomor telepon maksimal 20 karakter")
      .regex(PHONE_REGEX, "Nomor telepon tidak valid (hanya angka, +, -, (), dan spasi, 8-20 karakter)"),
    purpose: z.string().trim().max(500, "Tujuan peminjaman maksimal 500 karakter").optional(),
    institutionType: z.enum(["Kemensetneg", "Non-Kemensetneg"]),
  })
  .superRefine((data, ctx) => {
    const [sh, sm] = data.startTime.split(":").map(Number);
    const [eh, em] = data.endTime.split(":").map(Number);

    if (Number.isNaN(sh) || Number.isNaN(eh)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid time format" });
      return;
    }

    if (eh < sh || (eh === sh && em <= sm)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "Waktu selesai harus setelah waktu mulai",
      });
    }

    if (sh < WORKING_HOURS.start || eh > WORKING_HOURS.end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: `Jam operasional: ${WORKING_HOURS.start}:00 - ${WORKING_HOURS.end}:00`,
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
        message: "Tanggal selesai harus setelah tanggal mulai",
      });
    }
  });

type BookingFormData = z.infer<typeof bookingSchema>;

const dateUtils = {
  isoDate: (d?: Date | null) => (d ? new Date(d).toISOString() : null),
  isoDateOnly: (iso: string) => iso.split("T")[0],
  parseTimeToMinutes: (t: string) => {
    const [hh, mm] = t.split(":").map((s) => parseInt(s, 10));
    return hh * 60 + mm;
  },
  dateRangesOverlap: (
    aStartISO: string,
    aEndISO: string,
    bStartISO: string,
    bEndISO: string
  ) => {
    const aStart = new Date(dateUtils.isoDateOnly(aStartISO));
    const aEnd = new Date(dateUtils.isoDateOnly(aEndISO));
    const bStart = new Date(dateUtils.isoDateOnly(bStartISO));
    const bEnd = new Date(dateUtils.isoDateOnly(bEndISO));
    return !(aEnd < bStart || bEnd < aStart);
  },
  timesOverlap: (
    aStartTime: string,
    aEndTime: string,
    bStartTime: string,
    bEndTime: string
  ) => {
    const aS = dateUtils.parseTimeToMinutes(aStartTime);
    const aE = dateUtils.parseTimeToMinutes(aEndTime);
    const bS = dateUtils.parseTimeToMinutes(bStartTime);
    const bE = dateUtils.parseTimeToMinutes(bEndTime);
    return !(aE <= bS || bE <= aS);
  },
  bookingOverlaps: (
    candidateStartISO: string,
    candidateEndISO: string,
    candidateStartTime: string,
    candidateEndTime: string,
    booking: Booking
  ) => {
    const {
      bookingStart: bStartISO,
      bookingEnd: bEndISO,
      startTime: bStartTime,
      endTime: bEndTime,
    } = booking.payload;

    if (
      !dateUtils.dateRangesOverlap(
        candidateStartISO,
        candidateEndISO,
        bStartISO,
        bEndISO
      )
    ) {
      return false;
    }
    return dateUtils.timesOverlap(
      candidateStartTime,
      candidateEndTime,
      bStartTime,
      bEndTime
    );
  },
};

const excelUtils = {
  downloadTemplate: () => {
    const data = [
      ["id", "nama", "gender", "unit_kerja", "instansi"],
      ["", "Peserta 1", "L", "PPKASN", "Kemensetneg"],
      ["", "Peserta 2", "P", "BTDI", "Kemensetneg"],
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Peserta");
    XLSX.writeFile(wb, "template-peserta-asrama.xlsx");
  },
  parseParticipants: (file: File): Promise<Participant[]> => {
    return new Promise((resolve, reject) => {
      // Protect file size max 5MB
      if (file.size > 5 * 1024 * 1024) {
        reject("Ukuran file Excel maksimal 5 MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: "binary" });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as string[][];

          if (!data || data.length <= 1) {
            reject("File kosong atau tidak ada data");
            return;
          }

          if (data.length > 501) {
            reject("Jumlah data maksimal 500 peserta per file");
            return;
          }

          const headers = data[0].map((h) => String(h || "").toLowerCase().trim());
          const getIdx = (patterns: string[]) =>
            headers.findIndex((h) => patterns.some((p) => h.includes(p)));

          const indices = {
            id: getIdx(["id"]),
            name: getIdx(["nama", "name"]),
            gender: getIdx(["gender", "jenis_kelamin"]),
            unit: getIdx(["unit_kerja", "unitkerja"]),
            instansi: getIdx(["instansi"]),
          };

          if (Object.values(indices).some((i) => i === -1)) {
            reject(
              "Format kolom tidak sesuai. Pastikan ada: id, nama, gender, unit_kerja, instansi"
            );
            return;
          }

          const parsed = data
            .slice(1)
            .map((row) => {
              const r = (i: number) => sanitizeExcelCell(row[i]);
              const rawGender = r(indices.gender).toUpperCase();
              const gender = rawGender.startsWith("P") ? "P" : rawGender.startsWith("L") ? "L" : "";
              const name = r(indices.name).slice(0, 150);
              const unitKerja = r(indices.unit).slice(0, 150);
              const instansi = r(indices.instansi).slice(0, 150);

              // Strict validation
              if (!name || (gender !== "L" && gender !== "P") || !unitKerja || !instansi) {
                return null;
              }

              return {
                id: r(indices.id).slice(0, 50) || crypto.randomUUID(),
                name,
                gender: gender as "L" | "P",
                unitKerja,
                instansi,
              };
            })
            .filter((p): p is Participant => p !== null);

          if (parsed.length === 0) reject("Tidak ada data valid yang ditemukan");
          else resolve(parsed);
        } catch {
          reject("Gagal membaca file Excel");
        }
      };
      reader.onerror = () => reject("Gagal memproses file");
      reader.readAsBinaryString(file);
    });
  },
};

const RoomCard = React.memo(
  ({
    room,
    statusOverride,
    assigned,
    onSelect,
  }: {
    room: Room;
    statusOverride?: RoomStatus;
    assigned?: Participant[];
    onSelect: (id: string) => void;
  }) => {
    const status = statusOverride || "available";

    const statusClasses: Record<RoomStatus, string> = {
      available:
        "bg-white border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 cursor-pointer",
      booked:
        "bg-slate-50 border-dashed border-slate-200 cursor-not-allowed opacity-60",
      selected: "bg-slate-50 border-2 border-black border-dashed ring-0",
    };

    const isAvailable = status === "available" || status === "selected";

    return (
      <div
        onClick={() => isAvailable && onSelect(room.id)}
        className={cn(
          "p-6 rounded-xl border transition-all select-none flex flex-col justify-between h-full relative overflow-hidden group cursor-pointer",
          statusClasses[status]
        )}
        role="button"
        aria-disabled={!isAvailable}
      >
        <div className="flex justify-between items-start">
          <h3
            className={cn(
              "font-bold text-lg tracking-tight",
              status === "selected" ? "text-slate-900" : "text-slate-700"
            )}
          >
            {room.name}
          </h3>
          <div className="flex items-center gap-1.5">
            {assigned && assigned.length > 0 && (
              <Badge
                variant="outline"
                className="font-medium text-xs border border-dashed rounded-lg shadow-none px-2 py-1 text-slate-700 bg-slate-50"
              >
                {assigned.length}/{room.capacity}
              </Badge>
            )}
            <Badge
              variant="secondary"
              className={cn(
                "font-medium text-xs border border-dashed rounded-lg shadow-none px-2.5 py-1",
                status === "selected"
                  ? "bg-black text-white border-transparent"
                  : "bg-slate-100 text-slate-600 border-slate-300"
              )}
            >
              {room.capacity} pax
            </Badge>
          </div>
        </div>

        {status === "booked" && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px] z-10">
            <div className="flex items-center text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-dashed border-slate-300 shadow-sm">
              <XCircle className="h-3.5 w-3.5 mr-1.5" />
              Booked
            </div>
          </div>
        )}
      </div>
    );
  }
);
RoomCard.displayName = "RoomCard";

const DraggableParticipant = ({
  participant,
  source,
  roomId,
  onRemove,
}: {
  participant: Participant;
  source: "room" | "unassigned";
  roomId?: string;
  onRemove?: () => void;
}) => {
  const id: UniqueIdentifier =
    source === "room" && roomId
      ? `room-${roomId}-${participant.id}`
      : `unassigned-${participant.id}`;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: { participant, source, roomId },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "flex items-center gap-3 p-2.5 rounded-lg border border-dashed transition-all group relative",
        source === "room" ? "bg-white border-slate-200" : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm",
        isDragging && "z-50 shadow-xl scale-105"
      )}
    >
      <div className="cursor-grab text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="h-4 w-4" />
      </div>
      <div
        className={cn(
          "flex items-center justify-center min-w-8 min-h-8 w-8 h-8 rounded-full text-xs font-bold border border-dashed",
          participant.gender === "L"
            ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
            : "bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100"
        )}
      >
        {participant.gender === "L" ? "L" : "P"}
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="font-semibold text-xs text-slate-900 truncate">
          {participant.name}
        </span>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium truncate">
          <span>{participant.unitKerja}</span>
        </div>
      </div>
      {onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-slate-400 hover:text-red-500 rounded-md"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
};

const DroppableRoom = ({
  room,
  assigned,
}: {
  room: Room;
  assigned: Participant[];
}) => {
  const items = assigned.map((p) => `room-${room.id}-${p.id}`);
  const { setNodeRef, isOver } = useDroppable({
    id: `room-container-${room.id}`,
    data: { type: "room", roomId: room.id },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-xl border border-dashed transition-all duration-200 flex flex-col overflow-hidden",
        isOver
          ? "bg-slate-50 border-slate-400 ring-1 ring-slate-400"
          : "bg-white border-slate-300"
      )}
    >
      <div className="px-3 py-2.5 bg-slate-50/50 border-b border-dashed border-slate-200 flex justify-between items-center">
        <h4 className="font-semibold text-xs text-slate-900 tracking-tight flex items-center gap-2">
          <Building2 className="h-3.5 w-3.5 text-slate-500" />
          {room.name}
        </h4>
        <div className="flex gap-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full border",
                i < assigned.length
                  ? (assigned[i].gender === "L" ? "bg-blue-400 border-blue-500" : "bg-pink-400 border-pink-500")
                  : "bg-transparent border-slate-300"
              )}
            />
          ))}
        </div>
      </div>

      <div className="p-2 min-h-[100px] flex flex-col gap-2">
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {assigned.map((p) => (
            <DraggableParticipant
              key={p.id}
              participant={p}
              source="room"
              roomId={room.id}
            />
          ))}
        </SortableContext>
        {assigned.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-[10px] text-slate-400 py-4 italic">
            Tarik peserta ke sini
          </div>
        )}
      </div>
    </div>
  );
};

function AddParticipantDialog({ onAdd }: { onAdd: (p: Participant) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"L" | "P">("L");
  const [unit, setUnit] = useState("");
  const [instansi, setInstansi] = useState("");

  const handleSubmit = (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    const cleanName = sanitizeExcelCell(name).slice(0, 150);
    const cleanUnit = sanitizeExcelCell(unit).slice(0, 150);
    const cleanInstansi = sanitizeExcelCell(instansi).slice(0, 150);

    if (!cleanName || !cleanUnit || !cleanInstansi) {
      toast.error("Mohon lengkapi semua data peserta dengan benar");
      return;
    }

    onAdd({
      id: crypto.randomUUID(),
      name: cleanName,
      gender,
      unitKerja: cleanUnit,
      instansi: cleanInstansi,
    });

    setName("");
    setGender("L");
    setUnit("");
    setInstansi("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-8 rounded-lg border-dashed border-slate-300 text-xs font-medium gap-2">
          <Plus className="h-3.5 w-3.5" />
          Tambah Manual
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Peserta</DialogTitle>
          <DialogDescription>
            Masukkan data peserta secara manual ke dalam daftar.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="p-name">Nama Lengkap</Label>
            <Input
              id="p-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="p-gender">Jenis Kelamin</Label>
            <Select value={gender} onValueChange={(v) => setGender(v as "L" | "P")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">Laki-laki</SelectItem>
                <SelectItem value="P">Perempuan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="p-unit">Unit Kerja</Label>
              <Input
                id="p-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Unit Kerja"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="p-instansi">Instansi</Label>
              <Input
                id="p-instansi"
                value={instansi}
                onChange={(e) => setInstansi(e.target.value)}
                placeholder="Kemensetneg"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleSubmit}>Simpan</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const UnassignedList = ({
  participants,
  roomAssignments,
  onAddParticipant,
  onRemoveParticipant,
}: {
  participants: Participant[];
  roomAssignments: Record<string, Participant[]>;
  onAddParticipant: (p: Participant) => void;
  onRemoveParticipant: (id: string) => void;
}) => {
  const [search, setSearch] = useState("");

  const assignedIds = new Set(
    Object.values(roomAssignments)
      .flat()
      .map((p) => p.id)
  );

  const unassigned = participants.filter((p) => !assignedIds.has(p.id));

  const filtered = unassigned.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.unitKerja.toLowerCase().includes(search.toLowerCase())
  );

  const items = filtered.map((p) => `unassigned-${p.id}`);
  const { setNodeRef } = useDroppable({
    id: "unassigned-container",
    data: { type: "unassigned" },
  });

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col h-full bg-slate-50 rounded-xl border border-dashed border-slate-300 overflow-hidden"
    >
      <div className="p-4 border-b border-dashed border-slate-200 bg-white space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h5 className="font-bold text-sm text-slate-900">Belum Ditempatkan</h5>
            <Badge variant="secondary" className="rounded-md h-5 mr-2 px-1.5 text-xs">
              {unassigned.length}
            </Badge>
          </div>
          <AddParticipantDialog onAdd={onAddParticipant} />
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari peserta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-slate-50 border-slate-200 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-slate-400"
          />
        </div>
      </div>

      <div className="flex-1 min-h-[400px] overflow-hidden">
        <div className="h-[500px] py-4 px-3 overflow-y-auto custom-scrollbar">
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {filtered.length > 0 ? (
                filtered.map((p) => (
                  <DraggableParticipant
                    key={p.id}
                    participant={p}
                    source="unassigned"
                    onRemove={() => onRemoveParticipant(p.id)}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400 gap-2">
                  <Users className="h-8 w-8 opacity-20" />
                  <p className="text-xs">
                    {participants.length === 0
                      ? "Belum ada peserta. Tambah manual atau upload Excel."
                      : "Tidak ada peserta tersisa"}
                  </p>
                </div>
              )}
            </div>
          </SortableContext>
        </div>
      </div>
    </div>
  );
};

const RoomSelector = React.memo(
  ({
    rooms,
    selectedRooms,
    bookedRoomIds,
    roomAssignments,
    onToggle,
    loading,
  }: {
    rooms: Room[];
    selectedRooms: string[];
    bookedRoomIds: Set<string>;
    roomAssignments: Record<string, Participant[]>;
    onToggle: (id: string) => void;
    loading: boolean;
  }) => {
    const floors = useMemo(
      () =>
        Array.from(new Set(rooms.map((r) => r.floor))).sort((a, b) => a - b),
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

    if (loading) {
      return (
        <div className="space-y-6">
          {[2, 3, 4].map((floor) => (
            <div key={floor} className="space-y-3">
              <Skeleton className="h-6 w-24 rounded-md" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <Tabs defaultValue={String(floors[0] ?? 2)}>
        <TabsList className="bg-transparent h-auto p-4 flex flex-wrap gap-2 justify-start w-full sm:w-auto mb-6">
          {floors.map((floor) => (
            <TabsTrigger
              key={floor}
              value={String(floor)}
              className="rounded-xl border cursor-pointer border-dashed border-slate-300 data-[state=active]:border-black data-[state=active]:bg-black data-[state=active]:text-white data-[state=inactive]:text-slate-500 hover:text-slate-900 hover:border-slate-400 px-4 py-2.5 font-bold text-sm transition-all bg-white shadow-none"
            >
              Lantai {floor}
            </TabsTrigger>
          ))}
        </TabsList>

        {floorsWithRooms.map(({ floor, rooms: floorRooms }) => (
          <TabsContent key={floor} value={String(floor)}>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Lantai {floor}</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <div className="w-2.5 h-2.5 rounded-full border border-slate-300 bg-white" />
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-900">
                    <div className="w-2.5 h-2.5 rounded-full bg-black border border-black" />
                    <span>Selected</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-100 border border-dashed border-slate-300" />
                    <span>Booked</span>
                  </div>
                </div>
              </div>

              {floorRooms.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {floorRooms.map((room) => {
                    const isBooked = bookedRoomIds.has(room.id);
                    const isSelected = selectedRooms.includes(room.id);
                    return (
                      <RoomCard
                        key={room.id}
                        room={room}
                        statusOverride={
                          isBooked
                            ? "booked"
                            : isSelected
                              ? "selected"
                              : "available"
                        }
                        assigned={roomAssignments[room.id]}
                        onSelect={onToggle}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No rooms available on this floor
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    );
  }
);
RoomSelector.displayName = "RoomSelector";

export default function DormBookingPage() {
  const router = useRouter();

  const roomRepo = useMemo(() => new SupabaseRoomRepository(), []);
  const bookingRepo = useMemo(() => new SupabaseBookingRepository(), []);

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
      institutionType: "Kemensetneg",
    },
    mode: "onChange",
  });

  const bookingStart = form.watch("bookingStart");
  const bookingEnd = form.watch("bookingEnd");
  const startTime = form.watch("startTime");
  const endTime = form.watch("endTime");

  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookedRoomIds, setBookedRoomIds] = useState<Set<string>>(new Set());
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [roomAssignments, setRoomAssignments] = useState<
    Record<string, Participant[]>
  >({});

  const [openStart, setOpenStart] = useState(false);
  const [openEnd, setOpenEnd] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (!bookingStart) return;
    let mounted = true;

    const fetchAvailability = async () => {
      try {
        setIsLoadingRooms(true);
        setSelectedRooms([]);
        setRoomAssignments({});

        const fetchedRooms = await roomRepo.getRoomsForRange(
          bookingStart,
          bookingEnd
        );

        if (!mounted) return;

        const startISO = dateUtils.isoDate(bookingStart)!;
        const endISO = dateUtils.isoDate(bookingEnd ?? bookingStart)!;

        const bookings = await bookingRepo.listBookingsOverlapping(
          startISO,
          endISO
        );

        const booked = new Set<string>();
        bookings.forEach((b) => {
          (b.roomIds || []).forEach((rid) => {
            if (
              dateUtils.bookingOverlaps(
                startISO,
                endISO,
                startTime || "00:00",
                endTime || "23:59",
                b
              )
            ) {
              booked.add(rid);
            }
          });
        });

        setRooms(fetchedRooms);
        setBookedRoomIds(booked);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load rooms availability");
      } finally {
        if (mounted) setIsLoadingRooms(false);
      }
    };

    fetchAvailability();
    return () => { mounted = false; };
  }, [bookingStart, bookingEnd, startTime, endTime, roomRepo, bookingRepo]);

  const assignParticipantsToRoomsLogic = useCallback(
    (
      participantList: Participant[],
      targetRooms: Room[],
      currentAssignments: Record<string, Participant[]>
    ) => {

      if (Object.keys(currentAssignments).length > 0) return currentAssignments;

      const newAssignments: Record<string, Participant[]> = {};
      const sortedRooms = [...targetRooms].sort((a, b) =>
        a.id.localeCompare(b.id)
      );
      sortedRooms.forEach((r) => (newAssignments[r.id] = []));

      const males = participantList.filter((p) => p.gender === "L");
      const females = participantList.filter((p) => p.gender === "P");

      const distributor = (
        people: Participant[],
        allowed: Room[]
      ) => {
        const queue = [...people];
        allowed.forEach((room) => {
          const cap = Math.min(3, room.capacity);
          const current = newAssignments[room.id];
          const usedUnits = new Set(current.map((p) => p.unitKerja));

          while (current.length < cap && queue.length > 0) {

            let idx = queue.findIndex((p) => !usedUnits.has(p.unitKerja));
            if (idx === -1) idx = 0; // Fallback

            if (idx !== -1) {
              const p = queue[idx];
              current.push(p);
              usedUnits.add(p.unitKerja);
              queue.splice(idx, 1);
            }
          }
        });
      };

      distributor(females, sortedRooms);

      const maleRooms = sortedRooms.filter(r => {
        const occ = newAssignments[r.id];
        return occ.length === 0 || occ.every(p => p.gender === "L");
      });

      distributor(males, maleRooms);

      return newAssignments;
    },
    []
  );

  const handleToggleRoom = useCallback(
    (id: string) => {
      if (bookedRoomIds.has(id)) {
        toast.error("Room already booked for these dates");
        return;
      }

      setSelectedRooms((prev) => {
        const next = prev.includes(id)
          ? prev.filter((p) => p !== id)
          : [...prev, id];

        if (participants.length > 0) {
          const selectedRoomObjects = rooms.filter((r) => next.includes(r.id));
          const newAssignments = assignParticipantsToRoomsLogic(
            participants,
            selectedRoomObjects,
            {}
          );
          setRoomAssignments(newAssignments);
        }

        return next;
      });
    },
    [bookedRoomIds, participants, rooms, assignParticipantsToRoomsLogic]
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await excelUtils.parseParticipants(file);
      setParticipants(prev => {
        const combined = [...prev, ...parsed];
        const uniqueParticipants = Array.from(new Map(combined.map(p => [p.id, p])).values());

        if (selectedRooms.length > 0) {
          const selectedRoomObjects = rooms.filter((r) =>
            selectedRooms.includes(r.id)
          );

          const newAssignments = assignParticipantsToRoomsLogic(
            parsed,
            selectedRoomObjects,
            roomAssignments
          );
          setRoomAssignments(newAssignments);
          toast.success("Participants automatically distributed");
        }

        return uniqueParticipants;
      });
    } catch (msg) {
      toast.error(String(msg));
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleManualAdd = (p: Participant) => {
    setParticipants(prev => [...prev, p]);
    toast.success("Peserta ditambahkan");
  };

  const handleRemoveParticipant = (id: string) => {

    setParticipants(prev => prev.filter(p => p.id !== id));

    setRoomAssignments(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(rid => {
        next[rid] = next[rid].filter(p => p.id !== id);
      });
      return next;
    });
    toast.success("Peserta dihapus");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current as {
      participant: Participant;
      source: "room" | "unassigned";
      roomId?: string;
    };
    const overData = over.data.current as {
      type: "room" | "unassigned";
      roomId?: string;
    };

    if (!activeData?.participant) return;

    const { participant, source: srcType, roomId: srcRoomId } = activeData;
    const { type: destType, roomId: destRoomId } = overData;

    if (destType === "unassigned") {
      if (srcType === "room" && srcRoomId) {
        setRoomAssignments((prev) => ({
          ...prev,
          [srcRoomId]: prev[srcRoomId].filter((p) => p.id !== participant.id),
        }));
      }
      return;
    }

    if (destType === "room" && destRoomId) {

      const targetRoomParticipants = roomAssignments[destRoomId] || [];
      const currentOccupants = targetRoomParticipants.filter(p => p.id !== participant.id); // Exclude self if moving within same room (edge case)

      if (currentOccupants.length >= 3) {
        toast.error("Kamar sudah penuh (maks 3 orang)");
        return;
      }
      if (currentOccupants.length > 0 && currentOccupants[0].gender !== participant.gender) {
        toast.error("Gender harus sama dalam satu kamar");
        return;
      }

      setRoomAssignments(prev => {
        const next = { ...prev };

        if (srcType === "room" && srcRoomId) {
          next[srcRoomId] = next[srcRoomId].filter(p => p.id !== participant.id);
        }

        if (!next[destRoomId]?.some(p => p.id === participant.id)) {
          next[destRoomId] = [...(next[destRoomId] || []), participant];
        }
        return next;
      });
    }
  };

  const onSubmit = async (data: BookingFormData) => {
    if (selectedRooms.length === 0) {
      toast.error("Please select at least one room");
      return;
    }

    const startISO = dateUtils.isoDate(data.bookingStart)!;
    const endISO = dateUtils.isoDate(data.bookingEnd) || startISO;

    try {

      const hasConflict = await (async () => {
        try {
          const existing = await bookingRepo.listBookingsOverlapping(startISO, endISO);
          return existing.some(b =>
            b.roomIds.some(r => selectedRooms.includes(r)) &&
            dateUtils.bookingOverlaps(startISO, endISO, data.startTime, data.endTime, b)
          );
        } catch { return false; }
      })();

      if (hasConflict) {
        toast.error("Conflict detected. Please refresh or update selection.");
        return;
      }

      const assignmentMap = Object.entries(roomAssignments).reduce((acc, [rid, parts]) => {
        acc[rid] = parts.map(p => p.id);
        return acc;
      }, {} as Record<string, string[]>);

      const payload = {
        roomIds: selectedRooms,
        payload: {
          bookingStart: startISO,
          bookingEnd: endISO,
          startTime: data.startTime,
          endTime: data.endTime,
          name: data.name,
          institutionName: data.institutionName,
          phoneNumber: data.phoneNumber,
          purpose: data.purpose,
          institutionType: data.institutionType,
          participants: participants.map(p => ({
            id: p.id, name: p.name, gender: p.gender, unitKerja: p.unitKerja, instansi: p.instansi
          })),
          roomAssignments: assignmentMap
        }
      } as Omit<Booking, "id" | "createdAt" | "status">;

      const id = await bookingRepo.createBooking(payload);
      toast.success(`Booking Berhasil! Ref: ${id}`);
      router.push("/dorm");

    } catch (e) {
      const message = e instanceof Error ? e.message : "Booking failed";
      toast.error(message);
    }
  };

  const selectedRoomsDetails = useMemo(() =>
    selectedRooms.map(id => rooms.find(r => r.id === id)).filter(Boolean) as Room[],
    [selectedRooms, rooms]
  );

  return (
    <div className="container mx-auto py-6 px-4 md:px-8 max-w-7xl">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Booking Asrama
          </h1>
          <p className="text-slate-500 mt-1">Ajukan jadwal peminjaman asrama</p>
        </div>
      </div>

      <div className="grid gap-8">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

          <Card className="border border-dashed border-slate-300 shadow-none bg-white rounded-xl overflow-hidden">
            <CardHeader className="bg-white border-b border-dashed border-slate-300 pb-6 pt-3 px-6 items-center">
              <CardTitle className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-black" strokeWidth={1.5} />
                Informasi Peminjam
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field>
                  <FieldLabel>
                    Nama Peminjam <span className="text-red-500">*</span>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      {...form.register("name")}
                      placeholder="Nama lengkap peminjam"
                      className="bg-slate-50 border-dashed border-slate-300 focus:border-solid focus:border-black focus:ring-0 rounded-lg h-11"
                    />
                    <FieldError errors={[form.formState.errors.name]} />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel>
                    Nomor Telepon / WA <span className="text-red-500">*</span>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      {...form.register("phoneNumber")}
                      placeholder="Nomor Telepon/WA Peminjam"
                      type="tel"
                      className="bg-slate-50 border-dashed border-slate-300 focus:border-solid focus:border-black focus:ring-0 rounded-lg h-11"
                    />
                    <FieldError errors={[form.formState.errors.phoneNumber]} />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel>
                    Tipe Instansi <span className="text-red-500">*</span>
                  </FieldLabel>
                  <FieldContent>
                    <Controller
                      control={form.control}
                      name="institutionType"
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="bg-slate-50 border-dashed border-slate-300 focus:border-solid focus:border-black focus:ring-0 rounded-lg h-11">
                            <SelectValue placeholder="Pilih tipe" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-dashed border-slate-300 shadow-none">
                            <SelectItem value="Kemensetneg">
                              Kemensetneg
                            </SelectItem>
                            <SelectItem value="Non-Kemensetneg">
                              Non-Kemensetneg
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel>
                    Nama Instansi / Unit Kerja{" "}
                    <span className="text-red-500">*</span>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      {...form.register("institutionName")}
                      placeholder="Contoh: Biro SDM"
                      className="bg-slate-50 border-dashed border-slate-300 focus:border-solid focus:border-black focus:ring-0 rounded-lg h-11"
                    />
                    <FieldError
                      errors={[form.formState.errors.institutionName]}
                    />
                  </FieldContent>
                </Field>

                <div className="md:col-span-2">
                  <Field>
                    <FieldLabel>
                      Nama Kegiatan <span className="text-red-500">*</span>
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        {...form.register("purpose")}
                        placeholder="Nama acara atau kegiatan"
                        className="bg-slate-50 border-dashed border-slate-300 focus:border-solid focus:border-black focus:ring-0 rounded-lg h-11"
                      />
                      <FieldError errors={[form.formState.errors.purpose]} />
                    </FieldContent>
                  </Field>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-dashed border-slate-300 shadow-none bg-white rounded-xl overflow-hidden h-fit">
            <CardHeader className="bg-white border-b border-dashed border-slate-300 pb-6 pt-3 px-6 items-center">
              <CardTitle className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                <CalendarClock className="w-6 h-6 text-black" strokeWidth={1.5} />
                Waktu Peminjaman
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
                      control={form.control}
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
                              onClick={() => setOpenStart(true)}
                            >
                              {field.value ? (
                                format(field.value, "dd MMMM yyyy")
                              ) : (
                                <span>Pilih tanggal</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto p-0"
                            align="start"
                          >
                            <ShadcnCalendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={(d) => {
                                field.onChange(d);
                                setOpenStart(false);
                              }}
                              fromDate={new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      )}
                    />
                    <FieldError errors={[form.formState.errors.bookingStart]} />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel>Tanggal Selesai (Opsional)</FieldLabel>
                  <FieldContent>
                    <Controller
                      control={form.control}
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
                              onClick={() => setOpenEnd(true)}
                            >
                              {field.value ? (
                                format(field.value, "dd MMMM yyyy")
                              ) : (
                                <span>Pilih tanggal</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto p-0"
                            align="start"
                          >
                            <ShadcnCalendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={(d) => {
                                field.onChange(d);
                                setOpenEnd(false);
                              }}
                              fromDate={bookingStart || new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      )}
                    />
                    <FieldError errors={[form.formState.errors.bookingEnd]} />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel>
                    Jam Mulai <span className="text-red-500">*</span>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      type="time"
                      {...form.register("startTime")}
                      className="bg-slate-50 border-dashed border-slate-300 focus:border-solid focus:border-black focus:ring-0 rounded-lg h-11"
                    />
                    <FieldError errors={[form.formState.errors.startTime]} />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel>
                    Jam Selesai <span className="text-red-500">*</span>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      type="time"
                      {...form.register("endTime")}
                      className="bg-slate-50 border-dashed border-slate-300 focus:border-solid focus:border-black focus:ring-0 rounded-lg h-11"
                    />
                    <FieldError errors={[form.formState.errors.endTime]} />
                  </FieldContent>
                </Field>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Room Selection */}
          <Card className="border border-dashed border-slate-300 shadow-none bg-white rounded-xl overflow-hidden h-fit">
            <CardHeader className="bg-white border-b border-dashed border-slate-300 pb-6 pt-3 px-6 items-center">
              <CardTitle className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                <Building2 className="w-6 h-6 text-black" strokeWidth={1.5} />
                Pilih Kamar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <RoomSelector
                rooms={rooms}
                selectedRooms={selectedRooms}
                bookedRoomIds={bookedRoomIds}
                roomAssignments={roomAssignments}
                onToggle={handleToggleRoom}
                loading={isLoadingRooms}
              />
            </CardContent>
          </Card>

          {selectedRooms.length > 0 && (
            <Card className="border border-dashed border-slate-300 shadow-none bg-white rounded-xl overflow-hidden h-fit">
              <CardHeader className="bg-white border-b border-dashed border-slate-300 pb-6 pt-3 px-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <CardTitle className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                    <Users className="w-6 h-6 text-black" strokeWidth={1.5} />
                    Daftar Peserta
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={excelUtils.downloadTemplate}
                      className="h-9 rounded-xl border-dashed border-slate-300 text-xs font-medium shadow-none hover:bg-slate-50"
                    >
                      <Download className="h-3.5 w-3.5 mr-2" /> Template
                    </Button>
                    <div className="relative">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-9 rounded-xl border-dashed border-slate-300 text-xs font-medium shadow-none hover:bg-slate-50"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Upload Excel
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx, .xls"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6 bg-slate-50/30">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">

                    <div className="lg:sticky lg:top-4 h-full">
                      <UnassignedList
                        participants={participants}
                        roomAssignments={roomAssignments}
                        onAddParticipant={handleManualAdd}
                        onRemoveParticipant={handleRemoveParticipant}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <h5 className="font-bold text-sm text-slate-900">Alokasi Kamar ({selectedRooms.length} Kamar)</h5>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {selectedRoomsDetails.map((room) => (
                          <DroppableRoom
                            key={room.id}
                            room={room}
                            assigned={roomAssignments[room.id] || []}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </DndContext>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end pt-6 pb-20">
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full sm:w-auto px-10 bg-black hover:bg-zinc-800 text-white shadow-none hover:opacity-90 transition-all rounded-full font-bold h-12 text-base"
            >
              {form.formState.isSubmitting ? "Memproses..." : "Konfirmasi Booking"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
