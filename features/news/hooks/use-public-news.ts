"use client";
import { useQuery } from "@tanstack/react-query";
import { CmsNewsService } from "../services/cms-news-service";
export function usePublicNews(){return useQuery({queryKey:["public","news"],queryFn:CmsNewsService.getPublic});}
