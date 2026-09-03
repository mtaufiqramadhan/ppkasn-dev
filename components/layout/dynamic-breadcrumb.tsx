"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const ROUTE_NAME_MAP: Record<string, string> = {
  dashboard: "Dashboard",
  assets: "Kelola Aset",
  room: "Peminjaman Ruangan",
  "meeting-room": "Ruang Rapat",
  dorm: "Peminjaman Asrama",
  booking: "Form Peminjaman",
  "backup-restore": "Backup & Restore",
  add: "Tambah Baru",
  data: "Data Peminjaman",
};

export function DynamicBreadcrumb() {
  const pathname = usePathname();

  const segments = pathname.split("/").filter((item) => item !== "");

  const formatSegmentTitle = (segment: string): string => {
    if (ROUTE_NAME_MAP[segment]) {
      return ROUTE_NAME_MAP[segment];
    }
    return segment
      .replace(/-/g, " ")
      .split(" ")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink asChild>
            <Link href="/dashboard">Sarpras</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {segments.length > 0 && <BreadcrumbSeparator className="hidden md:block" />}

        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          const href = `/${segments.slice(0, index + 1).join("/")}`;
          const title = formatSegmentTitle(segment);

          return (
            <React.Fragment key={href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{title}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{title}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator className="hidden md:block" />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
