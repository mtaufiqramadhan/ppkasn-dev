"use client";

import { useEffect, useMemo, useState, type JSX } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Package,
  ListChecks,
  Loader2,
  PackageX,
  PackageCheck,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { type Asset, type PieDatum } from "../types";
import {
  partitionAndSortByName,
  groupAssetsByType,
  resolveRoutesForType,
} from "../services/dashboard-service";
import { useDashboardData } from "../hooks/use-dashboard-data";
import { StatCard } from "./stat-card";
import { InteractivePie } from "./interactive-pie";
import { AssetTable } from "./asset-table";
import { DateRangePicker } from "./date-range-picker";

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

export function DashboardScreen(): JSX.Element {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const {
    data: assets = [],
    isLoading,
    isError,
    error,
  } = useDashboardData(startDate, endDate);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push("/auth");
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
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
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-10">
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
