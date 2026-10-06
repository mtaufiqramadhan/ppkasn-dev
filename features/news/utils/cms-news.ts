import type { NewsArticle } from "../types";
import type { CmsNewsFormValues } from "../schemas/cms-news-schema";
export function prepareNewsDraft(article?: NewsArticle): CmsNewsFormValues {
  if(article) {
    const {id,slug,title,excerpt,category,publishedDateIso,image,imageCaption,author,content,tags}=article;
    return structuredClone({id,slug,title,excerpt,category,publishedDateIso,image,imageCaption,author,content,tags,isFeatured:article.isFeatured ?? false,publicationStatus:article.publicationStatus ?? "published"});
  }
  return {id:`news-${crypto.randomUUID()}`,slug:"",title:"",excerpt:"",category:"Pengumuman",publishedDateIso:new Date().toISOString().slice(0,10),image:"/empty-news.webp",imageCaption:"",author:{name:"Tim Publikasi PPKASN",role:"Redaksi",department:"",avatar:""},content:{lead:"",sections:[],keyTakeaways:[]},tags:[],isFeatured:false,publicationStatus:"draft"};
}
export function getPublishedNews(articles: NewsArticle[]): NewsArticle[] {
  return articles.filter(article=>article.publicationStatus !== "draft").sort((a,b)=>b.publishedDateIso.localeCompare(a.publishedDateIso));
}
export class NewsMutationError extends Error {
  constructor(message:string, public readonly status:number) {super(message);}
}
export function applyNewsSave(articles:NewsArticle[], input:CmsNewsFormValues, isNew:boolean):NewsArticle[] {
  const previous=articles.find(article=>article.id===input.id);
  if(!isNew && !previous) throw new NewsMutationError("Berita tidak ditemukan",404);
  if(articles.some(article=>(isNew && article.id===input.id) || (article.slug===input.slug && article.id!==input.id))) throw new NewsMutationError("ID atau alamat berita sudah digunakan",409);
  const text=[input.content.lead,...input.content.sections.flatMap(section=>[...section.paragraphs,section.quote?.text ?? ""])].join(" ");
  const saved:NewsArticle={...input,content:{...input.content,keyTakeaways:input.content.keyTakeaways?.filter(Boolean),sections:input.content.sections.map(section=>{const {quote,...rest}=section;return {...rest,paragraphs:section.paragraphs.filter(Boolean),...(quote?.text ? {quote} : {})};})},tags:input.tags.filter(Boolean),viewsCount:previous?.viewsCount ?? 0,
    publishedAt:new Intl.DateTimeFormat("id-ID",{day:"numeric",month:"long",year:"numeric",timeZone:"UTC"}).format(new Date(`${input.publishedDateIso}T00:00:00Z`)),
    readTimeMinutes:Math.max(1,Math.ceil(text.trim().split(/\s+/).filter(Boolean).length/200)),
  };
  const result=isNew ? [saved,...articles] : articles.map(article=>article.id===input.id ? saved : article);
  return saved.isFeatured && saved.publicationStatus==="published" ? result.map(article=>article.id===saved.id ? article : {...article,isFeatured:false}) : result;
}
