"use client";
import { useEffect,useState } from "react";
import { Controller,FormProvider,useFieldArray,useForm,useFormContext,useWatch,type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft,ArrowUp,ArrowDown,Plus,Trash2,Save,Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog,AlertDialogContent,AlertDialogHeader,AlertDialogTitle,AlertDialogDescription,AlertDialogFooter,AlertDialogCancel,AlertDialogAction } from "@/components/ui/alert-dialog";
import { cmsNewsSchema,NEWS_CATEGORIES,type CmsNewsFormValues } from "../schemas/cms-news-schema";
const panel="space-y-5 rounded-2xl sm:rounded-3xl border border-dashed border-border bg-card p-4 sm:p-6";
const control="rounded-2xl sm:rounded-3xl border-dashed border-input bg-background text-sm ";
function NewsField({name,label,multiline=false,type="text"}:{name:FieldPath<CmsNewsFormValues>;label:string;multiline?:boolean;type?:"text"|"date"}) {
  const {register,getFieldState,formState}=useFormContext<CmsNewsFormValues>();
  const {error}=getFieldState(name,formState);const id=`news-${name.replaceAll(".","-")}`;
  return <div className="min-w-0 space-y-2"><label htmlFor={id} className="text-sm font-medium">{label}</label>
    {multiline?<Textarea {...register(name)} id={id} rows={4} aria-invalid={!!error} aria-describedby={error?`${id}-error`:undefined} className={control}/>:<Input {...register(name)} id={id} type={type} aria-invalid={!!error} aria-describedby={error?`${id}-error`:undefined} className={`h-11 ${control}`}/>}
    {error && <p id={`${id}-error`} role="alert" className="text-xs text-destructive">{error.message}</p>}
  </div>;
}
function NewsLines({name,label,paragraphs=false}:{name:"tags"|"content.keyTakeaways"|`content.sections.${number}.paragraphs`;label:string;paragraphs?:boolean}) {
  const {control}=useFormContext<CmsNewsFormValues>();const id=`news-${name.replaceAll(".","-")}`;
  return <Controller name={name} control={control} render={({field,fieldState})=><div className="space-y-2">
    <label htmlFor={id} className="text-sm font-medium">{label}</label><Textarea id={id} rows={paragraphs?8:3} className={controlClass} ref={field.ref} name={field.name} onBlur={field.onBlur}
      value={(field.value??[]).join(paragraphs?"\n\n":"\n")} onChange={event=>field.onChange(event.target.value.split(paragraphs?/\n\s*\n/:/\n/))} aria-invalid={!!fieldState.error} aria-describedby={`${id}-hint`}/>
    <p id={`${id}-hint`} className="text-xs text-muted-foreground">{paragraphs?"Pisahkan paragraf dengan satu baris kosong.":"Satu item per baris."}</p>
    {fieldState.error && <p role="alert" className="text-xs text-destructive">{fieldState.error.message}</p>}
  </div>}/>;
}
const controlClass=control;
export function CmsNewsEditor({draft,isNew,isSaving,onSave,onClose}:{draft:CmsNewsFormValues;isNew:boolean;isSaving:boolean;onSave:(values:CmsNewsFormValues)=>Promise<void>;onClose:()=>void}) {
  const form=useForm<CmsNewsFormValues>({resolver:zodResolver(cmsNewsSchema),defaultValues:draft});
  const {fields,append,remove,move}=useFieldArray({control:form.control,name:"content.sections"});
  const title=useWatch({control:form.control,name:"title"});
  const slugEdited=!!form.formState.dirtyFields.slug;
  const [discard,setDiscard]=useState(false);
  useEffect(()=>{if(isNew && !slugEdited)form.setValue("slug",title.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""));},[title,isNew,slugEdited,form]);
  useEffect(()=>{const handle=(event:BeforeUnloadEvent)=>{if(form.formState.isDirty){event.preventDefault();event.returnValue="";}};window.addEventListener("beforeunload",handle);return()=>window.removeEventListener("beforeunload",handle);},[form.formState.isDirty]);
  return <FormProvider {...form}><form noValidate onSubmit={form.handleSubmit(onSave)} className="space-y-6">
    <header className="flex flex-wrap items-start justify-between gap-4"><div><Button type="button" variant="ghost" size="sm" disabled={isSaving} onClick={()=>form.formState.isDirty?setDiscard(true):onClose()} className="-ml-2 text-muted-foreground"><ArrowLeft/>Daftar berita</Button><h1 className="mt-3 text-2xl font-semibold">{isNew?"Tambah berita":"Edit berita"}</h1></div>
      
    </header>
    <fieldset disabled={isSaving} className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-w-0 space-y-6">
        <section className={panel}><h2 className="text-base font-semibold">Artikel</h2><NewsField name="title" label="Judul berita"/><NewsField name="slug" label="Alamat halaman (slug)"/><NewsField name="excerpt" label="Ringkasan" multiline/><NewsField name="content.lead" label="Paragraf pembuka" multiline/></section>
        <section className={panel}><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-base font-semibold">Isi berita</h2><Button type="button" variant="outline" onClick={()=>append({heading:"",paragraphs:[""],quote:{text:"",speaker:"",speakerRole:""}})}><Plus/>Tambah bagian</Button></div>
          {fields.length===0 && <p className="text-sm text-muted-foreground">Tambahkan bagian untuk melengkapi artikel dengan paragraf dan kutipan.</p>}
          {fields.map((section,index)=><div key={section.id} className="space-y-5 border-t border-dashed border-border pt-5">
            <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-medium">Bagian {index+1}</h3><div className="flex gap-1"><Button type="button" variant="ghost" size="icon-sm" disabled={index===0} onClick={()=>move(index,index-1)} aria-label={`Naikkan bagian ${index+1}`}><ArrowUp/></Button><Button type="button" variant="ghost" size="icon-sm" disabled={index===fields.length-1} onClick={()=>move(index,index+1)} aria-label={`Turunkan bagian ${index+1}`}><ArrowDown/></Button><Button type="button" variant="ghost" size="icon-sm" onClick={()=>remove(index)} className="text-destructive" aria-label={`Hapus bagian ${index+1}`}><Trash2/></Button></div></div>
            <NewsField name={`content.sections.${index}.heading`} label="Judul bagian (opsional)"/>
            <NewsLines name={`content.sections.${index}.paragraphs`} label="Paragraf" paragraphs/>
            <NewsField name={`content.sections.${index}.quote.text`} label="Kutipan (opsional)" multiline/>
            <div className="grid gap-4 sm:grid-cols-2"><NewsField name={`content.sections.${index}.quote.speaker`} label="Nama narasumber"/><NewsField name={`content.sections.${index}.quote.speakerRole`} label="Jabatan narasumber"/></div>
          </div>)}
        </section>
        <section className={panel}><NewsLines name="content.keyTakeaways" label="Poin penting (opsional)"/></section>
      </div>
      <aside className="min-w-0 space-y-6">
        <section className={panel}><h2 className="text-base font-semibold">Publikasi</h2>
          <div className="space-y-2"><label htmlFor="news-status" className="text-sm font-medium">Status</label><select id="news-status" {...form.register("publicationStatus")} className={`h-11 w-full border px-3 ${control}`}><option value="draft">Draf</option><option value="published">Terbit</option></select><p className="text-xs text-muted-foreground">Draf hanya terlihat di CMS. Berita terbit tampil di situs publik.</p></div>
          <div className="space-y-2"><label htmlFor="news-category" className="text-sm font-medium">Kategori</label><select id="news-category" {...form.register("category")} className={`h-11 w-full border px-3 ${control}`}>{NEWS_CATEGORIES.map(category=><option key={category}>{category}</option>)}</select></div>
          <NewsField name="publishedDateIso" label="Tanggal berita" type="date"/>
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" {...form.register("isFeatured")} className="size-4 accent-current"/>Jadikan berita utama</label><p className="text-xs text-muted-foreground">Saat diterbitkan, berita ini menggantikan berita utama sebelumnya.</p>
        </section>
        <section className={panel}><h2 className="text-base font-semibold">Gambar</h2><NewsField name="image" label="URL / path gambar"/><p className="text-xs leading-relaxed text-muted-foreground">Gunakan path lokal, misalnya /images/berita.webp, atau URL HTTPS PPKASN / Unsplash.</p><NewsField name="imageCaption" label="Keterangan gambar" multiline/></section>
        <section className={panel}><h2 className="text-base font-semibold">Penulis</h2><NewsField name="author.name" label="Nama penulis"/><NewsField name="author.role" label="Jabatan / peran"/><NewsField name="author.department" label="Unit kerja"/><NewsField name="author.avatar" label="URL / path foto (opsional)"/></section>
        <section className={panel}><NewsLines name="tags" label="Tag berita"/></section>
      </aside>
    </fieldset>
      <div className="flex justify-end"><Button type="submit" disabled={isSaving} className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90">{isSaving?<Loader2 className="animate-spin"/>:<Save/>}{isSaving?"Menyimpan…":"Simpan berita"}</Button></div>
  </form><AlertDialog open={discard} onOpenChange={setDiscard}><AlertDialogContent className="rounded-2xl sm:rounded-3xl "><AlertDialogHeader><AlertDialogTitle>Tinggalkan perubahan?</AlertDialogTitle><AlertDialogDescription>Perubahan yang belum disimpan akan hilang.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Lanjut mengedit</AlertDialogCancel><AlertDialogAction onClick={onClose}>Tinggalkan editor</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></FormProvider>;
}
