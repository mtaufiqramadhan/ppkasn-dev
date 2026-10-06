"use client";

import { Controller, useFieldArray, useFormContext, type FieldPath } from "react-hook-form";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PROGRAM_METHODS, type CmsProgramFormValues } from "../schemas/cms-program-schema";

export type ProgramFieldPath = FieldPath<CmsProgramFormValues>;
export type DetailPrefix = "" | `subPelatihan.${number}.`;
export const STATUS_OPTIONS = [{value:"buka",label:"Buka pendaftaran"},{value:"segera",label:"Segera dibuka"},{value:"penuh",label:"Kuota penuh"},{value:"selesai",label:"Selesai"}];

export function ProgramField({name, label, type = "text", multiline = false, readOnly = false}: {
  name: ProgramFieldPath; label: string; type?: "text" | "number" | "date" | "email"; multiline?: boolean; readOnly?: boolean;
}) {
  const {register, getFieldState, formState} = useFormContext<CmsProgramFormValues>();
  const {error} = getFieldState(name, formState);
  const id = `program-${name.replaceAll(".", "-")}`;
  const registration = register(name, type === "number" ? {setValueAs: (value: string) => value === "" ? undefined : Number(value)} : {});
  return <div className="min-w-0 space-y-1.5">
    <label htmlFor={id} className="text-sm font-medium text-foreground">{label}</label>
    {multiline ? <Textarea id={id} rows={4} {...registration} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} className="rounded-2xl sm:rounded-3xl border-dashed border-input bg-background text-sm leading-relaxed" /> :
      <Input id={id} type={type} min={type === "number" ? 0 : undefined} readOnly={readOnly} {...registration} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} className="h-10 rounded-2xl sm:rounded-3xl border-dashed border-input bg-background text-sm" style={type === "date" ? {colorScheme:"light dark"} : undefined} />}
    {error && <p id={`${id}-error`} role="alert" className="text-xs text-destructive">{error.message}</p>}
  </div>;
}

export function ProgramSelect({name,label,options}: {name:ProgramFieldPath;label:string;options:readonly {value:string;label:string}[]}) {
  const {register,getFieldState,formState} = useFormContext<CmsProgramFormValues>();
  const {error}=getFieldState(name,formState);const id=`program-${name.replaceAll(".","-")}`;
  return <div className="min-w-0 space-y-1.5"><label htmlFor={id} className="text-sm font-medium">{label}</label>
    <select id={id} {...register(name)} aria-invalid={!!error} className="h-10 w-full rounded-2xl sm:rounded-3xl border border-dashed border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {options.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}
    </select>{error && <p role="alert" className="text-xs text-destructive">{error.message}</p>}
  </div>;
}

type ListPath = "objectives" | "requirements" | "facilities" | "tags" | `subPelatihan.${number}.objectives` | `subPelatihan.${number}.requirements` | `subPelatihan.${number}.facilities`;
export function ProgramListField({name,label}: {name:ListPath;label:string}) {
  const {control}=useFormContext<CmsProgramFormValues>();const id=`program-${name.replaceAll(".","-")}`;
  return <Controller control={control} name={name} render={({field,fieldState})=><div className="space-y-1.5">
    <label htmlFor={id} className="text-sm font-medium">{label}</label>
    <Textarea id={id} rows={4} ref={field.ref} name={field.name} onBlur={field.onBlur} value={(field.value ?? []).join("\n")} onChange={event=>field.onChange(event.target.value.split("\n"))} aria-describedby={`${id}-hint`} className="rounded-2xl sm:rounded-3xl border-dashed border-input bg-background text-sm leading-relaxed" />
    <p id={`${id}-hint`} className="text-xs text-muted-foreground">Satu item per baris.</p>
    {fieldState.error && <p role="alert" className="text-xs text-destructive">{fieldState.error.message}</p>}
  </div>} />;
}

export function ProgramScheduleFields({prefix = ""}: {prefix?:DetailPrefix}) {
  const name=(key:string)=>(`${prefix}${key}` as ProgramFieldPath);
  return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
    <ProgramField name={name("duration")} label="Durasi" />
    <ProgramField name={name("hours")} label="Jam pelajaran (JP)" type="number" />
    <ProgramSelect name={name("method")} label="Metode" options={PROGRAM_METHODS.map(value=>({value,label:value}))} />
    <ProgramField name={name("startDate")} label="Tanggal mulai" type="date" />
    <ProgramField name={name("endDate")} label="Tanggal selesai" type="date" />
    <ProgramField name={name("registrationDeadline")} label="Batas pendaftaran" type="date" />
    <ProgramField name={name("quota")} label="Kuota peserta" type="number" />
    <ProgramField name={name("enrolledCount")} label="Jumlah peserta terdaftar" type="number" />
    <ProgramSelect name={name("status")} label="Status pendaftaran" options={STATUS_OPTIONS} />
    <div className="sm:col-span-2"><ProgramField name={name("location")} label="Lokasi pelaksanaan" /></div>
    <ProgramField name={name("country")} label="Negara" />
    <div className="sm:col-span-2 lg:col-span-3"><ProgramField name={name("targetAudience")} label="Sasaran peserta" multiline /></div>
  </div>;
}

export function ProgramRequirementsFields({prefix=""}: {prefix?:DetailPrefix}) {
  return <div className="space-y-5">
    <div className="grid gap-6 sm:grid-cols-2">
      <ProgramListField name={`${prefix}requirements`} label="Persyaratan pendaftaran" />
      <ProgramListField name={`${prefix}facilities`} label="Fasilitas peserta" />
    </div>
    <ProgramField name={`${prefix}fundingScheme`} label="Skema pendanaan" multiline />
  </div>;
}

export function ProgramContactFields({prefix=""}: {prefix?:DetailPrefix}) {
  return <div className="grid gap-5 sm:grid-cols-2">
    <ProgramField name={`${prefix}contactPerson.name`} label="Nama narahubung" />
    <ProgramField name={`${prefix}contactPerson.role`} label="Jabatan / peran" />
    <ProgramField name={`${prefix}contactPerson.email`} label="Email" type="email" />
    <ProgramField name={`${prefix}contactPerson.phone`} label="Telepon / WhatsApp" />
  </div>;
}

export function ProgramCurriculumEditor({name}: {name:"curriculum" | `subPelatihan.${number}.curriculum`}) {
  const {control}=useFormContext<CmsProgramFormValues>();
  const {fields,append,remove,move}=useFieldArray({control,name});
  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h3 className="text-base font-semibold">Kurikulum & silabus <span className="text-sm font-normal text-muted-foreground">({fields.length} modul)</span></h3>
      <Button type="button" variant="outline" className="border-dashed border-border bg-card text-foreground" onClick={()=>append({title:"",duration:"",description:""})}><Plus aria-hidden="true" />Tambah modul</Button>
    </div>
    {fields.length === 0 && <p className="py-6 text-sm text-muted-foreground">Belum ada modul pembelajaran.</p>}
    {fields.map((module,index)=><fieldset key={module.id} className="space-y-4 border-t border-dashed border-border pt-5">
      <legend className="sr-only">Modul {index+1}</legend>
      <div className="flex items-center justify-between gap-3"><span className="text-sm font-medium">Modul {index+1}</span>
        <div className="flex gap-1">
          <Button type="button" variant="ghost" size="icon-sm" disabled={index===0} onClick={()=>move(index,index-1)} aria-label={`Naikkan modul ${index+1}`}><ArrowUp /></Button>
          <Button type="button" variant="ghost" size="icon-sm" disabled={index===fields.length-1} onClick={()=>move(index,index+1)} aria-label={`Turunkan modul ${index+1}`}><ArrowDown /></Button>
          <Button type="button" variant="ghost" size="icon-sm" className="text-destructive hover:bg-destructive/10" onClick={()=>remove(index)} aria-label={`Hapus modul ${index+1}`}><Trash2 /></Button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_10rem]">
        <ProgramField name={`${name}.${index}.title`} label="Judul modul" /><ProgramField name={`${name}.${index}.duration`} label="Durasi modul" />
      </div>
      <ProgramField name={`${name}.${index}.description`} label="Materi / silabus" multiline />
    </fieldset>)}
  </div>;
}
