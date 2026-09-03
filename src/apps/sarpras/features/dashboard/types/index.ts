export type AssetStatus = "tersedia" | "dipinjam" | string;

export interface Asset {
  id: string;
  type?: string;
  name?: string;
  code?: string;
  location?: string;
  status?: AssetStatus;
  [k: string]: unknown;
}

export type DashboardAsset = Asset;

export interface PieDatum {
  name: string;
  value: number;
  color?: string;
  [key: string]: unknown;
}

export interface RouteResolution {
  detailPath: string;
  bookingPath?: string;
}
