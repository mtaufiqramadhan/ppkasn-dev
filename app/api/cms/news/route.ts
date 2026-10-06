import { NextRequest, NextResponse } from "next/server";
import { requireCmsAdmin, guardMutation, readJsonBody, securityFailure } from "@/lib/security/request-guard";
import { cmsNewsSchema, deleteNewsSchema, getStoredNews, saveNews, deleteNews, NewsMutationError } from "@/features/news/server";
function failure(error:unknown) {
  if(error instanceof NewsMutationError)return NextResponse.json({error:error.message},{status:error.status});
  return securityFailure(error);
}
export async function GET() {
  try {
    await requireCmsAdmin();
    return NextResponse.json({data:getStoredNews()},{headers:{"Cache-Control":"no-store"}});
  } catch(error){return failure(error);}
}
async function save(request:NextRequest,isNew:boolean) {
  try {
    await requireCmsAdmin();
    await guardMutation(request,"cms-news");
    const parsed=cmsNewsSchema.safeParse(await readJsonBody(request));
    if(!parsed.success)return NextResponse.json({error:parsed.error.issues.map(issue=>`${issue.path.join(".")}: ${issue.message}`).join("; ")},{status:400});
    return NextResponse.json({data:saveNews(parsed.data,isNew)},{status:isNew?201:200});
  } catch(error){return failure(error);}
}
export function POST(request:NextRequest){return save(request,true);}
export function PUT(request:NextRequest){return save(request,false);}
export async function DELETE(request:NextRequest) {
  try {
    await requireCmsAdmin();
    await guardMutation(request,"cms-news");
    const parsed=deleteNewsSchema.safeParse({id:request.nextUrl.searchParams.get("id")});
    if(!parsed.success)return NextResponse.json({error:"ID berita wajib diisi"},{status:400});
    deleteNews(parsed.data.id);return NextResponse.json({success:true});
  }catch(error){return failure(error);}
}
