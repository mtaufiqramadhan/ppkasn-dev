"use client";

import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePagination } from "@/components/ui/table-pagination";
import { useTablePagination } from "@/hooks/use-table-pagination";

import { type Asset } from "../types";

export interface AssetTableProps {
  data: Asset[];
  title: string;
  rowsPerPage?: number;
}

export function AssetTable({
  data,
  title,
  rowsPerPage = 5,
}: AssetTableProps) {
  const pagination=useTablePagination(data.length,"",rowsPerPage);
  const paginatedData=useMemo(()=>data.slice(pagination.startIndex,pagination.endIndex),[data,pagination.startIndex,pagination.endIndex]);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      <Table className="border border-dashed rounded-2xl sm:rounded-3xl">
        <TableHeader>
          <TableRow>
            <TableHead>Kode</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((asset) => (
            <TableRow key={asset.id}>
              <TableCell className="truncate">{asset.id ?? "—"}</TableCell>
              <TableCell className="truncate max-w-[18rem]">
                {asset.name}
              </TableCell>
              <TableCell className="capitalize">{asset.status}</TableCell>
            </TableRow>
          ))}

          {paginatedData.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={3}
                className="text-center text-muted-foreground"
              >
                Tidak ada data
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <TablePagination {...pagination} itemLabel="aset" />
    </div>
  );
}
