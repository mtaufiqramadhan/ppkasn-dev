"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus,Search,Pencil,Trash2,ExternalLink,Loader2,MoreHorizontal } from "lucide-react";
import { TablePagination } from "@/components/ui/table-pagination";
import { useTablePagination } from "@/hooks/use-table-pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table,TableHeader,TableHead,TableBody,TableRow,TableCell } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { AlertDialog,AlertDialogContent,AlertDialogHeader,AlertDialogTitle,AlertDialogDescription,AlertDialogFooter,AlertDialogCancel } from "@/components/ui/alert-dialog";
import { useCmsNews } from "../hooks/use-cms-news";
import { prepareNewsDraft } from "../utils/cms-news";
import { NEWS_CATEGORIES,type CmsNewsFormValues } from "../schemas/cms-news-schema";
import type { NewsArticle } from "../types";
import { CmsNewsEditor } from "./cms-news-editor";
export function CmsNewsView(){
  const {query,save,remove}=useCmsNews();
  const [editing,setEditing]=useState<{draft:CmsNewsFormValues;isNew:boolean}|null>(null);
  const [deleting,setDeleting]=useState<NewsArticle|null>(null);
  const [search,setSearch]=useState("");const [status,setStatus]=useState("all");const [category,setCategory]=useState("all");
  const q=search.trim().toLowerCase();
  const articles=(query.data??[]).filter(article=>(status==="all" || (article.publicationStatus??"published")===status) && (category==="all" || article.category===category) && (!q || [article.title,article.author.name,...article.tags].some(text=>text.toLowerCase().includes(q)))).sort((a,b)=>b.publishedDateIso.localeCompare(a.publishedDateIso));
  const pagination=useTablePagination(articles.length,`${search}|${status}|${category}`);
  const setPage=pagination.onPageChange;
  const visible=articles.slice(pagination.startIndex,pagination.endIndex);
  if(editing)return <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8"><CmsNewsEditor key={editing.draft.id} {...editing} isSaving={save.isPending} onClose={()=>setEditing(null)} onSave={async article=>{try{await save.mutateAsync({article,isNew:editing.isNew});setEditing(null);}catch{/* Keep draft open; mutation hook displays the error. */}}}/></div>;
  const selectStyle="h-10 min-w-0 rounded-2xl sm:rounded-3xl border border-dashed border-input bg-background px-3 text-sm text-foreground ";
  return <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
    <header className="flex flex-wrap items-start justify-between gap-4"><h1 className="text-2xl font-semibold tracking-tight">Kelola Berita</h1><Button onClick={()=>setEditing({draft:prepareNewsDraft(),isNew:true})} className="bg-foreground text-background hover:bg-foreground/90"><Plus/>Tambah berita</Button></header>
    <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-dashed border-border bg-card ">
      <div className="flex flex-col gap-3 border-b border-dashed border-border p-4 sm:p-6 lg:flex-row"><div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input aria-label="Cari berita" placeholder="Cari judul, penulis, atau tag…" value={search} onChange={event=>{setSearch(event.target.value);setPage(1);}} className={`${selectStyle} w-full pl-9!`}/></div><div className="grid grid-cols-2 gap-2"><select aria-label="Filter status berita" value={status} onChange={event=>{setStatus(event.target.value);setPage(1);}} className={selectStyle}><option value="all">Semua status</option><option value="draft">Draf</option><option value="published">Terbit</option></select><select aria-label="Filter kategori berita" value={category} onChange={event=>{setCategory(event.target.value);setPage(1);}} className={selectStyle}><option value="all">Semua kategori</option>{NEWS_CATEGORIES.map(item=><option key={item}>{item}</option>)}</select></div></div>
      <div className="px-4 pb-4 sm:px-6 sm:pb-6">{query.isPending?<div role="status" className="flex justify-center gap-2 py-16 text-sm text-muted-foreground"><Loader2 className="size-5 animate-spin"/>Memuat berita…</div>:query.isError?<div className="space-y-3 py-12 text-center"><p role="alert" className="text-sm text-destructive">Gagal memuat berita. {query.error.message}</p><Button variant="outline" onClick={()=>query.refetch()}>Coba lagi</Button></div>:<Table>
        <TableHeader className="[&_th]:h-14! [&_th]:py-4!">
          <TableRow>
            <TableHead className="w-14">No</TableHead>
            <TableHead className="min-w-72">Berita</TableHead>
            <TableHead className="min-w-40">Kategori</TableHead>
            <TableHead className="min-w-44">Tanggal &amp; Penulis</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-16 text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.length === 0 ? (
            <TableRow><TableCell colSpan={6}>
              <div className="space-y-1 text-center">
                <p className="text-sm font-medium">Tidak ada berita yang cocok</p>
                <p className="text-xs text-muted-foreground">Coba ubah filter atau kata kunci pencarian.</p>
              </div>
            </TableCell></TableRow>
          ) : visible.map((article, index) => (
            <TableRow key={article.id} className="border-b border-dashed border-border hover:bg-muted/50 last:border-0">
              <TableCell className="align-top! tabular-nums text-muted-foreground">{pagination.startIndex + index + 1}</TableCell>
              <TableCell className="align-top! whitespace-normal">
                <div className="max-w-md space-y-1.5">
                  <p className="break-words text-sm font-medium leading-relaxed text-foreground">{article.title}</p>
                  {article.isFeatured && <p className="text-xs text-muted-foreground">Berita utama</p>}
                </div>
              </TableCell>
              <TableCell className="align-top! whitespace-normal"><p className="max-w-44 text-sm leading-relaxed text-muted-foreground">{article.category}</p></TableCell>
              <TableCell className="align-top! whitespace-normal">
                <div className="max-w-56 space-y-1.5">
                  <p className="text-sm font-medium text-foreground">{article.publishedAt}</p>
                  <p className="break-words text-sm leading-relaxed text-muted-foreground">{article.author.name}</p>
                </div>
              </TableCell>
              <TableCell className="align-top!">
                <span className={`inline-flex whitespace-nowrap rounded-2xl border border-dashed px-2.5 py-1 text-xs font-medium sm:rounded-3xl ${article.publicationStatus === "draft" ? "border-border bg-secondary text-secondary-foreground" : "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"}`}>
                  {article.publicationStatus === "draft" ? "Draf" : "Terbit"}
                </span>
              </TableCell>
              <TableCell className="align-top! text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="ghost" size="icon-sm" aria-label={`Aksi berita ${article.title}`}><MoreHorizontal className="size-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 rounded-2xl border-dashed border-border shadow-none sm:rounded-3xl">
                    {article.publicationStatus !== "draft" && <DropdownMenuItem asChild><Link href={`/berita/${article.slug}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="size-4" />Lihat berita</Link></DropdownMenuItem>}
                    <DropdownMenuItem onClick={() => setEditing({draft:prepareNewsDraft(article),isNew:false})}><Pencil className="size-4" />Edit</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setDeleting(article)} className="text-destructive focus:bg-destructive/10 focus:text-destructive"><Trash2 className="size-4" />Hapus</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
      </TableBody></Table>}</div>
      {!query.isPending && !query.isError && <div className="px-4 sm:px-6"><TablePagination {...pagination} itemLabel="berita" /></div>}
    </div>
    <AlertDialog open={!!deleting} onOpenChange={open=>{if(!open && !remove.isPending)setDeleting(null);}}><AlertDialogContent className="rounded-2xl sm:rounded-3xl "><AlertDialogHeader><AlertDialogTitle>Hapus berita?</AlertDialogTitle><AlertDialogDescription>Berita “{deleting?.title}” akan dihapus dari CMS dan situs publik.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={remove.isPending}>Batal</AlertDialogCancel><Button variant="destructive" disabled={remove.isPending} onClick={async()=>{if(!deleting)return;try{await remove.mutateAsync(deleting.id);setDeleting(null);}catch{/* Keep confirmation open on failure. */}}}>{remove.isPending?"Menghapus…":"Hapus berita"}</Button></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}
