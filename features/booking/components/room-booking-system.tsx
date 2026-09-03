"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Field, FieldContent } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { bookingSchema, type BookingFormData } from "../schemas/booking-schema";
import { type Booking } from "../types";
import { DateUtils } from "../utils/date-utils";
import { useServices } from "../context/services-context";
import { useRoomManager, useBookingOverlapChecker } from "../hooks/use-room-manager";
import { RoomSelector } from "./room-selector";
import {
  ActivityTimeSection,
  UserInfoSection,
  ActivityNameSection,
} from "./booking-form-sections";

export const RoomBookingSystem: React.FC = () => {
  const router = useRouter();
  const { bookingRepo } = useServices();
  const checkOverlap = useBookingOverlapChecker();

  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");
  const initialDate = dateParam ? new Date(dateParam) : null;

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    mode: "onChange",
    defaultValues: {
      bookingStart: initialDate,
      bookingEnd: initialDate,
      startTime: "08:00",
      endTime: "09:00",
      name: "",
      institutionName: "",
      purpose: "",
      notes: "",
    },
  });

  const {
    handleSubmit,
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
            if (checkOverlap(startISO, endISO, startT, endT, b)) {
              newBooked.add(rid);
            }
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
          purpose: data.purpose,
          notes: data.notes,
        },
      };

      await bookingRepo.createBooking(payload);
      toast.success("Booking Berhasil Disimpan!");
      router.push("/");

      reset();
      setSelectedRooms([]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal membuat booking";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-8 px-4 sm:px-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Form Peminjaman
          </h1>
          <p className="text-gray-500">
            Ajukan permohonan peminjaman ruang rapat
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ActivityTimeSection form={form} />
            <UserInfoSection form={form} />
          </div>

          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ActivityNameSection form={form} />
          </div>

          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border border-dashed border-slate-300 shadow-none bg-white rounded-xl overflow-hidden">
              <CardHeader className="bg-white border-b border-dashed border-slate-300 pb-6 pt-3 px-6 items-center">
                <CardTitle className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                  <Building2 className="w-6 h-6 text-black" strokeWidth={1.5} />
                  Pilih Ruangan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
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
                  Catatan Tambahan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Field>
                  <FieldContent>
                    <Textarea
                      {...form.register("notes")}
                      placeholder="Masukkan kebutuhan tambahan atau informasi lainnya"
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
    </div>
  );
};
