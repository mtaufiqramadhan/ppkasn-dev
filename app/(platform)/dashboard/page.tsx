"use client";

import React, { JSX, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Package,
  ListChecks,
  Loader2,
  PackageX,
  PackageCheck,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Sector,
  Cell,
  Tooltip,
  SectorProps,
} from "recharts";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

type AssetStatus = "tersedia" | "dipinjam" | string;

export type Asset = {
  id: string;
  type?: string;
  name?: string;
  code?: string;
  location?: string;
  status?: AssetStatus;
  [k: string]: unknown;
};

type PieDatum = {
  name: string;
  value: number;
  color?: string;
};

const bookingPayloadSchema = z
  .object({
    bookingStart: z.string().optional().nullable(),
    bookingEnd: z.string().optional().nullable(),
    startTime: z.string().optional().nullable(),
    endTime: z.string().optional().nullable(),
  })
  .passthrough();

function combineDateAndTime(
  dateValue?: unknown,
  timeValue?: unknown,
  isEnd = false
): Date | null {
  if (!dateValue || typeof dateValue !== "string") return null;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;

  if (!timeValue || typeof timeValue !== "string") {
    if (isEnd) {
      date.setHours(23, 59, 59, 999);
      return date;
    }
    date.setHours(0, 0, 0, 0);
    return date;
  }

  const [hoursStr, minutesStr, secondsStr] = timeValue.split(":");
  const hours = Number.parseInt(hoursStr ?? "0", 10);
  const minutes = Number.parseInt(minutesStr ?? "0", 10);
  const seconds = Number.parseInt(secondsStr ?? (isEnd ? "59" : "0"), 10);
  date.setHours(hours, minutes, seconds, isEnd ? 999 : 0);
  return date;
}

function isInRange(
  start: Date | null | undefined,
  end: Date | null | undefined,
  filterStart: Date | null | undefined,
  filterEnd: Date | null | undefined
): boolean {
  if (!start || !end || !filterStart) return false;

  const effectiveFilterEnd = filterEnd
    ? filterEnd
    : new Date(
      filterStart.getFullYear(),
      filterStart.getMonth(),
      filterStart.getDate(),
      23,
      59,
      59,
      999
    );
  return (
    start.getTime() <= effectiveFilterEnd.getTime() &&
    end.getTime() >= filterStart.getTime()
  );
}

async function fetchAssets(
  filterStart?: Date,
  filterEnd?: Date
): Promise<Asset[]> {
  const supabase = createClient();

  const { data: rawAssets, error: assetsError } = await supabase
    .from("assets")
    .select("*");

  if (assetsError) {
    throw new Error(assetsError.message);
  }

  const raw: Asset[] = (rawAssets || []).map((d) => ({
    id: d.id,
    ...(d as Record<string, unknown>),
  }));

  const effectiveFilterEnd = filterEnd
    ? filterEnd
    : filterStart
      ? new Date(
        filterStart.getFullYear(),
        filterStart.getMonth(),
        filterStart.getDate(),
        23,
        59,
        59,
        999
      )
      : undefined;

  const { data: bookingsData } = await supabase
    .from("room_bookings")
    .select("*")
    .eq("status", "confirmed");

  const bookings = bookingsData || [];

  const annotated = raw.map((asset) => {
    if (asset.type !== "ruangan" && asset.type !== "asrama") {
      return { ...asset, status: "tersedia" };
    }

    let isBooked = false;

    const relevantBookings = bookings.filter(b => {
      const roomIds = b.room_ids || [];
      return roomIds.includes(asset.id) || b.assetId === asset.id;
    });

    for (const rawDoc of relevantBookings) {
      const rawPayload = (rawDoc.payload ?? {}) as unknown;
      const parsed = bookingPayloadSchema.safeParse(rawPayload);
      if (!parsed.success) continue;

      const payload = parsed.data;
      const start = combineDateAndTime(
        payload.bookingStart ?? null,
        payload.startTime ?? null,
        false
      );
      const end = combineDateAndTime(
        payload.bookingEnd ?? payload.bookingStart ?? null,
        payload.endTime ?? null,
        true
      );

      if (isInRange(start, end, filterStart, effectiveFilterEnd)) {
        isBooked = true;
        break;
      }
    }

    return { ...asset, status: isBooked ? "dipinjam" : "tersedia" } as Asset;
  });

  return annotated;
}

function useAssetsQuery(filterStart?: Date, filterEnd?: Date) {
  return useQuery<Asset[], Error>({
    queryKey: ["assets", filterStart?.toISOString(), filterEnd?.toISOString()],
    queryFn: () => fetchAssets(filterStart, filterEnd),
    staleTime: 1000 * 30,
    retry: 1,
  });
}

type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

function StatCard({
  title,
  value,
  Icon,
}: {
  title: string;
  value: string | number;
  Icon: IconComponent;
}): JSX.Element {
  return (
    <Card className="p-4 sm:p-5 rounded-2xl bg-white/90 border border-dashed border-black shadow-sm h-full">
      <CardHeader className="flex w-full items-center justify-between p-0">
        <div className="flex items-center gap-3">
          <div className="rounded-xl p-2 bg-primary/10 ring-1 ring-primary/20">
            <Icon className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-muted-foreground tracking-tight">
            {title}
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-semibold tabular-nums tracking-tight">
          {value}
        </div>
      </CardHeader>
      <CardContent className="hidden" />
    </Card>
  );
}

function LoaderUI(): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-sm text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin" />
      <span>Memuat dashboard…</span>
    </div>
  );
}

function ErrorUI({ error }: { error: unknown }): JSX.Element {
  const message =
    error instanceof Error ? error.message : "Terjadi kesalahan tak terduga.";
  return (
    <Card className="p-6 rounded-2xl bg-destructive/5">
      <CardTitle className="text-base font-semibold tracking-tight">
        Gagal memuat data
      </CardTitle>
      <CardDescription className="text-sm">{message}</CardDescription>
    </Card>
  );
}

function InteractivePie({
  data,
  defaultCenterLabel,
  colors,
  ariaLabel,
  height = 200,
}: {
  data: PieDatum[];
  defaultCenterLabel?: string;
  colors?: string[];
  ariaLabel?: string;
  height?: number;
}): JSX.Element {
  const safeData = useMemo(() => data ?? [], [data]);
  const labels = useMemo(() => safeData.map((d) => d.name), [safeData]);
  const [activeName, setActiveName] = useState<string | undefined>(
    safeData[0]?.name
  );
  const activeIndex = useMemo(
    () => safeData.findIndex((d) => d.name === activeName),
    [safeData, activeName]
  );

  if (safeData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        Tidak ada data
      </div>
    );
  }

  const colorPalette = colors ?? [
    "#1A2A80",
    "#386641",
    "#0B57D0",
    "#B3261E",
    "#006875",
    "#7D5260",
  ];

  const renderActiveShape = (props: SectorProps): JSX.Element => {
    const { outerRadius = 0, ...rest } = props;
    return (
      <g>
        <Sector {...rest} outerRadius={outerRadius + 6} />
        <Sector
          {...rest}
          outerRadius={outerRadius + 16}
          innerRadius={outerRadius + 8}
          opacity={0.15}
        />
      </g>
    );
  };

  const active = safeData[activeIndex] ?? safeData[0];

  return (
    <div className="w-full">
      <div className="flex items-start gap-3 mb-3">
        <div className="text-sm font-medium tracking-tight text-foreground/90">
          {defaultCenterLabel ?? "Chart"}
        </div>
        <div className="w-[160px]">
          <Select
            value={activeName}
            onValueChange={(v) => v && setActiveName(v)}
          >
            <SelectTrigger className="h-9 rounded-xl" aria-label={ariaLabel}>
              <SelectValue placeholder="Pilih" />
            </SelectTrigger>
            <SelectContent align="end" className="rounded-2xl">
              {labels.map((label) => {
                const idx = safeData.findIndex((d) => d.name === label);
                const color =
                  safeData[idx]?.color ??
                  colorPalette[idx % colorPalette.length];
                return (
                  <SelectItem
                    key={label}
                    value={label}
                    className="rounded-xl [&_span]:flex"
                  >
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className="flex h-3 w-3 shrink-0 rounded"
                        style={{ backgroundColor: color }}
                      />
                      <span className="truncate max-w-[10rem]">{label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(val: unknown) =>
                typeof val === "number" ? val.toLocaleString() : String(val)
              }
            />
            <Pie
              data={safeData}
              dataKey="value"
              nameKey="name"
              innerRadius={height > 180 ? 40 : 30}
              outerRadius={height > 180 ? 72 : 50}
              activeShape={renderActiveShape}
              strokeWidth={4}
              paddingAngle={2}
              isAnimationActive
            >
              {safeData.map((entry, idx) => (
                <Cell
                  key={entry.name}
                  fill={entry.color ?? colorPalette[idx % colorPalette.length]}
                />
              ))}
            </Pie>

            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-foreground text-lg font-bold tracking-tight"
              style={{ pointerEvents: "none" }}
            >
              {typeof active?.value === "number"
                ? active.value.toLocaleString()
                : String(active?.value ?? "")}
            </text>

            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              dy={18}
              className="fill-muted-foreground text-xs"
              style={{ pointerEvents: "none" }}
            >
              {active?.name}
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function sortByName(a?: Asset, b?: Asset): number {
  const na = (a?.name ?? a?.id ?? "").toString().toLowerCase();
  const nb = (b?.name ?? b?.id ?? "").toString().toLowerCase();
  if (na < nb) return -1;
  if (na > nb) return 1;
  return 0;
}

function partitionAndSortByName(items: Asset[]) {
  const available = items
    .filter((i) => i.status === "tersedia")
    .sort(sortByName);
  const booked = items.filter((i) => i.status !== "tersedia").sort(sortByName);
  return { available, booked };
}

function groupAssetsByType(assets: Asset[]): Record<string, Asset[]> {
  return assets.reduce<Record<string, Asset[]>>((acc, asset) => {
    const type = (asset.type?.trim() || "lainnya").toLowerCase();
    if (!acc[type]) acc[type] = [];
    acc[type].push(asset);
    return acc;
  }, {});
}

const typeRouteMap: Record<
  string,
  { detailPath: string; bookingPath?: string }
> = {
  elektronik: { detailPath: "/assets" },
  perabot: { detailPath: "/assets" },
  kendaraan: { detailPath: "/assets" },
  ruangan: { detailPath: "/room", bookingPath: "/room/add" },
  asrama: { detailPath: "/dorm", bookingPath: "/dorm" },
  lainnya: { detailPath: "/assets" },
};

function resolveRoutesForType(type: string): {
  detailPath: string;
  bookingPath?: string;
} {
  const key = typeRouteMap[type] ? type : "lainnya";
  return typeRouteMap[key];
}

function AssetTable({
  data,
  title,
  rowsPerPage = 5,
}: {
  data: Asset[];
  title: string;
  rowsPerPage?: number;
}) {
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));
  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  }, [data, page, rowsPerPage]);

  useEffect(() => {
    if (page >= totalPages) setPage(0);
  }, [totalPages, page]);

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
          Halaman {page + 1} dari {totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Sebelumnya
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          >
            Berikutnya
          </Button>
        </div>
      </div>
    </div>
  );
}

function DateRangePicker({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}: {
  startDate: Date | undefined;
  endDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  setEndDate: (date: Date | undefined) => void;
}) {
  return (
    <div className="flex items-center gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !startDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {startDate ? (
              format(startDate, "PPP")
            ) : (
              <span>Pilih tanggal mulai</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={setStartDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !endDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {endDate ? (
              format(endDate, "PPP")
            ) : (
              <span>Pilih tanggal selesai</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={endDate}
            onSelect={setEndDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function DashboardScreen(): JSX.Element {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const {
    data: assets = [],
    isLoading,
    isError,
    error,
  } = useAssetsQuery(startDate, endDate);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push("/auth");
    });

    // Auth Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.push("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const totalAssets = useMemo<number>(() => assets.length, [assets]);

  const groupedByStatus = useMemo<Record<string, number>>(() => {
    return assets.reduce<Record<string, number>>((acc, a) => {
      const key = (a.status as string) ?? "unknown";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
  }, [assets]);

  const groupedByType = useMemo(() => groupAssetsByType(assets), [assets]);

  const makePieData = (items: Asset[]): PieDatum[] => {
    const { available, booked } = partitionAndSortByName(items);
    return [
      { name: "Tersedia", value: available.length, color: "#386641" },
      { name: "Dipinjam", value: booked.length, color: "#B3261E" },
    ];
  };

  const handleLogout = async (): Promise<void> => {
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
      router.push("/auth");
    } catch {
      toast.error("Gagal logout");
    }
  };

  if (isLoading) return <LoaderUI />;
  if (isError) return <ErrorUI error={error} />;

  return (
    <div className="max-w-7xl px-4 sm:px-6 py-8 space-y-10">
      <header className="text-center">
        <div className="flex mb-8 gap-4 col-span-4 justify-between items-center">
          <h1 className="text-2xl sm:text-4xl font-black text-gray-900">
            Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
            />
            <Button onClick={() => router.push("/assets")}>Tambah asset</Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Aset" value={totalAssets} Icon={Package} />
        <StatCard
          title="Tersedia"
          value={groupedByStatus["tersedia"] ?? 0}
          Icon={PackageCheck}
        />
        <StatCard
          title="Dipinjam"
          value={groupedByStatus["dipinjam"] ?? 0}
          Icon={PackageX}
        />
      </section>

      <section className="grid grid-cols-1 gap-6">
        {Object.entries(groupedByType)
          .sort(([a], [b]) => {
            const priority = (t: string): number =>
              t === "ruangan" ? 0 : t === "asrama" ? 1 : 2;
            const pa = priority(a);
            const pb = priority(b);
            if (pa !== pb) return pa - pb;
            return a.localeCompare(b);
          })
          .map(([type, items]) => {
            const { available, booked } = partitionAndSortByName(items);
            const routes = resolveRoutesForType(type);
            const pieData = makePieData(items);

            return (
              <Card
                key={type}
                className="rounded-2xl border border-dashed border-black shadow-sm overflow-hidden relative"
              >
                <CardHeader className="flex items-center gap-3">
                  <ListChecks className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <CardTitle className="text-base capitalize">
                      {type}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      Total {items.length} aset • Tersedia: {available.length} •
                      Dipinjam: {booked.length}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => router.push(routes.detailPath)}
                    >
                      Lihat detail
                    </Button>
                  </div>
                </CardHeader>

                <Separator />

                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="rounded-2xl border p-3 pt-6">
                      <InteractivePie
                        data={pieData}
                        defaultCenterLabel=""
                        height={200}
                      />
                    </div>

                    <div className="space-y-4">
                      {available.length > 0 && (
                        <AssetTable
                          data={available}
                          title="Daftar Aset Tersedia"
                        />
                      )}
                      {booked.length > 0 && (
                        <AssetTable
                          data={booked}
                          title="Daftar Aset Dipinjam"
                        />
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-end gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-2 w-6 rounded"
                        style={{ backgroundColor: "#386641" }}
                      />
                      <span>Tersedia</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-2 w-6 rounded"
                        style={{ backgroundColor: "#B3261E" }}
                      />
                      <span>Dipinjam</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </section>
    </div>
  );
}

const client = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export default function Dashboard(): JSX.Element {
  return (
    <QueryClientProvider client={client}>
      <DashboardScreen />
    </QueryClientProvider>
  );
}
