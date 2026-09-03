"use client";

import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));
  const safePage = page >= totalPages ? 0 : page;
  const paginatedData = useMemo(() => {
    const start = safePage * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  }, [data, safePage, rowsPerPage]);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      <Table className="border border-dashed rounded-lg">
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

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Halaman {safePage + 1} dari {totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={safePage === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Sebelumnya
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={safePage >= totalPages - 1}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          >
            Berikutnya
          </Button>
        </div>
      </div>
    </div>
  );
}
