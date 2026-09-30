import sharp from "sharp";
import fs from "fs";
import path from "path";

async function optimizeImages() {
  console.log("Starting image optimization...\n");

  const imagesDir = path.join(process.cwd(), "public", "images");
  const publicDir = path.join(process.cwd(), "public");

  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  // 1. Optimize empty-rooms.jpg (currently 688KB)
  const emptyRoomsPath = path.join(publicDir, "empty-rooms.jpg");
  if (fs.existsSync(emptyRoomsPath)) {
    const rawBuffer = fs.readFileSync(emptyRoomsPath);
    await sharp(rawBuffer)
      .resize(1024, 1024, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80, effort: 6 })
      .toFile(path.join(publicDir, "empty-rooms.webp"));

    await sharp(rawBuffer)
      .resize(1024, 1024, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true })
      .toFile(path.join(publicDir, "empty-rooms.jpg.tmp"));

    fs.renameSync(path.join(publicDir, "empty-rooms.jpg.tmp"), emptyRoomsPath);
    console.log("✓ Optimized empty-rooms.jpg & created empty-rooms.webp");
  }

  // 1b. Optimize empty-news.jpg
  const emptyNewsPath = path.join(publicDir, "empty-news.jpg");
  if (fs.existsSync(emptyNewsPath)) {
    const rawBuffer = fs.readFileSync(emptyNewsPath);
    await sharp(rawBuffer)
      .resize(1200, 675, { fit: "cover" })
      .webp({ quality: 82, effort: 6 })
      .toFile(path.join(publicDir, "empty-news.webp"));

    await sharp(rawBuffer)
      .resize(1200, 675, { fit: "cover" })
      .webp({ quality: 82, effort: 6 })
      .toFile(path.join(imagesDir, "empty-news.webp"));

    console.log("✓ Optimized empty-news.jpg & created empty-news.webp");
  }

  // 2. Optimize bg-cover.jpeg (currently 470KB, 4K)
  const bgCoverPath = path.join(publicDir, "bg-cover.jpeg");
  if (fs.existsSync(bgCoverPath)) {
    const rawBuffer = fs.readFileSync(bgCoverPath);
    await sharp(rawBuffer)
      .resize(1920, 1080, { fit: "cover" })
      .webp({ quality: 80, effort: 6 })
      .toFile(path.join(publicDir, "bg-cover.webp"));

    await sharp(rawBuffer)
      .resize(1920, 1080, { fit: "cover" })
      .jpeg({ quality: 80, mozjpeg: true })
      .toFile(path.join(publicDir, "bg-cover.jpeg.tmp"));

    fs.renameSync(path.join(publicDir, "bg-cover.jpeg.tmp"), bgCoverPath);
    console.log("✓ Optimized bg-cover.jpeg & created bg-cover.webp");
  }

  // 3. Optimize setneg-emblem.png
  const emblemPath = path.join(publicDir, "setneg-emblem.png");
  if (fs.existsSync(emblemPath)) {
    const rawBuffer = fs.readFileSync(emblemPath);
    await sharp(rawBuffer)
      .webp({ quality: 90, effort: 6 })
      .toFile(path.join(publicDir, "setneg-emblem.webp"));
    console.log("✓ Created setneg-emblem.webp");
  }

  // 3b. Optimize logo-bangga-melayani-bangsa.png
  const bmbPath = path.join(publicDir, "logo-bangga-melayani-bangsa.png");
  if (fs.existsSync(bmbPath)) {
    const rawBuffer = fs.readFileSync(bmbPath);
    await sharp(rawBuffer)
      .webp({ quality: 90, effort: 6, alphaQuality: 100 })
      .toFile(path.join(publicDir, "logo-bangga-melayani-bangsa.webp"));
    console.log("✓ Created logo-bangga-melayani-bangsa.webp");
  }

  // 4. Optimize Hero image
  const heroRaw = path.join(imagesDir, "hero-gedung-raw.jpg");
  if (fs.existsSync(heroRaw)) {
    await sharp(heroRaw)
      .resize(1920, 1080, { fit: "cover", position: "center" })
      .webp({ quality: 82, effort: 6 })
      .toFile(path.join(imagesDir, "hero-gedung-ppkasn.webp"));

    await sharp(heroRaw)
      .resize(1920, 1080, { fit: "cover", position: "center" })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(path.join(imagesDir, "hero-gedung-ppkasn.jpg"));

    fs.unlinkSync(heroRaw);
    console.log("✓ Created hero-gedung-ppkasn.webp and .jpg");
  }

  // 5. Optimize News 1 (SEF 3)
  const news1Raw = path.join(imagesDir, "news-sef-3-raw.png");
  if (fs.existsSync(news1Raw)) {
    await sharp(news1Raw)
      .resize(800, 500, { fit: "cover" })
      .webp({ quality: 80, effort: 6 })
      .toFile(path.join(imagesDir, "news-sef-3.webp"));

    await sharp(news1Raw)
      .resize(800, 500, { fit: "cover" })
      .jpeg({ quality: 80, mozjpeg: true })
      .toFile(path.join(imagesDir, "news-sef-3.jpg"));

    fs.unlinkSync(news1Raw);
    console.log("✓ Created news-sef-3.webp and .jpg");
  }

  // 6. Optimize News 2 (Sholeh BPIP)
  const news2Raw = path.join(imagesDir, "news-sholeh-raw.jpg");
  if (fs.existsSync(news2Raw)) {
    await sharp(news2Raw)
      .resize(800, 500, { fit: "cover" })
      .webp({ quality: 80, effort: 6 })
      .toFile(path.join(imagesDir, "news-sholeh-bpip.webp"));

    await sharp(news2Raw)
      .resize(800, 500, { fit: "cover" })
      .jpeg({ quality: 80, mozjpeg: true })
      .toFile(path.join(imagesDir, "news-sholeh-bpip.jpg"));

    fs.unlinkSync(news2Raw);
    console.log("✓ Created news-sholeh-bpip.webp and .jpg");
  }

  // 7. Optimize News 3 (Smart Office)
  const news3Raw = path.join(imagesDir, "news-smart-office-raw.jpg");
  if (fs.existsSync(news3Raw)) {
    await sharp(news3Raw)
      .resize(800, 500, { fit: "cover" })
      .webp({ quality: 80, effort: 6 })
      .toFile(path.join(imagesDir, "news-smart-office.webp"));

    await sharp(news3Raw)
      .resize(800, 500, { fit: "cover" })
      .jpeg({ quality: 80, mozjpeg: true })
      .toFile(path.join(imagesDir, "news-smart-office.jpg"));

    fs.unlinkSync(news3Raw);
    console.log("✓ Created news-smart-office.webp and .jpg");
  }

  console.log("\nAll images successfully optimized!");
}

optimizeImages().catch((err) => {
  console.error("Optimization failed:", err);
  process.exit(1);
});
