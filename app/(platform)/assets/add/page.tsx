"use client";

import { useState, useTransition, useEffect, useCallback, memo } from "react";
import { useForm, type FieldErrors, type UseFormRegister, type UseFormSetValue, type UseFormWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    Loader2,
    RefreshCw,
    QrCode,
    Plus,
    X,
    Info,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
    Field,
    FieldLabel,
    FieldContent,
    FieldError,
    FieldGroup,
} from "@/components/ui/field";

import { Badge } from "@/components/ui/badge";
import { type Asset, assetSchema, ASSET_STATUSES } from "../schemas";

type AssetType = Asset["type"];

interface BaseFormProps {
    register: UseFormRegister<Asset>;
    errors: FieldErrors<Asset>;
    setValue: UseFormSetValue<Asset>;
    watch: UseFormWatch<Asset>;
}

const CATEGORY_MAP: Record<AssetType, string> = {
    elektronik: "Elektronik",
    perabot: "Perabot",
    kendaraan: "Kendaraan",
    ruangan: "Ruangan",
    asrama: "Asrama",
    lainnya: "Lainnya",
};

const generateAssetId = (): string => {
    const random = Math.floor(10000000 + Math.random() * 90000000);
    return `AST-${random}`;
};

const createAssetPayload = (data: Asset) => {

    const commonPayload = {
        id: data.assetsId || data.id,
        name: data.name,
        category: data.category,
        location: data.location,
        status: data.status,
        notes: data.notes,
        type: data.type,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        brand: data.brand,
        model: data.model,
    };

    let specificPayload: Record<string, unknown> = {};

    switch (data.type) {
        case "elektronik":
            specificPayload = { serial_number: data.serialNumber };
            break;
        case "perabot":
            specificPayload = {
                material: data.material,
                dimensions: data.dimensions,
            };
            break;
        case "kendaraan":
            specificPayload = {
                license_plate: data.licensePlate,
                vehicle_type: data.vehicleType,
                year: data.year,
                month: data.month,
                stnk_year: data.stnkYear,
                stnk_month: data.stnkMonth,
                mileage: data.mileage,
                fuel_type: data.fuelType,
            };
            break;
        case "ruangan":
        case "asrama":
            specificPayload = {
                capacity: data.capacity,
                room_size: data.roomSize,
                floor: data.floor,
                facilities: data.facilities,
            };
            break;
    }

    return { ...commonPayload, ...specificPayload };
};

const QRCodeSection = memo(({ assetId, onRefresh }: { assetId: string; onRefresh: () => void }) => (
    <Card className="border border-dashed border-slate-300 shadow-none bg-white rounded-xl overflow-hidden">
        <CardHeader className="bg-white border-b border-dashed border-slate-300 pb-6 pt-3 px-6 items-center">
            <CardTitle className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                <QrCode className="h-4 w-4 text-slate-500" />
                QR Code
            </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6 space-y-6">
            <div className="bg-white p-3 rounded-xl border border-dashed border-slate-200 shadow-none">
                {assetId ? (
                    <QRCodeCanvas
                        value={assetId}
                        size={160}
                        level={"H"}
                        includeMargin={true}
                        className="rounded-lg"
                    />
                ) : (
                    <div className="h-[160px] w-[160px] bg-slate-50 rounded-xl flex items-center justify-center text-slate-400  text-center px-4 border border-dashed border-slate-300">
                        QR Code placeholder
                    </div>
                )}
            </div>

            <div className="w-full space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Asset ID
                    </label>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            onRefresh();
                        }}
                        className="text-[10px] font-medium text-primary hover:text-primary/90 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 border border-dashed border-transparent hover:border-primary"
                    >
                        <RefreshCw className="h-3 w-3" /> Refresh
                    </button>
                </div>
                <div className="relative group">
                    <div className="flex items-center justify-center w-full h-11 font-mono text-base tracking-widest font-bold border border-dashed border-slate-300 rounded-lg bg-slate-50 text-slate-700 group-hover:border-slate-400 transition-colors cursor-default">
                        {assetId || "AST-XXXXXX"}
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
));
QRCodeSection.displayName = "QRCodeSection";

const ElectronicInputs = ({ register }: BaseFormProps) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field className="space-y-1.5">
            <FieldLabel className="font-semibold text-slate-900">Merek (Brand)</FieldLabel>
            <FieldContent>
                <Input {...register("brand")} placeholder="Contoh: Lenovo" className="bg-slate-50 border-dashed border-slate-300 focus:border-solid focus:border-black focus:ring-0 rounded-lg h-11" />
            </FieldContent>
        </Field>
        <Field className="space-y-1.5">
            <FieldLabel className=" font-semibold text-slate-900">Model</FieldLabel>
            <FieldContent>
                <Input {...register("model")} placeholder="Contoh: Thinkpad X1 Carbon" className="bg-slate-50 border-dashed border-slate-300 focus:border-solid focus:border-black focus:ring-0 rounded-lg h-11" />
            </FieldContent>
        </Field>
        <Field className="md:col-span-2 space-y-1.5">
            <FieldLabel className=" font-semibold text-slate-900">Nomor Seri (Serial Number)</FieldLabel>
            <FieldContent>
                <Input {...register("serialNumber")} placeholder="Contoh: SN-12345678" className="bg-slate-50 border-dashed border-slate-300 focus:border-solid focus:border-black focus:ring-0 rounded-lg h-11" />
            </FieldContent>
        </Field>
    </div>
);

const FurnitureInputs = ({ register }: BaseFormProps) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field className="space-y-1.5">
            <FieldLabel className=" font-semibold text-slate-900">Bahan (Material)</FieldLabel>
            <FieldContent>
                <Input {...register("material")} placeholder="Contoh: Kayu Jati" className="bg-slate-50 border-dashed border-slate-300 focus:border-solid focus:border-black focus:ring-0 rounded-lg h-11" />
            </FieldContent>
        </Field>
        <Field className="space-y-1.5">
            <FieldLabel className=" font-semibold text-slate-900">Dimensi</FieldLabel>
            <FieldContent>
                <Input {...register("dimensions")} placeholder="Contoh: 120 x 60 x 75 cm" className="bg-slate-50 border-dashed border-slate-300 focus:border-solid focus:border-black focus:ring-0 rounded-lg h-11" />
            </FieldContent>
        </Field>
    </div>
);

const VehicleInputs = ({ register, errors }: BaseFormProps) => {

    const vehicleErrors = errors as FieldErrors<Extract<Asset, { type: "kendaraan" }>>;

    return (
        <FieldGroup className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field className="space-y-1.5">
                    <FieldLabel className=" font-semibold text-slate-900">
                        Plat Nomor <span className="text-red-500">*</span>
                    </FieldLabel>
                    <FieldContent>
                        <Input {...register("licensePlate")} placeholder="Contoh: B 1234 CD" className="bg-slate-50 border-dashed border-slate-300 focus:border-solid focus:border-black focus:ring-0 rounded-lg h-11" />
                        <FieldError errors={[vehicleErrors.licensePlate]} />
                    </FieldContent>
                </Field>
                <Field className="space-y-1.5">
                    <FieldLabel className=" font-semibold text-slate-900">
                        Jenis Kendaraan <span className="text-red-500">*</span>
                    </FieldLabel>
                    <FieldContent>
                        <Input
                            {...register("vehicleType")}
                            placeholder="Contoh: Sepeda Motor / Mobil"
                            className="bg-slate-50 border-dashed border-slate-300 focus:border-solid focus:border-black focus:ring-0 rounded-lg h-11"
                        />
                        <FieldError errors={[vehicleErrors.vehicleType]} />
                    </FieldContent>
                </Field>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Field className="space-y-1.5">
                    <FieldLabel className=" font-semibold text-slate-900">Tahun Kendaraan</FieldLabel>
                    <FieldContent>
                        <Input
                            type="number"
                            {...register("year", { valueAsNumber: true })}
                            placeholder="YYYY"
                            className="border-dashed shadow-none bg-white focus-visible:ring-slate-400 rounded-lg"
                        />
                    </FieldContent>
                </Field>
                <Field className="space-y-1.5">
                    <FieldLabel className=" font-semibold text-slate-900">Bulan Kendaraan</FieldLabel>
                    <FieldContent>
                        <Input
                            type="number"
                            {...register("month", { valueAsNumber: true })}
                            placeholder="MM"
                            className="border-dashed shadow-none bg-white focus-visible:ring-slate-400 rounded-lg"
                        />
                    </FieldContent>
                </Field>
                <Field className="space-y-1.5">
                    <FieldLabel className=" font-semibold text-slate-900">STNK (Tahun)</FieldLabel>
                    <FieldContent>
                        <Input
                            type="number"
                            {...register("stnkYear", { valueAsNumber: true })}
                            placeholder="YYYY"
                            className="border-dashed shadow-none bg-white focus-visible:ring-slate-400 rounded-lg"
                        />
                    </FieldContent>
                </Field>
                <Field className="space-y-1.5">
                    <FieldLabel className=" font-semibold text-slate-900">STNK (Bulan)</FieldLabel>
                    <FieldContent>
                        <Input
                            type="number"
                            {...register("stnkMonth", { valueAsNumber: true })}
                            placeholder="MM"
                            className="border-dashed shadow-none bg-white focus-visible:ring-slate-400 rounded-lg"
                        />
                    </FieldContent>
                </Field>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field className="space-y-1.5">
                    <FieldLabel className=" font-semibold text-slate-900">Bahan Bakar</FieldLabel>
                    <FieldContent>
                        <Input
                            {...register("fuelType")}
                            placeholder="Bensin / Solar / Listrik"
                            className="border-dashed shadow-none bg-white focus-visible:ring-slate-400 rounded-lg"
                        />
                    </FieldContent>
                </Field>
                <Field className="space-y-1.5">
                    <FieldLabel className=" font-semibold text-slate-900">Kilometer (km)</FieldLabel>
                    <FieldContent>
                        <Input
                            type="number"
                            {...register("mileage", { valueAsNumber: true })}
                            placeholder="0"
                            className="border-dashed shadow-none bg-white focus-visible:ring-slate-400 rounded-lg"
                        />
                    </FieldContent>
                </Field>
            </div>
        </FieldGroup>
    );
};

const FacilitiesInput = ({
    value,
    onChange,
}: {
    value: string[] | string | undefined;
    onChange: (val: string[]) => void;
}) => {
    const [inputValue, setInputValue] = useState("");

    const facilities = Array.isArray(value)
        ? value
        : typeof value === "string" && value.trim() !== ""
            ? value.split(",").map((s) => s.trim())
            : [];

    const handleAdd = (e?: React.FormEvent) => {
        e?.preventDefault();
        const trimmed = inputValue.trim();
        if (trimmed && !facilities.includes(trimmed)) {
            onChange([...facilities, trimmed]);
            setInputValue("");
        }
    };

    const handleRemove = (itemToRemove: string) => {
        onChange(facilities.filter((f) => f !== itemToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAdd();
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <Input
                    placeholder="Tambah fasilitas (tekan Enter)"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-slate-50 border-dashed border-slate-300 focus:border-solid focus:border-black focus:ring-0 rounded-lg h-11"
                />
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleAdd}
                    disabled={!inputValue.trim()}
                    className="shrink-0 bg-slate-50 shadow-none border border-dashed border-slate-300 hover:bg-slate-100 hover:border-slate-400 rounded-lg h-11 px-3"
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
            <div className="flex flex-wrap gap-2 min-h-[32px]">
                {facilities.length > 0 ? (
                    facilities.map((fac, idx) => (
                        <Badge
                            key={idx}
                            variant="secondary"
                            className="pl-3 pr-1.5 py-1.5 flex items-center gap-1  font-medium border border-dashed border-slate-300 shadow-none bg-slate-50 text-slate-700 hover:bg-white transition-colors rounded-lg"
                        >
                            {fac}
                            <button
                                type="button"
                                onClick={() => handleRemove(fac)}
                                className="hover:bg-red-100 hover:text-red-600 rounded-full p-0.5 transition-colors ml-1"
                                aria-label={`Hapus fasilitas ${fac}`}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))
                ) : (
                    <div className="flex items-center gap-2  text-slate-400 italic px-1">
                        <Info className="h-3 w-3" />
                        Belum ada fasilitas ditambahkan
                    </div>
                )}
            </div>
        </div>
    );
};

const RoomInputs = ({ register, errors, setValue, watch }: BaseFormProps) => {
    const roomErrors = errors as FieldErrors<Extract<Asset, { type: "ruangan" }>>;
    const facilitiesValue = watch("facilities");

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field className="space-y-1.5">
                <FieldLabel className=" font-semibold text-slate-900">
                    Kapasitas (Orang) <span className="text-red-500">*</span>
                </FieldLabel>
                <FieldContent>
                    <Input
                        type="number"
                        {...register("capacity", { valueAsNumber: true })}
                        placeholder="0"
                        className="bg-slate-50 border-dashed border-slate-300 focus:border-solid focus:border-black focus:ring-0 rounded-lg h-11"
                    />
                    <FieldError errors={[roomErrors.capacity]} />
                </FieldContent>
            </Field>
            <Field className="space-y-1.5">
                <FieldLabel className=" font-semibold text-slate-900">
                    Lantai <span className="text-red-500">*</span>
                </FieldLabel>
                <FieldContent>
                    <Input
                        type="number"
                        {...register("floor", { valueAsNumber: true })}
                        placeholder="0"
                        className="bg-slate-50 border-dashed border-slate-300 focus:border-solid focus:border-black focus:ring-0 rounded-lg h-11"
                    />
                    <FieldError errors={[roomErrors.floor]} />
                </FieldContent>
            </Field>
            <Field className="md:col-span-2 space-y-1.5">
                <FieldLabel className=" font-semibold text-slate-900">Fasilitas</FieldLabel>
                <FieldContent>
                    <FacilitiesInput
                        value={facilitiesValue}
                        onChange={(val) =>
                            setValue("facilities", val, {
                                shouldDirty: true,
                                shouldValidate: true,
                            })
                        }
                    />
                </FieldContent>
            </Field>
            <Field className="space-y-1.5">
                <FieldLabel className=" font-semibold text-slate-900">Ukuran (m²)</FieldLabel>
                <FieldContent>
                    <Input {...register("roomSize")} placeholder="Contoh: 5 x 6 m" className="bg-slate-50 border-dashed border-slate-300 focus:border-solid focus:border-black focus:ring-0 rounded-lg h-11" />
                </FieldContent>
            </Field>
        </div>
    );
};

const SpecificFieldsSelector = ({
    type,
    register,
    errors,
    setValue,
    watch,
}: { type: AssetType } & BaseFormProps) => {
    switch (type) {
        case "elektronik":
            return <ElectronicInputs register={register} errors={errors} setValue={setValue} watch={watch} />;
        case "perabot":
            return <FurnitureInputs register={register} errors={errors} setValue={setValue} watch={watch} />;
        case "kendaraan":
            return <VehicleInputs register={register} errors={errors} setValue={setValue} watch={watch} />;
        case "ruangan":
        case "asrama":
            return <RoomInputs register={register} errors={errors} setValue={setValue} watch={watch} />;
        default:
            return null;
    }
};

export default function AddAssetPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isPending, startTransition] = useTransition();
    const [activeType, setActiveType] = useState<AssetType>("elektronik");

    const form = useForm<Asset>({
        resolver: zodResolver(assetSchema) as Resolver<Asset>,
        defaultValues: {
            type: "elektronik",
            status: "tersedia",
            name: "",
            category: "Elektronik",
            location: "",
            notes: "",
            createdAt: new Date(0),
            updatedAt: new Date(0),
            id: "",
            assetsId: "",
            addedBy: "Admin",
        },
    });

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        getValues,
        formState: { errors },
    } = form;

    const watchedType = watch("type");
    const watchedAssetsId = watch("assetsId");

    useEffect(() => {
        if (!getValues("id")) {
            setValue("id", crypto.randomUUID());
        }
    }, [setValue, getValues]);

    useEffect(() => {
        if (!watchedAssetsId) {
            setValue("assetsId", generateAssetId());
        }
    }, [watchedAssetsId, setValue]);

    useEffect(() => {
        if (watchedType) {
            setActiveType(watchedType);
            const mappedCategory = CATEGORY_MAP[watchedType];
            if (mappedCategory) {
                setValue("category", mappedCategory, { shouldValidate: true });
            }
        }
    }, [watchedType, setValue]);

    const handleRefreshId = useCallback(() => {
        setValue("assetsId", generateAssetId(), { shouldDirty: true, shouldValidate: true });
        toast.info("ID Aset baru berhasil dibuat");
    }, [setValue]);

    const onSubmit = useCallback(
        (data: Asset) => {
            startTransition(async () => {
                try {
                    const supabase = createClient();
                    const payload = createAssetPayload(data);

                    const { error } = await supabase.from("assets").insert(payload);

                    if (error) throw new Error(error.message);

                    toast.success("Aset berhasil ditambahkan");
                    await queryClient.invalidateQueries({ queryKey: ["assets"] });
                    router.push("/assets");
                } catch (err: unknown) {
                    console.error(err);
                    const msg = err instanceof Error ? err.message : "Gagal menambahkan aset";
                    toast.error(msg);
                }
            });
        },
        [router, queryClient]
    );

    const onInvalid = useCallback((formErrors: FieldErrors<Asset>) => {
        console.error("Form Validation Errors:", formErrors);
        toast.error("Mohon periksa kembali inputan Anda. Masih ada data yang belum sesuai.");
    }, []);

    return (
        <div className="container mx-auto py-8 px-4 sm:px-6 max-w-7xl">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Tambah Aset Baru</h1>
                    <p className="text-slate-500 text-sm mt-1">Daftarkan aset ke dalam sistem</p>
                </div>

            </div>

            <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    <div className="lg:col-span-2 space-y-8">

                        <Card className="border border-dashed border-slate-300 shadow-none bg-white rounded-xl overflow-hidden">
                            <CardHeader className="bg-white border-b border-dashed border-slate-300 pb-6 pt-3 px-6 items-center">
                                <CardTitle className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-3 mx-0">Informasi Umum</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <Field className="space-y-1.5">
                                    <FieldLabel className=" font-semibold text-slate-900">
                                        Nama Aset <span className="text-red-500">*</span>
                                    </FieldLabel>
                                    <FieldContent>
                                        <Input
                                            {...register("name")}
                                            placeholder="Masukkan nama aset"
                                            className="bg-slate-50 border-dashed border-slate-300 focus:border-solid focus:border-black focus:ring-0 rounded-lg h-11"
                                        />
                                        <FieldError errors={[errors.name]} />
                                    </FieldContent>
                                </Field>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <Field className="space-y-1.5">
                                        <FieldLabel className=" font-semibold text-slate-900">
                                            Jenis Aset <span className="text-red-500">*</span>
                                        </FieldLabel>
                                        <FieldContent>
                                            <Select
                                                onValueChange={(val) =>
                                                    setValue("type", val as AssetType)
                                                }
                                                defaultValue={activeType}
                                            >
                                                <SelectTrigger className="w-full bg-slate-50 border-dashed border-slate-300 focus:border-solid focus:border-black focus:ring-0 rounded-lg h-11">
                                                    <SelectValue placeholder="Pilih jenis aset" />
                                                </SelectTrigger>
                                                <SelectContent className="border-dashed shadow-none">
                                                    <SelectItem value="elektronik">Elektronik</SelectItem>
                                                    <SelectItem value="perabot">Perabot</SelectItem>
                                                    <SelectItem value="kendaraan">Kendaraan</SelectItem>
                                                    <SelectItem value="ruangan">Ruangan</SelectItem>
                                                    <SelectItem value="asrama">Asrama</SelectItem>
                                                    <SelectItem value="lainnya">Lainnya</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FieldError errors={[errors.type]} />
                                        </FieldContent>
                                    </Field>

                                    <Field className="space-y-1.5">
                                        <FieldLabel className=" font-semibold text-slate-900">
                                            Kategori <span className="text-red-500">*</span>
                                        </FieldLabel>
                                        <FieldContent>
                                            <Input
                                                {...register("category")}
                                                placeholder="Contoh: Elektronik Kantor"
                                                className="bg-slate-50 border-dashed border-slate-300 focus:border-solid focus:border-black focus:ring-0 rounded-lg h-11"
                                            />
                                            <FieldError errors={[errors.category]} />
                                        </FieldContent>
                                    </Field>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <Field className="space-y-1.5">
                                        <FieldLabel className=" font-semibold text-slate-900">
                                            Lokasi <span className="text-red-500">*</span>
                                        </FieldLabel>
                                        <FieldContent>
                                            <Input
                                                {...register("location")}
                                                placeholder="Contoh: PPKASN"
                                                className="bg-slate-50 border-dashed border-slate-300 focus:border-solid focus:border-black focus:ring-0 rounded-lg h-11"
                                            />
                                            <FieldError errors={[errors.location]} />
                                        </FieldContent>
                                    </Field>

                                    <Field className="space-y-1.5">
                                        <FieldLabel className=" font-semibold text-slate-900">
                                            Status <span className="text-red-500">*</span>
                                        </FieldLabel>
                                        <FieldContent>
                                            <Select
                                                onValueChange={(val) =>
                                                    setValue("status", val as Asset["status"])
                                                }
                                                defaultValue="tersedia"
                                            >
                                                <SelectTrigger className="w-full bg-slate-50 border-dashed border-slate-300 focus:border-solid focus:border-black focus:ring-0 rounded-lg h-11">
                                                    <SelectValue placeholder="Pilih status" />
                                                </SelectTrigger>
                                                <SelectContent className="border-dashed shadow-none">
                                                    {ASSET_STATUSES.map((status) => (
                                                        <SelectItem key={status} value={status}>
                                                            {status.charAt(0).toUpperCase() +
                                                                status.slice(1)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FieldError errors={[errors.status]} />
                                        </FieldContent>
                                    </Field>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border border-dashed border-slate-300 shadow-none bg-white rounded-xl overflow-hidden">
                            <CardHeader className="bg-white border-b border-dashed border-slate-300 pb-6 pt-3 px-6 items-center">
                                <CardTitle className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-3">Detail Spesifik</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <SpecificFieldsSelector
                                    type={activeType}
                                    register={register}
                                    errors={errors}
                                    setValue={setValue}
                                    watch={watch}
                                />

                                <Field className="pt-2 space-y-1.5">
                                    <FieldLabel className=" font-semibold text-slate-900">Catatan Tambahan</FieldLabel>
                                    <FieldContent>
                                        <Textarea
                                            {...register("notes")}
                                            placeholder="Tuliskan catatan atau informasi lainnya..."
                                            className="min-h-[120px] bg-slate-50 border-dashed border-slate-300 focus:border-solid focus:border-black focus:ring-0 rounded-lg p-4 resize-none"
                                        />
                                    </FieldContent>
                                </Field>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-3 border-t bg-white px-6 py-4 border-t-slate-200 border-dashed">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push("/assets")}
                                    disabled={isPending}
                                    className="h-12 px-6 shadow-none border border-dashed border-slate-300 hover:bg-white hover:border-slate-400 rounded-full text-sm font-bold"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isPending}
                                    className="min-w-[140px] shadow-none rounded-full text-base font-bold bg-black hover:bg-zinc-800 text-white h-12 px-8"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>

                                            Simpan Aset
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <QRCodeSection
                            assetId={watchedAssetsId || ""}
                            onRefresh={handleRefreshId}
                        />
                    </div>
                </div >
            </form >
        </div >
    );
}
