import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cmsNewsSchema, deleteNewsSchema, getStoredNews, saveNews, deleteNews, NewsMutationError } from "@/features/news/server";
async function authorized() {
  const supabase=await createClient();
  const {data:{user},error}=await supabase.auth.getUser();
  return !!user && !error;
}
function failure(error:unknown) {
  if(error instanceof NewsMutationError)return NextResponse.json({error:error.message},{status:error.status});
  console.error("CMS news request failed",error);
  return NextResponse.json({error:"Gagal memproses berita. Silakan coba lagi."},{status:500});
}
export async function GET() {
  try {
    if(!await authorized())return NextResponse.json({error:"Unauthorized"},{status:401});
    return NextResponse.json({data:getStoredNews()},{headers:{"Cache-Control":"no-store"}});
  } catch(error){return failure(error);}
}
async function save(request:NextRequest,isNew:boolean) {
  try {
    if(!await authorized())return NextResponse.json({error:"Unauthorized"},{status:401});
    const parsed=cmsNewsSchema.safeParse(await request.json().catch(()=>null));
    if(!parsed.success)return NextResponse.json({error:parsed.error.issues.map(issue=>`${issue.path.join(".")}: ${issue.message}`).join("; ")},{status:400});
    return NextResponse.json({data:saveNews(parsed.data,isNew)},{status:isNew?201:200});
  } catch(error){return failure(error);}
}
export function POST(request:NextRequest){return save(request,true);}
export function PUT(request:NextRequest){return save(request,false);}
export async function DELETE(request:NextRequest) {
  try {
    if(!await authorized())return NextResponse.json({error:"Unauthorized"},{status:401});
    const parsed=deleteNewsSchema.safeParse({id:request.nextUrl.searchParams.get("id")});
    if(!parsed.success)return NextResponse.json({error:"ID berita wajib diisi"},{status:400});
    deleteNews(parsed.data.id);return NextResponse.json({success:true});
  }catch(error){return failure(error);}
}
