"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import * as XLSX from "xlsx";
import {
  ArrowLeft,
  Users,
  Building,
  Building2,
  Check,
  CheckCircle,
  CheckCircle2,
  CalendarClock,
  User,
  NotebookPen,
  Download,
  Plus,
  Trash2,
  Bed,
  Printer,
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Copy,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Field,
  FieldLabel,
  FieldContent,
} from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  chisfisRoomService,
  detectAssetType,
} from "../services/chisfis-room-service";
import { TiketBookingVoucher } from "./tiket-booking-voucher";
import {
  UNIT_KERJA_OPTIONS,
  type UnitKerjaOption,
  type ChisfisRoom,
  type InstitutionType,
  type RoomSetup,
  type AssetType,
  type Participant,
} from "../types";

interface AirbnbRoomDetailViewProps {
  roomId: string;
}

interface SuccessBookingDetails {
  id: string;
  assetType: AssetType;
  roomName: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  name: string;
  phoneNumber?: string;
  institutionName: string;
  institutionType?: string;
  purpose: string;
  attendees?: number;
  roomSetup?: RoomSetup;
  participants?: Participant[];
  notes?: string;
}

// ---------------- Excel Helpers for Asrama ----------------
const sanitizeExcelCell = (val: unknown): string => {
  let str = String(val || "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim();
  if (/^[=+\-@\t\r]/.test(str)) {
    str = str.replace(/^[=+\-@\t\r]+/, "");
  }
  return str;
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
              "Format kolom tidak sesuai. Pastikan kolom memuat: id, nama, gender, unit_kerja, instansi"
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

// ---------------- Manual Participant Dialog for Asrama ----------------
function AddParticipantDialog({ onAdd }: { onAdd: (p: Participant) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"L" | "P">("L");
  const [unitKerja, setUnitKerja] = useState("");
  const [instansi, setInstansi] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Nama wajib diisi");
      return;
    }
    if (!unitKerja.trim()) {
      toast.error("Unit kerja wajib diisi");
      return;
    }
    if (!instansi.trim()) {
      toast.error("Instansi wajib diisi");
      return;
    }
    onAdd({
      id: crypto.randomUUID(),
      name: name.trim(),
      gender,
      unitKerja: unitKerja.trim(),
      instansi: instansi.trim(),
    });
    setName("");
    setUnitKerja("");
    setInstansi("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-9 rounded-xl border-dashed border-slate-300 dark:border-neutral-700 text-xs font-medium shadow-none hover:bg-slate-50 dark:hover:bg-neutral-800 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5 mr-1" /> Tambah Manual
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white dark:bg-neutral-900 border border-dashed border-slate-300 dark:border-neutral-700">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-slate-900 dark:text-neutral-100">
            Tambah Peserta Menginap
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-neutral-400">
            Masukkan informasi peserta yang akan menempati kamar asrama.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300">
              Nama Lengkap <span className="text-red-500">*</span>
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama lengkap peserta"
              className="bg-slate-50 border-dashed border-slate-300 dark:bg-neutral-800/60 dark:border-neutral-700 dark:text-neutral-100 text-xs h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300">
              Jenis Kelamin (Gender) <span className="text-red-500">*</span>
            </Label>
            <Select value={gender} onValueChange={(v) => setGender(v as "L" | "P")}>
              <SelectTrigger className="bg-slate-50 border-dashed border-slate-300 dark:bg-neutral-800/60 dark:border-neutral-700 dark:text-neutral-100 text-xs h-10">
                <SelectValue placeholder="Pilih jenis kelamin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">Laki-laki (L)</SelectItem>
                <SelectItem value="P">Perempuan (P)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300">
              Unit Kerja <span className="text-red-500">*</span>
            </Label>
            <Input
              value={unitKerja}
              onChange={(e) => setUnitKerja(e.target.value)}
              placeholder="Contoh: Biro SDM / PPKASN"
              className="bg-slate-50 border-dashed border-slate-300 dark:bg-neutral-800/60 dark:border-neutral-700 dark:text-neutral-100 text-xs h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300">
              Instansi <span className="text-red-500">*</span>
            </Label>
            <Input
              value={instansi}
              onChange={(e) => setInstansi(e.target.value)}
              placeholder="Contoh: Kemensetneg"
              className="bg-slate-50 border-dashed border-slate-300 dark:bg-neutral-800/60 dark:border-neutral-700 dark:text-neutral-100 text-xs h-10"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={handleSubmit}
            className="rounded-full bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black font-bold text-xs h-10 px-6 cursor-pointer"
          >
            Simpan Peserta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =========================================================================
// MAIN COMPONENT: AirbnbRoomDetailView
// =========================================================================
export const AirbnbRoomDetailView: React.FC<AirbnbRoomDetailViewProps> = ({
  roomId,
}) => {
  const router = useRouter();
  const [room, setRoom] = useState<ChisfisRoom | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successBooking, setSuccessBooking] = useState<SuccessBookingDetails | null>(null);
  const [showVoucherModal, setShowVoucherModal] = useState<boolean>(false);

  // Shared Date/Time States
  const [bookingStart, setBookingStart] = useState<Date | null>(new Date());
  const [bookingEnd, setBookingEnd] = useState<Date | null>(new Date());
  const [openStart, setOpenStart] = useState<boolean>(false);
  const [openEnd, setOpenEnd] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<string>("08:00");
  const [endTime, setEndTime] = useState<string>("16:00");

  // Form 1 & 2 & 3 Shared / Specific Field States
  const [name, setName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [purpose, setPurpose] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Ruang Rapat specifics:
  const [unitKerja, setUnitKerja] = useState<string>(UNIT_KERJA_OPTIONS[0]);

  // Ruangan specifics:
  const [attendees, setAttendees] = useState<number>(10);
  const [roomSetup, setRoomSetup] = useState<RoomSetup>("Island");
  const [roomInstitutionName, setRoomInstitutionName] = useState<string>("");
  const [institutionType, setInstitutionType] = useState<InstitutionType>("Kemensetneg");

  // Asrama specifics:
  const [dormInstansiUnit, setDormInstansiUnit] = useState<string>("");
  const [dormInstitutionType, setDormInstitutionType] = useState<InstitutionType>("Kemensetneg");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let mounted = true;
    async function loadRoom() {
      setIsLoading(true);
      try {
        const rooms = await chisfisRoomService.getChisfisRooms();
        const found = rooms.find((r) => r.id === roomId);
        if (mounted) {
          if (found) {
            setRoom(found);
            setAttendees(found.capacity || 10);
            if (found.assetType === "asrama") {
              setStartTime("14:00");
              setEndTime("12:00");
            } else if (found.assetType === "ruangan") {
              setStartTime("08:00");
              setEndTime("20:00");
            } else {
              setStartTime("08:00");
              setEndTime("16:00");
            }
          } else {
            const fallbacks = chisfisRoomService.getFallbackRooms();
            const fallbackFound = fallbacks.find((r) => r.id === roomId) || fallbacks[0];
            setRoom(fallbackFound);
            setAttendees(fallbackFound.capacity || 10);
          }
        }
      } catch {
        if (mounted) {
          const fallbacks = chisfisRoomService.getFallbackRooms();
          const fallbackFound = fallbacks.find((r) => r.id === roomId) || fallbacks[0];
          setRoom(fallbackFound);
          setAttendees(fallbackFound.capacity || 10);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadRoom();
    return () => {
      mounted = false;
    };
  }, [roomId]);

  // Determine actual asset type (ruang_rapat | ruangan | asrama)
  const assetType: AssetType = room?.assetType || (room ? detectAssetType(room) : "ruangan");

  // Handle Asrama Excel Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await excelUtils.parseParticipants(file);
      setParticipants((prev) => [...prev, ...parsed]);
      toast.success(`${parsed.length} data peserta berhasil diimpor dari Excel!`);
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Gagal memproses file Excel");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Handle Remove Participant in Asrama
  const handleRemoveParticipant = (id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
    toast.success("Peserta dihapus");
  };

  // =========================================================================
  // SUBMISSION LOGIC ACCORDING TO FORM TYPE
  // =========================================================================
  const handleSubmitRuangRapat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room) return;
    const errors: Record<string, string> = {};

    if (!bookingStart) errors.bookingStart = "Tanggal mulai wajib diisi";
    if (!startTime) errors.startTime = "Jam mulai wajib diisi";
    if (!endTime) errors.endTime = "Jam selesai wajib diisi";
    if (startTime && endTime && startTime >= endTime) {
      errors.endTime = "Jam selesai harus setelah jam mulai";
    }
    if (!name.trim()) errors.name = "Nama peminjam wajib diisi";
    if (!unitKerja.trim()) {
      errors.unitKerja = "Unit kerja wajib dipilih";
    } else if (!UNIT_KERJA_OPTIONS.includes(unitKerja as UnitKerjaOption)) {
      errors.unitKerja = "Hanya 4 unit kerja yang dapat meminjam ruang rapat (PUSBINTER, PUSBIN AKS, PPKASN, Assessment Center)";
    }
    if (!purpose.trim()) errors.purpose = "Nama kegiatan wajib diisi";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Mohon lengkapi seluruh isian bertanda bintang (*)");
      return;
    }

    try {
      setIsSubmitting(true);
      const startISO = format(bookingStart!, "yyyy-MM-dd");
      const endISO = bookingEnd ? format(bookingEnd, "yyyy-MM-dd") : startISO;

      const res = await chisfisRoomService.submitBooking({
        roomId: room.id,
        roomName: room.name,
        bookingDate: startISO,
        bookingEndDate: endISO,
        startTime,
        endTime,
        name: name.trim(),
        institutionName: unitKerja,
        purpose: purpose.trim(),
        notes: notes.trim(),
        participantsCount: room.capacity || 10,
        roomSetup: "Island",
      });

      setSuccessBooking({
        id: res.bookingId,
        assetType: "ruang_rapat",
        roomName: room.name,
        startDate: startISO,
        endDate: endISO,
        startTime,
        endTime,
        name: name.trim(),
        institutionName: unitKerja,
        purpose: purpose.trim(),
        attendees: room.capacity,
        notes: notes.trim(),
      });

      toast.success("Booking Ruang Rapat Berhasil Disimpan!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal membuat booking";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitRuangan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room) return;
    const errors: Record<string, string> = {};

    if (!bookingStart) errors.bookingStart = "Tanggal mulai wajib diisi";
    if (!startTime) errors.startTime = "Jam mulai wajib diisi";
    if (!endTime) errors.endTime = "Jam selesai wajib diisi";
    if (startTime && endTime && startTime >= endTime) {
      errors.endTime = "Jam selesai harus setelah jam mulai";
    }
    if (!purpose.trim()) errors.purpose = "Nama kegiatan wajib diisi";
    if (!attendees || attendees < 1) errors.attendees = "Jumlah peserta minimal 1";
    if (!name.trim()) errors.name = "Nama peminjam wajib diisi";
    if (!phoneNumber.trim()) errors.phoneNumber = "Nomor Telepon/WA wajib diisi";
    else if (!/^[0-9+\-() ]{8,20}$/.test(phoneNumber.trim())) {
      errors.phoneNumber = "Format nomor telepon tidak valid";
    }
    if (!roomInstitutionName.trim()) errors.roomInstitutionName = "Nama instansi wajib diisi";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Mohon lengkapi seluruh isian bertanda bintang (*)");
      return;
    }

    try {
      setIsSubmitting(true);
      const startISO = format(bookingStart!, "yyyy-MM-dd");
      const endISO = bookingEnd ? format(bookingEnd, "yyyy-MM-dd") : startISO;

      const res = await chisfisRoomService.submitBooking({
        roomId: room.id,
        roomName: room.name,
        bookingDate: startISO,
        bookingEndDate: endISO,
        startTime,
        endTime,
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
        institutionName: roomInstitutionName.trim(),
        institutionType,
        roomSetup,
        purpose: purpose.trim(),
        notes: notes.trim(),
        participantsCount: Number(attendees) || 1,
      });

      setSuccessBooking({
        id: res.bookingId,
        assetType: "ruangan",
        roomName: room.name,
        startDate: startISO,
        endDate: endISO,
        startTime,
        endTime,
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
        institutionName: roomInstitutionName.trim(),
        institutionType,
        purpose: purpose.trim(),
        attendees: Number(attendees) || 1,
        roomSetup,
        notes: notes.trim(),
      });

      toast.success("Booking Ruangan Berhasil Disimpan!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal membuat booking";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAsrama = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room) return;
    const errors: Record<string, string> = {};

    if (!name.trim()) errors.name = "Nama peminjam wajib diisi";
    if (!phoneNumber.trim()) errors.phoneNumber = "Nomor Telepon/WA wajib diisi";
    else if (!/^[0-9+\-() ]{8,20}$/.test(phoneNumber.trim())) {
      errors.phoneNumber = "Format nomor telepon tidak valid";
    }
    if (!dormInstansiUnit.trim()) errors.dormInstansiUnit = "Nama instansi / unit kerja wajib diisi";
    if (!purpose.trim()) errors.purpose = "Nama kegiatan wajib diisi";
    if (!bookingStart) errors.bookingStart = "Tanggal mulai wajib diisi";
    if (!startTime) errors.startTime = "Jam mulai wajib diisi";
    if (!endTime) errors.endTime = "Jam selesai wajib diisi";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Mohon lengkapi seluruh isian bertanda bintang (*)");
      return;
    }

    try {
      setIsSubmitting(true);
      const startISO = format(bookingStart!, "yyyy-MM-dd");
      const endISO = bookingEnd ? format(bookingEnd, "yyyy-MM-dd") : startISO;

      const assignmentMap = {
        [room.id]: participants.map((p) => p.id),
      };

      const res = await chisfisRoomService.submitBooking({
        roomId: room.id,
        roomName: room.name,
        bookingDate: startISO,
        bookingEndDate: endISO,
        startTime,
        endTime,
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
        institutionName: dormInstansiUnit.trim(),
        institutionType: dormInstitutionType,
        purpose: purpose.trim(),
        notes: notes.trim(),
        participantsCount: participants.length > 0 ? participants.length : room.capacity,
        participants,
        roomAssignments: assignmentMap,
      });

      setSuccessBooking({
        id: res.bookingId,
        assetType: "asrama",
        roomName: room.name,
        startDate: startISO,
        endDate: endISO,
        startTime,
        endTime,
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
        institutionName: dormInstansiUnit.trim(),
        institutionType: dormInstitutionType,
        purpose: purpose.trim(),
        attendees: participants.length > 0 ? participants.length : room.capacity,
        participants,
        notes: notes.trim(),
      });

      toast.success("Booking Asrama Berhasil Disimpan!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal membuat booking";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#121212] flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-neutral-500 animate-pulse">
          <div className="h-5 w-5 rounded-full border-2 border-black dark:border-white border-t-transparent animate-spin" />
          <span>Memuat detail fasilitas &amp; formulir...</span>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#121212] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          Fasilitas Tidak Ditemukan
        </h2>
        <p className="text-sm text-neutral-500 mt-2">
          Fasilitas yang Anda cari mungkin telah dinonaktifkan atau ID tidak valid.
        </p>
        <Link
          href="/booking"
          className="mt-6 rounded-xl bg-neutral-900 text-white px-6 py-2.5 text-xs font-semibold dark:bg-white dark:text-neutral-900"
        >
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  const images = room.images && room.images.length > 0 ? room.images : ["/empty-rooms.jpg"];

  return (
    <div className="min-h-screen bg-white text-[#222222] dark:bg-[#121212] dark:text-[#F7F7F7]">
      {/* 1. Header Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-[#ebebeb] bg-white transition-all dark:border-neutral-800 dark:bg-[#121212]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <Link
                href="/booking"
                className="flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors dark:text-neutral-400 dark:hover:text-neutral-200"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Semua Fasilitas</span>
              </Link>

              <div className="h-5 w-[1px] bg-neutral-200 dark:bg-neutral-800" />

              <Link href="/booking" className="flex items-center gap-2.5 focus:outline-none group select-none">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#FF385C] to-rose-500 text-white shadow-xs shadow-rose-500/20 transition-transform group-hover:scale-105">
                  <Building2 className="h-4.5 w-4.5 stroke-[2.3]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold tracking-tight text-[#FF385C] leading-none uppercase">
                    SARPRAS
                  </span>
                  <span className="text-[8px] uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-bold mt-0.5">
                    PPKASN
                  </span>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-2" />
          </div>
        </div>
      </header>

      {/* 2. Main Content Container */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Title Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            {room.name}
          </h1>
        </div>

        {/* 3. Photo Gallery (Airbnb 3-Photo Grid) */}
        <div className="overflow-hidden rounded-2xl mb-8">
          {images.length >= 2 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3">
              <div className="relative aspect-[16/10] md:col-span-2 md:aspect-auto md:h-[380px] overflow-hidden bg-neutral-100 dark:bg-neutral-800 rounded-xl sm:rounded-2xl group">
                <Image
                  src="/empty-rooms.jpg"
                  alt={room.name}
                  fill
                  priority
                  className="object-cover group-hover:scale-102 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span className="rounded-full bg-white/95 backdrop-blur-xs px-3 py-1 text-[11px] font-bold text-neutral-900 shadow-sm tracking-tight dark:bg-neutral-900/90 dark:text-neutral-100">
                    Lantai {room.floor}
                  </span>
                </div>
              </div>

              <div className="hidden md:flex flex-col gap-2 sm:gap-3 h-[380px]">
                <div className="relative flex-1 overflow-hidden bg-neutral-100 dark:bg-neutral-800 rounded-xl sm:rounded-2xl group">
                  <Image
                    src="/empty-rooms.jpg"
                    alt={`${room.name} view 2`}
                    fill
                    className="object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                </div>
                <div className="relative flex-1 overflow-hidden bg-neutral-100 dark:bg-neutral-800 rounded-xl sm:rounded-2xl group">
                  <Image
                    src="/empty-rooms.jpg"
                    alt={`${room.name} view 3`}
                    fill
                    className="object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="relative aspect-[21/9] min-h-[280px] md:h-[380px] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800 rounded-2xl">
              <Image
                src="/empty-rooms.jpg"
                alt={room.name}
                fill
                priority
                className="object-cover hover:scale-101 transition-transform duration-300"
              />
              <div className="absolute top-4 left-4">
                <span className="rounded-full bg-white/95 backdrop-blur-xs px-3 py-1 text-[11px] font-bold text-neutral-900 shadow-sm tracking-tight dark:bg-neutral-900/90 dark:text-neutral-100">
                  Lantai {room.floor}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 4. Overview Highlights Banner */}
        <div className="mb-10 rounded-2xl border border-dashed border-slate-300 dark:border-neutral-700 bg-slate-50/50 dark:bg-neutral-900/40 p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-neutral-800 text-slate-800 dark:text-neutral-200">
                {assetType === "asrama" ? <Bed className="h-5 w-5" /> : <Users className="h-5 w-5" />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-neutral-100">
                  {assetType === "asrama"
                    ? `Kapasitas ${room.capacity} Bed / Kamar`
                    : `Kapasitas ${room.capacity} Peserta`}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-neutral-800 text-slate-800 dark:text-neutral-200">
                <Building className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-neutral-100">
                  Gedung PPKASN, Lantai {room.floor}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* 5. SUCCESS CONFIRMATION STATE - HORIZONTAL TICKET DESIGN */}
        {successBooking ? (
          <div className="w-full mx-auto py-4 sm:py-6 space-y-6 animate-in fade-in zoom-in-95 duration-500">
            {/* Global Print Style for clean ticket printing */}
            <style dangerouslySetInnerHTML={{ __html: `
              @media print {
                @page {
                  size: A4 portrait;
                  margin: 8mm 10mm;
                }
                *, *::before, *::after {
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                header, footer, nav, aside, .print\\:hidden {
                  display: none !important;
                }
                body {
                  background: white !important;
                  color: black !important;
                  padding: 0 !important;
                  margin: 0 !important;
                }
                #website-booking-ticket {
                  display: none !important;
                }
                #printable-tiketcom-voucher {
                  display: block !important;
                  width: 100% !important;
                  max-width: 100% !important;
                  margin: 0 auto !important;
                  padding: 0 !important;
                  box-shadow: none !important;
                  border: none !important;
                }
              }
            `}} />

            {/* Top Bar: Title on the left, action buttons on the right (NO green checklist icon) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
              <div className="space-y-1 text-left">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
                  Booking Berhasil Disimpan!
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                  Jadwal peminjaman fasilitas telah terdaftar resmi di sistem SARPRAS PPKASN.
                </p>
              </div>

              {/* Action Buttons on top right */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowVoucherModal(true)}
                  className="rounded-full border-neutral-300 dark:border-neutral-700 h-10 px-4 font-semibold text-xs gap-1.5 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <Eye className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                  Pratinjau Voucher
                </Button>
                <Button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-full bg-neutral-900 text-white hover:bg-black dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 h-10 px-5 font-semibold text-xs gap-2 cursor-pointer shadow-none"
                >
                  <Printer className="h-4 w-4" />
                  Cetak Tiket
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSuccessBooking(null)}
                  className="rounded-full border-neutral-300 dark:border-neutral-700 h-10 px-5 font-semibold text-xs cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Pesan Sesi Tambahan
                </Button>
              </div>
            </div>

            {/* THE WIDE HORIZONTAL TICKET (Full kesamping - on website screen with concise info) */}
            <div
              id="website-booking-ticket"
              className="print:hidden relative w-full text-left bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/90 dark:border-neutral-800 shadow-none transition-all flex flex-col lg:flex-row"
            >
              {/* Desktop Inward Semicircle Perforation Cutouts */}
              <svg
                className="hidden lg:block absolute -top-[1px] right-80 translate-x-1/2 z-20 overflow-visible pointer-events-none"
                width="32"
                height="16"
                viewBox="0 0 32 16"
                fill="none"
              >
                <path
                  d="M 0 0 C 0 8.837 7.163 16 16 16 C 24.837 16 32 8.837 32 0 Z"
                  className="fill-white dark:fill-[#121212]"
                />
                <path
                  d="M 0 0 C 0 8.837 7.163 16 16 16 C 24.837 16 32 8.837 32 0"
                  className="stroke-neutral-200/90 dark:stroke-neutral-800"
                  strokeWidth="1"
                />
                <rect
                  x="-0.5"
                  y="-1"
                  width="33"
                  height="1.5"
                  className="fill-white dark:fill-[#121212]"
                />
              </svg>

              <svg
                className="hidden lg:block absolute -bottom-[1px] right-80 translate-x-1/2 z-20 overflow-visible pointer-events-none"
                width="32"
                height="16"
                viewBox="0 0 32 16"
                fill="none"
              >
                <path
                  d="M 0 16 C 0 7.163 7.163 0 16 0 C 24.837 0 32 7.163 32 16 Z"
                  className="fill-white dark:fill-[#121212]"
                />
                <path
                  d="M 0 16 C 0 7.163 7.163 0 16 0 C 24.837 0 32 7.163 32 16"
                  className="stroke-neutral-200/90 dark:stroke-neutral-800"
                  strokeWidth="1"
                />
                <rect
                  x="-0.5"
                  y="15.5"
                  width="33"
                  height="1.5"
                  className="fill-white dark:fill-[#121212]"
                />
              </svg>

              {/* Desktop Vertical Perforation Dashed Line */}
              <div className="hidden lg:block absolute top-4 bottom-4 right-80 -mr-[1px] w-0 border-r-2 border-dashed border-neutral-300 dark:border-neutral-600 pointer-events-none z-10" />

              {/* LEFT / MAIN PASS SECTION */}
              <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                {/* Brand & Status Banner Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FF385C] text-white shadow-none">
                      <Building2 className="h-4.5 w-4.5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-extrabold tracking-wider text-sm text-neutral-900 dark:text-white uppercase leading-none">
                        SARPRAS
                      </span>
                      <span className="text-[9px] tracking-widest text-neutral-400 dark:text-neutral-500 font-bold uppercase mt-0.5">
                        PPKASN KEMENSETNEG
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400">
                      E-TIKET RESERVASI
                    </Badge>
                  </div>
                </div>

                {/* Facility Spotlight */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-neutral-400 dark:text-neutral-500">
                    <Ticket className="h-3 w-3 text-[#FF385C]" />
                    <span>Fasilitas / Ruangan</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
                    {successBooking.roomName}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 pt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-[#FF385C] shrink-0" />
                    <span>Gedung PPKASN Kemensetneg</span>
                  </p>
                </div>

                {/* Horizontal Specifications Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
                  {/* Tanggal */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                      <Calendar className="h-3.5 w-3.5 text-[#FF385C]" />
                      <span>Tanggal Penggunaan</span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      {format(new Date(successBooking.startDate), "EEEE, dd MMM yyyy", { locale: localeId })}
                    </p>
                    {successBooking.endDate !== successBooking.startDate && (
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        s.d. {format(new Date(successBooking.endDate), "dd MMM yyyy", { locale: localeId })}
                      </p>
                    )}
                  </div>

                  {/* Waktu */}
                  <div className="space-y-1 sm:border-l sm:border-neutral-200 dark:sm:border-neutral-700/80 sm:pl-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                      <Clock className="h-3.5 w-3.5 text-[#FF385C]" />
                      <span>Waktu Pelaksanaan</span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      {successBooking.startTime} - {successBooking.endTime} WIB
                    </p>
                    <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                      Waktu Indonesia Barat
                    </p>
                  </div>

                  {/* Penanggung Jawab */}
                  <div className="space-y-1 xl:border-l xl:border-neutral-200 dark:xl:border-neutral-700/80 xl:pl-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                      <User className="h-3.5 w-3.5 text-[#FF385C]" />
                      <span>Penanggung Jawab</span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
                      {successBooking.name}
                    </p>
                    {successBooking.phoneNumber && (
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                        {successBooking.phoneNumber}
                      </p>
                    )}
                  </div>

                  {/* Unit Kerja */}
                  <div className="space-y-1 sm:border-l sm:border-neutral-200 dark:sm:border-neutral-700/80 sm:pl-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                      <Building className="h-3.5 w-3.5 text-[#FF385C]" />
                      <span>Unit Kerja</span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100 line-clamp-2">
                      {successBooking.institutionName}
                    </p>
                  </div>
                </div>

                {/* Bottom Row: Kegiatan & Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                      Nama Kegiatan
                    </span>
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                      {successBooking.purpose}
                    </p>
                  </div>

                  {successBooking.assetType === "ruangan" && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                        Kapasitas &amp; Tata Ruang
                      </span>
                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        {successBooking.attendees && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium text-xs">
                            <Users className="h-3.5 w-3.5" />
                            {successBooking.attendees} Orang
                          </span>
                        )}
                        {successBooking.roomSetup && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium text-xs">
                            Layout {successBooking.roomSetup}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Participants Manifest (Asrama) */}
                {successBooking.assetType === "asrama" && successBooking.participants && successBooking.participants.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-dashed border-neutral-200 dark:border-neutral-800 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                      Daftar Tamu Menginap ({successBooking.participants.length} Orang)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                      {successBooking.participants.map((p, idx) => (
                        <div
                          key={p.id || idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                              {idx + 1}. {p.name}
                            </span>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] px-1.5 py-0 h-4 border-dashed",
                                p.gender === "P" ? "border-rose-300 text-rose-600" : "border-blue-300 text-blue-600"
                              )}
                            >
                              {p.gender === "P" ? "P" : "L"}
                            </Badge>
                          </div>
                          <span className="text-neutral-500 dark:text-neutral-400 text-[11px] truncate">
                            {p.unitKerja}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Perforation Divider */}
              <div className="lg:hidden relative flex items-center py-3 bg-white dark:bg-neutral-900 overflow-visible">
                <svg
                  className="absolute -left-[1px] top-1/2 -translate-y-1/2 z-20 overflow-visible pointer-events-none"
                  width="16"
                  height="32"
                  viewBox="0 0 16 32"
                  fill="none"
                >
                  <path
                    d="M 0 0 C 8.837 0 16 7.163 16 16 C 16 24.837 8.837 32 0 32 Z"
                    className="fill-white dark:fill-[#121212]"
                  />
                  <path
                    d="M 0 0 C 8.837 0 16 7.163 16 16 C 16 24.837 8.837 32 0 32"
                    className="stroke-neutral-200/90 dark:stroke-neutral-800"
                    strokeWidth="1"
                  />
                  <rect
                    x="-1"
                    y="-0.5"
                    width="1.5"
                    height="33"
                    className="fill-white dark:fill-[#121212]"
                  />
                </svg>
                <div className="w-full border-b-2 border-dashed border-neutral-300 dark:border-neutral-600 mx-4" />
                <svg
                  className="absolute -right-[1px] top-1/2 -translate-y-1/2 z-20 overflow-visible pointer-events-none"
                  width="16"
                  height="32"
                  viewBox="0 0 16 32"
                  fill="none"
                >
                  <path
                    d="M 16 0 C 7.163 0 0 7.163 0 16 C 0 24.837 7.163 32 16 32 Z"
                    className="fill-white dark:fill-[#121212]"
                  />
                  <path
                    d="M 16 0 C 7.163 0 0 7.163 0 16 C 0 24.837 7.163 32 16 32"
                    className="stroke-neutral-200/90 dark:stroke-neutral-800"
                    strokeWidth="1"
                  />
                  <rect
                    x="15.5"
                    y="-0.5"
                    width="1.5"
                    height="33"
                    className="fill-white dark:fill-[#121212]"
                  />
                </svg>
              </div>

              {/* RIGHT STUB (VERIFICATION & BARCODE) */}
              <div className="lg:w-80 shrink-0 bg-neutral-50/80 dark:bg-neutral-800/40 p-6 sm:p-7 flex flex-col justify-between rounded-b-3xl lg:rounded-b-none lg:rounded-r-3xl space-y-5">
                {/* Top: Header stub & Booking Reference */}
                <div className="space-y-3 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
                      KODE BOOKING
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono border-neutral-300 dark:border-neutral-700">
                      E-PASS
                    </Badge>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-neutral-900 dark:text-neutral-100 select-all truncate">
                      {successBooking.id}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(successBooking.id);
                        toast.success("Kode booking berhasil disalin!");
                      }}
                      title="Salin Kode Tiket"
                      className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer transition-colors shrink-0"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Middle: Authentic Barcode */}
                <div className="flex flex-col items-center justify-center py-2 space-y-1.5">
                  <div className="flex items-center justify-center gap-[2px] h-12 w-full px-3 py-1 bg-white dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700">
                    {[2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 1, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2].map((w, i) => (
                      <span
                        key={i}
                        className={cn(
                          "h-full bg-neutral-900 dark:bg-neutral-100 inline-block",
                          w === 1 && "w-[1.5px]",
                          w === 2 && "w-[2.5px]",
                          w === 3 && "w-[3.5px]",
                          w === 4 && "w-[4.5px]"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-[9px] font-mono tracking-widest text-neutral-400 dark:text-neutral-500">
                    * {successBooking.id.slice(0, 8).toUpperCase()} *
                  </span>
                </div>

                {/* Bottom Note */}
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 text-left leading-relaxed">
                  Tunjukkan tiket ini kepada petugas SARPRAS saat memasuki ruangan fasilitas.
                </p>
              </div>
            </div>

            {/* 6. PRINTABLE TIKET.COM-STYLE OFFICIAL E-VOUCHER (Rendered on window.print()) */}
            <div id="printable-tiketcom-voucher" className="hidden print:block w-full">
              <TiketBookingVoucher booking={successBooking} room={room} />
            </div>

            {/* 7. PREVIEW MODAL FOR OFFICIAL E-VOUCHER */}
            <Dialog open={showVoucherModal} onOpenChange={setShowVoucherModal}>
              <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
                  <div className="text-left space-y-0.5">
                    <DialogTitle className="text-base font-extrabold text-neutral-900 dark:text-neutral-100">
                      Pratinjau Cetak E-Voucher (Format Tiket.com)
                    </DialogTitle>
                    <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400">
                      Format resmi voucher lengkap untuk dicetak fisik atau disimpan sebagai PDF.
                    </DialogDescription>
                  </div>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowVoucherModal(false);
                      setTimeout(() => window.print(), 250);
                    }}
                    className="rounded-full bg-[#0064D2] hover:bg-[#0050AE] text-white font-semibold text-xs h-9 px-4 gap-2 cursor-pointer shadow-none shrink-0"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Cetak Dokumen Ini
                  </Button>
                </DialogHeader>
                <div className="py-2">
                  <TiketBookingVoucher booking={successBooking} room={room} />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          /* =========================================================================
             FORM 1: RUANG RAPAT (EXACT MATCH WITH /meeting-room/add)
             ========================================================================= */
          assetType === "ruang_rapat" ? (
            <div className="space-y-8">
              <div className="mb-2">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-neutral-100 mb-1">
                  Form Peminjaman
                </h2>
                <p className="text-sm text-slate-500 dark:text-neutral-400">
                  Ajukan permohonan peminjaman ruang rapat
                </p>
              </div>

              <form onSubmit={handleSubmitRuangRapat} className="space-y-8">
                {/* Row 1: Waktu & Informasi Peminjam */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Card 1: Waktu */}
                  <Card className="border border-dashed border-slate-300 dark:border-neutral-700 shadow-none bg-white dark:bg-neutral-900 rounded-xl overflow-hidden h-fit">
                    <CardHeader className="bg-white dark:bg-neutral-900 border-b border-dashed border-slate-300 dark:border-neutral-700 pb-6 pt-3 px-6 items-center">
                      <CardTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-neutral-100 flex items-center gap-3">
                        <CalendarClock className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
                        Waktu
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Field>
                          <FieldLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                            Tanggal Mulai <span className="text-red-500">*</span>
                          </FieldLabel>
                          <FieldContent>
                            <Popover open={openStart} onOpenChange={setOpenStart}>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal bg-slate-50 border-dashed border-slate-300 dark:bg-neutral-800/60 dark:border-neutral-700 hover:bg-slate-100 hover:border-slate-400 focus:border-solid focus:border-black dark:focus:border-white focus:ring-0 rounded-lg h-11 text-xs sm:text-sm",
                                    !bookingStart && "text-muted-foreground"
                                  )}
                                >
                                  {bookingStart ? (
                                    format(bookingStart, "dd MMMM yyyy", { locale: localeId })
                                  ) : (
                                    <span>Pilih tanggal</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <ShadcnCalendar
                                  mode="single"
                                  selected={bookingStart || undefined}
                                  onSelect={(d) => {
                                    setBookingStart(d || null);
                                    setOpenStart(false);
                                    if (d && (!bookingEnd || bookingEnd < d)) setBookingEnd(d);
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            {formErrors.bookingStart && (
                              <p className="text-red-500 text-xs mt-1">{formErrors.bookingStart}</p>
                            )}
                          </FieldContent>
                        </Field>

                        <Field>
                          <FieldLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                            Tanggal Selesai (Opsional)
                          </FieldLabel>
                          <FieldContent>
                            <Popover open={openEnd} onOpenChange={setOpenEnd}>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal bg-slate-50 border-dashed border-slate-300 dark:bg-neutral-800/60 dark:border-neutral-700 hover:bg-slate-100 hover:border-slate-400 focus:border-solid focus:border-black dark:focus:border-white focus:ring-0 rounded-lg h-11 text-xs sm:text-sm",
                                    !bookingEnd && "text-muted-foreground"
                                  )}
                                >
                                  {bookingEnd ? (
                                    format(bookingEnd, "dd MMMM yyyy", { locale: localeId })
                                  ) : (
                                    <span>Pilih tanggal</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <ShadcnCalendar
                                  mode="single"
                                  selected={bookingEnd || undefined}
                                  onSelect={(d) => {
                                    setBookingEnd(d || null);
                                    setOpenEnd(false);
                                  }}
                                  disabled={(d) => !!bookingStart && d < bookingStart}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </FieldContent>
                        </Field>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Field>
                          <FieldLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                            Jam Mulai <span className="text-red-500">*</span>
                          </FieldLabel>
                          <FieldContent>
                            <Input
                              type="time"
                              value={startTime}
                              onChange={(e) => setStartTime(e.target.value)}
                              className="bg-slate-50 border-dashed border-slate-300 dark:bg-neutral-800/60 dark:border-neutral-700 dark:text-neutral-100 focus:border-solid focus:border-black dark:focus:border-white focus:ring-0 rounded-lg h-11 text-xs sm:text-sm"
                            />
                            {formErrors.startTime && (
                              <p className="text-red-500 text-xs mt-1">{formErrors.startTime}</p>
                            )}
                          </FieldContent>
                        </Field>

                        <Field>
                          <FieldLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                            Jam Selesai <span className="text-red-500">*</span>
                          </FieldLabel>
                          <FieldContent>
                            <Input
                              type="time"
                              value={endTime}
                              onChange={(e) => setEndTime(e.target.value)}
                              className="bg-slate-50 border-dashed border-slate-300 dark:bg-neutral-800/60 dark:border-neutral-700 dark:text-neutral-100 focus:border-solid focus:border-black dark:focus:border-white focus:ring-0 rounded-lg h-11 text-xs sm:text-sm"
                            />
                            {formErrors.endTime && (
                              <p className="text-red-500 text-xs mt-1">{formErrors.endTime}</p>
                            )}
                          </FieldContent>
                        </Field>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card 2: Informasi Peminjam */}
                  <Card className="border border-dashed border-slate-300 dark:border-neutral-700 shadow-none bg-white dark:bg-neutral-900 rounded-xl overflow-hidden h-fit">
                    <CardHeader className="bg-white dark:bg-neutral-900 border-b border-dashed border-slate-300 dark:border-neutral-700 pb-6 pt-3 px-6 items-center">
                      <CardTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-neutral-100 flex items-center gap-3">
                        <User className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
                        Informasi Peminjam
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                      <Field>
                        <FieldLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                          Nama Peminjam <span className="text-red-500">*</span>
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            placeholder="Nama lengkap peminjam"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-slate-50 border-dashed border-slate-300 dark:bg-neutral-800/60 dark:border-neutral-700 dark:text-neutral-100 focus:border-solid focus:border-black dark:focus:border-white focus:ring-0 rounded-lg h-11 text-xs sm:text-sm"
                          />
                          {formErrors.name && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                          )}
                        </FieldContent>
                      </Field>

                      <Field>
                        <FieldLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                          Nama Unit Kerja <span className="text-red-500">*</span>
                        </FieldLabel>
                        <FieldContent>
                          <Select value={unitKerja} onValueChange={(val) => setUnitKerja(val)}>
                            <SelectTrigger className="bg-slate-50 border-dashed border-slate-300 dark:bg-neutral-800/60 dark:border-neutral-700 dark:text-neutral-100 focus:border-solid focus:border-black dark:focus:border-white focus:ring-0 rounded-lg h-11 text-xs sm:text-sm">
                              <SelectValue placeholder="Pilih unit kerja" />
                            </SelectTrigger>
                            <SelectContent>
                              {UNIT_KERJA_OPTIONS.map((opt) => (
                                <SelectItem key={opt} value={opt}>
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {formErrors.unitKerja && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.unitKerja}</p>
                          )}
                        </FieldContent>
                      </Field>
                    </CardContent>
                  </Card>
                </div>

                {/* Row 2: Nama Kegiatan */}
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <Card className="border border-dashed border-slate-300 dark:border-neutral-700 shadow-none bg-white dark:bg-neutral-900 rounded-xl overflow-hidden h-fit">
                    <CardHeader className="bg-white dark:bg-neutral-900 border-b border-dashed border-slate-300 dark:border-neutral-700 pb-6 pt-3 px-6 items-center">
                      <CardTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-neutral-100 flex items-center gap-3">
                        <NotebookPen className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
                        Nama Kegiatan
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <Field>
                        <FieldLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                          Nama Kegiatan <span className="text-red-500">*</span>
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            placeholder="Contoh: Rapat Koordinasi Tahunan"
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                            className="bg-slate-50 border-dashed border-slate-300 dark:bg-neutral-800/60 dark:border-neutral-700 dark:text-neutral-100 focus:border-solid focus:border-black dark:focus:border-white focus:ring-0 rounded-lg h-11 text-xs sm:text-sm"
                          />
                          {formErrors.purpose && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.purpose}</p>
                          )}
                        </FieldContent>
                      </Field>
                    </CardContent>
                  </Card>
                </div>

                {/* Row 3: Ruangan Terpilih */}
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <Card className="border border-dashed border-slate-300 dark:border-neutral-700 shadow-none bg-white dark:bg-neutral-900 rounded-xl overflow-hidden">
                    <CardHeader className="bg-white dark:bg-neutral-900 border-b border-dashed border-slate-300 dark:border-neutral-700 pb-6 pt-3 px-6 items-center">
                      <CardTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-neutral-100 flex items-center gap-3">
                        <Building2 className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
                        Ruangan Terpilih
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="p-6 rounded-xl border-2 border-black dark:border-white border-dashed bg-slate-50 dark:bg-neutral-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <h3 className="font-bold text-lg text-slate-900 dark:text-neutral-100">
                            {room.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-neutral-400">
                            <span>Ruang Rapat</span>
                            <span>•</span>
                            <span>Lantai {room.floor}</span>
                            <span>•</span>
                            <span>{room.location}</span>
                          </div>
                          {room.features && room.features.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1.5">
                              {room.features.slice(0, 4).map((f) => (
                                <span
                                  key={f}
                                  className="inline-flex items-center gap-1 rounded-md bg-white dark:bg-neutral-900 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-neutral-700"
                                >
                                  <Check className="h-3 w-3 text-emerald-600" />
                                  {f}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex sm:flex-col items-end gap-2 shrink-0">
                          <Badge
                            variant="secondary"
                            className="bg-black text-white dark:bg-white dark:text-black font-bold text-xs px-3.5 py-1.5 rounded-lg border-none shadow-none"
                          >
                            {room.capacity} Pax
                          </Badge>
                          <span className="text-[11px] text-slate-500 dark:text-neutral-400 font-medium">
                            ID: {room.id}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Row 4: Catatan Tambahan */}
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <Card className="border border-dashed border-slate-300 dark:border-neutral-700 shadow-none bg-white dark:bg-neutral-900 rounded-xl overflow-hidden">
                    <CardHeader className="bg-white dark:bg-neutral-900 border-b border-dashed border-slate-300 dark:border-neutral-700 pb-6 pt-3 px-6 items-center">
                      <CardTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-neutral-100 flex items-center gap-3">
                        <NotebookPen className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
                        Catatan Tambahan
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <Field>
                        <FieldContent>
                          <Textarea
                            placeholder="Masukkan kebutuhan tambahan atau informasi lainnya"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="min-h-[120px] bg-slate-50 border-dashed border-slate-300 dark:bg-neutral-800/60 dark:border-neutral-700 dark:text-neutral-100 focus:border-solid focus:border-black dark:focus:border-white focus:ring-0 rounded-lg p-4 text-xs sm:text-sm"
                          />
                        </FieldContent>
                      </Field>
                    </CardContent>
                  </Card>
                </div>

                {/* Submit Action */}
                <div className="flex justify-end pt-4 pb-16">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-10 bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 shadow-none transition-all rounded-full font-bold h-12 text-base cursor-pointer"
                  >
                    {isSubmitting ? "Memproses..." : "Konfirmasi Booking"}
                  </Button>
                </div>
              </form>
            </div>
          ) : /* =========================================================================
             FORM 2: RUANGAN (EXACT MATCH WITH /room/add)
             ========================================================================= */
          assetType === "ruangan" ? (
            <div className="space-y-8">
              <div className="mb-2">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-neutral-100 mb-1">
                  Tambah Jadwal
                </h2>
                <p className="text-sm text-slate-500 dark:text-neutral-400">
                  Ajukan jadwal peminjaman ruangan
                </p>
              </div>

              <form onSubmit={handleSubmitRuangan} className="space-y-8">
                {/* Row 1: Waktu & Kegiatan + Informasi Peminjam */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Card 1: Waktu & Kegiatan */}
                  <Card className="border border-dashed border-slate-300 dark:border-neutral-700 shadow-none bg-white dark:bg-neutral-900 rounded-xl overflow-hidden h-fit">
                    <CardHeader className="bg-white dark:bg-neutral-900 border-b border-dashed border-slate-300 dark:border-neutral-700 pb-6 pt-3 px-6 items-center">
                      <CardTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-neutral-100 flex items-center gap-3">
                        <CalendarClock className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
                        Waktu &amp; Kegiatan
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Field>
                          <FieldLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                            Tanggal Mulai <span className="text-red-500">*</span>
                          </FieldLabel>
                          <FieldContent>
                            <Popover open={openStart} onOpenChange={setOpenStart}>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal bg-slate-50 border-dashed border-slate-300 dark:bg-neutral-800/60 dark:border-neutral-700 hover:bg-slate-100 hover:border-slate-400 focus:border-solid focus:border-black dark:focus:border-white focus:ring-0 rounded-lg h-11 text-xs sm:text-sm",
                                    !bookingStart && "text-muted-foreground"
                                  )}
                                >
                                  {bookingStart ? (
                                    format(bookingStart, "dd MMMM yyyy", { locale: localeId })
                                  ) : (
                                    <span>Pilih tanggal</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <ShadcnCalendar
                                  mode="single"
                                  selected={bookingStart || undefined}
                                  onSelect={(d) => {
                                    setBookingStart(d || null);
                                    setOpenStart(false);
                                    if (d && (!bookingEnd || bookingEnd < d)) setBookingEnd(d);
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            {formErrors.bookingStart && (
                              <p className="text-red-500 text-xs mt-1">{formErrors.bookingStart}</p>
                            )}
                          </FieldContent>
                        </Field>

                        <Field>
                          <FieldLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                            Tanggal Selesai (Opsional)
                          </FieldLabel>
                          <FieldContent>
                            <Popover open={openEnd} onOpenChange={setOpenEnd}>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal bg-slate-50 border-dashed border-slate-300 dark:bg-neutral-800/60 dark:border-neutral-700 hover:bg-slate-100 hover:border-slate-400 focus:border-solid focus:border-black dark:focus:border-white focus:ring-0 rounded-lg h-11 text-xs sm:text-sm",
                                    !bookingEnd && "text-muted-foreground"
                                  )}
                                >
                                  {bookingEnd ? (
                                    format(bookingEnd, "dd MMMM yyyy", { locale: localeId })
                                  ) : (
                                    <span>Pilih tanggal</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <ShadcnCalendar
                                  mode="single"
                                  selected={bookingEnd || undefined}
                                  onSelect={(d) => {
                                    setBookingEnd(d || null);
                                    setOpenEnd(false);
                                  }}
                                  disabled={(d) => !!bookingStart && d < bookingStart}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </FieldContent>
                        </Field>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Field>
                          <FieldLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                            Jam Mulai <span className="text-red-500">*</span>
                          </FieldLabel>
                          <FieldContent>
                            <Input
                              type="time"
                              value={startTime}
                              onChange={(e) => setStartTime(e.target.value)}
                              className="bg-slate-50 border-dashed border-slate-300 dark:bg-neutral-800/60 dark:border-neutral-700 dark:text-neutral-100 focus:border-solid focus:border-black dark:focus:border-white focus:ring-0 rounded-lg h-11 text-xs sm:text-sm"
                            />
                            {formErrors.startTime && (
                              <p className="text-red-500 text-xs mt-1">{formErrors.startTime}</p>
                            )}
                          </FieldContent>
                        </Field>

                        <Field>
                          <FieldLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                            Jam Selesai <span className="text-red-500">*</span>
                          </FieldLabel>
                          <FieldContent>
                            <Input
                              type="time"
                              value={endTime}
                              onChange={(e) => setEndTime(e.target.value)}
                              className="bg-slate-50 border-dashed border-slate-300 dark:bg-neutral-800/60 dark:border-neutral-700 dark:text-neutral-100 focus:border-solid focus:border-black dark:focus:border-white focus:ring-0 rounded-lg h-11 text-xs sm:text-sm"
                            />
                            {formErrors.endTime && (
                              <p className="text-red-500 text-xs mt-1">{formErrors.endTime}</p>
                            )}
                          </FieldContent>
                        </Field>
                      </div>

                      <Field>
                        <FieldLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                          Nama Kegiatan <span className="text-red-500">*</span>
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            placeholder="Contoh: Rapat Koordinasi Tahunan"
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                            className="bg-slate-50 border-dashed border-slate-300 dark:bg-neutral-800/60 dark:border-neutral-700 dark:text-neutral-100 focus:border-solid focus:border-black dark:focus:border-white focus:ring-0 rounded-lg h-11 text-xs sm:text-sm"
                          />
                          {formErrors.purpose && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.purpose}</p>
                          )}
                        </FieldContent>
                      </Field>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Field>
                          <FieldLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                            Jumlah Peserta <span className="text-red-500">*</span>
                          </FieldLabel>
                          <FieldContent>
                            <Input
                              type="number"
                              min={1}
                              placeholder="0"
                              value={attendees}
                              onChange={(e) => setAttendees(Number(e.target.value))}
                              className="bg-slate-50 border-dashed border-slate-300 dark:bg-neutral-800/60 dark:border-neutral-700 dark:text-neutral-100 focus:border-solid focus:border-black dark:focus:border-white focus:ring-0 rounded-lg h-11 text-xs sm:text-sm"
                            />
                            {formErrors.attendees && (
                              <p className="text-red-500 text-xs mt-1">{formErrors.attendees}</p>
                            )}
                          </FieldContent>
                        </Field>

                        <Field>
                          <FieldLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                            Layout Ruangan <span className="text-red-500">*</span>
                          </FieldLabel>
                          <FieldContent>
                            <Select
                              value={roomSetup}
                              onValueChange={(val) => setRoomSetup(val as RoomSetup)}
                            >
                              <SelectTrigger className="bg-slate-50 border-dashed border-slate-300 dark:bg-neutral-800/60 dark:border-neutral-700 dark:text-neutral-100 focus:border-solid focus:border-black dark:focus:border-white focus:ring-0 rounded-lg h-11 text-xs sm:text-sm">
                                <SelectValue placeholder="Pilih layout" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Island">Island</SelectItem>
                                <SelectItem value="U-shape">U-shape</SelectItem>
                                <SelectItem value="Classroom">Classroom</SelectItem>
                              </SelectContent>
                            </Select>
                          </FieldContent>
                        </Field>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card 2: Informasi Peminjam */}
                  <Card className="border border-dashed border-slate-300 dark:border-neutral-700 shadow-none bg-white dark:bg-neutral-900 rounded-xl overflow-hidden h-fit">
                    <CardHeader className="bg-white dark:bg-neutral-900 border-b border-dashed border-slate-300 dark:border-neutral-700 pb-6 pt-3 px-6 items-center">
                      <CardTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-neutral-100 flex items-center gap-3">
                        <User className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
                        Informasi Peminjam
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                      <Field>
                        <FieldLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                          Nama Peminjam <span className="text-red-500">*</span>
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            placeholder="Nama lengkap peminjam"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-slate-50 border-dashed border-slate-300 dark:bg-neutral-800/60 dark:border-neutral-700 dark:text-neutral-100 focus:border-solid focus:border-black dark:focus:border-white focus:ring-0 rounded-lg h-11 text-xs sm:text-sm"
                          />
                          {formErrors.name && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                          )}
                        </FieldContent>
                      </Field>

                      <Field>
                        <FieldLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                          Nomor Telepon/WA <span className="text-red-500">*</span>
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            placeholder="Nomor Telepon/WA Peminjam"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="bg-slate-50 border-dashed border-slate-300 dark:bg-neutral-800/60 dark:border-neutral-700 dark:text-neutral-100 focus:border-solid focus:border-black dark:focus:border-white focus:ring-0 rounded-lg h-11 text-xs sm:text-sm"
                          />
                          {formErrors.phoneNumber && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.phoneNumber}</p>
                          )}
                        </FieldContent>
                      </Field>

                      <Field>
                        <FieldLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                          Nama Instansi <span className="text-red-500">*</span>
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            placeholder="Nama unit/instansi"
                            value={roomInstitutionName}
                            onChange={(e) => setRoomInstitutionName(e.target.value)}
                            className="bg-slate-50 border-dashed border-slate-300 dark:bg-neutral-800/60 dark:border-neutral-700 dark:text-neutral-100 focus:border-solid focus:border-black dark:focus:border-white focus:ring-0 rounded-lg h-11 text-xs sm:text-sm"
                          />
                          {formErrors.roomInstitutionName && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.roomInstitutionName}</p>
                          )}
                        </FieldContent>
                      </Field>

                      <Field>
                        <FieldLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                          Jenis Instansi <span className="text-red-500">*</span>
                        </FieldLabel>
                        <FieldContent>
                          <Select
                            value={institutionType}
                            onValueChange={(val) => setInstitutionType(val as InstitutionType)}
                          >
                            <SelectTrigger className="bg-slate-50 border-dashed border-slate-300 dark:bg-neutral-800/60 dark:border-neutral-700 dark:text-neutral-100 focus:border-solid focus:border-black dark:focus:border-white focus:ring-0 rounded-lg h-11 text-xs sm:text-sm">
                              <SelectValue placeholder="Pilih jenis instansi" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Kemensetneg">Kemensetneg</SelectItem>
                              <SelectItem value="Non-Kemensetneg">Non-Kemensetneg</SelectItem>
                            </SelectContent>
                          </Select>
                        </FieldContent>
                      </Field>
                    </CardContent>
                  </Card>
                </div>

                {/* Row 2: Ruangan Terpilih */}
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <Card className="border border-dashed border-slate-300 dark:border-neutral-700 shadow-none bg-white dark:bg-neutral-900 rounded-xl overflow-hidden">
                    <CardHeader className="bg-white dark:bg-neutral-900 border-b border-dashed border-slate-300 dark:border-neutral-700 pb-6 pt-3 px-6 items-center">
                      <CardTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-neutral-100 flex items-center gap-3">
                        <Building2 className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
                        Ruangan Terpilih
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="p-6 rounded-xl border-2 border-black dark:border-white border-dashed bg-slate-50 dark:bg-neutral-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <h3 className="font-bold text-lg text-slate-900 dark:text-neutral-100">
                            {room.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-neutral-400">
                            <span>Ruangan</span>
                            <span>•</span>
                            <span>Lantai {room.floor}</span>
                            <span>•</span>
                            <span>{room.location}</span>
                          </div>
                          {room.features && room.features.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1.5">
                              {room.features.slice(0, 4).map((f) => (
                                <span
                                  key={f}
                                  className="inline-flex items-center gap-1 rounded-md bg-white dark:bg-neutral-900 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-neutral-700"
                                >
                                  <Check className="h-3 w-3 text-emerald-600" />
                                  {f}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex sm:flex-col items-end gap-2 shrink-0">
                          <Badge
                            variant="secondary"
                            className="bg-black text-white dark:bg-white dark:text-black font-bold text-xs px-3.5 py-1.5 rounded-lg border-none shadow-none"
                          >
                            {room.capacity} pax
                          </Badge>
                          <span className="text-[11px] text-slate-500 dark:text-neutral-400 font-medium">
                            ID: {room.id}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Row 3: Catatan Tambahan */}
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <Card className="border border-dashed border-slate-300 dark:border-neutral-700 shadow-none bg-white dark:bg-neutral-900 rounded-xl overflow-hidden">
                    <CardHeader className="bg-white dark:bg-neutral-900 border-b border-dashed border-slate-300 dark:border-neutral-700 pb-6 pt-3 px-6 items-center">
                      <CardTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-neutral-100 flex items-center gap-3">
                        <NotebookPen className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
                        Catatan Tambahan
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <Field>
                        <FieldContent>
                          <Textarea
                            placeholder="Kebutuhan tambahan seperti sound system, proyektor, dll."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="min-h-[120px] bg-slate-50 border-dashed border-slate-300 dark:bg-neutral-800/60 dark:border-neutral-700 dark:text-neutral-100 focus:border-solid focus:border-black dark:focus:border-white focus:ring-0 rounded-lg p-4 text-xs sm:text-sm"
                          />
                        </FieldContent>
                      </Field>
                    </CardContent>
                  </Card>
                </div>

                {/* Submit Action */}
                <div className="flex justify-end pt-4 pb-16">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-10 bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 shadow-none transition-all rounded-full font-bold h-12 text-base cursor-pointer"
                  >
                    {isSubmitting ? "Memproses..." : "Konfirmasi Booking"}
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            /* =========================================================================
             FORM 3: ASRAMA (EXACT MATCH WITH /dorm/add)
             ========================================================================= */
            <div className="space-y-8">
              <div className="mb-2">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-neutral-100 mb-1">
                  Booking Asrama
                </h2>
                <p className="text-sm text-slate-500 dark:text-neutral-400">
                  Ajukan jadwal peminjaman asrama
                </p>
              </div>

              <form onSubmit={handleSubmitAsrama} className="space-y-8">
                {/* Card 1: Informasi Peminjam */}
                <Card className="border border-dashed border-slate-300 dark:border-neutral-700 shadow-none bg-white dark:bg-neutral-900 rounded-xl overflow-hidden">
                  <CardHeader className="bg-white dark:bg-neutral-900 border-b border-dashed border-slate-300 dark:border-neutral-700 pb-6 pt-3 px-6 items-center">
                    <CardTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-neutral-100 flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
                      Informasi Peminjam
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Field>
                        <FieldLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                          Nama Peminjam <span className="text-red-500">*</span>
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            placeholder="Nama lengkap peminjam"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-slate-50 border-dashed border-slate-300 dark:bg-neutral-800/60 dark:border-neutral-700 dark:text-neutral-100 focus:border-solid focus:border-black dark:focus:border-white focus:ring-0 rounded-lg h-11 text-xs sm:text-sm"
                          />
                          {formErrors.name && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                          )}
                        </FieldContent>
                      </Field>

                      <Field>
                        <FieldLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                          Nomor Telepon / WA <span className="text-red-500">*</span>
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            type="tel"
                            placeholder="Nomor Telepon/WA Peminjam"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="bg-slate-50 border-dashed border-slate-300 dark:bg-neutral-800/60 dark:border-neutral-700 dark:text-neutral-100 focus:border-solid focus:border-black dark:focus:border-white focus:ring-0 rounded-lg h-11 text-xs sm:text-sm"
                          />
                          {formErrors.phoneNumber && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.phoneNumber}</p>
                          )}
                        </FieldContent>
                      </Field>

                      <Field>
                        <FieldLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                          Tipe Instansi <span className="text-red-500">*</span>
                        </FieldLabel>
                        <FieldContent>
                          <Select
                            value={dormInstitutionType}
                            onValueChange={(val) => setDormInstitutionType(val as InstitutionType)}
                          >
                            <SelectTrigger className="bg-slate-50 border-dashed border-slate-300 dark:bg-neutral-800/60 dark:border-neutral-700 dark:text-neutral-100 focus:border-solid focus:border-black dark:focus:border-white focus:ring-0 rounded-lg h-11 text-xs sm:text-sm">
                              <SelectValue placeholder="Pilih tipe" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Kemensetneg">Kemensetneg</SelectItem>
                              <SelectItem value="Non-Kemensetneg">Non-Kemensetneg</SelectItem>
                            </SelectContent>
                          </Select>
                        </FieldContent>
                      </Field>

                      <Field>
                        <FieldLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                          Nama Instansi / Unit Kerja <span className="text-red-500">*</span>
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            placeholder="Contoh: Biro SDM"
                            value={dormInstansiUnit}
                            onChange={(e) => setDormInstansiUnit(e.target.value)}
                            className="bg-slate-50 border-dashed border-slate-300 dark:bg-neutral-800/60 dark:border-neutral-700 dark:text-neutral-100 focus:border-solid focus:border-black dark:focus:border-white focus:ring-0 rounded-lg h-11 text-xs sm:text-sm"
                          />
                          {formErrors.dormInstansiUnit && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.dormInstansiUnit}</p>
                          )}
                        </FieldContent>
                      </Field>

                      <div className="md:col-span-2">
                        <Field>
                          <FieldLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                            Nama Kegiatan <span className="text-red-500">*</span>
                          </FieldLabel>
                          <FieldContent>
                            <Input
                              placeholder="Nama acara atau kegiatan"
                              value={purpose}
                              onChange={(e) => setPurpose(e.target.value)}
                              className="bg-slate-50 border-dashed border-slate-300 dark:bg-neutral-800/60 dark:border-neutral-700 dark:text-neutral-100 focus:border-solid focus:border-black dark:focus:border-white focus:ring-0 rounded-lg h-11 text-xs sm:text-sm"
                            />
                            {formErrors.purpose && (
                              <p className="text-red-500 text-xs mt-1">{formErrors.purpose}</p>
                            )}
                          </FieldContent>
                        </Field>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Card 2: Waktu Peminjaman */}
                <Card className="border border-dashed border-slate-300 dark:border-neutral-700 shadow-none bg-white dark:bg-neutral-900 rounded-xl overflow-hidden h-fit">
                  <CardHeader className="bg-white dark:bg-neutral-900 border-b border-dashed border-slate-300 dark:border-neutral-700 pb-6 pt-3 px-6 items-center">
                    <CardTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-neutral-100 flex items-center gap-3">
                      <CalendarClock className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
                      Waktu Peminjaman
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Field>
                        <FieldLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                          Tanggal Mulai <span className="text-red-500">*</span>
                        </FieldLabel>
                        <FieldContent>
                          <Popover open={openStart} onOpenChange={setOpenStart}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal bg-slate-50 border-dashed border-slate-300 dark:bg-neutral-800/60 dark:border-neutral-700 hover:bg-slate-100 hover:border-slate-400 focus:border-solid focus:border-black dark:focus:border-white focus:ring-0 rounded-lg h-11 text-xs sm:text-sm",
                                  !bookingStart && "text-muted-foreground"
                                )}
                              >
                                {bookingStart ? (
                                  format(bookingStart, "dd MMMM yyyy", { locale: localeId })
                                ) : (
                                  <span>Pilih tanggal</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <ShadcnCalendar
                                mode="single"
                                selected={bookingStart || undefined}
                                onSelect={(d) => {
                                  setBookingStart(d || null);
                                  setOpenStart(false);
                                  if (d && (!bookingEnd || bookingEnd < d)) setBookingEnd(d);
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          {formErrors.bookingStart && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.bookingStart}</p>
                          )}
                        </FieldContent>
                      </Field>

                      <Field>
                        <FieldLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                          Tanggal Selesai (Opsional)
                        </FieldLabel>
                        <FieldContent>
                          <Popover open={openEnd} onOpenChange={setOpenEnd}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal bg-slate-50 border-dashed border-slate-300 dark:bg-neutral-800/60 dark:border-neutral-700 hover:bg-slate-100 hover:border-slate-400 focus:border-solid focus:border-black dark:focus:border-white focus:ring-0 rounded-lg h-11 text-xs sm:text-sm",
                                  !bookingEnd && "text-muted-foreground"
                                )}
                              >
                                {bookingEnd ? (
                                  format(bookingEnd, "dd MMMM yyyy", { locale: localeId })
                                ) : (
                                  <span>Pilih tanggal</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <ShadcnCalendar
                                mode="single"
                                selected={bookingEnd || undefined}
                                onSelect={(d) => {
                                  setBookingEnd(d || null);
                                  setOpenEnd(false);
                                }}
                                disabled={(d) => !!bookingStart && d < bookingStart}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </FieldContent>
                      </Field>

                      <Field>
                        <FieldLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                          Jam Mulai <span className="text-red-500">*</span>
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="bg-slate-50 border-dashed border-slate-300 dark:bg-neutral-800/60 dark:border-neutral-700 dark:text-neutral-100 focus:border-solid focus:border-black dark:focus:border-white focus:ring-0 rounded-lg h-11 text-xs sm:text-sm"
                          />
                          {formErrors.startTime && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.startTime}</p>
                          )}
                        </FieldContent>
                      </Field>

                      <Field>
                        <FieldLabel className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                          Jam Selesai <span className="text-red-500">*</span>
                        </FieldLabel>
                        <FieldContent>
                          <Input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="bg-slate-50 border-dashed border-slate-300 dark:bg-neutral-800/60 dark:border-neutral-700 dark:text-neutral-100 focus:border-solid focus:border-black dark:focus:border-white focus:ring-0 rounded-lg h-11 text-xs sm:text-sm"
                          />
                          {formErrors.endTime && (
                            <p className="text-red-500 text-xs mt-1">{formErrors.endTime}</p>
                          )}
                        </FieldContent>
                      </Field>
                    </div>
                  </CardContent>
                </Card>

                {/* Card 3: Kamar Terpilih */}
                <Card className="border border-dashed border-slate-300 dark:border-neutral-700 shadow-none bg-white dark:bg-neutral-900 rounded-xl overflow-hidden h-fit">
                  <CardHeader className="bg-white dark:bg-neutral-900 border-b border-dashed border-slate-300 dark:border-neutral-700 pb-6 pt-3 px-6 items-center">
                    <CardTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-neutral-100 flex items-center gap-3">
                      <Building2 className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
                      Kamar Terpilih
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="p-6 rounded-xl border-2 border-black dark:border-white border-dashed bg-slate-50 dark:bg-neutral-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-neutral-100">
                          {room.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-neutral-400">
                          <span>Asrama</span>
                          <span>•</span>
                          <span>Lantai {room.floor}</span>
                          <span>•</span>
                          <span>{room.location}</span>
                        </div>
                        {room.features && room.features.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1.5">
                            {room.features.slice(0, 4).map((f) => (
                              <span
                                key={f}
                                className="inline-flex items-center gap-1 rounded-md bg-white dark:bg-neutral-900 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-neutral-700"
                              >
                                <Check className="h-3 w-3 text-emerald-600" />
                                {f}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex sm:flex-col items-end gap-2 shrink-0">
                        <Badge
                          variant="secondary"
                          className="bg-black text-white dark:bg-white dark:text-black font-bold text-xs px-3.5 py-1.5 rounded-lg border-none shadow-none"
                        >
                          {room.capacity} Bed
                        </Badge>
                        <span className="text-[11px] text-slate-500 dark:text-neutral-400 font-medium">
                          ID: {room.id}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Card 4: Daftar Peserta Menginap */}
                <Card className="border border-dashed border-slate-300 dark:border-neutral-700 shadow-none bg-white dark:bg-neutral-900 rounded-xl overflow-hidden h-fit">
                  <CardHeader className="bg-white dark:bg-neutral-900 border-b border-dashed border-slate-300 dark:border-neutral-700 pb-6 pt-3 px-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <CardTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-neutral-100 flex items-center gap-3">
                        <Users className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
                        Daftar Peserta Menginap
                      </CardTitle>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={excelUtils.downloadTemplate}
                          className="h-9 rounded-xl border-dashed border-slate-300 dark:border-neutral-700 text-xs font-medium shadow-none hover:bg-slate-50 dark:hover:bg-neutral-800 cursor-pointer"
                        >
                          <Download className="h-3.5 w-3.5 mr-1.5" /> Template
                        </Button>
                        <div className="relative">
                          <Button
                            type="button"
                            variant="outline"
                            className="h-9 rounded-xl border-dashed border-slate-300 dark:border-neutral-700 text-xs font-medium shadow-none hover:bg-slate-50 dark:hover:bg-neutral-800 cursor-pointer"
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
                        <AddParticipantDialog
                          onAdd={(p) => {
                            setParticipants((prev) => [...prev, p]);
                            toast.success("Peserta ditambahkan");
                          }}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    {participants.length > 0 ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400 px-1">
                          <span>
                            Total <strong className="text-slate-900 dark:text-neutral-100">{participants.length}</strong> peserta terdaftar
                          </span>
                          <span className="text-[11px]">
                            Kapasitas kamar: {room.capacity} Bed
                          </span>
                        </div>

                        <div className="divide-y divide-dashed divide-slate-200 dark:divide-neutral-800 border border-dashed border-slate-200 dark:border-neutral-800 rounded-xl overflow-hidden">
                          {participants.map((p, idx) => (
                            <div
                              key={p.id}
                              className="p-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-neutral-850 transition-colors bg-white dark:bg-neutral-900"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="text-xs font-bold text-slate-400 w-5 text-center">
                                  {idx + 1}
                                </span>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-sm text-slate-900 dark:text-neutral-100 truncate">
                                      {p.name}
                                    </h4>
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "text-[10px] px-1.5 py-0 h-4 border-dashed",
                                        p.gender === "P"
                                          ? "border-rose-300 text-rose-600 dark:text-rose-400"
                                          : "border-blue-300 text-blue-600 dark:text-blue-400"
                                      )}
                                    >
                                      {p.gender === "P" ? "P" : "L"}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-slate-500 dark:text-neutral-400 truncate">
                                    {p.unitKerja} • {p.instansi}
                                  </p>
                                </div>
                              </div>

                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveParticipant(p.id)}
                                className="text-slate-400 hover:text-red-600 h-8 w-8 p-0 cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400 border border-dashed border-slate-200 dark:border-neutral-800 rounded-xl bg-slate-50/50 dark:bg-neutral-900/40">
                        <Users className="h-8 w-8 mb-2 opacity-30" />
                        <p className="text-xs font-medium">Belum ada peserta terdaftar</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Gunakan tombol Download Template, Upload Excel, atau Tambah Manual di atas.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Submit Action */}
                <div className="flex justify-end pt-4 pb-16">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-10 bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 shadow-none transition-all rounded-full font-bold h-12 text-base cursor-pointer"
                  >
                    {isSubmitting ? "Memproses..." : "Konfirmasi Booking"}
                  </Button>
                </div>
              </form>
            </div>
          )
        )}
      </main>
    </div>
  );
};
