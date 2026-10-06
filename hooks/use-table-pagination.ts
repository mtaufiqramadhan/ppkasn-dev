"use client";
import { useState } from "react";
import { getTablePagination } from "@/lib/table-pagination";
export function useTablePagination(totalItems:number,resetKey="",initialPageSize=10){
  const [page,setPage]=useState(1);
  const [pageSize,setPageSize]=useState(initialPageSize);
  const [previousKey,setPreviousKey]=useState(resetKey);
  if(previousKey!==resetKey){setPreviousKey(resetKey);setPage(1);}
  const pagination=getTablePagination(totalItems,page,pageSize);
  if(page!==pagination.page)setPage(pagination.page);
  return {...pagination,onPageChange:setPage,onPageSizeChange:(size:number)=>{setPageSize(size);setPage(1);}};
}
