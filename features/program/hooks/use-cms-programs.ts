"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ProgramService } from "../services/program-service";
import type { ProgramItem } from "../types";
const programKeys = ["cms", "programs"] as const;
export function useCmsPrograms() {
  const client=useQueryClient();
  const query=useQuery({queryKey:programKeys,queryFn:()=>ProgramService.fetchCmsPrograms()});
  const save=useMutation({
    mutationFn:({program,isNew}:{program:ProgramItem;isNew:boolean})=>isNew ? ProgramService.createProgram(program) : ProgramService.updateProgram(program),
    onSuccess:async()=>{await client.invalidateQueries({queryKey:programKeys});toast.success("Pelatihan dan subpelatihan berhasil disimpan");},
    onError:(error:Error)=>toast.error(error.message || "Gagal menyimpan program"),
  });
  const remove=useMutation({mutationFn:(id:string)=>ProgramService.deleteProgram(id),onSuccess:async()=>{await client.invalidateQueries({queryKey:programKeys});toast.success("Program berhasil dihapus");},onError:(error:Error)=>toast.error(error.message || "Gagal menghapus program")});
  return {query,save,remove};
}
