"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import {
  type Booking,
  type Room,
  type IRoomRepository,
  type IBookingRepository,
} from "../types";
import { DateUtils } from "../utils/date-utils";
import { useServices } from "../context/services-context";

export const useBookingOverlapChecker = () => {
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

      if (!DateUtils.dateRangesOverlap(startISO, endISO, bStart, bEnd)) {
        return false;
      }
      return DateUtils.timesOverlap(sTime, eTime, bSTime, bETime);
    },
    []
  );
};

export function useRoomManager(
  bookingStart: Date | null | undefined,
  bookingEnd: Date | null | undefined,
  startTime: string,
  endTime: string,
  roomRepoOverride?: IRoomRepository,
  bookingRepoOverride?: IBookingRepository
) {
  const contextServices = useServices();
  const roomRepo = roomRepoOverride ?? contextServices.roomRepo;
  const bookingRepo = bookingRepoOverride ?? contextServices.bookingRepo;
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
}
