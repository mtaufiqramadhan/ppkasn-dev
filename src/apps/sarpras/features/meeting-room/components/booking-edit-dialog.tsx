"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type BookingPayload, UNIT_KERJA_OPTIONS } from "../types";

export interface BookingEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  form: Partial<BookingPayload>;
  onFormChange: (form: Partial<BookingPayload>) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function BookingEditDialog({
  isOpen,
  onOpenChange,
  form,
  onFormChange,
  onSave,
  isSaving,
}: BookingEditDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-xl border border-dashed border-slate-300 shadow-none">
        <DialogHeader>
          <DialogTitle>Edit Booking</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="bookingStart">Tanggal Mulai</Label>
              <Input
                id="bookingStart"
                type="date"
                className="rounded-xl border-dashed border-slate-300 shadow-none focus:ring-0 focus:border-slate-400"
                value={form.bookingStart ? String(form.bookingStart).split("T")[0] : ""}
                onChange={(e) => onFormChange({ ...form, bookingStart: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bookingEnd">Tanggal Selesai</Label>
              <Input
                id="bookingEnd"
                type="date"
                className="rounded-xl border-dashed border-slate-300 shadow-none focus:ring-0 focus:border-slate-400"
                value={
                  form.bookingEnd
                    ? String(form.bookingEnd).split("T")[0]
                    : form.bookingStart
                    ? String(form.bookingStart).split("T")[0]
                    : ""
                }
                onChange={(e) => onFormChange({ ...form, bookingEnd: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startTime">Waktu Mulai</Label>
              <Input
                id="startTime"
                type="time"
                className="rounded-xl border-dashed border-slate-300 shadow-none focus:ring-0 focus:border-slate-400"
                value={form.startTime || ""}
                onChange={(e) => onFormChange({ ...form, startTime: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endTime">Waktu Selesai</Label>
              <Input
                id="endTime"
                type="time"
                className="rounded-xl border-dashed border-slate-300 shadow-none focus:ring-0 focus:border-slate-400"
                value={form.endTime || ""}
                onChange={(e) => onFormChange({ ...form, endTime: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name">Nama Peminjam</Label>
            <Input
              id="name"
              className="rounded-xl border-dashed border-slate-300 shadow-none focus:ring-0 focus:border-slate-400"
              value={form.name || ""}
              onChange={(e) => onFormChange({ ...form, name: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="unit">Unit Kerja</Label>
            <Select
              value={form.institutionName}
              onValueChange={(val) => onFormChange({ ...form, institutionName: val })}
            >
              <SelectTrigger className="rounded-xl border-dashed border-slate-300 shadow-none focus:ring-0 focus:border-slate-400">
                <SelectValue placeholder="Pilih unit kerja" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-dashed border-slate-300 shadow-none">
                {UNIT_KERJA_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt} className="rounded-lg focus:bg-slate-50 cursor-pointer">
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="purpose">Kegiatan</Label>
            <Input
              id="purpose"
              className="rounded-xl border-dashed border-slate-300 shadow-none focus:ring-0 focus:border-slate-400"
              value={form.purpose || ""}
              onChange={(e) => onFormChange({ ...form, purpose: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notes">Catatan</Label>
            <Textarea
              id="notes"
              className="rounded-xl border-dashed border-slate-300 shadow-none focus:ring-0 focus:border-slate-400"
              value={form.notes || ""}
              onChange={(e) => onFormChange({ ...form, notes: e.target.value })}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl border-dashed border-slate-300 shadow-none hover:bg-slate-50"
          >
            Batal
          </Button>
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="rounded-xl shadow-none bg-black hover:bg-slate-800 text-white"
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Perubahan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
