import { apiClient } from "@/lib/api-client";
import {
  type ExportFormat,
  type TableOption,
  type BackupStats,
  type RestoreResult,
} from "../types";

export const BackupRestoreService = {
  async getStats(): Promise<BackupStats> {
    const data = await apiClient<{ stats: BackupStats }>("/api/backup", {
      params: { stats: "true" },
    });
    return data.stats;
  },

  getDownloadUrl(format: ExportFormat, table: TableOption): string {
    return `/api/backup?format=${format}&table=${table}`;
  },

  async restoreFromFile(file: File, table: TableOption): Promise<RestoreResult> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("table", table);

    return apiClient<RestoreResult>("/api/restore", {
      method: "POST",
      body: formData,
    });
  },
};
