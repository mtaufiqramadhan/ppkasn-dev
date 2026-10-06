"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Pencil, Trash2, Users, Loader2, ExternalLink } from "lucide-react";
import { TablePagination } from "@/components/ui/table-pagination";
import { useTablePagination } from "@/hooks/use-table-pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useCmsPrograms } from "../hooks/use-cms-programs";
import { createProgramDraft } from "../utils/program-editor";
import { getProgramSubPelatihanList } from "../utils/sub-pelatihan";
import type { ProgramItem, ProgramStatus } from "../types";
import { CmsProgramEditor } from "./cms-program-editor";

const statusLabels:Record<ProgramStatus,string>={buka:"Buka pendaftaran",segera:"Segera dibuka",penuh:"Kuota penuh",selesai:"Selesai"};
const statusStyles:Record<ProgramStatus,string>={buka:"bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",segera:"bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",penuh:"bg-secondary text-secondary-foreground",selesai:"bg-muted text-muted-foreground"};

export function CmsProgramView() {
  const {query,save,remove}=useCmsPrograms();
  const [editing,setEditing]=useState<{program:ProgramItem;isNew:boolean}|null>(null);
  const [deleting,setDeleting]=useState<ProgramItem|null>(null);
  const [search,setSearch]=useState("");
  const [typeFilter,setTypeFilter]=useState("all");
  const [statusFilter,setStatusFilter]=useState("all");
  const programs=query.data ?? [];
  const q=search.toLowerCase().trim();
  const filtered=programs.filter(program=>
    (typeFilter==="all" || program.type===typeFilter) && (statusFilter==="all" || program.status===statusFilter) &&
    (!q || [program.title,program.organizer,program.category,...getProgramSubPelatihanList(program).map(sub=>`${sub.title} ${sub.code ?? ""}`)].some(text=>text.toLowerCase().includes(q)))
  );
  const pagination=useTablePagination(filtered.length,`${search}|${typeFilter}|${statusFilter}`);
  if(editing) return <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
    <CmsProgramEditor key={editing.program.id} program={editing.program} isNew={editing.isNew} isSaving={save.isPending} onClose={()=>setEditing(null)}
      onSave={async program=>{try{await save.mutateAsync({program,isNew:editing.isNew});setEditing(null);}catch{/* Mutation hook displays the error; keep the draft open. */}}} />
  </div>;

  return <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <h1 className="text-2xl font-semibold tracking-tight">Kelola Program & Pelatihan</h1>
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" className="border-dashed border-border bg-card text-foreground"><Link href="/cms/program/pendaftar"><Users />Data pendaftar</Link></Button>
        <Button onClick={()=>setEditing({program:createProgramDraft(),isNew:true})} className="bg-foreground text-background hover:bg-foreground/90"><Plus />Tambah pelatihan</Button>
      </div>
    </header>
    <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-dashed border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-dashed border-border p-4 sm:p-6 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1"><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={event=>setSearch(event.target.value)} aria-label="Cari pelatihan atau subpelatihan" placeholder="Cari pelatihan, subpelatihan, atau kode…" className="h-10 rounded-2xl sm:rounded-3xl border-dashed border-input bg-background pl-9 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <select value={typeFilter} onChange={event=>setTypeFilter(event.target.value)} aria-label="Filter tipe pelatihan" className="h-10 rounded-2xl sm:rounded-3xl border border-dashed border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"><option value="all">Semua tipe</option><option value="diklat">Diklat nasional</option><option value="luar-negeri">Luar negeri</option></select>
          <select value={statusFilter} onChange={event=>setStatusFilter(event.target.value)} aria-label="Filter status pendaftaran" className="h-10 rounded-2xl sm:rounded-3xl border border-dashed border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"><option value="all">Semua status</option>{Object.entries(statusLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select>
        </div>
      </div>
      <div className="px-4 pb-4 sm:px-6 sm:pb-6">
        {query.isPending ? <div role="status" className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground"><Loader2 className="size-5 animate-spin" />Memuat pelatihan…</div> :
        query.isError ? <div className="space-y-3 py-12 text-center"><p role="alert" className="text-sm text-destructive">Gagal memuat pelatihan. {query.error.message}</p><Button variant="outline" className="bg-card text-foreground" onClick={()=>query.refetch()}>Coba lagi</Button></div> :
        <Table><TableHeader className="bg-muted/40"><TableRow><TableHead>Pelatihan</TableHead><TableHead>Kategori & tipe</TableHead><TableHead>Subpelatihan</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
          <TableBody>{filtered.length===0 ? <TableRow><TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground">{programs.length===0 ? "Belum ada pelatihan." : "Tidak ada pelatihan yang cocok. Coba kata kunci atau filter lain."}</TableCell></TableRow> : filtered.slice(pagination.startIndex,pagination.endIndex).map(program=>{
            const subs=getProgramSubPelatihanList(program);const modules=subs.reduce((total,sub)=>total+(sub.curriculum?.length ?? program.curriculum.length),0);
            return <TableRow key={program.id} className="border-b border-dashed border-border hover:bg-muted/50">
              <TableCell className="min-w-64 max-w-md py-4"><p className="text-sm font-medium leading-relaxed">{program.title}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{program.batch} · {program.organizer}</p></TableCell>
              <TableCell className="min-w-40 py-4"><p className="text-sm">{program.category}</p><p className="mt-1 text-xs text-muted-foreground">{program.type==="luar-negeri" ? "Luar negeri" : "Diklat nasional"}</p></TableCell>
              <TableCell className="whitespace-nowrap py-4"><p className="text-sm tabular-nums">{subs.length} subpelatihan</p><p className="mt-1 text-xs tabular-nums text-muted-foreground">{modules} modul pembelajaran</p></TableCell>
              <TableCell className="py-4"><span className={`inline-flex whitespace-nowrap rounded-2xl sm:rounded-3xl px-2 py-1 text-xs font-medium ${statusStyles[program.status]}`}>{statusLabels[program.status]}</span></TableCell>
              <TableCell className="py-4 text-right"><div className="flex justify-end gap-1.5">
                <Button asChild size="icon-sm" variant="ghost" className="rounded-2xl sm:rounded-3xl border border-dashed border-border"><Link href={`/program/${program.slug}`} target="_blank" aria-label={`Lihat pelatihan ${program.title}`}><ExternalLink /></Link></Button>
                <Button size="sm" variant="outline" className="border-dashed border-border bg-card text-foreground" onClick={()=>setEditing({program,isNew:false})}><Pencil />Kelola</Button>
                <Button size="icon-sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={()=>setDeleting(program)} aria-label={`Hapus pelatihan ${program.title}`}><Trash2 /></Button>
              </div></TableCell>
            </TableRow>;
          })}</TableBody>
        </Table>}
        {!query.isPending && !query.isError && <TablePagination {...pagination} itemLabel="pelatihan" />}
      </div>
    </div>
    <AlertDialog open={!!deleting} onOpenChange={open=>{if(!open && !remove.isPending)setDeleting(null);}}><AlertDialogContent className="rounded-2xl sm:rounded-3xl border-border bg-card"><AlertDialogHeader><AlertDialogTitle>Hapus pelatihan?</AlertDialogTitle><AlertDialogDescription>Pelatihan “{deleting?.title}” beserta seluruh subpelatihannya akan dihapus dari katalog.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={remove.isPending} className="bg-card text-foreground">Batal</AlertDialogCancel><Button variant="destructive" disabled={remove.isPending} onClick={async()=>{if(!deleting)return;try{await remove.mutateAsync(deleting.id);setDeleting(null);}catch{/* Keep confirmation open on failure. */}}}>{remove.isPending ? "Menghapus…" : "Hapus pelatihan"}</Button></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}
