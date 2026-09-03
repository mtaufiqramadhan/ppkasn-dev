"use client";

import { useQuery } from "@tanstack/react-query";
import { DashboardService } from "../services/dashboard-service";
import { type Asset } from "../types";

export function useDashboardData(filterStart?: Date, filterEnd?: Date) {
  return useQuery<Asset[], Error>({
    queryKey: ["assets", filterStart?.toISOString(), filterEnd?.toISOString()],
    queryFn: () => DashboardService.fetchAssets(filterStart, filterEnd),
    staleTime: 1000 * 30,
    retry: 1,
  });
}
