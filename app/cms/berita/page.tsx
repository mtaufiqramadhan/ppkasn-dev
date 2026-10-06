import type { Metadata } from "next";
import { CmsNewsView } from "@/features/news";
export const metadata:Metadata={title:"Kelola Berita | PPKASN"};
export default function CmsNewsPage(){return <CmsNewsView />;}
