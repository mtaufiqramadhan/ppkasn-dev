import { type z } from "zod";
import { type assetSchema, type displayAssetSchema } from "../schemas/asset-schema";

export type { AssetStatus, ValidAssetType } from "../schemas/asset-schema";
export type Asset = z.infer<typeof assetSchema>;
export type DisplayAsset = z.infer<typeof displayAssetSchema>;

export interface DBAssetRow {
  id: string;
  assets_id?: string;
  name: string;
  type: string;
  category: string;
  location: string;
  status: string;
  brand?: string;
  model?: string;
  notes?: string;
  added_by?: string;
  created_at: string;
  updated_at: string;
  last_borrowed_by?: string;
  last_borrowed_at?: string;
  last_returned_at?: string;
  serial_number?: string;
  license_plate?: string;
  vehicle_type?: string;
  year?: number;
  fuel_type?: string;
  stnk_year?: number;
  stnk_month?: number;
  mileage?: number;
  material?: string;
  dimensions?: string;
  capacity?: number;
  floor?: number;
  room_size?: string;
  facilities?: string | string[];
}
