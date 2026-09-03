"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { startOfMonth, endOfMonth, subMonths, addMonths } from "date-fns";
import {
  type Room,
  type Booking,
} from "../types";
import {
  roomService,
  bookingService,
} from "../services/meeting-room-service";

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

  return {
    rooms,
    bookings,
    loading,
    error,
    refresh,
  };
}
