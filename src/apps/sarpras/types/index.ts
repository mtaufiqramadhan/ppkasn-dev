import type React from "react";

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export type LucideIcon = React.ComponentType<{ className?: string; size?: number | string }>;

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
