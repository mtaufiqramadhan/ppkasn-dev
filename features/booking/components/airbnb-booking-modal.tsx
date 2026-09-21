"use client";

import React, { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  X,
  Users,
  Building,
  Check,
  CheckCircle2,
  Calendar,
  Clock,
  ShieldCheck,
  Tv,
  Presentation,
  Volume2,
  AirVent,
  Wifi,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

export interface AirbnbBookingModalProps {
  room: ChisfisRoom | null;
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
  onBookingSuccess?: () => void;
}

export const AirbnbBookingModal: React.FC<AirbnbBookingModalProps> = ({
  room,
  isOpen,
  onClose,
  defaultDate,
  onBookingSuccess,
}) => {
  const [date, setDate] = useState<string>(
    defaultDate || format(new Date(), "yyyy-MM-dd")
  );
  const [session, setSession] = useState<"pagi" | "siang" | "seharian" | "custom">("pagi");
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

  const images = room.images && room.images.length > 0
    ? room.images
    : ["/empty-rooms.jpg"];

  const handleSessionChange = (s: "pagi" | "siang" | "seharian") => {
    setSession(s);
    if (s === "pagi") {
      setStartTime("08:00");
      setEndTime("12:00");
    } else if (s === "siang") {
      setStartTime("13:00");
      setEndTime("17:00");
    } else if (s === "seharian") {
      setStartTime("08:00");
      setEndTime("17:00");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Nama pemesan / PIC wajib diisi.");
      return;
    }
    if (!purpose.trim()) {
      toast.error("Agenda kegiatan / topik rapat wajib diisi.");
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
      toast.success("Pemesanan Ruangan Berhasil Dikonfirmasi!", {
        description: `${room.name} telah dijadwalkan pada ${date} (${startTime} - ${endTime}).`,
      });

      if (onBookingSuccess) {
        onBookingSuccess();
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Terjadi kendala saat memproses reservasi.";
      toast.error("Reservasi Gagal", { description: errorMsg });
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
      <DialogContent className="max-w-4xl p-0 rounded-3xl border-neutral-200 dark:border-neutral-800 dark:bg-[#181818] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Minimal Bar */}
        <div className="flex items-center justify-between border-b border-[#ebebeb] px-6 py-3.5 dark:border-neutral-800">
          <button
            type="button"
            onClick={handleResetAndClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-800 dark:hover:bg-neutral-800 dark:text-neutral-200 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-4 text-xs font-semibold text-neutral-500">
            <span>{room.category}</span>
          </div>
        </div>

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          {successBookingId ? (
            /* Confirmation Receipt */
            <div className="py-12 max-w-md mx-auto text-center space-y-5">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  Reservasi Dikonfirmasi!
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Nomor Referensi: <strong className="font-mono text-neutral-800 dark:text-neutral-200">{successBookingId}</strong>
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-200 p-5 text-left text-xs space-y-2.5 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40">
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
                  <span className="text-neutral-500">Waktu:</span>
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

              <button
                type="button"
                onClick={handleResetAndClose}
                className="rounded-xl bg-[#222222] hover:bg-black text-white px-8 py-3 text-sm font-semibold dark:bg-white dark:text-neutral-900 cursor-pointer"
              >
                Selesai
              </button>
            </div>
          ) : (
            <>
              {/* Room Header Info */}
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {room.name}
                </h2>
                <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                  <span className="underline">{room.location}</span>
                  <span>•</span>
                  <span>Lantai {room.floor}</span>
                </div>
              </div>

              {/* Photo Banner (Single Clean Empty View Illustration) */}
              <div className="relative aspect-[16/9] md:h-72 w-full overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800">
                <Image
                  src="/empty-rooms.jpg"
                  alt={room.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Two Column Layout: Left (Specs) & Right (Airbnb Reserve Box) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                
                {/* Left Column: Room Highlights & Details (7 cols) */}
                <div className="md:col-span-7 space-y-6">
                  {/* Host note */}
                  <div className="flex items-center justify-between border-b border-[#ebebeb] pb-6 dark:border-neutral-800">
                    <div>
                      <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                        {room.category} dikelola oleh Pengelola SARPRAS PPKASN
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Kapasitas hingga {room.capacity} peserta • Ruangan formal kedinasan
                      </p>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="space-y-4 border-b border-[#ebebeb] pb-6 dark:border-neutral-800">
                    <div className="flex items-start gap-4">
                      <Users className="h-5 w-5 text-neutral-700 mt-0.5 shrink-0 dark:text-neutral-300" />
                      <div>
                        <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                          Kapasitas Fleksibel ({room.capacity} Pax)
                        </h4>
                        <p className="text-xs text-neutral-500 leading-relaxed">
                          Penataan meja dan kursi ergonomis dapat disesuaikan dengan kebutuhan agenda pertemuan.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <Presentation className="h-5 w-5 text-neutral-700 mt-0.5 shrink-0 dark:text-neutral-300" />
                      <div>
                        <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                          Peralatan Audio Visual Siap Pakai
                        </h4>
                        <p className="text-xs text-neutral-500 leading-relaxed">
                          Dilengkapi perangkat proyektor, sound system, mikrofon, dan layar display terverifikasi.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <ShieldCheck className="h-5 w-5 text-neutral-700 mt-0.5 shrink-0 dark:text-neutral-300" />
                      <div>
                        <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                          Layanan Kedinasan Resmi
                        </h4>
                        <p className="text-xs text-neutral-500 leading-relaxed">
                          Fasilitas internal PPKASN Kemensetneg tanpa pungutan biaya untuk agenda kerja kedinasan.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Facilities list */}
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                      Fasilitas yang Ditawarkan
                    </h4>
                    <div className="grid grid-cols-2 gap-2.5">
                      {room.features.map((fac) => (
                        <div key={fac} className="flex items-center gap-2.5 text-xs text-neutral-700 dark:text-neutral-300">
                          <Check className="h-4 w-4 text-neutral-900 dark:text-white stroke-[2.5]" />
                          <span>{fac}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: The Iconic Airbnb Reservation Box (5 cols) */}
                <div className="md:col-span-5">
                  <div className="rounded-2xl border border-neutral-300 p-5 shadow-xl dark:border-neutral-700 dark:bg-neutral-900/90">
                    {/* Header */}
                    <div className="mb-4">
                      <span className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                        Formulir Reservasi
                      </span>
                    </div>

                    {/* Airbnb Segmented Form Box */}
                    <form onSubmit={handleSubmit} className="space-y-3.5">
                      <div className="rounded-xl border border-neutral-300 divide-y divide-neutral-300 dark:border-neutral-700 dark:divide-neutral-700 overflow-hidden">
                        {/* Date Field */}
                        <div className="p-2.5 bg-white dark:bg-neutral-900">
                          <Label htmlFor="res-date" className="block text-[10px] font-bold text-neutral-800 uppercase dark:text-neutral-300">
                            Tanggal Reservasi
                          </Label>
                          <Input
                            id="res-date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="h-8 border-none p-0 text-xs font-semibold focus-visible:ring-0 shadow-none bg-transparent"
                            required
                          />
                        </div>

                        {/* Sesi Waktu */}
                        <div className="p-2.5 bg-white dark:bg-neutral-900">
                          <Label className="block text-[10px] font-bold text-neutral-800 uppercase dark:text-neutral-300 mb-1">
                            Sesi Waktu
                          </Label>
                          <div className="grid grid-cols-3 gap-1">
                            {[
                              { k: "pagi", l: "Pagi", d: "08-12" },
                              { k: "siang", l: "Siang", d: "13-17" },
                              { k: "seharian", l: "Seharian", d: "08-17" },
                            ].map((s) => (
                              <button
                                key={s.k}
                                type="button"
                                onClick={() => handleSessionChange(s.k as "pagi" | "siang" | "seharian")}
                                className={`rounded-lg py-1.5 text-center text-xs font-semibold cursor-pointer transition-colors ${
                                  session === s.k
                                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300"
                                }`}
                              >
                                {s.l}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Nama PIC & Unit */}
                        <div className="p-2.5 bg-white dark:bg-neutral-900 space-y-2">
                          <div>
                            <Label htmlFor="res-name" className="block text-[10px] font-bold text-neutral-800 uppercase dark:text-neutral-300">
                              Nama Pemesan / PIC
                            </Label>
                            <Input
                              id="res-name"
                              placeholder="Nama lengkap"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="h-8 border-none p-0 text-xs font-semibold focus-visible:ring-0 shadow-none bg-transparent"
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="res-unit" className="block text-[10px] font-bold text-neutral-800 uppercase dark:text-neutral-300 mb-0.5">
                              Unit Kerja
                            </Label>
                            <Select value={institutionName} onValueChange={setInstitutionName}>
                              <SelectTrigger id="res-unit" className="h-7 text-xs border-none p-0 focus:ring-0 shadow-none bg-transparent font-medium">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {UNIT_KERJA_OPTIONS.map((item) => (
                                  <SelectItem key={item} value={item}>
                                    {item}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Peserta & Agenda */}
                        <div className="p-2.5 bg-white dark:bg-neutral-900 space-y-2">
                          <div>
                            <Label htmlFor="res-pax" className="block text-[10px] font-bold text-neutral-800 uppercase dark:text-neutral-300">
                              Estimasi Jumlah Peserta
                            </Label>
                            <Input
                              id="res-pax"
                              type="number"
                              min={1}
                              max={room.capacity * 2}
                              value={participantsCount}
                              onChange={(e) => setParticipantsCount(Number(e.target.value))}
                              className="h-8 border-none p-0 text-xs font-semibold focus-visible:ring-0 shadow-none bg-transparent"
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="res-agenda" className="block text-[10px] font-bold text-neutral-800 uppercase dark:text-neutral-300">
                              Agenda Kegiatan / Rapat
                            </Label>
                            <Input
                              id="res-agenda"
                              placeholder="Contoh: Rapat Koordinasi Diklat"
                              value={purpose}
                              onChange={(e) => setPurpose(e.target.value)}
                              className="h-8 border-none p-0 text-xs font-semibold focus-visible:ring-0 shadow-none bg-transparent"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Signature Airbnb Primary Coral Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-xl bg-[#FF385C] hover:bg-[#D90B38] text-white py-3.5 text-sm font-bold shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Memproses Reservasi...
                          </span>
                        ) : (
                          "Konfirmasi Reservasi"
                        )}
                      </button>
                    </form>
                  </div>
                </div>

              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
