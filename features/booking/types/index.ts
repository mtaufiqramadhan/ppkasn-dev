export const WORKING_HOURS = { start: 8, end: 20 } as const;
export const TIME_REGEX = /^\d{2}:\d{2}$/;

export const UNIT_KERJA_OPTIONS = [
  "PUSBINTER",
  "PUSBIN AKS",
  "PPKASN",
  "Assessment Center",
] as const;

export type UnitKerjaOption = (typeof UNIT_KERJA_OPTIONS)[number];
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
  purpose: string;
  notes?: string;
  userId?: string;
}

export interface Booking {
  readonly id: string;
  readonly roomIds: string[];
  readonly createdAt: string;
  readonly status: "confirmed" | "cancelled";
  readonly payload: BookingPayload;
}

export interface DBAssetRow {
  id: string;
  name: string | null;
  floor: number | string | null;
  capacity: number | string | null;
  facilities: string[] | string | null;
  category?: string | null;
  type?: string | null;
}

export interface DBRoomBookingRow {
  id: string;
  room_ids: string[] | null;
  created_at: string;
  status: string;
  payload: Partial<BookingPayload> | null;
}

export interface IRoomRepository {
  getRoomsForRange(start?: Date | null, end?: Date | null): Promise<Room[]>;
}

export interface IBookingRepository {
  createBooking(
    data: Omit<Booking, "id" | "createdAt" | "status">
  ): Promise<string>;
  listBookingsOverlapping(startISO: string, endISO: string): Promise<Booking[]>;
}

export interface BookingServices {
  roomRepo: IRoomRepository;
  bookingRepo: IBookingRepository;
}
