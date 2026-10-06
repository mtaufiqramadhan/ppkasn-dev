import { apiClient } from "@/lib/api-client";
import type { NewsArticle } from "../types";
import type { CmsNewsFormValues } from "../schemas/cms-news-schema";
export const CmsNewsService={
  async getAll(){return (await apiClient<{data:NewsArticle[]}>("/api/cms/news",{cache:"no-store"})).data;},
  async save(article:CmsNewsFormValues,isNew:boolean){return (await apiClient<{data:NewsArticle}>("/api/cms/news",{method:isNew?"POST":"PUT",body:article})).data;},
  async remove(id:string){await apiClient("/api/cms/news",{method:"DELETE",params:{id}});},
  async getPublic(){return (await apiClient<{data:NewsArticle[]}>("/api/news",{cache:"no-store"})).data;},
};
