export type ISOString = string;
export type RoomId = string;
export type BookingId = string;

export interface Room {
  readonly id: RoomId;
  readonly name: string;
  readonly floor: number | string;
}

export interface BookingPayload {
  readonly bookingStart: ISOString;
  readonly bookingEnd?: ISOString;
  readonly startTime?: string;
  readonly endTime?: string;
  readonly name: string;
  readonly institutionType: string;
  readonly institutionName: string;
  readonly phoneNumber: string;
  readonly purpose?: string;
  readonly notes?: string;
  readonly roomSetup: "Island" | "U-shape";
  readonly attendees: number;
}

export interface Booking {
  readonly id: BookingId;
  readonly payload: BookingPayload;
  readonly roomIds: RoomId[];
}

export interface DetailState {
  readonly roomId?: RoomId;
  readonly items: Booking[];
  readonly title?: string;
}

export type BookingsMap = Record<RoomId, Record<string, Booking[]>>;

export interface CalendarCell {
  readonly startDay: number;
  readonly span: number;
  readonly items: Booking[];
}
