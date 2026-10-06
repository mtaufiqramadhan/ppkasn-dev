import { test } from "node:test";
import assert from "node:assert/strict";
import { NEWS_ARTICLES } from "../services/news-data";
import { cmsNewsSchema } from "../schemas/cms-news-schema";
import { prepareNewsDraft, applyNewsSave, getPublishedNews } from "./cms-news";

test("legacy articles retain sections, quotes, tags and views when edited", () => {
  for (const article of NEWS_ARTICLES) {
    const input = cmsNewsSchema.parse(prepareNewsDraft(article));
    const saved = applyNewsSave([article], input, false)[0];
    assert.deepEqual(saved.content, article.content);
    assert.equal(saved.viewsCount, article.viewsCount);
    assert.equal(saved.publicationStatus, "published");
  }
});
test("drafts stay out of public lists and publication switches the headline", () => {
  const input = prepareNewsDraft(NEWS_ARTICLES[1]);
  input.id = "new"; input.slug = "new"; input.publicationStatus = "draft";
  const draft = applyNewsSave(NEWS_ARTICLES, cmsNewsSchema.parse(input), true);
  assert.equal(getPublishedNews(draft).some(article => article.id === "new"), false);
  input.publicationStatus = "published"; input.isFeatured = true;
  const published = applyNewsSave(draft, cmsNewsSchema.parse(input), false);
  assert.equal(getPublishedNews(published).filter(article=>article.isFeatured).length, 1);
  assert.equal(published[0].isFeatured, true);
});
test("duplicate slugs and unknown update IDs are rejected", () => {
  const input = cmsNewsSchema.parse(prepareNewsDraft(NEWS_ARTICLES[0]));
  assert.throws(()=>applyNewsSave(NEWS_ARTICLES,{...input,id:"new"},true),/digunakan/);
  assert.throws(()=>applyNewsSave(NEWS_ARTICLES,{...input,id:"missing",slug:"unique"},false),/ditemukan/);
});
test("published articles require content and reject unsafe image URLs", () => {
  const input = prepareNewsDraft(NEWS_ARTICLES[0]);
  assert.equal(cmsNewsSchema.safeParse({...input,image:"javascript:alert(1)"}).success,false);
  assert.equal(cmsNewsSchema.safeParse({...input,content:{lead:"",sections:[]}}).success,false);
  assert.equal(cmsNewsSchema.safeParse({...input,publicationStatus:"draft",content:{lead:"",sections:[]}}).success,true);
});

test("saved edits survive repository reload and deleting removes the public article", async () => {
  const fs = await import("node:fs");
  const os = await import("node:os");
  const path = await import("node:path");
  const {createNewsRepository} = await import("../services/news-repository");
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),"ppkasn-news-test-"));
  try {
    const filename=path.join(directory,"news.json");
    const repository=createNewsRepository(filename);
    assert.equal(fs.existsSync(filename),false);
    const input=cmsNewsSchema.parse(prepareNewsDraft(NEWS_ARTICLES[0]));
    input.title="Berita yang diedit dari CMS";
    repository.saveNews(input,false);
    const reloaded=createNewsRepository(filename);
    assert.equal(reloaded.getPublicNews().find(article=>article.id===input.id)?.title,input.title);
    reloaded.deleteNews(input.id);
    assert.equal(createNewsRepository(filename).getPublicNews().some(article=>article.id===input.id),false);
  } finally {fs.rmSync(directory,{recursive:true,force:true});}
});
