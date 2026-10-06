"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useForm, useWatch, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Building2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Field, FieldContent } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

import {
  type Booking,
  type BookingFormData,
  bookingSchema,
  DateUtils,
  ServicesProvider,
  useServices,
  useRoomManager,
  useBookingOverlapChecker,
  RoomSelector,
  ActivityTimeSection,
  UserInfoSection,
  ActivityNameSection,
} from "@/features/booking";

const WORKING_HOURS = { start: 8, end: 20 } as const;

export const RoomBookingSystem: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
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
      router.push(pathname.startsWith("/cms") ? "/cms/room" : "/room");

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
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
          Tambah Jadwal
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Ajukan jadwal peminjaman ruangan
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
          <Card className="border border-dashed border-neutral-300 dark:border-neutral-700 shadow-none bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-3xl overflow-hidden">
            <CardHeader className="bg-white dark:bg-neutral-900 border-b border-dashed border-neutral-300 dark:border-neutral-700 pb-6 pt-3 px-6 items-center">
              <CardTitle className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-3">
                <Building2 className="w-6 h-6 text-neutral-900 dark:text-white" strokeWidth={1.5} />
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
              <div className="flex items-center justify-between mt-6 p-4 bg-neutral-50 dark:bg-neutral-800 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl sm:rounded-3xl">
                <span className="text-sm font-semibold text-neutral-900 dark:text-white tracking-tight">
                  Ruangan Terpilih:
                </span>
                <Badge
                  variant="default"
                  className="bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 border-none rounded-2xl sm:rounded-3xl px-4 py-1.5 font-bold shadow-none"
                >
                  {selectedRooms.length}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border border-dashed border-neutral-300 dark:border-neutral-700 shadow-none bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-3xl overflow-hidden">
            <CardHeader className="bg-white dark:bg-neutral-900 border-b border-dashed border-neutral-300 dark:border-neutral-700 pb-6 pt-3 px-6 items-center">
              <CardTitle className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-3">
                Catatan Tambahan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Field>
                <FieldContent>
                  <Textarea
                    {...form.register("notes")}
                    placeholder="Masukkan kebutuhan tambahan atau informasi lainnya"
                    className="min-h-[120px] bg-neutral-50 dark:bg-neutral-800 border-dashed border-neutral-300 dark:border-neutral-700 focus:border-solid focus:border-neutral-900 dark:focus:border-white focus:ring-0 rounded-2xl sm:rounded-3xl p-4"
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
            className="w-full sm:w-auto px-10 bg-primary hover:bg-primary/90 text-primary-foreground shadow-none transition-all rounded-2xl sm:rounded-3xl font-bold h-12 text-base cursor-pointer"
          >
            {isSubmitting ? "Memproses..." : "Konfirmasi Booking"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export function RoomBookingForm() {
  return (
    <ServicesProvider>
      <RoomBookingSystem />
    </ServicesProvider>
  );
}

export default RoomBookingForm;
