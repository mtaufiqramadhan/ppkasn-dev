export const WORKING_HOURS = { start: 8, end: 20 } as const;
export const TIME_REGEX = /^\d{2}:\d{2}$/;
export const PHONE_REGEX = /^[0-9+\-() ]{8,20}$/;

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
  readonly category?: string;
  readonly location?: string;
  readonly images?: string[];
  readonly rating?: number;
  readonly reviewCount?: number;
  readonly priceLabel?: string;
  readonly badge?: string;
  readonly description?: string;
}

export type AssetType = "ruang_rapat" | "ruangan" | "asrama";

export type RoomCategory =
  | "all"
  | "ruang_rapat"
  | "ruang_daring"
  | "ruang_diskusi"
  | "auditorium"
  | "studio_lab"
  | "asrama"
  | "diskusi"; // legacy compatibility alias

export type TimeSlotType = "all" | "pagi" | "siang" | "seharian";

export interface BookingFilterCriteria {
  searchTerm: string;
  category: RoomCategory;
  floor: number | "all";
  minCapacity: number;
  selectedFeatures: string[];
  selectedDate: string; // YYYY-MM-DD
  timeSlot: TimeSlotType;
}

export interface ChisfisRoom extends Room {
  readonly assetType?: AssetType;
  readonly category: string;
  readonly location: string;
  readonly images: string[];
  readonly rating: number;
  readonly reviewCount: number;
  readonly priceLabel: string;
  readonly badge?: string;
  readonly description?: string;
  readonly isFavorite?: boolean;
}

export type InstitutionType = "Kemensetneg" | "Non-Kemensetneg";
export type RoomSetup = "Island" | "U-shape" | "Classroom";

export interface Participant {
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
  purpose: string;
  notes?: string;
  userId?: string;
  phoneNumber?: string;
  institutionType?: InstitutionType;
  roomSetup?: RoomSetup;
  attendees?: number;
  participants?: Participant[];
  roomAssignments?: Record<string, string[]>;
}

export interface SuccessBookingDetails {
  id: string;
  assetType: AssetType;
  roomName: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  name: string;
  phoneNumber?: string;
  institutionName: string;
  institutionType?: string;
  purpose: string;
  attendees?: number;
  roomSetup?: RoomSetup;
  participants?: Participant[];
  notes?: string;
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
