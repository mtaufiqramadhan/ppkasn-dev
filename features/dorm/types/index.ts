export interface Room {
  id: string;
  name: string;
  floor: number;
  capacity: number;
  features: string[];
  status: "available" | "booked" | "selected";
}

export interface BookingParticipant {
  id: string;
  name: string;
  gender: "L" | "P";
  unitKerja: string;
  instansi: string;
}

export interface BookingPayload {
  bookingStart: string;
  bookingEnd: string;
  startTime: string;
  endTime: string;
  name: string;
  institutionName: string;
  phoneNumber: string;
  purpose?: string;
  institutionType: string;
  participants?: BookingParticipant[];
  roomAssignments?: Record<string, string[]>;
}

export interface Booking {
  id: string;
  roomIds: string[];
  createdAt: string;
  status: "confirmed" | "cancelled";
  payload: BookingPayload;
}

export interface IRoomRepository {
  getRoomsForRange(start?: Date | null, end?: Date | null): Promise<Room[]>;
}

export interface IBookingRepository {
  createBooking(
    data: Omit<Booking, "id" | "createdAt" | "status">
  ): Promise<string>;
  listBookingsOverlapping(startISO: string, endISO: string): Promise<Booking[]>;
  deleteBooking(id: string): Promise<void>;
}
