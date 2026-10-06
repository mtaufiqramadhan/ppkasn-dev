"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { Search, Trash2, Loader2, Image as ImageIcon, Info, Plus, Save } from "lucide-react";
import { TablePagination } from "@/components/ui/table-pagination";
import { useTablePagination } from "@/hooks/use-table-pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  LandingService,
  type CmsLandingData,
  type CmsHeroSlide,
  type CmsSpbeApp,
  type CmsGeneralInfoItem,
  type CmsSocialLink,
} from "../services/landing-service";

type ActiveTab = "hero" | "spbe" | "info" | "socials";

export function CmsLandingView() {
  const [data, setData] = useState<CmsLandingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("hero");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [slideDialogOpen, setSlideDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<CmsHeroSlide | null>(null);
  const [deletingSlideId, setDeletingSlideId] = useState<string | null>(null);
  const [slideForm, setSlideForm] = useState({
    label: "",
    imageUrl: "",
    tagline: "",
    isActive: true,
  });

  const [spbeDialogOpen, setSpbeDialogOpen] = useState(false);
  const [editingSpbe, setEditingSpbe] = useState<CmsSpbeApp | null>(null);
  const [deletingSpbeId, setDeletingSpbeId] = useState<string | null>(null);
  const [spbeForm, setSpbeForm] = useState<CmsSpbeApp>({
    id: "",
    name: "",
    fullName: "",
    description: "",
    image: "",
    isBookingLogo: false,
    link: "",
    isExternal: true,
    tag: "Layanan Digital",
    status: "Aktif",
  });

  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [editingInfo, setEditingInfo] = useState<CmsGeneralInfoItem | null>(null);
  const [deletingInfoId, setDeletingInfoId] = useState<string | null>(null);
  const [infoForm, setInfoForm] = useState<CmsGeneralInfoItem>({
    id: "",
    title: "",
    desc: "",
    link: "",
    type: "dokumen",
    actionType: "download",
    category: "Pelayanan",
  });

  const [socialDialogOpen, setSocialDialogOpen] = useState(false);
  const [editingSocial, setEditingSocial] = useState<CmsSocialLink | null>(null);
  const [socialForm, setSocialForm] = useState<CmsSocialLink>({
    id: "",
    name: "",
    handle: "",
    url: "",
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await LandingService.getLandingData();
      setData(res);
    } catch {
      toast.error("Gagal memuat data beranda");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveAll = async () => {
    if (!data) return;
    setIsSaving(true);
    try {
      await LandingService.updateLandingData(data);
      toast.success("Perubahan beranda berhasil disimpan");
    } catch {
      toast.error("Gagal menyimpan perubahan");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Handlers: Hero Slides ---
  const openAddSlide = () => {
    setEditingSlide(null);
    setSlideForm({
      label: "",
      imageUrl: "/images/hero-gedung-ppkasn.webp",
      tagline: "",
      isActive: true,
    });
    setSlideDialogOpen(true);
  };

  const openEditSlide = (slide: CmsHeroSlide) => {
    setEditingSlide(slide);
    setSlideForm({
      label: slide.label,
      imageUrl: slide.imageUrl,
      tagline: slide.tagline || "",
      isActive: slide.isActive !== false,
    });
    setSlideDialogOpen(true);
  };

  const handleSaveSlide = () => {
    if (!data) return;
    if (!slideForm.label.trim() || !slideForm.imageUrl.trim()) {
      toast.error("Nama label dan URL gambar wajib diisi");
      return;
    }
    if (editingSlide) {
      const updated = data.heroSlides.map((s) =>
        s.id === editingSlide.id ? { ...s, ...slideForm } : s
      );
      setData({ ...data, heroSlides: updated });
    } else {
      const newSlide: CmsHeroSlide = {
        id: `slide-${Date.now()}`,
        ...slideForm,
      };
      setData({ ...data, heroSlides: [...data.heroSlides, newSlide] });
    }
    setSlideDialogOpen(false);
    toast.success("Slide banner diperbarui");
  };

  const confirmDeleteSlide = () => {
    if (!data || !deletingSlideId) return;
    if (data.heroSlides.length <= 1) {
      toast.error("Minimal harus menyisakan 1 slide banner");
      setDeletingSlideId(null);
      return;
    }
    setData({
      ...data,
      heroSlides: data.heroSlides.filter((s) => s.id !== deletingSlideId),
    });
    setDeletingSlideId(null);
    toast.success("Slide banner dihapus");
  };

  // --- Handlers: SPBE Apps ---
  const openAddSpbe = () => {
    setEditingSpbe(null);
    setSpbeForm({
      id: `app-${Date.now()}`,
      name: "",
      fullName: "",
      description: "",
      image: "",
      isBookingLogo: false,
      link: "https://",
      isExternal: true,
      tag: "Layanan Digital",
      status: "Aktif",
    });
    setSpbeDialogOpen(true);
  };

  const openEditSpbe = (app: CmsSpbeApp) => {
    setEditingSpbe(app);
    setSpbeForm({ ...app });
    setSpbeDialogOpen(true);
  };

  const handleSaveSpbe = () => {
    if (!data) return;
    if (!spbeForm.name.trim() || !spbeForm.link.trim()) {
      toast.error("Nama aplikasi dan URL link wajib diisi");
      return;
    }
    if (editingSpbe) {
      const updated = data.spbeApps.map((a) => (a.id === editingSpbe.id ? spbeForm : a));
      setData({ ...data, spbeApps: updated });
    } else {
      setData({ ...data, spbeApps: [...data.spbeApps, spbeForm] });
    }
    setSpbeDialogOpen(false);
    toast.success("Aplikasi SPBE diperbarui");
  };

  const confirmDeleteSpbe = () => {
    if (!data || !deletingSpbeId) return;
    setData({
      ...data,
      spbeApps: data.spbeApps.filter((a) => a.id !== deletingSpbeId),
    });
    setDeletingSpbeId(null);
    toast.success("Aplikasi SPBE dihapus");
  };

  // --- Handlers: Documents & Public Info ---
  const openAddInfo = () => {
    setEditingInfo(null);
    setInfoForm({
      id: `info-${Date.now()}`,
      title: "",
      desc: "",
      link: "",
      type: "dokumen",
      actionType: "download",
      category: "Pelayanan",
    });
    setInfoDialogOpen(true);
  };

  const openEditInfo = (item: CmsGeneralInfoItem) => {
    setEditingInfo(item);
    setInfoForm({ ...item });
    setInfoDialogOpen(true);
  };

  const handleSaveInfo = () => {
    if (!data) return;
    if (!infoForm.title.trim() || !infoForm.link.trim()) {
      toast.error("Judul dokumen dan URL link wajib diisi");
      return;
    }
    if (editingInfo) {
      const updated = data.generalInfo.map((i) => (i.id === editingInfo.id ? infoForm : i));
      setData({ ...data, generalInfo: updated });
    } else {
      setData({ ...data, generalInfo: [...data.generalInfo, infoForm] });
    }
    setInfoDialogOpen(false);
    toast.success("Dokumen/link diperbarui");
  };

  const confirmDeleteInfo = () => {
    if (!data || !deletingInfoId) return;
    setData({
      ...data,
      generalInfo: data.generalInfo.filter((i) => i.id !== deletingInfoId),
    });
    setDeletingInfoId(null);
    toast.success("Dokumen/link dihapus");
  };

  // --- Handlers: Social Media ---
  const openEditSocial = (item: CmsSocialLink) => {
    setEditingSocial(item);
    setSocialForm({ ...item });
    setSocialDialogOpen(true);
  };

  const handleSaveSocial = () => {
    if (!data || !editingSocial) return;
    const updated = data.socials.map((s) => (s.id === editingSocial.id ? socialForm : s));
    setData({ ...data, socials: updated });
    setSocialDialogOpen(false);
    toast.success(`Akun ${socialForm.name} diperbarui`);
  };

  // Filter items by search
  const q = searchTerm.toLowerCase().trim();
  const filteredHero = (data?.heroSlides ?? []).filter(
    (s) => !q || s.label.toLowerCase().includes(q) || (s.tagline && s.tagline.toLowerCase().includes(q))
  );
  const filteredSpbe = (data?.spbeApps ?? []).filter(
    (a) => !q || a.name.toLowerCase().includes(q) || a.fullName.toLowerCase().includes(q) || a.tag.toLowerCase().includes(q)
  );
  const filteredInfo = (data?.generalInfo ?? []).filter(
    (i) => !q || i.title.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q) || (i.category && i.category.toLowerCase().includes(q))
  );
  const filteredSocials = (data?.socials ?? []).filter(
    (s) => !q || s.name.toLowerCase().includes(q) || s.handle.toLowerCase().includes(q)
  );

  const heroPagination=useTablePagination(filteredHero.length,q);
  const spbePagination=useTablePagination(filteredSpbe.length,q);
  const infoPagination=useTablePagination(filteredInfo.length,q);
  const socialsPagination=useTablePagination(filteredSocials.length,q);
  const pagination={hero:heroPagination,spbe:spbePagination,info:infoPagination,socials:socialsPagination}[activeTab];
  if (isLoading || !data) {
    return (
      <div className="py-24 text-center text-muted-foreground flex flex-col items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin mb-2 text-muted-foreground" />
        <p className="text-xs">Memuat data beranda...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Kelola Beranda</h1>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Atur banner, layanan digital, dan informasi yang tampil di beranda publik.
          </p>
        </div>

      </header>

      <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-dashed border-border bg-card">
        <Tabs value={activeTab} onValueChange={(value) => {
          if (value === "hero" || value === "spbe" || value === "info" || value === "socials") {
            setActiveTab(value);
            setSearchTerm("");
          }
        }} className="gap-0">
          <div className="overflow-x-auto border-b border-dashed border-border px-4 sm:px-6">
            <TabsList aria-label="Bagian beranda" className="h-auto w-max min-w-full justify-start gap-2 border-0 rounded-none bg-transparent py-4">
              {([
                { value: "hero", label: "Banner", count: data.heroSlides.length },
                { value: "spbe", label: "Aplikasi SPBE", count: data.spbeApps.length },
                { value: "info", label: "Dokumen & informasi", count: data.generalInfo.length },
                { value: "socials", label: "Media sosial", count: data.socials.length },
              ] as const).map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}
                  className="group h-10 flex-none gap-2 rounded-2xl sm:rounded-3xl border border-dashed border-border bg-card px-3 text-sm font-medium text-muted-foreground shadow-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 data-[state=active]:border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background">
                  {tab.label}
                  <span className="rounded-2xl sm:rounded-3xl bg-secondary px-1.5 py-0.5 text-xs tabular-nums text-secondary-foreground group-data-[state=active]:bg-background/15 group-data-[state=active]:text-background">{tab.count}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        <TabsContent value={activeTab} className="m-0 space-y-5 p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={{ hero: "Cari nama atau tagline banner…", spbe: "Cari aplikasi atau kategori…", info: "Cari dokumen atau informasi…", socials: "Cari platform atau akun…" }[activeTab]}
              aria-label="Cari pada bagian aktif" className="h-10 border-dashed border-border bg-background pl-9 text-sm" />
          </div>
            {activeTab !== "socials" && (
              <Button variant="outline" onClick={activeTab === "hero" ? openAddSlide : activeTab === "spbe" ? openAddSpbe : openAddInfo}
                className="self-start border-dashed border-border bg-card text-foreground">
                <Plus aria-hidden="true" />
                {{ hero: "Tambah slide", spbe: "Tambah aplikasi", info: "Tambah dokumen" }[activeTab]}
              </Button>
            )}
          </div>


        {/* Tab Content: Clean Table */}
        <div className="border-0 rounded-none overflow-hidden">
          {/* TAB 1: HERO SLIDES */}
          {activeTab === "hero" && (
            <Table>
              <TableHeader className="bg-muted/40 border-b border-dashed border-border">
                <TableRow>
                  <TableHead className="w-20 text-xs">Preview</TableHead>
                  <TableHead className="text-xs">Nama Slide</TableHead>
                  <TableHead className="text-xs">Tagline</TableHead>
                  <TableHead className="text-xs">URL Gambar</TableHead>
                  <TableHead className="w-24 text-xs">Status</TableHead>
                  <TableHead className="w-28 text-right text-xs">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHero.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-14 text-center text-sm text-muted-foreground">
                      {q ? "Tidak ada banner yang cocok. Coba kata kunci lain." : "Belum ada slide banner."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHero.slice(heroPagination.startIndex,heroPagination.endIndex).map((slide) => (
                    <TableRow
                      key={slide.id}
                      className="hover:bg-muted/50 transition-colors border-b border-dashed border-border last:border-0"
                    >
                      <TableCell className="py-4">
                        <Image unoptimized width={112} height={64}
                          src={slide.imageUrl}
                          alt={slide.label}
                          className="h-16 w-28 max-w-none object-cover rounded-2xl sm:rounded-3xl border border-border bg-muted"
                        />
                      </TableCell>
                      <TableCell className="min-w-40 py-4 text-sm font-medium text-foreground">
                        {slide.label}
                      </TableCell>
                      <TableCell className="min-w-48 max-w-72 py-4 text-sm leading-relaxed text-muted-foreground">
                        {slide.tagline || "-"}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-muted-foreground max-w-xs truncate">
                        {slide.imageUrl}
                      </TableCell>
                      <TableCell className="py-4">
                        <span
                          className={`inline-flex whitespace-nowrap px-2.5 py-0.5 rounded-2xl sm:rounded-3xl text-xs font-medium border ${
                            slide.isActive !== false
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
                              : "bg-secondary text-secondary-foreground border-border"
                          }`}
                        >
                          {slide.isActive !== false ? "Aktif" : "Non-Aktif"}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditSlide(slide)}
                            className="h-9 text-sm font-medium text-foreground border border-dashed border-border hover:text-foreground hover:bg-muted rounded-2xl sm:rounded-3xl shadow-none"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            aria-label={`Hapus ${slide.label}`}
                            onClick={() => setDeletingSlideId(slide.id)}
                            className="w-9 h-9 p-0 flex items-center justify-center rounded-2xl sm:rounded-3xl shadow-none"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {/* TAB 2: APLIKASI SPBE */}
          {activeTab === "spbe" && (
            <Table>
              <TableHeader className="bg-muted/40 border-b border-dashed border-border">
                <TableRow>
                  <TableHead className="w-24 text-xs">Aplikasi</TableHead>
                  <TableHead className="text-xs">Nama Lengkap</TableHead>
                  <TableHead className="text-xs">Deskripsi</TableHead>
                  <TableHead className="text-xs">URL Tautan</TableHead>
                  <TableHead className="w-28 text-xs">Kategori</TableHead>
                  <TableHead className="w-28 text-right text-xs">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSpbe.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-14 text-center text-sm text-muted-foreground">
                      {q ? "Tidak ada aplikasi yang cocok. Coba kata kunci lain." : "Belum ada aplikasi SPBE. Tambahkan aplikasi untuk ditampilkan di beranda."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSpbe.slice(spbePagination.startIndex,spbePagination.endIndex).map((app) => (
                    <TableRow
                      key={app.id}
                      className="hover:bg-muted/50 transition-colors border-b border-dashed border-border last:border-0"
                    >
                      <TableCell className="py-4 text-sm font-bold text-foreground">
                        {app.name}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-foreground">
                        {app.fullName}
                      </TableCell>
                      <TableCell className="min-w-48 max-w-sm py-4 text-sm leading-relaxed text-muted-foreground">
                        {app.description}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-muted-foreground max-w-xs truncate">
                        {app.link}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-muted-foreground">
                        {app.tag}
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditSpbe(app)}
                            className="h-9 text-sm font-medium text-foreground border border-dashed border-border hover:text-foreground hover:bg-muted rounded-2xl sm:rounded-3xl shadow-none"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            aria-label={`Hapus ${app.name}`}
                            onClick={() => setDeletingSpbeId(app.id)}
                            className="w-9 h-9 p-0 flex items-center justify-center rounded-2xl sm:rounded-3xl shadow-none"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {/* TAB 3: DOKUMEN & INFORMASI */}
          {activeTab === "info" && (
            <Table>
              <TableHeader className="bg-muted/40 border-b border-dashed border-border">
                <TableRow>
                  <TableHead className="text-xs">Judul Dokumen / Layanan</TableHead>
                  <TableHead className="w-28 text-xs">Kategori</TableHead>
                  <TableHead className="w-28 text-xs">Tipe Aksi</TableHead>
                  <TableHead className="text-xs">URL / File</TableHead>
                  <TableHead className="w-28 text-right text-xs">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInfo.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-14 text-center text-sm text-muted-foreground">
                      {q ? "Tidak ada dokumen yang cocok. Coba kata kunci lain." : "Belum ada dokumen atau informasi. Tambahkan konten untuk ditampilkan di beranda."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInfo.slice(infoPagination.startIndex,infoPagination.endIndex).map((item) => (
                    <TableRow
                      key={item.id}
                      className="hover:bg-muted/50 transition-colors border-b border-dashed border-border last:border-0"
                    >
                      <TableCell className="py-4">
                        <div className="text-sm font-medium text-foreground">
                          {item.title}
                        </div>
                        <div className="mt-1 max-w-sm whitespace-normal text-sm leading-relaxed text-muted-foreground">
                          {item.desc}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-sm text-muted-foreground">
                        {item.category || "Umum"}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-muted-foreground">
                        {item.actionType === "download" ? "Unduh" : "Tautan"}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-muted-foreground max-w-xs truncate">
                        {item.link}
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditInfo(item)}
                            className="h-9 text-sm font-medium text-foreground border border-dashed border-border hover:text-foreground hover:bg-muted rounded-2xl sm:rounded-3xl shadow-none"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            aria-label={`Hapus ${item.title}`}
                            onClick={() => setDeletingInfoId(item.id)}
                            className="w-9 h-9 p-0 flex items-center justify-center rounded-2xl sm:rounded-3xl shadow-none"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {/* TAB 4: MEDIA SOSIAL */}
          {activeTab === "socials" && (
            <Table>
              <TableHeader className="bg-muted/40 border-b border-dashed border-border">
                <TableRow>
                  <TableHead className="w-40 text-xs">Platform</TableHead>
                  <TableHead className="text-xs">Akun / Handle</TableHead>
                  <TableHead className="text-xs">Tautan URL</TableHead>
                  <TableHead className="w-28 text-right text-xs">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSocials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-14 text-center text-sm text-muted-foreground">
                      {q ? "Tidak ada akun yang cocok. Coba kata kunci lain." : "Belum ada akun media sosial."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSocials.slice(socialsPagination.startIndex,socialsPagination.endIndex).map((social) => (
                    <TableRow
                      key={social.id}
                      className="hover:bg-muted/50 transition-colors border-b border-dashed border-border last:border-0"
                    >
                      <TableCell className="py-4 text-sm font-semibold text-foreground">
                        {social.name}
                      </TableCell>
                      <TableCell className="py-4 text-sm  text-foreground">
                        {social.handle}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-muted-foreground max-w-md truncate">
                        {social.url}
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditSocial(social)}
                            className="h-9 text-sm font-medium text-foreground border border-dashed border-border hover:text-foreground hover:bg-muted rounded-2xl sm:rounded-3xl shadow-none"
                          >
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
        <TablePagination {...pagination} />
        </TabsContent>
        </Tabs>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSaveAll} disabled={isSaving} className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90">
            {isSaving ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Save aria-hidden="true" />}
            {isSaving ? "Menyimpan…" : "Simpan perubahan"}
          </Button>
      </div>

      {/* DIALOG: HERO SLIDE */}
      <Dialog open={slideDialogOpen} onOpenChange={setSlideDialogOpen}>
        <DialogContent aria-describedby={undefined} className="shadow-none border border-border rounded-2xl sm:rounded-3xl max-w-lg max-h-[85dvh] overflow-y-auto bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold tracking-tight">
              {editingSlide ? "Edit Slide Banner" : "Tambah Slide Banner"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3.5 py-2">
            <div>
              <label htmlFor="cms-beranda-field-1" className="text-sm font-medium text-foreground">Nama Label</label>
              <Input id="cms-beranda-field-1"
                value={slideForm.label}
                onChange={(e) => setSlideForm({ ...slideForm, label: e.target.value })}
                placeholder="Gedung PPKASN Kemensetneg"
                className="mt-1.5 h-10 text-sm bg-background border border-input rounded-2xl sm:rounded-3xl shadow-none"
              />
            </div>

            <div>
              <label htmlFor="cms-beranda-field-2" className="text-sm font-medium text-foreground">URL Gambar Banner</label>
              <Input id="cms-beranda-field-2"
                value={slideForm.imageUrl}
                onChange={(e) => setSlideForm({ ...slideForm, imageUrl: e.target.value })}
                placeholder="/images/hero-gedung-ppkasn.webp"
                className="mt-1.5 h-10 text-sm bg-background border border-input rounded-2xl sm:rounded-3xl shadow-none"
              />

              {/* Preview & Image Guidelines */}
              <div className="mt-2 space-y-2">
                <div className="relative w-full h-36 rounded-2xl sm:rounded-3xl overflow-hidden border border-border bg-muted flex items-center justify-center">
                  {slideForm.imageUrl ? (
                    <Image unoptimized fill
                      src={slideForm.imageUrl}
                      alt={slideForm.label || "Preview Banner"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/hero-gedung-ppkasn.webp";
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-7 w-7 mb-1 stroke-1" />
                      <span className="text-xs">Belum ada gambar</span>
                    </div>
                  )}
                </div>

                <div className="p-2.5 rounded-2xl sm:rounded-3xl bg-muted/50 border border-border flex items-start gap-2 text-xs text-muted-foreground">
                  <Info className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                  <div className="space-y-0.5 leading-relaxed">
                    <p className="font-semibold text-muted-foreground">
                      Ketentuan Upload Gambar Banner:
                    </p>
                    <p>• Resolusi rekomendasi: <strong>1920 × 1080 px</strong> (Rasio 16:9 Landscape)</p>
                    <p>• Format: <strong>WebP, JPG, PNG</strong> • Ukuran file maks: <strong>2 MB</strong></p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="cms-beranda-field-3" className="text-sm font-medium text-foreground">Tagline (Opsional)</label>
              <Input id="cms-beranda-field-3"
                value={slideForm.tagline}
                onChange={(e) => setSlideForm({ ...slideForm, tagline: e.target.value })}
                placeholder="Tagline teks di banner"
                className="mt-1.5 h-10 text-sm bg-background border border-input rounded-2xl sm:rounded-3xl shadow-none"
              />
            </div>

            {/* Toggle Status Aktif */}
            <div className="flex items-center justify-between p-3 rounded-2xl sm:rounded-3xl border border-border bg-muted/50">
              <div>
                <span className="text-xs font-medium text-foreground block">
                  Status Publikasi
                </span>
                <span className="text-xs text-muted-foreground">
                  {slideForm.isActive ? "Slide aktif dan ditampilkan pada beranda publik" : "Slide dinonaktifkan (disembunyikan)"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground">
                  {slideForm.isActive ? "Aktif" : "Nonaktif"}
                </span>
                <Switch
                  aria-label="Tampilkan slide di beranda publik"
                  checked={slideForm.isActive}
                  onCheckedChange={(checked) => setSlideForm({ ...slideForm, isActive: checked })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSlideDialogOpen(false)}
              className="border border-input bg-card text-foreground rounded-2xl sm:rounded-3xl shadow-none text-sm"
            >
              Batal
            </Button>
            <Button size="sm" onClick={handleSaveSlide} className="rounded-2xl sm:rounded-3xl bg-foreground text-background hover:bg-foreground/90 shadow-none text-sm">
              Terapkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG: SPBE APP */}
      <Dialog open={spbeDialogOpen} onOpenChange={setSpbeDialogOpen}>
        <DialogContent aria-describedby={undefined} className="shadow-none border border-border rounded-2xl sm:rounded-3xl max-w-lg max-h-[85dvh] overflow-y-auto bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold tracking-tight">
              {editingSpbe ? "Edit Aplikasi SPBE" : "Tambah Aplikasi SPBE"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3.5 py-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="cms-beranda-field-4" className="text-sm font-medium text-foreground">Nama Singkat</label>
                <Input id="cms-beranda-field-4"
                  value={spbeForm.name}
                  onChange={(e) => setSpbeForm({ ...spbeForm, name: e.target.value })}
                  placeholder="PIONIR"
                  className="mt-1.5 h-10 text-sm bg-background border border-input rounded-2xl sm:rounded-3xl shadow-none"
                />
              </div>
              <div>
                <label htmlFor="cms-beranda-field-5" className="text-sm font-medium text-foreground">Kategori / Tag</label>
                <Input id="cms-beranda-field-5"
                  value={spbeForm.tag}
                  onChange={(e) => setSpbeForm({ ...spbeForm, tag: e.target.value })}
                  placeholder="E-Office & Layanan"
                  className="mt-1.5 h-10 text-sm bg-background border border-input rounded-2xl sm:rounded-3xl shadow-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="cms-beranda-field-6" className="text-sm font-medium text-foreground">Nama Lengkap</label>
              <Input id="cms-beranda-field-6"
                value={spbeForm.fullName}
                onChange={(e) => setSpbeForm({ ...spbeForm, fullName: e.target.value })}
                placeholder="PIONIR Kemensetneg"
                className="mt-1.5 h-10 text-sm bg-background border border-input rounded-2xl sm:rounded-3xl shadow-none"
              />
            </div>

            <div>
              <label htmlFor="cms-beranda-field-7" className="text-sm font-medium text-foreground">Deskripsi</label>
              <Textarea id="cms-beranda-field-7"
                value={spbeForm.description}
                onChange={(e) => setSpbeForm({ ...spbeForm, description: e.target.value })}
                rows={2}
                className="mt-1.5 text-sm bg-background border border-input rounded-2xl sm:rounded-3xl shadow-none"
              />
            </div>

            <div>
              <label htmlFor="cms-beranda-field-8" className="text-sm font-medium text-foreground">URL Tautan / Link</label>
              <Input id="cms-beranda-field-8"
                value={spbeForm.link}
                onChange={(e) => setSpbeForm({ ...spbeForm, link: e.target.value })}
                placeholder="https://..."
                className="mt-1.5 h-10 text-sm bg-background border border-input rounded-2xl sm:rounded-3xl shadow-none"
              />
            </div>

            <div>
              <label htmlFor="cms-beranda-field-9" className="text-sm font-medium text-foreground">URL Icon / Logo Aplikasi</label>
              <Input id="cms-beranda-field-9"
                value={spbeForm.image || ""}
                onChange={(e) => setSpbeForm({ ...spbeForm, image: e.target.value })}
                placeholder="/images/spbe/layanan.webp atau https://..."
                className="mt-1.5 h-10 text-sm bg-background border border-input rounded-2xl sm:rounded-3xl shadow-none"
              />

              {/* Logo Preview & Guidelines */}
              <div className="mt-2 flex items-start gap-3">
                <div className="relative w-16 h-16 shrink-0 rounded-2xl sm:rounded-3xl overflow-hidden border border-border bg-muted flex items-center justify-center p-1.5">
                  {spbeForm.image ? (
                    <Image unoptimized width={64} height={64}
                      src={spbeForm.image}
                      alt={spbeForm.name || "Logo"}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/spbe/layanan.webp";
                      }}
                    />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="p-2 flex-1 rounded-2xl sm:rounded-3xl bg-muted/50 border border-border text-xs text-muted-foreground space-y-0.5 leading-relaxed">
                  <p className="font-semibold text-muted-foreground">Ketentuan Logo SPBE:</p>
                  <p>• Resolusi: <strong>200 × 200 px</strong> (Rasio 1:1 Kotak)</p>
                  <p>• Format: <strong>PNG transparan, SVG, WebP</strong> • Maks: <strong>500 KB</strong></p>
                </div>
              </div>
            </div>

            {/* Toggle Status Aktif SPBE */}
            <div className="flex items-center justify-between p-3 rounded-2xl sm:rounded-3xl border border-border bg-muted/50">
              <div>
                <span className="text-xs font-medium text-foreground block">
                  Status Aplikasi
                </span>
                <span className="text-xs text-muted-foreground">
                  {spbeForm.status === "Aktif" ? "Aplikasi tampil di portal publik" : "Aplikasi disembunyikan"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground">
                  {spbeForm.status === "Aktif" ? "Aktif" : "Nonaktif"}
                </span>
                <Switch
                  checked={spbeForm.status === "Aktif"}
                  onCheckedChange={(checked) =>
                    setSpbeForm({ ...spbeForm, status: checked ? "Aktif" : "Non-Aktif" })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSpbeDialogOpen(false)}
              className="border border-input bg-card text-foreground rounded-2xl sm:rounded-3xl shadow-none text-sm"
            >
              Batal
            </Button>
            <Button size="sm" onClick={handleSaveSpbe} className="rounded-2xl sm:rounded-3xl bg-foreground text-background hover:bg-foreground/90 shadow-none text-sm">
              Terapkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG: DOKUMEN / INFO */}
      <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
        <DialogContent aria-describedby={undefined} className="shadow-none border border-border rounded-2xl sm:rounded-3xl max-w-lg max-h-[85dvh] overflow-y-auto bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold tracking-tight">
              {editingInfo ? "Edit Dokumen" : "Tambah Dokumen"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label htmlFor="cms-beranda-field-10" className="text-sm font-medium text-foreground">Judul Dokumen</label>
              <Input id="cms-beranda-field-10"
                value={infoForm.title}
                onChange={(e) => setInfoForm({ ...infoForm, title: e.target.value })}
                placeholder="Standar Pelayanan PPKASN"
                className="mt-1.5 h-10 text-sm bg-background border border-input rounded-2xl sm:rounded-3xl shadow-none"
              />
            </div>
            <div>
              <label htmlFor="cms-beranda-field-11" className="text-sm font-medium text-foreground">Keterangan</label>
              <Input id="cms-beranda-field-11"
                value={infoForm.desc}
                onChange={(e) => setInfoForm({ ...infoForm, desc: e.target.value })}
                placeholder="Keterangan singkat"
                className="mt-1.5 h-10 text-sm bg-background border border-input rounded-2xl sm:rounded-3xl shadow-none"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="cms-beranda-field-12" className="text-sm font-medium text-foreground">Tipe Aksi</label>
                <select id="cms-beranda-field-12"
                  value={infoForm.actionType}
                  onChange={(e) =>
                    setInfoForm({ ...infoForm, actionType: e.target.value as "download" | "detail" })
                  }
                  className="mt-1.5 w-full h-10 text-sm text-foreground pl-3 pr-10 rounded-2xl sm:rounded-3xl border border-input bg-card shadow-none cursor-pointer"
                >
                  <option value="download">Unduh File</option>
                  <option value="detail">Buka Tautan</option>
                </select>
              </div>
              <div>
                <label htmlFor="cms-beranda-field-13" className="text-sm font-medium text-foreground">Kategori</label>
                <Input id="cms-beranda-field-13"
                  value={infoForm.category || ""}
                  onChange={(e) => setInfoForm({ ...infoForm, category: e.target.value })}
                  placeholder="Pelayanan / Tarif"
                  className="mt-1.5 h-10 text-sm bg-background border border-input rounded-2xl sm:rounded-3xl shadow-none"
                />
              </div>
            </div>
            <div>
              <label htmlFor="cms-beranda-field-14" className="text-sm font-medium text-foreground">URL File / Tautan</label>
              <Input id="cms-beranda-field-14"
                value={infoForm.link}
                onChange={(e) => setInfoForm({ ...infoForm, link: e.target.value })}
                placeholder="https://..."
                className="mt-1.5 h-10 text-sm bg-background border border-input rounded-2xl sm:rounded-3xl shadow-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInfoDialogOpen(false)}
              className="border border-input bg-card text-foreground rounded-2xl sm:rounded-3xl shadow-none text-sm"
            >
              Batal
            </Button>
            <Button size="sm" onClick={handleSaveInfo} className="rounded-2xl sm:rounded-3xl bg-foreground text-background hover:bg-foreground/90 shadow-none text-sm">
              Terapkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG: SOCIAL MEDIA */}
      <Dialog open={socialDialogOpen} onOpenChange={setSocialDialogOpen}>
        <DialogContent aria-describedby={undefined} className="shadow-none border border-border rounded-2xl sm:rounded-3xl max-w-lg max-h-[85dvh] overflow-y-auto bg-card">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">
              Edit Akun {socialForm.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label htmlFor="cms-beranda-field-15" className="text-sm font-medium text-foreground">Username / Nomor</label>
              <Input id="cms-beranda-field-15"
                value={socialForm.handle}
                onChange={(e) => setSocialForm({ ...socialForm, handle: e.target.value })}
                placeholder="@ppkasn.kemensetneg"
                className="mt-1.5 h-10 text-sm bg-background border border-input rounded-2xl sm:rounded-3xl shadow-none"
              />
            </div>
            <div>
              <label htmlFor="cms-beranda-field-16" className="text-sm font-medium text-foreground">URL Link</label>
              <Input id="cms-beranda-field-16"
                value={socialForm.url}
                onChange={(e) => setSocialForm({ ...socialForm, url: e.target.value })}
                placeholder="https://..."
                className="mt-1.5 h-10 text-sm bg-background border border-input rounded-2xl sm:rounded-3xl shadow-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSocialDialogOpen(false)}
              className="border border-input bg-card text-foreground rounded-2xl sm:rounded-3xl shadow-none text-sm"
            >
              Batal
            </Button>
            <Button size="sm" onClick={handleSaveSocial} className="rounded-2xl sm:rounded-3xl bg-foreground text-background hover:bg-foreground/90 shadow-none text-sm">
              Terapkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATIONS */}
      <AlertDialog open={Boolean(deletingSlideId)} onOpenChange={(open) => !open && setDeletingSlideId(null)}>
        <AlertDialogContent className="shadow-none border border-border rounded-2xl sm:rounded-3xl ">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Slide Banner</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus slide ini?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="shadow-none border border-input rounded-2xl sm:rounded-3xl">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSlide} className="bg-destructive hover:bg-destructive/90 shadow-none rounded-2xl sm:rounded-3xl text-white">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={Boolean(deletingSpbeId)} onOpenChange={(open) => !open && setDeletingSpbeId(null)}>
        <AlertDialogContent className="shadow-none border border-border rounded-2xl sm:rounded-3xl ">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Aplikasi SPBE</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus aplikasi ini?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="shadow-none border border-input rounded-2xl sm:rounded-3xl">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSpbe} className="bg-destructive hover:bg-destructive/90 shadow-none rounded-2xl sm:rounded-3xl text-white">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={Boolean(deletingInfoId)} onOpenChange={(open) => !open && setDeletingInfoId(null)}>
        <AlertDialogContent className="shadow-none border border-border rounded-2xl sm:rounded-3xl ">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Dokumen</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus dokumen ini?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="shadow-none border border-input rounded-2xl sm:rounded-3xl">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteInfo} className="bg-destructive hover:bg-destructive/90 shadow-none rounded-2xl sm:rounded-3xl text-white">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
