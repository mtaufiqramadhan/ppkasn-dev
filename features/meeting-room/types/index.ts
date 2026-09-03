export const UNIT_KERJA_OPTIONS = [
  "PUSBINTER",
  "PUSBIN AKS",
  "PPKASN",
  "Assessment Center",
] as const;

export type UnitKerjaOption = (typeof UNIT_KERJA_OPTIONS)[number];

export type ISOString = string;
export type RoomId = string;
export type BookingId = string;

export interface Room {
  readonly id: RoomId;
  readonly name: string;
  readonly floor: number;
  readonly capacity: number;
  readonly features: string[];
  readonly location?: string;
}

export interface BookingPayload {
  readonly bookingStart: ISOString;
  readonly bookingEnd?: ISOString;
  readonly startTime?: string;
  readonly endTime?: string;
  readonly name: string;
  readonly institutionName: string;
  readonly purpose?: string;
  readonly notes?: string;
  readonly userId?: string;
  readonly institutionType?: string;
  readonly phoneNumber?: string;
  readonly attendees?: number;
  readonly roomSetup?: string;
}

export type BookingStatus = "confirmed" | "cancelled";

export interface Booking {
  readonly id: BookingId;
  readonly payload: BookingPayload;
  readonly roomIds: RoomId[];
  readonly createdAt?: string;
  readonly status?: BookingStatus;
}

export interface DetailState {
  readonly booking: Booking;
  readonly room?: Room;
}
