export function getTablePagination(totalItems:number,page:number,pageSize:number){
  const size=Math.max(1,Math.floor(pageSize));
  const total=Math.max(0,Math.floor(totalItems));
  const totalPages=Math.max(1,Math.ceil(total/size));
  const current=Math.min(Math.max(1,Math.floor(page)),totalPages);
  const startIndex=(current-1)*size;
  return {page:current,pageSize:size,totalItems:total,totalPages,startIndex,endIndex:Math.min(startIndex+size,total),start:total===0?0:startIndex+1,end:Math.min(startIndex+size,total)};
}
