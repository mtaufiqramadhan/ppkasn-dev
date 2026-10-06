"use client";

import { useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm, useWatch, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowDown, ArrowUp, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { cmsProgramSchema, PROGRAM_CATEGORIES, type CmsProgramFormValues } from "../schemas/cms-program-schema";
import { createSubPelatihanDraft, prepareProgramForEditor } from "../utils/program-editor";
import type { ProgramItem } from "../types";
import { ProgramContactFields, ProgramCurriculumEditor, ProgramField, ProgramListField, ProgramRequirementsFields, ProgramScheduleFields, ProgramSelect } from "./cms-program-form-fields";

const tabStyle="h-10 flex-none rounded-2xl sm:rounded-3xl border border-dashed border-border bg-card px-3 font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[state=active]:border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background";
const innerTabStyle="h-9 flex-none rounded-2xl sm:rounded-3xl border-0 bg-transparent text-sm text-muted-foreground data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground focus-visible:ring-2 focus-visible:ring-ring";

export function CmsProgramEditor({program,isNew,isSaving,onSave,onClose}: {
  program:ProgramItem;isNew:boolean;isSaving:boolean;onSave:(program:ProgramItem)=>Promise<void>;onClose:()=>void;
}) {
  const [tab,setTab]=useState("information");
  const [selectedSub,setSelectedSub]=useState(0);
  const [subTab,setSubTab]=useState("information");
  const [discardOpen,setDiscardOpen]=useState(false);
  const [invalid,setInvalid]=useState(false);
  const form=useForm<CmsProgramFormValues>({resolver:zodResolver(cmsProgramSchema),defaultValues:prepareProgramForEditor(program),shouldFocusError:true});
  const {fields,append,remove,move}=useFieldArray({control:form.control,name:"subPelatihan",keyName:"formKey"});
  const subValues=useWatch({control:form.control,name:"subPelatihan"});
  const title=useWatch({control:form.control,name:"title"});
  const slugWasEdited=!!form.formState.dirtyFields.slug;
  useEffect(()=>{
    if(isNew && !slugWasEdited) form.setValue("slug",title.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""));
  },[title,isNew,slugWasEdited,form]);
  useEffect(()=>{
    const handler=(event:BeforeUnloadEvent)=>{if(form.formState.isDirty){event.preventDefault();event.returnValue="";}};
    window.addEventListener("beforeunload",handler);return()=>window.removeEventListener("beforeunload",handler);
  },[form.formState.isDirty]);

  const handleInvalid=(errors:FieldErrors<CmsProgramFormValues>)=>{
    setInvalid(true);
    if(errors.subPelatihan){
      setTab("subpelatihan");
      const index=Object.keys(errors.subPelatihan).find(key=>/^\d+$/.test(key));
      if(index){
        setSelectedSub(Number(index));
        const subError=errors.subPelatihan[Number(index)];
        setSubTab(subError?.curriculum || subError?.objectives ? "curriculum" : subError?.requirements || subError?.facilities || subError?.fundingScheme ? "requirements" : subError?.contactPerson ? "contact" : "information");
      }
    }else if(errors.curriculum || errors.objectives) setTab("curriculum");
    else if(errors.requirements || errors.facilities || errors.fundingScheme) setTab("requirements");
    else if(errors.contactPerson) setTab("contact");
    else setTab("information");
    requestAnimationFrame(()=>document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
  };
  const activeIndex=Math.min(selectedSub,Math.max(0,fields.length-1));
  const prefix=`subPelatihan.${activeIndex}.` as const;
  const addSub=()=>{append(createSubPelatihanDraft(form.getValues()));setSelectedSub(fields.length);setSubTab("information");};
  const close=()=>form.formState.isDirty ? setDiscardOpen(true) : onClose();

  return <FormProvider {...form}>
    <form noValidate onSubmit={form.handleSubmit(async values=>{setInvalid(false);await onSave(values);},handleInvalid)} className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-3">
          <Button type="button" variant="ghost" size="sm" onClick={close} disabled={isSaving} className="-ml-2 text-muted-foreground"><ArrowLeft />Daftar pelatihan</Button>
          <h1 className="text-2xl font-semibold tracking-tight">{isNew ? "Tambah pelatihan" : "Edit pelatihan"}</h1>
          {!isNew && <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{program.title}</p>}
        </div>
        
      </header>
      {invalid && <p role="alert" className="rounded-2xl sm:rounded-3xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">Periksa field yang ditandai sebelum menyimpan. Semua perubahan tetap ada di editor.</p>}
      <fieldset disabled={isSaving} className="min-w-0">
      <Tabs value={tab} onValueChange={setTab} className="gap-0 overflow-hidden rounded-2xl sm:rounded-3xl border border-dashed border-border bg-card">
        <div className="overflow-x-auto border-b border-dashed border-border px-4 sm:px-6">
          <TabsList className="h-auto w-max min-w-full justify-start gap-2 rounded-none border-0 bg-transparent py-4" aria-label="Editor pelatihan">
            <TabsTrigger value="information" className={tabStyle}>Informasi umum</TabsTrigger>
            <TabsTrigger value="subpelatihan" className={tabStyle}>Subpelatihan ({fields.length})</TabsTrigger>
            <TabsTrigger value="curriculum" className={tabStyle}>Kurikulum umum</TabsTrigger>
            <TabsTrigger value="requirements" className={tabStyle}>Persyaratan & fasilitas</TabsTrigger>
            <TabsTrigger value="contact" className={tabStyle}>Narahubung</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="information" className="m-0 space-y-8 p-4 sm:p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2"><ProgramField name="title" label="Nama pelatihan" /></div>
            <ProgramField name="slug" label="Alamat halaman (slug)" />
            <ProgramSelect name="type" label="Tipe pelatihan" options={[{value:"diklat",label:"Diklat nasional"},{value:"luar-negeri",label:"Pelatihan luar negeri"}]} />
            <ProgramSelect name="category" label="Kategori" options={PROGRAM_CATEGORIES.map(value=>({value,label:value}))} />
            <ProgramField name="batch" label="Angkatan / batch" />
            <div className="sm:col-span-2"><ProgramField name="organizer" label="Penyelenggara" /></div>
            <div className="sm:col-span-2"><ProgramField name="shortDescription" label="Ringkasan katalog" multiline /></div>
            <div className="sm:col-span-2"><ProgramField name="fullDescription" label="Deskripsi lengkap pelatihan" multiline /></div>
          </div>
          <section className="space-y-5 border-t border-dashed border-border pt-6"><h2 className="text-base font-semibold">Pelaksanaan umum</h2><ProgramScheduleFields /></section>
          <section className="space-y-5 border-t border-dashed border-border pt-6">
            <h2 className="text-base font-semibold">Tampilan katalog</h2>
            <div className="grid gap-5 sm:grid-cols-2"><ProgramField name="countryFlag" label="Penanda negara" /><ProgramField name="accentColor" label="Warna aksen (#RRGGBB)" /></div>
            <ProgramListField name="tags" label="Tag pelatihan" />
          </section>
        </TabsContent>
        <TabsContent value="curriculum" className="m-0 space-y-8 p-4 sm:p-6">
          <ProgramListField name="objectives" label="Tujuan & manfaat pembelajaran umum" />
          <ProgramCurriculumEditor name="curriculum" />
        </TabsContent>
        <TabsContent value="requirements" className="m-0 p-4 sm:p-6"><ProgramRequirementsFields /></TabsContent>
        <TabsContent value="contact" className="m-0 p-4 sm:p-6"><ProgramContactFields /></TabsContent>
        <TabsContent value="subpelatihan" className="m-0 p-4 sm:p-6">
          <div className="grid items-start gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
            <aside className="min-w-0 space-y-3">
              <Button type="button" variant="outline" onClick={addSub} className="w-full border-dashed border-border bg-card text-foreground"><Plus />Tambah subpelatihan</Button>
              <nav aria-label="Pilih subpelatihan" className="flex gap-2 overflow-x-auto pb-2 lg:max-h-[65vh] lg:flex-col lg:overflow-y-auto">
                {fields.map((sub,index)=><button key={sub.formKey} type="button" aria-current={index===activeIndex ? "true" : undefined} onClick={()=>{setSelectedSub(index);setSubTab("information");}}
                  className={`min-w-52 rounded-2xl sm:rounded-3xl border border-dashed p-3 text-left text-sm leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring lg:min-w-0 ${index===activeIndex ? "border-foreground bg-secondary text-foreground" : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                  <span className="block font-medium">{subValues?.[index]?.title || "Subpelatihan baru"}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{subValues?.[index]?.code || "Tanpa kode"} · {subValues?.[index]?.curriculum?.length ?? 0} modul</span>
                </button>)}
              </nav>
            </aside>
            {fields.length===0 ? <div className="py-12 text-center text-sm text-muted-foreground">Tambahkan subpelatihan untuk mengatur detail dan modulnya.</div> :
              <div key={fields[activeIndex].formKey} className="min-w-0 space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 className="max-w-xl text-base font-semibold leading-relaxed">{subValues?.[activeIndex]?.title || "Subpelatihan baru"}</h2>
                  <div className="flex gap-1">
                    <Button type="button" variant="ghost" size="icon-sm" disabled={activeIndex===0} onClick={()=>{move(activeIndex,activeIndex-1);setSelectedSub(activeIndex-1);}} aria-label="Naikkan urutan subpelatihan"><ArrowUp /></Button>
                    <Button type="button" variant="ghost" size="icon-sm" disabled={activeIndex===fields.length-1} onClick={()=>{move(activeIndex,activeIndex+1);setSelectedSub(activeIndex+1);}} aria-label="Turunkan urutan subpelatihan"><ArrowDown /></Button>
                    <Button type="button" variant="ghost" size="sm" onClick={()=>{remove(activeIndex);setSelectedSub(Math.max(0,activeIndex-1));}} className="text-destructive hover:bg-destructive/10"><Trash2 />Hapus</Button>
                  </div>
                </div>
                <Tabs value={subTab} onValueChange={setSubTab} className="gap-5">
                  <div className="overflow-x-auto border-b border-dashed border-border pb-3"><TabsList aria-label="Detail subpelatihan" className="h-auto w-max min-w-full justify-start gap-1 rounded-none border-0 bg-transparent p-0">
                    <TabsTrigger value="information" className={innerTabStyle}>Informasi & jadwal</TabsTrigger>
                    <TabsTrigger value="curriculum" className={innerTabStyle}>Tujuan & modul</TabsTrigger>
                    <TabsTrigger value="requirements" className={innerTabStyle}>Persyaratan & fasilitas</TabsTrigger>
                    <TabsTrigger value="contact" className={innerTabStyle}>Narahubung</TabsTrigger>
                  </TabsList></div>
                  <TabsContent value="information" className="m-0 space-y-6">
                    <ProgramField name={`${prefix}title`} label="Nama subpelatihan" />
                    <ProgramField name={`${prefix}code`} label="Kode subpelatihan" />
                    <ProgramField name={`${prefix}description`} label="Deskripsi lengkap subpelatihan" multiline />
                    <ProgramScheduleFields prefix={prefix} />
                  </TabsContent>
                  <TabsContent value="curriculum" className="m-0 space-y-8"><ProgramListField name={`${prefix}objectives`} label="Tujuan & manfaat pembelajaran" /><ProgramCurriculumEditor name={`${prefix}curriculum`} /></TabsContent>
                  <TabsContent value="requirements" className="m-0"><ProgramRequirementsFields prefix={prefix} /></TabsContent>
                  <TabsContent value="contact" className="m-0"><ProgramContactFields prefix={prefix} /></TabsContent>
                </Tabs>
              </div>}
          </div>
        </TabsContent>
      </Tabs>
      </fieldset>
      <div className="flex justify-end"><Button type="submit" disabled={isSaving} className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90">
          {isSaving ? <Loader2 className="animate-spin" /> : <Save />}{isSaving ? "Menyimpan…" : "Simpan pelatihan"}
        </Button></div>
    </form>
    <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}><AlertDialogContent className="rounded-2xl sm:rounded-3xl border-border bg-card"><AlertDialogHeader><AlertDialogTitle>Tinggalkan perubahan?</AlertDialogTitle><AlertDialogDescription>Perubahan yang belum disimpan akan hilang.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel className="bg-card text-foreground">Lanjut mengedit</AlertDialogCancel><AlertDialogAction onClick={onClose} className="bg-foreground text-background">Tinggalkan editor</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </FormProvider>;
}
