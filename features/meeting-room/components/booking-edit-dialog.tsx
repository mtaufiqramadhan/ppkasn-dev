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
import { type BookingPayload, type Room, UNIT_KERJA_OPTIONS } from "../types";

export interface BookingEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  rooms: Room[];
  selectedRoomIds: string[];
  onRoomIdsChange: (roomIds: string[]) => void;
  form: Partial<BookingPayload>;
  onFormChange: (form: Partial<BookingPayload>) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function BookingEditDialog({
  isOpen,
  onOpenChange,
  rooms,
  selectedRoomIds,
  onRoomIdsChange,
  form,
  onFormChange,
  onSave,
  isSaving,
}: BookingEditDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto scroll-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:max-w-[425px] rounded-2xl sm:rounded-3xl border border-dashed border-border shadow-none">
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
                className="rounded-2xl sm:rounded-3xl border-dashed border-border shadow-none focus:ring-0 focus:border-ring"
                value={form.bookingStart ? String(form.bookingStart).split("T")[0] : ""}
                onChange={(e) => onFormChange({ ...form, bookingStart: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bookingEnd">Tanggal Selesai</Label>
              <Input
                id="bookingEnd"
                type="date"
                className="rounded-2xl sm:rounded-3xl border-dashed border-border shadow-none focus:ring-0 focus:border-ring"
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
                className="rounded-2xl sm:rounded-3xl border-dashed border-border shadow-none focus:ring-0 focus:border-ring"
                value={form.startTime || ""}
                onChange={(e) => onFormChange({ ...form, startTime: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endTime">Waktu Selesai</Label>
              <Input
                id="endTime"
                type="time"
                className="rounded-2xl sm:rounded-3xl border-dashed border-border shadow-none focus:ring-0 focus:border-ring"
                value={form.endTime || ""}
                onChange={(e) => onFormChange({ ...form, endTime: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name">Nama Peminjam</Label>
            <Input
              id="name"
              className="rounded-2xl sm:rounded-3xl border-dashed border-border shadow-none focus:ring-0 focus:border-ring"
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
              <SelectTrigger className="rounded-2xl sm:rounded-3xl border-dashed border-border shadow-none focus:ring-0 focus:border-ring">
                <SelectValue placeholder="Pilih unit kerja" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl sm:rounded-3xl border-dashed border-border shadow-none">
                {UNIT_KERJA_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt} className="rounded-2xl sm:rounded-3xl focus:bg-accent cursor-pointer">
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
              className="rounded-2xl sm:rounded-3xl border-dashed border-border shadow-none focus:ring-0 focus:border-ring"
              value={form.purpose || ""}
              onChange={(e) => onFormChange({ ...form, purpose: e.target.value })}
            />
          </div>
          <fieldset className="grid gap-2" disabled={isSaving}>
            <legend className="mb-2 text-sm font-medium">Ruangan</legend>
            <div className="max-h-44 overflow-y-auto scroll-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden rounded-2xl border border-dashed border-border p-3 sm:rounded-3xl">
              {rooms.length === 0 && <p className="text-sm text-muted-foreground">Belum ada ruangan tersedia.</p>}
              {rooms.map((room) => (
                <label key={room.id} className="flex cursor-pointer items-center gap-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-primary"
                    checked={selectedRoomIds.includes(room.id)}
                    onChange={(event) => onRoomIdsChange(event.target.checked
                      ? [...selectedRoomIds, room.id]
                      : selectedRoomIds.filter((id) => id !== room.id))}
                  />
                  <span>{room.name}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Pilih satu atau lebih ruangan.</p>
          </fieldset>
          <div className="grid gap-2">
            <Label htmlFor="notes">Catatan</Label>
            <Textarea
              id="notes"
              className="rounded-2xl sm:rounded-3xl border-dashed border-border shadow-none focus:ring-0 focus:border-ring"
              value={form.notes || ""}
              onChange={(e) => onFormChange({ ...form, notes: e.target.value })}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-2xl sm:rounded-3xl border-dashed border-border shadow-none hover:bg-accent"
          >
            Batal
          </Button>
          <Button
            onClick={onSave}
            disabled={isSaving || selectedRoomIds.length === 0}
            className="rounded-2xl sm:rounded-3xl shadow-none bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Perubahan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
