"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import {
  Save,
  Plus,
  Trash2,
  Pencil,
  Loader2,
} from "lucide-react";
import { TablePagination } from "@/components/ui/table-pagination";
import { useTablePagination } from "@/hooks/use-table-pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
  ProfileService,
  type CmsProfileData,
  type CmsStrategicPillar,
} from "../services/profile-service";

export function CmsProfileView() {
  const [data, setData] = useState<CmsProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Pillar Modal state
  const [pillarDialogOpen, setPillarDialogOpen] = useState(false);
  const [editingPillar, setEditingPillar] = useState<CmsStrategicPillar | null>(null);
  const [deletingPillarNumber, setDeletingPillarNumber] = useState<string | null>(null);
  const [pillarForm, setPillarForm] = useState<CmsStrategicPillar>({
    number: "01",
    title: "",
    description: "",
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await ProfileService.getProfileData();
      setData(res);
    } catch {
      toast.error("Gagal memuat profil PPKASN");
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
      await ProfileService.updateProfileData(data);
      toast.success("Konten Profil PPKASN berhasil disimpan ke sistem!");
    } catch {
      toast.error("Gagal menyimpan profil");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Handlers: Strategic Pillar ---
  const openAddPillar = () => {
    const nextNum = (data?.strategicPolicy.pillars.length || 0) + 1;
    const formattedNum = nextNum < 10 ? `0${nextNum}` : `${nextNum}`;
    setEditingPillar(null);
    setPillarForm({
      number: formattedNum,
      title: "",
      description: "",
    });
    setPillarDialogOpen(true);
  };

  const openEditPillar = (pillar: CmsStrategicPillar) => {
    setEditingPillar(pillar);
    setPillarForm({ ...pillar });
    setPillarDialogOpen(true);
  };

  const handleSavePillar = () => {
    if (!data) return;
    if (!pillarForm.title.trim() || !pillarForm.description.trim()) {
      toast.error("Judul dan deskripsi pilar wajib diisi");
      return;
    }

    if (editingPillar) {
      const updated = data.strategicPolicy.pillars.map((p) =>
        p.number === editingPillar.number ? pillarForm : p
      );
      setData({
        ...data,
        strategicPolicy: {
          ...data.strategicPolicy,
          pillars: updated,
        },
      });
      toast.success("Pilar strategis diperbarui");
    } else {
      setData({
        ...data,
        strategicPolicy: {
          ...data.strategicPolicy,
          pillars: [...data.strategicPolicy.pillars, pillarForm],
        },
      });
      toast.success("Pilar strategis baru ditambahkan");
    }

    setPillarDialogOpen(false);
  };

  const confirmDeletePillar = () => {
    if (!data || !deletingPillarNumber) return;
    const updated = data.strategicPolicy.pillars.filter((p) => p.number !== deletingPillarNumber);
    setData({
      ...data,
      strategicPolicy: {
        ...data.strategicPolicy,
        pillars: updated,
      },
    });
    setDeletingPillarNumber(null);
    toast.success("Pilar strategis dihapus");
  };

  const pagination=useTablePagination(data?.strategicPolicy.pillars.length ?? 0);

  if (isLoading || !data) {
    return (
      <div className="py-20 text-center text-muted-foreground flex flex-col items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin mb-2 text-muted-foreground" />
        <p className="text-sm">Memuat data Profil PPKASN...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Kelola Profil PPKASN</h1>
        
      </header>

      <Tabs defaultValue="structure" className="gap-0 overflow-hidden rounded-2xl sm:rounded-3xl border border-dashed border-border bg-card">
        <div className="overflow-x-auto border-b border-dashed border-border px-4 sm:px-6">
          <TabsList aria-label="Bagian profil" className="h-auto w-max min-w-full justify-start gap-2 rounded-none border-0 bg-transparent py-4">
            <TabsTrigger value="structure"
              className="h-10 flex-none rounded-2xl sm:rounded-3xl border border-dashed border-border bg-card px-3 font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 data-[state=active]:border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background">
              Struktur organisasi
            </TabsTrigger>
            <TabsTrigger value="policy"
              className="group h-10 flex-none gap-2 rounded-2xl sm:rounded-3xl border border-dashed border-border bg-card px-3 font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 data-[state=active]:border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background">
              Kebijakan &amp; pilar strategis
              <span className="rounded-2xl sm:rounded-3xl bg-secondary px-1.5 py-0.5 text-xs tabular-nums text-secondary-foreground group-data-[state=active]:bg-background/15 group-data-[state=active]:text-background">{data.strategicPolicy.pillars.length}</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: STRUKTUR ORGANISASI */}
        <TabsContent value="structure" className="m-0 p-4 sm:p-6">
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
            <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-5">
              <div>
                <label htmlFor="cms-profile-field-1" className="text-sm font-medium text-foreground">Judul Bagian</label>
                <Input id="cms-profile-field-1"
                  value={data.orgStructure.title}
                  onChange={(e) =>
                    setData({
                      ...data,
                      orgStructure: { ...data.orgStructure, title: e.target.value },
                    })
                  }
                  className="mt-1.5 h-10 text-sm bg-background border-dashed border-input rounded-2xl sm:rounded-3xl"
                />
              </div>

              <div>
                <label htmlFor="cms-profile-field-2" className="text-sm font-medium text-foreground">Subjudul Instansi</label>
                <Input id="cms-profile-field-2"
                  value={data.orgStructure.subtitle}
                  onChange={(e) =>
                    setData({
                      ...data,
                      orgStructure: { ...data.orgStructure, subtitle: e.target.value },
                    })
                  }
                  className="mt-1.5 h-10 text-sm bg-background border-dashed border-input rounded-2xl sm:rounded-3xl"
                />
              </div>
            </div>

            <div>
              <label htmlFor="cms-profile-field-3" className="text-sm font-medium text-foreground">URL / Path File Gambar Bagan Organisasi</label>
              <Input id="cms-profile-field-3"
                value={data.orgStructure.imageUrl}
                onChange={(e) =>
                  setData({
                    ...data,
                    orgStructure: { ...data.orgStructure, imageUrl: e.target.value },
                  })
                }
                placeholder="/images/struktur-organisasi.webp"
                className="mt-1.5 h-10 text-sm bg-background border border-input rounded-2xl sm:rounded-3xl font-mono shadow-none"
              />
            </div>

            </div>

            {/* Live Preview of Organization Structure Image + Specs */}
            <div className="min-w-0 space-y-3">
              <span className="text-sm font-medium text-foreground block">
                Pratinjau bagan
              </span>
              <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-muted/30 p-3">
                <Image unoptimized width={1920} height={1200}
                  src={data.orgStructure.imageUrl}
                  alt={data.orgStructure.title}
                  className="w-full h-auto rounded-2xl sm:rounded-3xl object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/struktur-organisasi.jpeg";
                  }}
                />
              </div>

              <p className="text-xs leading-relaxed text-muted-foreground">
                Rekomendasi 1920 × 1200 px. Format WebP, PNG, atau JPG; maksimal 3 MB.
              </p>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: KEBIJAKAN & PILAR STRATEGIS */}
        <TabsContent value="policy" className="m-0 space-y-6 p-4 sm:p-6">
          <div className="space-y-5">
            <div>
              <label htmlFor="cms-profile-field-4" className="text-sm font-medium text-foreground">Judul Bagian Kebijakan</label>
              <Input id="cms-profile-field-4"
                value={data.strategicPolicy.title}
                onChange={(e) =>
                  setData({
                    ...data,
                    strategicPolicy: { ...data.strategicPolicy, title: e.target.value },
                  })
                }
                className="mt-1.5 h-10 text-sm bg-background border-dashed border-input rounded-2xl sm:rounded-3xl"
              />
            </div>

            <div>
              <label htmlFor="cms-profile-field-5" className="text-sm font-medium text-foreground">Narasi Deskripsi Pengantar</label>
              <Textarea id="cms-profile-field-5"
                value={data.strategicPolicy.intro}
                onChange={(e) =>
                  setData({
                    ...data,
                    strategicPolicy: { ...data.strategicPolicy, intro: e.target.value },
                  })
                }
                rows={4}
                className="mt-1.5 text-sm bg-background border-dashed border-input rounded-2xl sm:rounded-3xl leading-relaxed"
              />
            </div>
          </div>

          {/* Pillars Table */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-border pt-6">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Daftar Pilar Strategis
                </h3>
              </div>
              <Button
                variant="outline"
                onClick={openAddPillar}
                size="sm"
                className="flex items-center gap-2 rounded-2xl sm:rounded-3xl border-dashed border-border bg-card text-foreground text-sm font-medium shadow-none"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Pilar</span>
              </Button>
            </div>

            <div className="overflow-hidden rounded-2xl sm:rounded-3xl">
              <Table>
                <TableHeader className="bg-muted/40 border-b border-dashed border-border">
                  <TableRow>
                    <TableHead className="w-16 text-xs font-semibold">No.</TableHead>
                    <TableHead className="w-64 text-xs font-semibold">Judul Pilar</TableHead>
                    <TableHead className="text-xs font-semibold">Penjelasan &amp; Implementasi</TableHead>
                    <TableHead className="w-28 text-right text-xs font-semibold">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.strategicPolicy.pillars.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="py-12 text-center text-sm text-muted-foreground">Belum ada pilar strategis. Pilih Tambah Pilar untuk menambahkan.</TableCell></TableRow>
                  )}
                  {data.strategicPolicy.pillars.slice(pagination.startIndex,pagination.endIndex).map((pillar) => (
                    <TableRow
                      key={pillar.number}
                      className="hover:bg-muted/50 border-b border-dashed border-border last:border-0"
                    >
                      <TableCell className="py-4 tabular-nums text-sm text-muted-foreground">
                        {pillar.number}
                      </TableCell>
                      <TableCell className="min-w-48 py-4 text-sm font-medium text-foreground">
                        {pillar.title}
                      </TableCell>
                      <TableCell className="min-w-64 max-w-2xl py-4 text-sm leading-relaxed text-muted-foreground">
                        {pillar.description}
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditPillar(pillar)}
                            className="h-9 text-sm font-medium text-foreground border border-dashed border-input hover:bg-muted rounded-2xl sm:rounded-3xl shadow-none"
                          >
                            <Pencil className="h-3.5 w-3.5 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            aria-label={`Hapus pilar ${pillar.title}`}
                            onClick={() => setDeletingPillarNumber(pillar.number)}
                            className="w-9 h-9 p-0 flex items-center justify-center rounded-2xl sm:rounded-3xl shadow-none"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination {...pagination} itemLabel="pilar" />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSaveAll} disabled={isSaving}
          className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90">
          {isSaving ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Save aria-hidden="true" />}
          {isSaving ? "Menyimpan…" : "Simpan perubahan"}
        </Button>
      </div>

      {/* MODAL: ADD/EDIT PILLAR */}
      <Dialog open={pillarDialogOpen} onOpenChange={setPillarDialogOpen}>
        <DialogContent aria-describedby={undefined} className="shadow-none border border-border rounded-2xl sm:rounded-3xl bg-card max-w-lg max-h-[85dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold tracking-tight">
              {editingPillar ? "Edit Pilar Strategis" : "Tambah Pilar Strategis"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="w-28">
              <label htmlFor="cms-profile-field-6" className="text-sm font-medium text-foreground">Nomor Urut</label>
              <Input id="cms-profile-field-6"
                value={pillarForm.number}
                onChange={(e) => setPillarForm({ ...pillarForm, number: e.target.value })}
                placeholder="01"
                className="mt-1.5 h-10 text-sm bg-background border border-input rounded-2xl sm:rounded-3xl tabular-nums font-medium shadow-none"
              />
            </div>
            <div>
              <label htmlFor="cms-profile-field-7" className="text-sm font-medium text-foreground">Judul Pilar</label>
              <Input id="cms-profile-field-7"
                value={pillarForm.title}
                onChange={(e) => setPillarForm({ ...pillarForm, title: e.target.value })}
                placeholder="cth. Competency Development Architect"
                className="mt-1.5 h-10 text-sm bg-background border border-input rounded-2xl sm:rounded-3xl font-semibold shadow-none"
              />
            </div>
            <div>
              <label htmlFor="cms-profile-field-8" className="text-sm font-medium text-foreground">Uraian Narasi Penjelasan</label>
              <Textarea id="cms-profile-field-8"
                value={pillarForm.description}
                onChange={(e) => setPillarForm({ ...pillarForm, description: e.target.value })}
                rows={5}
                placeholder="Penjelasan komprehensif implementasi pilar..."
                className="mt-1.5 text-sm bg-background border border-input rounded-2xl sm:rounded-3xl leading-relaxed shadow-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPillarDialogOpen(false)}
              className="border border-input rounded-2xl sm:rounded-3xl bg-card text-foreground shadow-none text-sm"
            >
              Batal
            </Button>
            <Button size="sm" onClick={handleSavePillar} className="rounded-2xl sm:rounded-3xl bg-foreground text-background hover:bg-foreground/90 text-sm">
              Terapkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CONFIRM DELETE PILLAR */}
      <AlertDialog
        open={Boolean(deletingPillarNumber)}
        onOpenChange={(open) => !open && setDeletingPillarNumber(null)}
      >
        <AlertDialogContent className="shadow-none border border-border ">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pilar Strategis</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pilar strategis ini dari profil publik?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="shadow-none border border-input bg-card text-foreground rounded-2xl sm:rounded-3xl">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePillar} className="bg-destructive hover:bg-destructive/90 shadow-none rounded-2xl sm:rounded-3xl text-white">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
