"use client";

import React, {
  useState,
  useMemo,
  useEffect,
  Suspense,
  useCallback,
  memo,
} from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  PlusCircle,
  Search,
  ChevronDown,
  Loader2,
  MapPin,
  Trash2,
  DatabaseBackup,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Loader from "@/components/ui/loader";
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  displayAssetSchema,
  type Asset,
  type AssetStatus,
} from "@/features/assets";
import { AssetService } from "../services/asset-service";

type SortColumn = "id" | "name" | "location" | "status";
type SortDirection = "asc" | "desc";
type BookingStatusMap = Record<string, AssetStatus>;

interface DeleteDialogProps {
  assetName: string;
  isDeleting: boolean;
  onConfirm: () => void;
}

const DeleteDialog = memo(({ assetName, isDeleting, onConfirm }: DeleteDialogProps) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button
        variant="destructive"
        size="sm"
        disabled={isDeleting}
        className="w-8 h-8 p-0 flex items-center justify-center"
        aria-label={`Hapus ${assetName}`}
      >
        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent className="shadow-none border-dashed border-black sm:rounded-xl">
      <AlertDialogHeader>
        <AlertDialogTitle>Konfirmasi</AlertDialogTitle>
        <AlertDialogDescription>
          Apakah Anda yakin ingin menghapus aset <strong>{assetName}</strong>?
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel className="shadow-none border-dashed border-slate-300 rounded-lg">Batal</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700 shadow-none rounded-lg border-transparent">
          Hapus
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
));
DeleteDialog.displayName = "DeleteDialog";

interface AssetRowProps {
  asset: Asset;
  liveStatus: AssetStatus;
  isDeleting: boolean;
  onDelete: () => void;
}

const AssetRow = memo(({ asset, liveStatus, isDeleting, onDelete }: AssetRowProps) => {
  const validationError = (asset as Asset & { _validationError?: unknown })._validationError;

  return (
    <TableRow className="hover:bg-gray-50/50 transition-colors border-b border-dashed border-gray-200 last:border-0">
      <TableCell className="font-mono text-xs py-4 text-gray-500">
        {asset.assetsId || "-"}
      </TableCell>
      <TableCell className="font-medium py-4">
        <div className="flex items-center gap-3">
          <div>
            <div className="font-medium flex items-center gap-2 text-sm text-gray-900">
              {asset.name}
              {Boolean(validationError) && (
                <span
                  className="text-xs text-red-500 bg-red-50 px-1.5 py-0.5 rounded border border-red-200 cursor-help"
                  title={JSON.stringify(validationError)}
                >
                  Invalid
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{asset.category}</div>
          </div>
        </div>
      </TableCell>
      <TableCell className="py-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-black" />
          <span>{asset.location || "-"}</span>
        </div>
      </TableCell>
      <TableCell className="py-4">
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
            liveStatus === "tersedia"
              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
              : "bg-rose-50 text-rose-700 border-rose-100"
          }`}
        >
          {liveStatus.charAt(0).toUpperCase() + liveStatus.slice(1)}
        </span>
      </TableCell>
      <TableCell className="py-3 text-right">
        <div className="flex justify-end gap-2">
          <Link href={`/assets/${asset.assetsId}`}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs font-medium text-gray-600 border border-dashed border-black hover:text-gray-900 hover:bg-gray-100"
            >
              Detail
            </Button>
          </Link>
          <DeleteDialog
            assetName={asset.name}
            isDeleting={isDeleting}
            onConfirm={onDelete}
          />
        </div>
      </TableCell>
    </TableRow>
  );
});
AssetRow.displayName = "AssetRow";

function Pagination({
  current,
  total,
  perPage,
  count,
  onChange,
}: {
  current: number;
  total: number;
  perPage: number;
  count: number;
  onChange: (page: number) => void;
}) {
  const start = (current - 1) * perPage + 1;
  const end = Math.min(current * perPage, count);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-2 py-4 border-t border-gray-100">
      <div className="text-sm text-gray-700 mb-4 sm:mb-0">
        Menampilkan {start} - {end} dari {count} aset
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onChange(current - 1)}
          disabled={current <= 1}
        >
          Sebelumnya
        </Button>
        <span className="text-sm text-gray-700 min-w-[3rem] text-center">
          {current} / {total}
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onChange(current + 1)}
          disabled={current >= total}
        >
          Selanjutnya
        </Button>
      </div>
    </div>
  );
}

function FilterDropdown<T extends string | number>({
  label,
  value,
  options,
  onSelect,
}: {
  label: string;
  value: T | null;
  options: T[];
  onSelect: (val: T | null) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 bg-white border-dashed border-black hover:border-black/70 shadow-none"
          suppressHydrationWarning
        >
          <span>
            {label}: {value ? String(value) : "Semua"}
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-[200px] shadow-none border-dashed border-black rounded-xl">
        <DropdownMenuItem onClick={() => onSelect(null)}>
          <span className="text-gray-700">Semua {label.toLowerCase()}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {options.map((option) => (
          <DropdownMenuItem
            key={String(option)}
            onClick={() => onSelect(option)}
            className="flex items-center gap-2"
          >
            <span>{String(option)}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const EmptyState = memo(({ message }: { message: string }) => (
  <div className="py-16 text-center">
    <svg
      className="mx-auto h-12 w-12 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
      />
    </svg>
    <h3 className="mt-2 text-sm font-medium text-gray-900">{message}</h3>
    <p className="mt-1 text-sm text-gray-500 mb-4">
      {message.includes("tidak ditemukan")
        ? "Coba ubah filter atau kata kunci pencarian"
        : "Tambahkan aset pertama Anda"}
    </p>
  </div>
));
EmptyState.displayName = "EmptyState";

export function AssetListView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [sortConfig, setSortConfig] = useState<{ column: SortColumn; direction: SortDirection }>({
    column: "name",
    direction: "asc",
  });

  const queryClient = useQueryClient();

  const { data: assets = [], isLoading, isError } = useQuery({
    queryKey: ["assets"],
    queryFn: AssetService.getAssets,
    staleTime: 1000 * 60 * 5,
  });

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: AssetService.deleteAsset,
    onMutate: async (id) => {
      setDeletingId(id);
      await queryClient.cancelQueries({ queryKey: ["assets"] });
      const previous = queryClient.getQueryData<Asset[]>(["assets"]);
      queryClient.setQueryData<Asset[]>(["assets"], (old = []) =>
        old.filter((asset) => asset.id !== id)
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      setDeletingId(null);
      if (context?.previous) {
        queryClient.setQueryData<Asset[]>(["assets"], context.previous);
      }
      toast.error("Gagal menghapus aset");
    },
    onSuccess: () => {
      toast.success("Aset berhasil dihapus");
    },
    onSettled: () => {
      setDeletingId(null);
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });

  const [statusMap, setStatusMap] = useState<BookingStatusMap>({});

  useEffect(() => {
    const bookableIds = assets
      .filter((a) => a.type === "ruangan" || a.type === "asrama")
      .map((a) => a.id);

    if (bookableIds.length === 0) return;

    const syncStatus = async () => {
      try {
        const busy = await AssetService.getActiveBookings(bookableIds);
        const nextMap: BookingStatusMap = {};
        bookableIds.forEach((id) => {
          nextMap[id] = busy[id] ? "dipinjam" : "tersedia";
        });
        setStatusMap(nextMap);
      } catch (err) {
        console.error("Failed to sync status", err);
      }
    };

    syncStatus();
    const intervalId = window.setInterval(syncStatus, 60_000);
    return () => window.clearInterval(intervalId);
  }, [assets]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("assets-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "assets" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["assets"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const processedAssets = useMemo(() => {
    const validated = assets.map((a) => {
      const result = displayAssetSchema.safeParse(a);
      return result.success ? a : { ...a, _validationError: result.error.format() };
    });

    return validated
      .filter((asset) => {
        const liveStatus = (asset.type === "ruangan" || asset.type === "asrama")
          ? statusMap[asset.id] ?? asset.status
          : asset.status;

        if (statusFilter && liveStatus !== statusFilter) return false;
        if (categoryFilter && asset.category !== categoryFilter) return false;

        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          return (
            asset.name.toLowerCase().includes(term) ||
            asset.id.toLowerCase().includes(term) ||
            (asset.assetsId?.toLowerCase() || "").includes(term) ||
            asset.location.toLowerCase().includes(term)
          );
        }
        return true;
      })
      .sort((a, b) => {
        const getVal = (item: Asset) => {
          if (sortConfig.column === "status") {
            return (item.type === "ruangan" || item.type === "asrama")
              ? statusMap[item.id] ?? item.status
              : item.status;
          }
          if (sortConfig.column === "id") return item.assetsId ?? "";
          return String(item[sortConfig.column as keyof Asset] ?? "");
        };

        const vA = getVal(a).toLowerCase();
        const vB = getVal(b).toLowerCase();

        return sortConfig.direction === "asc"
          ? vA.localeCompare(vB)
          : vB.localeCompare(vA);
      });
  }, [assets, searchTerm, statusFilter, categoryFilter, sortConfig, statusMap]);

  const totalPages = Math.max(1, Math.ceil(processedAssets.length / itemsPerPage));
  const paginatedAssets = processedAssets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const categories = useMemo(() =>
    [...new Set(assets.map((a) => a.category).filter(Boolean))].sort(),
    [assets]
  );

  const statusOptions = useMemo(() => {
    const statuses = new Set<string>();
    assets.forEach((a) => {
      const s = (a.type === "ruangan" || a.type === "asrama")
        ? statusMap[a.id] ?? a.status
        : a.status;
      statuses.add(s);
    });
    return Array.from(statuses).sort();
  }, [assets, statusMap]);

  const handleSort = useCallback((column: SortColumn) => {
    setSortConfig((prev) => ({
      column,
      direction: prev.column === column && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  if (isError) return <EmptyState message="Gagal memuat data aset." />;

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 mb-6">
      <Suspense fallback={<Loader />}>
        <div className="bg-white rounded-xl border border-dashed border-black p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="flex-1 max-w-[446px] relative">
              <Input
                placeholder="Cari aset..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-12 border-dashed border-black bg-white"
                aria-label="Cari aset"
              />
              <Search className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <div className="flex items-center gap-2">
              <Link href="/backup-restore">
                <Button variant="outline" className="flex items-center gap-2 border-dashed border-black bg-white hover:bg-slate-50">
                  <DatabaseBackup className="h-4 w-4" />
                  <span className="hidden sm:inline">Backup & Restore</span>
                </Button>
              </Link>
              <Link href="/assets/add">
                <Button className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  <span>Tambah Data</span>
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            <FilterDropdown
              label="Status"
              value={statusFilter}
              options={statusOptions}
              onSelect={(v) => {
                setStatusFilter(v as string);
                setCurrentPage(1);
              }}
            />
            <FilterDropdown
              label="Kategori"
              value={categoryFilter}
              options={categories}
              onSelect={(v) => {
                setCategoryFilter(v as string);
                setCurrentPage(1);
              }}
            />
            <FilterDropdown
              label="Halaman"
              value={itemsPerPage}
              options={[10, 20, 50]}
              onSelect={(v) => {
                setItemsPerPage(Number(v));
                setCurrentPage(1);
              }}
            />
          </div>

          {isLoading ? (
            <div className="py-20 text-center text-gray-500 flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p>Memuat data...</p>
            </div>
          ) : (
            <div className="border-0 rounded-none overflow-hidden">
              <Table>
                <TableHeader className="bg-transparent border-b">
                  <TableRow>
                    {(["id", "name", "location", "status"] as SortColumn[]).map((col) => (
                      <TableHead
                        key={col}
                        onClick={() => handleSort(col)}
                        className="cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-1">
                          {col === "id"
                            ? "ID"
                            : col === "name"
                              ? "Nama Aset"
                              : col.charAt(0).toUpperCase() + col.slice(1)}
                          {sortConfig.column === col && (
                            <span className="text-[10px] ml-1 text-gray-400">
                              {sortConfig.direction === "asc" ? "▲" : "▼"}
                            </span>
                          )}
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAssets.map((asset) => {
                    const liveStatus =
                      (asset.type === "ruangan" || asset.type === "asrama")
                        ? statusMap[asset.id] ?? asset.status
                        : asset.status;

                    return (
                      <AssetRow
                        key={asset.id}
                        asset={asset}
                        liveStatus={liveStatus}
                        onDelete={() => deleteMutation.mutate(asset.id)}
                        isDeleting={deletingId === asset.id}
                      />
                    );
                  })}
                </TableBody>
              </Table>
              {processedAssets.length === 0 ? (
                <EmptyState message="Data tidak tersedia" />
              ) : (
                <Pagination
                  current={currentPage}
                  total={totalPages}
                  perPage={itemsPerPage}
                  count={processedAssets.length}
                  onChange={setCurrentPage}
                />
              )}
            </div>
          )}
        </div>
      </Suspense>
    </div>
  );
}
