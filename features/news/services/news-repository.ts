import { z } from "zod";
import { storedNewsSchema } from "../schemas/cms-news-schema";
import fs from "node:fs";
import path from "node:path";
import { NEWS_ARTICLES } from "../services/news-data";
import type { NewsArticle } from "../types";
import { applyNewsSave, getPublishedNews, NewsMutationError } from "../utils/cms-news";
import type { CmsNewsFormValues } from "../schemas/cms-news-schema";
export function createNewsRepository(filePath:string) {
function getStoredNews():NewsArticle[] {
  if(!fs.existsSync(filePath)) return structuredClone(NEWS_ARTICLES);
  const value:unknown=JSON.parse(fs.readFileSync(filePath,"utf8"));
  return z.array(storedNewsSchema).parse(value);
}
function getPublicNews() {return getPublishedNews(getStoredNews());}
function persistNews(articles:NewsArticle[]) {
  fs.mkdirSync(path.dirname(filePath),{recursive:true});
  const temporary=`${filePath}.${crypto.randomUUID()}.tmp`;
  try {fs.writeFileSync(temporary,JSON.stringify(articles,null,2),"utf8");fs.renameSync(temporary,filePath);} finally {if(fs.existsSync(temporary))fs.unlinkSync(temporary);}
}
function saveNews(input:CmsNewsFormValues,isNew:boolean) {
  const articles=applyNewsSave(getStoredNews(),input,isNew);persistNews(articles);
  return articles.find(article=>article.id===input.id)!;
}
function deleteNews(id:string) {
  const articles=getStoredNews();
  if(!articles.some(article=>article.id===id))throw new NewsMutationError("Berita tidak ditemukan",404);
  persistNews(articles.filter(article=>article.id!==id));
}
return {getStoredNews,getPublicNews,saveNews,deleteNews};
}
