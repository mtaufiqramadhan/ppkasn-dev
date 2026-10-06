import "server-only";
import path from "node:path";
import { createNewsRepository } from "./services/news-repository";
export const {getStoredNews,getPublicNews,saveNews,deleteNews}=createNewsRepository(path.join(process.cwd(),"data","cms","news.json"));
export { cmsNewsSchema, deleteNewsSchema } from "./schemas/cms-news-schema";
export { NewsMutationError } from "./utils/cms-news";
