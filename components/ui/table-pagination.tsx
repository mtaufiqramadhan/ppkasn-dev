"use client";
import { Button } from "@/components/ui/button";
import { getTablePagination } from "@/lib/table-pagination";
export interface TablePaginationProps {
  page:number;pageSize:number;totalItems:number;onPageChange:(page:number)=>void;onPageSizeChange?:(size:number)=>void;itemLabel?:string;
}
export function TablePagination({page,pageSize,totalItems,onPageChange,itemLabel="data"}:TablePaginationProps){
  const state=getTablePagination(totalItems,page,pageSize);
  return <nav aria-label={`Pagination ${itemLabel}`} className="flex flex-col items-center justify-between gap-4 border-t border-border px-2 py-4 text-sm sm:flex-row">
    <p className="text-muted-foreground" aria-live="polite">Menampilkan {state.start} - {state.end} dari {state.totalItems} {itemLabel}</p>
    <div className="flex flex-wrap items-center justify-center gap-3">
      <div className="flex items-center gap-2"><Button type="button" variant="secondary" size="sm" disabled={state.page<=1} onClick={()=>onPageChange(state.page-1)}>Sebelumnya</Button><span className="min-w-12 text-center tabular-nums text-muted-foreground" aria-label={`Halaman ${state.page} dari ${state.totalPages}`}>{state.page} / {state.totalPages}</span><Button type="button" variant="secondary" size="sm" disabled={state.page>=state.totalPages} onClick={()=>onPageChange(state.page+1)}>Selanjutnya</Button></div>
    </div>
  </nav>;
}
