import React from "react";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
    AlertCircle,
    CheckCircle2,
    CircleDashed,
    Clock,
    HardDrive,
    History,
    Info,
    Sparkles,
    XCircle,
} from "lucide-react";

import type { LucideIcon } from "@/types";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { normalizeAssetType, ClientQR } from "@/features/assets";

type AssetStatus = "tersedia" | "dipinjam" | "rusak" | "hilang" | "perbaikan";
type AssetType = "elektronik" | "kendaraan" | "perabot" | "ruangan" | "asrama" | "lainnya";

interface BaseAsset {
    id: string;
    assetsId?: string;
    name: string;
    type: AssetType;
    category: string;
    location: string;
    status: AssetStatus;
    brand?: string;
    model?: string;
    notes?: string;
    addedBy: string;
    createdAt: Date;
    updatedAt: Date;
    lastBorrowedBy?: string;
    lastBorrowedAt?: Date;
    lastReturnedAt?: Date;
}

type ElectronicAsset = BaseAsset & { type: "elektronik"; serialNumber?: string };
type FurnitureAsset = BaseAsset & { type: "perabot"; material?: string; dimensions?: string };
type VehicleAsset = BaseAsset & {
    type: "kendaraan";
    licensePlate?: string;
    vehicleType?: string;
    year?: number;
    fuelType?: string;
    stnkYear?: number;
    stnkMonth?: number;
    mileage?: number;
};
type RoomAsset = BaseAsset & {
    type: "ruangan" | "asrama";
    capacity?: number;
    floor?: number;
    roomSize?: string;
    facilities?: string | string[];
};
type OtherAsset = BaseAsset & { type: "lainnya" };

type Asset = ElectronicAsset | VehicleAsset | FurnitureAsset | RoomAsset | OtherAsset;

interface DBAssetRow {
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

interface TimelineEventDetails {
    activityName?: string;
    institution?: string;
    borrowerName?: string;
    timeRange?: string;
    attendees?: number;
    roomSetup?: string;
    phoneNumber?: string;
    notes?: string;
}

interface TimelineEvent {
    title: string;
    date: string;
    subtitle?: string;
    details?: TimelineEventDetails;
    colorClass: string;
    isActive: boolean;
    rawDate: string;
}

interface StatusConfig {
    label: string;
    bg: string;
    text: string;
    border: string;
    indicator: string;
    icon: LucideIcon;
}

const STATUS_CONFIG: Record<AssetStatus, StatusConfig> = {
    tersedia: {
        label: "Tersedia",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        indicator: "bg-emerald-500",
        icon: CheckCircle2,
    },
    dipinjam: {
        label: "Dipinjam",
        bg: "bg-rose-50",
        text: "text-rose-700",
        border: "border-rose-200",
        indicator: "bg-rose-500",
        icon: Clock,
    },
    rusak: {
        label: "Rusak",
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        indicator: "bg-red-500",
        icon: XCircle,
    },
    hilang: {
        label: "Hilang",
        bg: "bg-gray-50",
        text: "text-gray-700",
        border: "border-gray-200",
        indicator: "bg-gray-500",
        icon: AlertCircle,
    },
    perbaikan: {
        label: "Dalam Perbaikan",
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        indicator: "bg-amber-500",
        icon: CircleDashed,
    },
};

const formatDate = (date: Date | string | undefined, fmt = "d MMM yyyy"): string => {
    if (!date) return "-";
    try {
        return format(new Date(date), fmt, { locale: idLocale });
    } catch {
        return "-";
    }
};

const transformDBAssetToDomain = (row: DBAssetRow): Asset => {
    const normalizedType = normalizeAssetType(row.type);
    const rawStatus = row.status?.toLowerCase().trim() || "tersedia";
    const status: AssetStatus = (
        rawStatus === "tersedia" ||
        rawStatus === "dipinjam" ||
        rawStatus === "rusak" ||
        rawStatus === "hilang" ||
        rawStatus === "perbaikan"
    ) ? (rawStatus as AssetStatus) : "tersedia";

    const base: BaseAsset = {
        id: row.id,
        assetsId: row.assets_id || row.id,
        name: row.name || "Aset Tanpa Nama",
        type: normalizedType,
        category: row.category || "Umum",
        location: row.location || "-",
        status,
        brand: row.brand,
        model: row.model,
        notes: row.notes,
        addedBy: row.added_by || "System Admin",
        createdAt: row.created_at ? new Date(row.created_at) : new Date(),
        updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
        lastBorrowedBy: row.last_borrowed_by,
        lastBorrowedAt: row.last_borrowed_at ? new Date(row.last_borrowed_at) : undefined,
        lastReturnedAt: row.last_returned_at ? new Date(row.last_returned_at) : undefined,
    };

    switch (base.type) {
        case "elektronik":
            return { ...base, type: "elektronik", serialNumber: row.serial_number };
        case "kendaraan":
            return {
                ...base,
                type: "kendaraan",
                licensePlate: row.license_plate,
                vehicleType: row.vehicle_type,
                year: row.year,
                fuelType: row.fuel_type,
                stnkYear: row.stnk_year,
                stnkMonth: row.stnk_month,
                mileage: row.mileage,
            };
        case "perabot":
            return { ...base, type: "perabot", material: row.material, dimensions: row.dimensions };
        case "ruangan":
        case "asrama":
            return {
                ...base,
                type: base.type as "ruangan" | "asrama",
                capacity: row.capacity,
                floor: row.floor,
                roomSize: row.room_size,
                facilities: row.facilities,
            };
        default:
            return { ...base, type: "lainnya" };
    }
};

interface RawBooking {
    payload?: {
        bookingStart?: string;
        bookingEnd?: string;
        startTime?: string;
        endTime?: string;
        purpose?: string;
        institutionName?: string;
        name?: string;
        attendees?: number;
        roomSetup?: string;
        phoneNumber?: string;
        notes?: string;
    } | null;
    created_at: string;
}

const processBookingEvents = (bookings: RawBooking[]): { events: TimelineEvent[]; isBooked: boolean } => {
    const now = new Date();
    let isBooked = false;

    const events = bookings.map((booking): TimelineEvent | null => {
        const payload = booking.payload;
        if (!payload) return null;

        const combineDateAndTime = (d?: string, t?: string, isEnd = false) => {
            if (!d) return null;
            const date = new Date(d);
            if (isNaN(date.getTime())) return null;

            if (!t) {
                if (isEnd) date.setHours(23, 59, 59, 999);
                else date.setHours(0, 0, 0, 0);
                return date;
            }
            const [h, m, s] = t.split(":").map(Number);
            date.setHours(h || 0, m || 0, s || (isEnd ? 59 : 0), isEnd ? 999 : 0);
            return date;
        };

        const start = combineDateAndTime(payload.bookingStart, payload.startTime, false);
        const end = combineDateAndTime(payload.bookingEnd || payload.bookingStart, payload.endTime, true);

        const isActive = !!(start && end && now >= start && now <= end);
        if (isActive) isBooked = true;

        const timeRange = payload.startTime && payload.endTime
            ? `${payload.startTime} - ${payload.endTime}`
            : "Sepanjang Hari";

        return {
            title: isActive ? "Dipinjam" : `Peminjaman: ${payload.purpose || "Kegiatan"}`,
            subtitle: `Peminjam: ${payload.name || "Tidak ada nama"} (${payload.institutionName || "-"})`,
            date: formatDate(booking.created_at),
            colorClass: isActive ? "bg-rose-500" : "bg-blue-500",
            isActive: isActive,
            rawDate: booking.created_at,
            details: {
                activityName: payload.purpose,
                institution: payload.institutionName,
                borrowerName: payload.name,
                timeRange,
                attendees: payload.attendees,
                roomSetup: payload.roomSetup,
                phoneNumber: payload.phoneNumber,
                notes: payload.notes
            }
        };
    }).filter((e): e is TimelineEvent => e !== null);

    return { events, isBooked };
};

const AssetStatusBadge: React.FC<{ status: AssetStatus }> = ({ status: statusKey }) => {
    const status = STATUS_CONFIG[statusKey] || STATUS_CONFIG.tersedia;
    const Icon = status.icon;

    return (
        <div className={`pl-1 pr-3 py-1 rounded-full border border-dashed ${status.border} ${status.bg} flex items-center gap-2`}>
            <div className={`w-6 h-6 rounded-full ${status.indicator} flex items-center justify-center`}>
                <Icon className="w-3.5 h-3.5 text-white" />
            </div>
            <span className={`text-sm font-bold uppercase tracking-wide ${status.text}`}>
                {status.label}
            </span>
        </div>
    );
};

const TileContainer: React.FC<{
    title: string;
    icon: LucideIcon;
    children: React.ReactNode;
    className?: string;
}> = ({ title, icon: Icon, children, className = "" }) => (
    <div className={`p-6 rounded-lg border border-dashed border-slate-300 bg-white hover:border-slate-300/70 transition-colors ${className}`}>
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-dashed border-gray-200">
            <Icon className="w-4 h-4" />
            <h4 className="text-[11px] font-bold uppercase tracking-widest leading-none">
                {title}
            </h4>
        </div>
        <div className="h-full">{children}</div>
    </div>
);

const PropertyRow: React.FC<{
    label: string;
    value: React.ReactNode;
    subValue?: string;
    isLast?: boolean;
}> = ({ label, value, subValue, isLast = false }) => (
    <div className={`py-2.5 ${!isLast ? "border-b border-dashed border-gray-100" : ""}`}>
        <div className="flex items-baseline justify-between group">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide group-hover:text-gray-700 transition-colors">
                {label}
            </span>
            <span className="text-sm font-semibold text-gray-900 text-right font-sans">
                {value || <span className="text-gray-300">-</span>}
            </span>
        </div>
        {subValue && (
            <p className="text-right text-[10px] text-gray-400 mt-0.5 font-mono">{subValue}</p>
        )}
    </div>
);

const TimelineItem: React.FC<{
    title: string;
    date: string;
    details?: TimelineEventDetails;
    subtitle?: string;
    isFirst?: boolean;
    isLast?: boolean;
    isActive?: boolean;
    colorClass: string;
}> = ({ title, date, subtitle, details, isLast, isActive, colorClass }) => (
    <div className="relative pl-8 pb-2 last:pb-0">
        {!isLast && (
            <div className="absolute left-[11px] top-3 bottom-0 w-px border-l border-dashed border-gray-300" />
        )}
        <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border border-gray-200 bg-white flex items-center justify-center z-10 box-border ${isActive ? "ring-4 ring-gray-50" : ""}`}>
            <div className={`w-2 h-2 rounded-full transition-all duration-500 ${isActive ? colorClass.replace("bg-", "bg-") : "bg-gray-300"} ${isActive ? "animate-pulse" : ""}`} />
        </div>
        <div className="group">
            <div className="flex items-center justify-between gap-4 mb-1">
                <p className={`text-sm font-bold ${isActive ? "text-gray-900" : "text-gray-600 group-hover:text-gray-800"} transition-colors`}>
                    {title}
                </p>
                <span className="text-[10px] font-mono font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full border border-dashed border-gray-200 whitespace-nowrap">
                    {date}
                </span>
            </div>
            {subtitle && <p className="text-xs text-gray-500 leading-normal mb-2">{subtitle}</p>}

            {details && (
                <div className="mt-2 text-xs bg-gray-50/50 border border-dashed border-gray-200 rounded-lg p-3 space-y-2">
                    {(details.activityName || details.borrowerName || details.institution) && (
                        <div className="border-b border-dashed border-gray-200 pb-2 mb-1 space-y-2">
                            {details.activityName && (
                                <div className="flex flex-col">
                                    <span className="text-[12px] leading-loose text-gray-400 font-semibold">Nama Kegiatan</span>
                                    <span className="font-bold text-gray-800 text-sm">{details.activityName}</span>
                                </div>
                            )}
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                        {details.timeRange && (
                            <div className="flex flex-col">
                                <span className="text-[12px] leading-loose text-gray-400 font-semibold">Waktu</span>
                                <span className="font-medium text-gray-700">{details.timeRange}</span>
                            </div>
                        )}
                        {details.attendees ? (
                            <div className="flex flex-col">
                                <span className="text-[12px] leading-loose text-gray-400 font-semibold">Peserta</span>
                                <span className="font-medium text-gray-700">{details.attendees} Orang</span>
                            </div>
                        ) : null}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {details.roomSetup && (
                            <div className="flex flex-col">
                                <span className="text-[12px] leading-loose text-gray-400 font-semibold">Setup</span>
                                <span className="font-medium text-gray-700">{details.roomSetup}</span>
                            </div>
                        )}
                        {details.phoneNumber && (
                            <div className="flex flex-col">
                                <span className="text-[12px] leading-loose text-gray-400 font-semibold">Kontak</span>
                                <span className="font-medium text-gray-700 font-mono">{details.phoneNumber}</span>
                            </div>
                        )}
                    </div>
                    {details.notes && (
                        <div className="flex flex-col border-t border-dashed border-gray-200 pt-2 mt-1">
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Catatan</span>
                            <span className="font-medium text-gray-700 italic">{details.notes}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
);

const MetadataRow: React.FC<{
    label: string;
    value: string;
    mono?: boolean;
    capitalize?: boolean;
}> = ({ label, value, mono, capitalize }) => (
    <div className="group flex justify-between items-center">
        <span className="text-gray-400 text-[10px]">{label}</span>
        <span className={`text-[10px] ${capitalize ? "capitalize" : ""} ${mono ? "" : ""}`}>
            {value}
        </span>
    </div>
);

const SpecificationList: React.FC<{ asset: Asset }> = ({ asset }) => {
    const listWrapper = (children: React.ReactNode) => <div className="flex flex-col">{children}</div>;

    const renderFacilities = (val: string | string[] | undefined) => {
        if (!val) return "-";
        let facilities: string[] = [];
        if (Array.isArray(val)) {
            facilities = val;
        } else if (typeof val === "string") {
            const trimmed = val.trim();
            if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
                try {
                    const parsed = JSON.parse(trimmed);
                    if (Array.isArray(parsed)) facilities = parsed;
                } catch {
                    facilities = trimmed.split(",").map((s) => s.trim()).filter(Boolean);
                }
            } else {
                facilities = trimmed.split(",").map((s) => s.trim()).filter(Boolean);
            }
        }

        if (facilities.length === 0) return "-";
        return (
            <div className="flex flex-wrap gap-2 justify-end">
                {facilities.map((fac, i) => (
                    <Badge key={i} variant="secondary" className="px-2 py-0.5 text-xs font-normal">
                        {fac}
                    </Badge>
                ))}
            </div>
        );
    };

    switch (asset.type) {
        case "elektronik":
            return listWrapper(
                <>
                    <PropertyRow label="Merek" value={asset.brand} />
                    <PropertyRow label="Model" value={asset.model} />
                    <PropertyRow
                        label="Serial Number"
                        value={asset.serialNumber ? <span className="font-mono">{asset.serialNumber}</span> : "-"}
                        isLast
                    />
                </>
            );
        case "kendaraan":
            return listWrapper(
                <>
                    <PropertyRow
                        label="Plat Nomor"
                        value={
                            asset.licensePlate ? (
                                <span className="font-mono font-bold bg-gray-100 px-1.5 rounded text-gray-800">
                                    {asset.licensePlate}
                                </span>
                            ) : (
                                "-"
                            )
                        }
                    />
                    <PropertyRow label="Tipe" value={asset.vehicleType} />
                    <PropertyRow label="Tahun" value={asset.year} />
                    <PropertyRow label="Bahan Bakar" value={asset.fuelType} />
                    <PropertyRow
                        label="Masa STNK"
                        value={asset.stnkYear ? `${asset.stnkMonth}/${asset.stnkYear}` : "-"}
                    />
                    <PropertyRow
                        label="Kilometer"
                        value={asset.mileage ? `${asset.mileage.toLocaleString()} km` : "-"}
                        isLast
                    />
                </>
            );
        case "ruangan":
        case "asrama":
            return listWrapper(
                <>
                    <PropertyRow
                        label="Fasilitas"
                        value={renderFacilities(asset.facilities)}
                        isLast
                    />
                    <PropertyRow
                        label="Kapasitas"
                        value={asset.capacity ? `${asset.capacity} Orang` : "-"}
                    />
                    <PropertyRow label="Lantai" value={asset.floor} />
                    <PropertyRow label="Luas" value={asset.roomSize} />
                </>
            );
        case "perabot":
            return listWrapper(
                <>
                    <PropertyRow label="Material" value={asset.material} />
                    <PropertyRow label="Dimensi" value={asset.dimensions} isLast />
                </>
            );
        default:
            return (
                <div className="text-sm text-gray-400 italic py-3 border-b border-dashed border-gray-100 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Tidak ada spesifikasi khusus untuk tipe ini.
                </div>
            );
    }
};

export default async function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: rawAsset, error } = await supabase
        .from("assets")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !rawAsset) notFound();

    const asset = transformDBAssetToDomain(rawAsset as DBAssetRow);

    const { data: bookings } = await supabase
        .from("room_bookings")
        .select("payload, created_at")
        .eq("status", "confirmed")
        .contains("room_ids", [asset.id])
        .order("created_at", { ascending: false });

    const { events: timelineEvents, isBooked } = processBookingEvents(bookings || []);

    const currentStatus = isBooked ? "dipinjam" : asset.status;

    return (
        <div className="min-h-screen bg-white pb-24 font-sans text-gray-900 selection:bg-gray-100 selection:text-gray-900">
            <main className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">

                <div className="mb-8 border-b border-dashed border-slate-300 pb-8">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <h2 className="text-3xl md:text-3xl font-black text-gray-900 tracking-tight leading-none">
                                {asset.name}
                            </h2>

                            <div className="flex flex-wrap items-center gap-3">
                                <AssetStatusBadge status={currentStatus} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    <div className="lg:col-span-8 space-y-8">
                        <TileContainer title="Informasi Detail" icon={Info}>
                            <div className="w-full">
                                <SpecificationList asset={asset} />
                            </div>
                        </TileContainer>

                        {asset.notes && (
                            <div className="p-5 rounded-lg border border-dashed border-amber-300 bg-amber-50 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#fcd34d_10px,#fcd34d_20px)] opacity-10" />
                                <h4 className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Sparkles className="w-3.5 h-3.5" /> Catatan Penting
                                </h4>
                                <p className="text-sm text-amber-900 font-medium whitespace-pre-wrap leading-relaxed font-sans">
                                    {asset.notes}
                                </p>
                            </div>
                        )}

                        <div className="p-6 rounded-lg border border-dashed border-slate-300 bg-white">
                            <div className="flex items-center justify-between mb-8 pb-3 border-b border-dashed border-gray-200">
                                <div className="flex items-center gap-2">
                                    <History className="w-4 h-4" />
                                    <h4 className="text-xs font-bold uppercase tracking-widest">
                                        Riwayat Booking
                                    </h4>
                                </div>
                            </div>
                            <div className="space-y-4 px-2">
                                {timelineEvents.map((event, idx) => (
                                    <TimelineItem
                                        key={idx}
                                        title={event.title}
                                        subtitle={event.subtitle}
                                        date={event.date}
                                        colorClass={event.colorClass}
                                        isActive={event.isActive}
                                        details={event.details}
                                        isFirst={idx === 0}
                                    />
                                ))}
                                <TimelineItem
                                    title="Aset Terdaftar"
                                    subtitle={`Ditambahkan ke sistem oleh ${asset.addedBy}`}
                                    date={formatDate(asset.createdAt)}
                                    colorClass="bg-emerald-500"
                                    isLast
                                />
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                        <div className="sticky top-24 space-y-6">

                            <div className="rounded-xl overflow-hidden border border-dashed text-black border-slate-300 bg-white transition-all duration-300">
                                <div className="bg-black p-4 flex items-center justify-center">
                                    <span className="text-xs font-bold uppercase tracking-widest text-white">
                                        Asset ID
                                    </span>
                                </div>
                                <div className="p-6">
                                    <ClientQR
                                        assetId={asset.id}
                                        customId={asset.assetsId}
                                        assetName={asset.name}
                                    />
                                </div>
                            </div>

                            <div className="p-5 rounded-lg border border-dashed border-slate-300 space-y-3 text-xs bg-gray-50/50">
                                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-dashed border-gray-200">
                                    <HardDrive className="w-3.5 h-3.5" />
                                    <span className="font-bold uppercase tracking-widest text-[10px] sans-serif">
                                        Log Sistem
                                    </span>
                                </div>

                                <MetadataRow label="added_by" value={asset.addedBy} />
                                <MetadataRow label="created_at" value={formatDate(asset.createdAt, "yyyy-MM-dd")} mono />
                                <MetadataRow label="updated_at" value={formatDate(asset.updatedAt, "yyyy-MM-dd")} mono />
                                <MetadataRow label="category" value={asset.category} />
                                <MetadataRow label="type" value={asset.type} capitalize />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
