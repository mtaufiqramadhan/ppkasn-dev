"use client"

import { useState, type FormEvent } from "react"
import { Download, Upload, AlertCircle, CheckCircle2, type LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type ExportFormat = "sql" | "csv" | "json"
type TableOption = "assets" | "room_bookings"

interface RestoreStatusState {
    type: "success" | "error" | null
    message: string
}

interface ExportConfig {
    format: ExportFormat
    label: string
    description: string
}

const TABLE_OPTIONS: { value: TableOption; label: string }[] = [
    { value: "assets", label: "Assets Data" },
    { value: "room_bookings", label: "Room Bookings" },
]

const EXPORT_FORMATS: ExportConfig[] = [
    {
        format: "json",
        label: "JSON Format",
        description: "Full fidelity data structure",
    },
    {
        format: "csv",
        label: "CSV Format",
        description: "Spreadsheet compatible",
    },
    {
        format: "sql",
        label: "SQL Format",
        description: "Database migration scripts",
    },
]

function useBackupRestore() {
    const [isRestoring, setIsRestoring] = useState(false)
    const [selectedTable, setSelectedTable] = useState<string>("assets")
    const [restoreStatus, setRestoreStatus] = useState<RestoreStatusState>({
        type: null,
        message: "",
    })

    const handleBackup = (format: ExportFormat) => {
        window.location.href = `/api/backup?format=${format}&table=${selectedTable}`
    }

    const handleRestore = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setRestoreStatus({ type: null, message: "" })
        setIsRestoring(true)

        try {
            const formData = new FormData(e.currentTarget)
            formData.append("table", selectedTable)

            const response = await fetch("/api/restore", {
                method: "POST",
                body: formData,
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || "Failed to restore data")
            }

            setRestoreStatus({
                type: "success",
                message: "Data restored successfully!",
            })
        } catch (error) {
            setRestoreStatus({
                type: "error",
                message:
                    error instanceof Error ? error.message : "Unknown error occurred",
            })
        } finally {
            setIsRestoring(false)
            e.currentTarget.reset()
        }
    }

    return {
        isRestoring,
        selectedTable,
        setSelectedTable,
        restoreStatus,
        handleBackup,
        handleRestore,
    }
}

function PageHeader() {
    return (
        <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Backup & Restore
            </h1>
            <p className="text-slate-500">Manage your system data securely.</p>
        </div>
    )
}

function DataSourceSelector({
    value,
    onValueChange,
}: {
    value: string
    onValueChange: (val: string) => void
}) {
    return (
        <div className="w-full sm:w-[280px]">
            <Select value={value} onValueChange={onValueChange}>
                <SelectTrigger className="h-12 border border-dashed border-slate-300 rounded-xl shadow-none hover:border-slate-400 focus:ring-0 focus:border-slate-900 bg-white text-base font-medium transition-colors">
                    <SelectValue placeholder="Select Data Source" />
                </SelectTrigger>
                <SelectContent className="border border-dashed border-slate-300 rounded-xl shadow-none p-1.5 bg-white">
                    {TABLE_OPTIONS.map((option) => (
                        <SelectItem
                            key={option.value}
                            value={option.value}
                            className="rounded-lg focus:bg-slate-50 focus:text-slate-900 cursor-pointer text-sm font-medium py-2.5 px-3 mb-1 last:mb-0"
                        >
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}

function StatusAlert({ status }: { status: RestoreStatusState }) {
    if (!status.type) return null

    const isSuccess = status.type === "success"
    const Icon = isSuccess ? CheckCircle2 : AlertCircle
    const title = isSuccess ? "Restore Successful" : "Restore Failed"
    const borderColor = isSuccess ? "border-emerald-200" : "border-red-200"
    const bgColor = isSuccess ? "bg-emerald-50" : "bg-red-50"
    const textColor = isSuccess ? "text-emerald-800" : "text-red-800"

    return (
        <div
            className={`p-4 rounded-xl border border-dashed ${borderColor} ${bgColor} ${textColor} flex items-start gap-3`}
        >
            <Icon className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
                <p className="font-bold text-sm">{title}</p>
                <p className="text-xs opacity-90">{status.message}</p>
            </div>
        </div>
    )
}

function ExportButton({
    config,
    onClick,
}: {
    config: ExportConfig
    onClick: () => void
}) {
    return (
        <Button
            className="w-full h-auto py-4 px-4 border border-dashed border-slate-300 rounded-xl bg-slate-50/50 hover:bg-slate-100/50 hover:border-slate-400 text-slate-900 justify-start transition-all shadow-none group"
            variant="ghost"
            onClick={onClick}
        >
            <div className="h-10 w-10 rounded-lg bg-white border border-dashed border-slate-300 flex items-center justify-center mr-4 group-hover:border-slate-400 transition-colors">
                <Download className="h-5 w-5 text-slate-500 group-hover:text-slate-900" />
            </div>
            <div className="flex flex-col items-start gap-0.5">
                <span className="font-bold text-sm">{config.label}</span>
                <span className="text-xs text-slate-500 font-normal">
                    {config.description}
                </span>
            </div>
        </Button>
    )
}

function ExportCard({
    tableName,
    onExport,
}: {
    tableName: string
    onExport: (format: ExportFormat) => void
}) {
    return (
        <div className="p-6 rounded-xl border border-dashed border-slate-300 bg-white space-y-6">
            <div className="space-y-1">
                <h3 className="font-bold text-lg tracking-tight text-slate-900">
                    Export Data
                </h3>
                <p className="text-sm text-slate-500">
                    Download current snapshot of {tableName.replace("_", " ")}.
                </p>
            </div>

            <div className="space-y-3">
                {EXPORT_FORMATS.map((config) => (
                    <ExportButton
                        key={config.format}
                        config={config}
                        onClick={() => onExport(config.format)}
                    />
                ))}
            </div>
        </div>
    )
}

function FileUploadBox() {
    return (
        <div className="group relative">
            <Input
                id="file"
                name="file"
                type="file"
                required
                accept=".json,.csv,.sql"
                className="h-48 w-full border border-dashed border-slate-300 rounded-xl bg-slate-50/30 file:hidden hover:border-slate-400 hover:bg-slate-50/50 transition-all text-transparent cursor-pointer flex items-center justify-center p-0 z-10 relative focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
            />
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center gap-3 text-slate-400 group-hover:text-slate-600 transition-colors z-0">
                <div className="h-12 w-12 rounded-xl bg-white border border-dashed border-slate-300 flex items-center justify-center shadow-sm">
                    <Upload className="h-6 w-6" />
                </div>
                <div className="text-center space-y-1">
                    <p className="font-medium text-sm text-slate-700">
                        Click to Select File
                    </p>
                </div>
            </div>
        </div>
    )
}

function ImportCard({
    tableName,
    isRestoring,
    restoreStatus,
    onRestore,
}: {
    tableName: string
    isRestoring: boolean
    restoreStatus: RestoreStatusState
    onRestore: (e: FormEvent<HTMLFormElement>) => void
}) {
    return (
        <div className="p-6 rounded-xl border border-dashed border-slate-300 bg-white space-y-6">
            <div className="space-y-1">
                <h3 className="font-bold text-lg tracking-tight text-slate-900">
                    Import Data
                </h3>
                <p className="text-sm text-slate-500">
                    Restore or update {tableName.replace("_", " ")} from file.
                </p>
            </div>

            <form onSubmit={onRestore} className="space-y-6">
                <FileUploadBox />

                <Button
                    type="submit"
                    disabled={isRestoring}
                    className="w-full h-12 rounded-xl text-sm font-bold shadow-none hover:shadow-none transition-transform active:scale-[0.98] bg-black text-white hover:bg-slate-800 border-0 ring-0"
                >
                    {isRestoring ? "Processing..." : "Start Restore"}
                </Button>

                <StatusAlert status={restoreStatus} />
            </form>
        </div>
    )
}

export default function BackupRestorePage() {
    const {
        isRestoring,
        selectedTable,
        setSelectedTable,
        restoreStatus,
        handleBackup,
        handleRestore,
    } = useBackupRestore()

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
            <PageHeader />

            <div className="space-y-6">
                <DataSourceSelector
                    value={selectedTable}
                    onValueChange={setSelectedTable}
                />

                <div className="grid gap-6 md:grid-cols-2">
                    <ExportCard tableName={selectedTable} onExport={handleBackup} />

                    <ImportCard
                        tableName={selectedTable}
                        isRestoring={isRestoring}
                        restoreStatus={restoreStatus}
                        onRestore={handleRestore}
                    />
                </div>
            </div>
        </div>
    )
}
