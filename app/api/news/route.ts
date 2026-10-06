import { NextResponse } from "next/server";
import { getPublicNews } from "@/features/news/server";
export const dynamic="force-dynamic";
export function GET() {
  try{return NextResponse.json({data:getPublicNews()},{headers:{"Cache-Control":"no-store"}});}
  catch(error){console.error("Public news unavailable",error);return NextResponse.json({error:"Gagal memuat berita"},{status:500});}
}
