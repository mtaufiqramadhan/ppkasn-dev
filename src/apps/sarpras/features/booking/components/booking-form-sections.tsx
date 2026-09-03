"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { type UseFormReturn, Controller } from "react-hook-form";
import { CalendarClock, User, NotebookPen } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Field, FieldLabel, FieldContent, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { type BookingFormData } from "../schemas/booking-schema";
import { UNIT_KERJA_OPTIONS } from "../types";

export const ActivityTimeSection: React.FC<{
  form: UseFormReturn<BookingFormData>;
}> = ({ form }) => {
  const {
    control,
    register,
    formState: { errors },
    setValue,
    watch,
  } = form;
  const [openStart, setOpenStart] = useState(false);
  const [openEnd, setOpenEnd] = useState(false);
  const bookingStart = watch("bookingStart");

  return (
    <Card className="border border-dashed border-slate-300 shadow-none bg-white rounded-xl overflow-hidden h-fit">
      <CardHeader className="bg-white border-b border-dashed border-slate-300 pb-6 pt-3 px-6 items-center">
        <CardTitle className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          <CalendarClock className="w-6 h-6 text-black" strokeWidth={1.5} />
          Waktu
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field>
            <FieldLabel>
              Tanggal Mulai <span className="text-red-500">*</span>
            </FieldLabel>
            <FieldContent>
              <Controller
                control={control}
                name="bookingStart"
                render={({ field }) => (
                  <Popover open={openStart} onOpenChange={setOpenStart}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-slate-50 border-dashed border-slate-300 hover:bg-slate-100 hover:border-slate-400 focus:border-solid focus:border-black focus:ring-0 rounded-lg h-11",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd MMMM yyyy")
                        ) : (
                          <span>Pilih tanggal</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <ShadcnCalendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={(date) => {
                          field.onChange(date);
                          setOpenStart(false);
                          setValue("bookingEnd", date);
                        }}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              <FieldError errors={[errors.bookingStart]} />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>Tanggal Selesai (Opsional)</FieldLabel>
            <FieldContent>
              <Controller
                control={control}
                name="bookingEnd"
                render={({ field }) => (
                  <Popover open={openEnd} onOpenChange={setOpenEnd}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-slate-50 border-dashed border-slate-300 hover:bg-slate-100 hover:border-slate-400 focus:border-solid focus:border-black focus:ring-0 rounded-lg h-11",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd MMMM yyyy")
                        ) : (
                          <span>Pilih tanggal</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <ShadcnCalendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={(date) => {
                          field.onChange(date);
                          setOpenEnd(false);
                        }}
                        disabled={(date) => !!bookingStart && date < bookingStart}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              <FieldError errors={[errors.bookingEnd]} />
            </FieldContent>
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field>
            <FieldLabel>
              Jam Mulai <span className="text-red-500">*</span>
            </FieldLabel>
            <FieldContent>
              <Input
                type="time"
                {...register("startTime")}
                className="bg-slate-50 border-dashed border-slate-300 focus:border-solid focus:border-black focus:ring-0 rounded-lg h-11"
              />
              <FieldError errors={[errors.startTime]} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>
              Jam Selesai <span className="text-red-500">*</span>
            </FieldLabel>
            <FieldContent>
              <Input
                type="time"
                {...register("endTime")}
                className="bg-slate-50 border-dashed border-slate-300 focus:border-solid focus:border-black focus:ring-0 rounded-lg h-11"
              />
              <FieldError errors={[errors.endTime]} />
            </FieldContent>
          </Field>
        </div>
      </CardContent>
    </Card>
  );
};

export const UserInfoSection: React.FC<{
  form: UseFormReturn<BookingFormData>;
}> = ({ form }) => {
  const {
    control,
    register,
    formState: { errors },
  } = form;

  return (
    <Card className="border border-dashed border-slate-300 shadow-none bg-white rounded-xl overflow-hidden h-fit">
      <CardHeader className="bg-white border-b border-dashed border-slate-300 pb-6 pt-3 px-6 items-center">
        <CardTitle className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          <User className="w-6 h-6 text-black" strokeWidth={1.5} />
          Informasi Peminjam
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Field>
          <FieldLabel>
            Nama Peminjam <span className="text-red-500">*</span>
          </FieldLabel>
          <FieldContent>
            <Input
              {...register("name")}
              placeholder="Nama lengkap peminjam"
              className="bg-slate-50 border-dashed border-slate-300 focus:border-solid focus:border-black focus:ring-0 rounded-lg h-11"
            />
            <FieldError errors={[errors.name]} />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>
            Nama Unit Kerja <span className="text-red-500">*</span>
          </FieldLabel>
          <FieldContent>
            <Controller
              control={control}
              name="institutionName"
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="bg-slate-50 border-dashed border-slate-300 focus:border-solid focus:border-black focus:ring-0 rounded-lg h-11">
                    <SelectValue placeholder="Pilih unit kerja" />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIT_KERJA_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.institutionName]} />
          </FieldContent>
        </Field>
      </CardContent>
    </Card>
  );
};

export const ActivityNameSection: React.FC<{
  form: UseFormReturn<BookingFormData>;
}> = ({ form }) => {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <Card className="border border-dashed border-slate-300 shadow-none bg-white rounded-xl overflow-hidden h-fit">
      <CardHeader className="bg-white border-b border-dashed border-slate-300 pb-6 pt-3 px-6 items-center">
        <CardTitle className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          <NotebookPen className="w-6 h-6 text-black" strokeWidth={1.5} />
          Nama Kegiatan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Field>
          <FieldLabel>
            Nama Kegiatan <span className="text-red-500">*</span>
          </FieldLabel>
          <FieldContent>
            <Input
              {...register("purpose")}
              placeholder="Contoh: Rapat Koordinasi Tahunan"
              className="bg-slate-50 border-dashed border-slate-300 focus:border-solid focus:border-black focus:ring-0 rounded-lg h-11"
            />
            <FieldError errors={[errors.purpose]} />
          </FieldContent>
        </Field>
      </CardContent>
    </Card>
  );
};
