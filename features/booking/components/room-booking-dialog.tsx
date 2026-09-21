"use client";

import React, { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  Calendar,
  Clock,
  Users,
  Building,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Send,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { chisfisRoomService } from "../services/chisfis-room-service";
import {
  UNIT_KERJA_OPTIONS,
  type ChisfisRoom,
} from "../types";

export interface RoomBookingDialogProps {
  room: ChisfisRoom | null;
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
  onBookingSuccess?: () => void;
}

export const RoomBookingDialog: React.FC<RoomBookingDialogProps> = ({
  room,
  isOpen,
  onClose,
  defaultDate,
  onBookingSuccess,
}) => {
  const [date, setDate] = useState<string>(
    defaultDate || format(new Date(), "yyyy-MM-dd")
  );
  const [timeSlot, setTimeSlot] = useState<"pagi" | "siang" | "seharian" | "custom">("pagi");
  const [startTime, setStartTime] = useState<string>("08:00");
  const [endTime, setEndTime] = useState<string>("12:00");
  const [name, setName] = useState<string>("");
  const [institutionName, setInstitutionName] = useState<string>(UNIT_KERJA_OPTIONS[0]);
  const [participantsCount, setParticipantsCount] = useState<number>(room?.capacity || 10);
  const [purpose, setPurpose] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successBookingId, setSuccessBookingId] = useState<string | null>(null);

  if (!room) return null;

  const handleSlotPreset = (slot: "pagi" | "siang" | "seharian") => {
    setTimeSlot(slot);
    if (slot === "pagi") {
      setStartTime("08:00");
      setEndTime("12:00");
    } else if (slot === "siang") {
      setStartTime("13:00");
      setEndTime("17:00");
    } else if (slot === "seharian") {
      setStartTime("08:00");
      setEndTime("17:00");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Nama pemesan wajib diisi.");
      return;
    }
    if (!purpose.trim()) {
      toast.error("Agenda atau keperluan kegiatan wajib diisi.");
      return;
    }
    if (startTime >= endTime) {
      toast.error("Jam selesai harus lebih akhir dari jam mulai.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await chisfisRoomService.submitBooking({
        roomId: room.id,
        roomName: room.name,
        bookingDate: date,
        startTime,
        endTime,
        name: name.trim(),
        institutionName,
        purpose: purpose.trim(),
        notes: notes.trim(),
        participantsCount: Number(participantsCount) || 1,
      });

      setSuccessBookingId(res.bookingId);
      toast.success("Reservasi Ruangan Berhasil Dikonfirmasi!", {
        description: `${room.name} telah dijadwalkan pada ${date} (${startTime} - ${endTime}).`,
      });

      if (onBookingSuccess) {
        onBookingSuccess();
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Terjadi kesalahan saat memproses booking.";
      toast.error("Gagal Melakukan Booking", {
        description: errorMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSuccessBookingId(null);
    setName("");
    setPurpose("");
    setNotes("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleResetAndClose()}>
      <DialogContent className="max-w-2xl overflow-hidden rounded-[2rem] p-0 border-neutral-200 dark:border-neutral-800 dark:bg-neutral-900 max-h-[90vh] flex flex-col">
        {/* Header Preview Image */}
        <div className="relative h-44 w-full shrink-0 overflow-hidden bg-neutral-900">
          <Image
            src={room.images?.[0] || "/empty-rooms.jpg"}
            alt={room.name}
            fill
            className="object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          {/* Close button top right */}
          <button
            type="button"
            onClick={handleResetAndClose}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-transform hover:scale-110 active:scale-90"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/90 px-3 py-0.5 text-[11px] font-bold text-white tracking-wide shadow-sm">
                <Sparkles className="h-3 w-3" />
                Lantai {room.floor}
              </span>
              <h2 className="mt-1 text-xl font-extrabold text-white sm:text-2xl">
                {room.name}
              </h2>
              <p className="text-xs text-neutral-300">
                {room.category} • Kapasitas {room.capacity} Orang • {room.location}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body / Scroll Area */}
        <div className="overflow-y-auto px-6 py-5 space-y-6 flex-1">
          {successBookingId ? (
            /* Success Receipt View */
            <div className="py-6 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  Reservasi Berhasil Dikonfirmasi!
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  ID Booking: <strong className="font-mono text-neutral-800 dark:text-neutral-200">{successBookingId}</strong>
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-left text-xs space-y-2 dark:border-neutral-800 dark:bg-neutral-800/40">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Ruangan:</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">{room.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Tanggal:</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {format(new Date(date), "EEEE, dd MMMM yyyy", { locale: localeId })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Waktu Pemakaian:</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">{startTime} - {endTime} WIB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Pemesan:</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">{name} ({institutionName})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Agenda:</span>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">{purpose}</span>
                </div>
              </div>

              <div className="flex justify-center pt-2">
                <Button
                  type="button"
                  onClick={handleResetAndClose}
                  className="rounded-full bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 px-8"
                >
                  Selesai &amp; Tutup
                </Button>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Facilities Checklist Highlights */}
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Fasilitas yang Disediakan
                </Label>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {room.features.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                    >
                      <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Date & Time Slot Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="booking-date" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Tanggal Penggunaan
                  </Label>
                  <Input
                    id="booking-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="rounded-xl border-neutral-300 dark:border-neutral-700"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Sesi Waktu Cepat
                  </Label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { key: "pagi", label: "Pagi", desc: "08-12" },
                      { key: "siang", label: "Siang", desc: "13-17" },
                      { key: "seharian", label: "Full Day", desc: "08-17" },
                    ].map((s) => (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => handleSlotPreset(s.key as "pagi" | "siang" | "seharian")}
                        className={`rounded-xl border py-2 text-center text-xs font-semibold transition-colors cursor-pointer ${
                          timeSlot === s.key
                            ? "border-amber-500 bg-amber-500/10 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300"
                            : "border-neutral-200 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
                        }`}
                      >
                        <div className="leading-tight">{s.label}</div>
                        <div className="text-[10px] font-normal opacity-70">{s.desc} WIB</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Custom Time Range (if needed) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="start-time" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Jam Mulai
                  </Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => {
                      setStartTime(e.target.value);
                      setTimeSlot("custom");
                    }}
                    className="rounded-xl border-neutral-300 dark:border-neutral-700"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="end-time" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Jam Selesai
                  </Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => {
                      setEndTime(e.target.value);
                      setTimeSlot("custom");
                    }}
                    className="rounded-xl border-neutral-300 dark:border-neutral-700"
                    required
                  />
                </div>
              </div>

              {/* Pemesan & Unit Kerja */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="pic-name" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Nama Pemesan / PIC
                  </Label>
                  <Input
                    id="pic-name"
                    placeholder="Contoh: Ahmad Fauzi"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl border-neutral-300 dark:border-neutral-700"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="unit-kerja" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Unit Kerja / Kedinasan
                  </Label>
                  <Select value={institutionName} onValueChange={setInstitutionName}>
                    <SelectTrigger id="unit-kerja" className="rounded-xl border-neutral-300 dark:border-neutral-700">
                      <SelectValue placeholder="Pilih unit kerja" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {UNIT_KERJA_OPTIONS.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Jumlah Peserta & Agenda */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5 sm:col-span-1">
                  <Label htmlFor="pax-count" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Estimasi Peserta
                  </Label>
                  <Input
                    id="pax-count"
                    type="number"
                    min={1}
                    max={room.capacity * 2}
                    value={participantsCount}
                    onChange={(e) => setParticipantsCount(Number(e.target.value))}
                    className="rounded-xl border-neutral-300 dark:border-neutral-700"
                    required
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="meeting-purpose" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Nama Kegiatan / Agenda Rapat
                  </Label>
                  <Input
                    id="meeting-purpose"
                    placeholder="Contoh: Rapat Koordinasi Program Diklat Triwulan"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="rounded-xl border-neutral-300 dark:border-neutral-700"
                    required
                  />
                </div>
              </div>

              {/* Catatan Tambahan */}
              <div className="space-y-1.5">
                <Label htmlFor="booking-notes" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Catatan Kebutuhan Tambahan (Opsional)
                </Label>
                <Textarea
                  id="booking-notes"
                  placeholder="Contoh: Butuh 2 buah mic wireless cadangan dan set meja formasi U-Shape."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="rounded-xl border-neutral-300 dark:border-neutral-700 min-h-[70px]"
                />
              </div>

              {/* Submit & Close Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Validasi Otomatis &amp; Real-time</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResetAndClose}
                    className="rounded-full text-xs font-semibold"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold text-xs px-6 shadow-md shadow-orange-500/20"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Memproses...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Send className="h-3.5 w-3.5" />
                        Konfirmasi Booking
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
