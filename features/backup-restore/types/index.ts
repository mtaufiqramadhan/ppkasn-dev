export type ExportFormat = "json" | "csv" | "sql";
export type TableOption = "all" | "assets" | "room_bookings";

export interface BackupStats {
  assets: number;
  room_bookings: number;
  total: number;
  timestamp?: string;
}

export interface RestoreResult {
  success: boolean;
  count: number;
  details: {
    assets: number;
    room_bookings: number;
  };
  message: string;
}
