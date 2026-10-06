"use client";
import { useMutation,useQuery,useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CmsNewsService } from "../services/cms-news-service";
import type { CmsNewsFormValues } from "../schemas/cms-news-schema";
export function useCmsNews(){
  const client=useQueryClient();
  const query=useQuery({queryKey:["cms","news"],queryFn:CmsNewsService.getAll});
  const refresh=async()=>{await Promise.all([client.invalidateQueries({queryKey:["cms","news"]}),client.invalidateQueries({queryKey:["public","news"]})]);};
  const save=useMutation({mutationFn:({article,isNew}:{article:CmsNewsFormValues;isNew:boolean})=>CmsNewsService.save(article,isNew),onSuccess:async()=>{await refresh();toast.success("Berita berhasil disimpan");},onError:(error:Error)=>toast.error(error.message)});
  const remove=useMutation({mutationFn:CmsNewsService.remove,onSuccess:async()=>{await refresh();toast.success("Berita berhasil dihapus");},onError:(error:Error)=>toast.error(error.message)});
  return {query,save,remove};
}
