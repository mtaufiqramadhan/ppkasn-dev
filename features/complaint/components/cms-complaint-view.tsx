"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import {
  Save,
  Plus,
  Trash2,
  Pencil,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { TablePagination } from "@/components/ui/table-pagination";
import { useTablePagination } from "@/hooks/use-table-pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  ComplaintService,
  type CmsComplaintsData,
  type CmsComplaintChannel,
} from "../services/complaint-service";
import type { ComplaintTicket, ComplaintStatus } from "../types";

export function CmsComplaintView() {
  const [data, setData] = useState<CmsComplaintsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Channel Dialog state
  const [channelDialogOpen, setChannelDialogOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<CmsComplaintChannel | null>(null);
  const [deletingChannelId, setDeletingChannelId] = useState<string | null>(null);
  const [channelForm, setChannelForm] = useState<CmsComplaintChannel>({
    id: "",
    number: "01",
    name: "",
    description: "",
    actionText: "Kunjungi Portal",
    actionUrl: "https://",
    type: "external",
    isActive: true,
  });

  // Ticket Modal state
  const [selectedTicket, setSelectedTicket] = useState<ComplaintTicket | null>(null);
  const [ticketStatus, setTicketStatus] = useState<ComplaintStatus>("TERKIRIM");
  const [statusNotes, setStatusNotes] = useState("");
  const [isUpdatingTicket, setIsUpdatingTicket] = useState(false);
  const [deletingTicketNum, setDeletingTicketNum] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await ComplaintService.getComplaintsData();
      setData(res);
    } catch {
      toast.error("Gagal memuat data pengaduan");
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
      await ComplaintService.updateComplaintsData(data);
      toast.success("Pengaturan Layanan Pengaduan berhasil disimpan!");
    } catch {
      toast.error("Gagal menyimpan data pengaduan");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Handlers: Complaint Channels ---
  const openAddChannel = () => {
    const nextNum = (data?.channels?.length || 0) + 1;
    const formattedNum = nextNum < 10 ? `0${nextNum}` : `${nextNum}`;
    setEditingChannel(null);
    setChannelForm({
      id: `ch-${Date.now()}`,
      number: formattedNum,
      name: "",
      description: "",
      actionText: "Buka Tautan",
      actionUrl: "https://",
      type: "external",
      isActive: true,
    });
    setChannelDialogOpen(true);
  };

  const openEditChannel = (channel: CmsComplaintChannel) => {
    setEditingChannel(channel);
    setChannelForm({ ...channel });
    setChannelDialogOpen(true);
  };

  const handleSaveChannel = () => {
    if (!data) return;
    if (!channelForm.name.trim() || !channelForm.actionUrl.trim()) {
      toast.error("Nama saluran dan URL tautan wajib diisi");
      return;
    }

    if (editingChannel) {
      const updated = data.channels.map((c) => (c.id === editingChannel.id ? channelForm : c));
      setData({ ...data, channels: updated });
      toast.success("Saluran pengaduan diperbarui");
    } else {
      setData({ ...data, channels: [...data.channels, channelForm] });
      toast.success("Saluran pengaduan baru ditambahkan");
    }

    setChannelDialogOpen(false);
  };

  const confirmDeleteChannel = () => {
    if (!data || !deletingChannelId) return;
    const updated = data.channels.filter((c) => c.id !== deletingChannelId);
    setData({ ...data, channels: updated });
    setDeletingChannelId(null);
    toast.success("Saluran pengaduan dihapus");
  };

  // --- Handlers: Tickets ---
  const handleUpdateTicket = async () => {
    if (!selectedTicket) return;
    setIsUpdatingTicket(true);
    try {
      const updated = await ComplaintService.updateTicketStatus(
        selectedTicket.ticketNumber,
        ticketStatus,
        statusNotes
      );
      if (data) {
        setData({
          ...data,
          tickets: data.tickets.map((t) =>
            t.ticketNumber === updated.ticketNumber ? updated : t
          ),
        });
      }
      toast.success("Status tiket pengaduan diperbarui");
      setSelectedTicket(null);
    } catch {
      toast.error("Gagal memperbarui tiket");
    } finally {
      setIsUpdatingTicket(false);
    }
  };

  const confirmDeleteTicket = async () => {
    if (!deletingTicketNum) return;
    try {
      await ComplaintService.deleteTicket(deletingTicketNum);
      if (data) {
        setData({
          ...data,
          tickets: data.tickets.filter((t) => t.ticketNumber !== deletingTicketNum),
        });
      }
      toast.success("Tiket pengaduan dihapus");
    } catch {
      toast.error("Gagal menghapus tiket");
    } finally {
      setDeletingTicketNum(null);
    }
  };

  const channelPagination=useTablePagination(data?.channels.length ?? 0);
  const ticketPagination=useTablePagination(data?.tickets.length ?? 0);

  if (isLoading || !data) {
    return (
      <div className="py-20 text-center text-muted-foreground flex flex-col items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin mb-2 text-muted-foreground" />
        <p className="text-sm">Memuat data Layanan Pengaduan...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Kelola Layanan Pengaduan</h1>
        
      </header>

      <Tabs defaultValue="channels" className="gap-0 overflow-hidden rounded-2xl sm:rounded-3xl border border-dashed border-border bg-card">
        <div className="overflow-x-auto border-b border-dashed border-border px-4 sm:px-6">
          <TabsList aria-label="Bagian layanan pengaduan" className="h-auto w-max min-w-full justify-start gap-2 rounded-none border-0 bg-transparent py-4">
            {[
              {value: "channels", label: "Saluran resmi", count: data.channels.length},
              {value: "hero-banner", label: "Banner & sambutan", count: null},
              {value: "tickets", label: "Tiket masuk", count: data.tickets.length},
            ].map(tab => (
              <TabsTrigger key={tab.value} value={tab.value}
                className="group h-10 flex-none gap-2 rounded-2xl sm:rounded-3xl border border-dashed border-border bg-card px-3 font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 data-[state=active]:border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background">
                {tab.label}
                {tab.count !== null && <span className="rounded-2xl sm:rounded-3xl bg-secondary px-1.5 py-0.5 text-xs tabular-nums text-secondary-foreground group-data-[state=active]:bg-background/15 group-data-[state=active]:text-background">{tab.count}</span>}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* TAB 1: SALURAN RESMI PENGADUAN (WA, Email, GOL, WBS, LAPOR) */}
        <TabsContent value="channels" className="m-0 space-y-5 p-4 sm:p-6">
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={openAddChannel}
              size="sm"
              className="flex items-center gap-2 rounded-2xl sm:rounded-3xl text-xs font-medium shadow-none"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Saluran</span>
            </Button>
          </div>

          <div className="overflow-hidden rounded-2xl sm:rounded-3xl">
            <Table>
              <TableHeader className="bg-muted/40 border-b border-dashed border-border">
                <TableRow>
                  <TableHead className="w-14 text-xs font-semibold">No.</TableHead>
                  <TableHead className="w-56 text-xs font-semibold">Nama Saluran</TableHead>
                  <TableHead className="text-xs font-semibold">Deskripsi &amp; Jam Layanan</TableHead>
                  <TableHead className="text-xs font-semibold">Tautan / Aksi</TableHead>
                  <TableHead className="w-24 text-xs font-semibold">Status</TableHead>
                  <TableHead className="w-28 text-right text-xs font-semibold">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.channels.length === 0 && <TableRow><TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">Belum ada saluran pengaduan.</TableCell></TableRow>}
                {data.channels.slice(channelPagination.startIndex,channelPagination.endIndex).map((ch) => (
                  <TableRow
                    key={ch.id}
                    className="hover:bg-muted/50 border-b border-dashed border-border last:border-0"
                  >
                    <TableCell className="py-4 tabular-nums font-medium text-xs text-primary">
                      {ch.number}
                    </TableCell>
                    <TableCell className="py-4">
                      <p className="font-medium text-sm text-foreground">
                        {ch.name}
                      </p>
                      <span className="text-xs text-muted-foreground capitalize">
                        {ch.type === "whatsapp"
                          ? "WhatsApp"
                          : ch.type === "email"
                          ? "Email Resmi"
                          : "Portal Eksternal"}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground max-w-sm">
                      <p className="line-clamp-2">{ch.description}</p>
                    </TableCell>
                    <TableCell className="py-4">
                      <a
                        href={ch.actionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-foreground underline-offset-4 hover:underline flex items-center gap-1"
                      >
                        <span className="truncate max-w-[150px]">{ch.actionUrl}</span>
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                      <span className="text-xs text-muted-foreground block mt-0.5">
                        Teks Tombol: &ldquo;{ch.actionText}&rdquo;
                      </span>
                    </TableCell>
                    <TableCell className="py-4">
                      <span
                        className={`inline-flex whitespace-nowrap px-2.5 py-0.5 rounded-2xl sm:rounded-3xl text-xs font-medium border border-dashed ${
                          ch.isActive !== false
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : "bg-secondary text-secondary-foreground border-border"
                        }`}
                      >
                        {ch.isActive !== false ? "Aktif" : "Non-Aktif"}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditChannel(ch)}
                          className="h-9 text-sm font-medium text-foreground border border-dashed border-input hover:bg-muted rounded-2xl sm:rounded-3xl shadow-none"
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          aria-label={`Hapus saluran ${ch.name}`}
                          onClick={() => setDeletingChannelId(ch.id)}
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
            <TablePagination {...channelPagination} itemLabel="saluran" />
          </div>
        </TabsContent>

        {/* TAB 2: BANNER & TEKS SAMBUTAN */}
        <TabsContent value="hero-banner" className="m-0 space-y-5 p-4 sm:p-6">
          <div className="grid items-start gap-8 lg:grid-cols-2">

            <div className="space-y-5">
            <div>
              <label htmlFor="cms-complaint-field-1" className="text-sm font-medium text-foreground">Judul Halaman</label>
              <Input id="cms-complaint-field-1"
                value={data.hero.title}
                onChange={(e) =>
                  setData({ ...data, hero: { ...data.hero, title: e.target.value } })
                }
                className="mt-1.5 h-10 text-sm bg-background border-dashed border-input rounded-2xl sm:rounded-3xl"
              />
            </div>

            <div>
              <label htmlFor="cms-complaint-field-2" className="text-sm font-medium text-foreground">Deskripsi Teks Sambutan (Kerahasiaan Pelapor)</label>
              <Textarea id="cms-complaint-field-2"
                value={data.hero.description}
                onChange={(e) =>
                  setData({ ...data, hero: { ...data.hero, description: e.target.value } })
                }
                rows={3}
                className="mt-1.5 text-sm bg-background border-dashed border-input rounded-2xl sm:rounded-3xl leading-relaxed"
              />
            </div>

            <div>
              <label htmlFor="cms-complaint-field-3" className="text-sm font-medium text-foreground">URL / Path File Banner Gambar Resmi Pengaduan</label>
              <Input id="cms-complaint-field-3"
                value={data.bannerUrl}
                onChange={(e) => setData({ ...data, bannerUrl: e.target.value })}
                placeholder="/images/pengaduan-banner.webp"
                className="mt-1.5 h-10 text-sm bg-background border border-input rounded-2xl sm:rounded-3xl font-mono shadow-none"
              />
            </div>

            <div className="pt-4 border-t border-dashed border-border space-y-3">
              <h3 className="text-sm font-semibold text-foreground">
                Komitmen pelayanan
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="cms-complaint-field-4" className="text-xs text-muted-foreground block mb-1">Kalimat Komitmen 1</label>
                  <Input id="cms-complaint-field-4"
                    value={data.commitment1 || ""}
                    onChange={(e) => setData({ ...data, commitment1: e.target.value })}
                    className="h-10 text-sm border-dashed border-input rounded-2xl sm:rounded-3xl"
                  />
                </div>
                <div>
                  <label htmlFor="cms-complaint-field-5" className="text-xs text-muted-foreground block mb-1">Kalimat Komitmen 2</label>
                  <Input id="cms-complaint-field-5"
                    value={data.commitment2 || ""}
                    onChange={(e) => setData({ ...data, commitment2: e.target.value })}
                    className="h-10 text-sm border-dashed border-input rounded-2xl sm:rounded-3xl"
                  />
                </div>
              </div>
            </div>
            </div>
            {/* Banner Live Preview + Specs */}
            <div className="min-w-0 space-y-3">
              <span className="text-sm font-medium text-foreground block">
                Pratinjau banner
              </span>
              <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-muted/30 p-3">
                <Image unoptimized width={1200} height={400}
                  src={data.bannerUrl}
                  alt={data.hero.title}
                  className="w-full h-auto rounded-2xl sm:rounded-3xl object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/pengaduan-banner.jpeg";
                  }}
                />
              </div>

              <p className="text-xs leading-relaxed text-muted-foreground">Rekomendasi 1200 × 400 px. Format WebP, JPG, atau PNG; maksimal 2 MB.</p>
            </div>

          </div>
        </TabsContent>

        {/* TAB 3: TIKET MASUK (DISPOSISI ADUAN) */}
        <TabsContent value="tickets" className="m-0 space-y-5 p-4 sm:p-6">
          <div className="overflow-hidden rounded-2xl sm:rounded-3xl">
            <Table>
              <TableHeader className="bg-muted/40 border-b border-dashed border-border">
                <TableRow>
                  <TableHead className="w-32 text-xs font-semibold">No. Tiket</TableHead>
                  <TableHead className="w-28 text-xs font-semibold">Kategori</TableHead>
                  <TableHead className="text-xs font-semibold">Substansi Aduan</TableHead>
                  <TableHead className="w-32 text-xs font-semibold">Pelapor</TableHead>
                  <TableHead className="w-28 text-xs font-semibold">Status</TableHead>
                  <TableHead className="w-28 text-right text-xs font-semibold">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.tickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-xs text-muted-foreground">
                      Belum ada tiket pengaduan yang masuk.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.tickets.slice(ticketPagination.startIndex,ticketPagination.endIndex).map((ticket) => (
                    <TableRow
                      key={ticket.ticketNumber}
                      className="hover:bg-muted/50 border-b border-dashed border-border last:border-0"
                    >
                      <TableCell className="py-4 tabular-nums font-medium text-xs text-primary">
                        {ticket.ticketNumber}
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="px-2 py-0.5 rounded-2xl sm:rounded-3xl text-xs font-medium border border-dashed border-input bg-muted text-foreground">
                          {ticket.category}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <p className="font-medium text-sm text-foreground">
                          {ticket.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {ticket.description}
                        </p>
                      </TableCell>
                      <TableCell className="py-4 text-sm text-muted-foreground">
                        <p className="font-medium">{ticket.reporterName}</p>
                        <p className="text-xs text-muted-foreground">{ticket.submittedAt}</p>
                      </TableCell>
                      <TableCell className="py-4">
                        <span
                          className={`inline-flex whitespace-nowrap px-2 py-0.5 rounded-2xl sm:rounded-3xl text-xs font-medium border border-dashed ${
                            ticket.status === "SELESAI"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300"
                              : ticket.status === "SEDANG_DITINDAKLANJUTI" ||
                                ticket.status === "DIVERIFIKASI"
                              ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300"
                              : "bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-950/40 dark:text-sky-300"
                          }`}
                        >
                          {({TERKIRIM: "Menunggu", DIVERIFIKASI: "Diverifikasi", SEDANG_DITINDAKLANJUTI: "Ditindaklanjuti", SELESAI: "Selesai"} satisfies Record<ComplaintStatus, string>)[ticket.status]}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedTicket(ticket);
                              setTicketStatus(ticket.status);
                              setStatusNotes(ticket.statusNotes || "");
                            }}
                            className="h-9 text-sm font-medium text-foreground border border-dashed border-input hover:bg-muted rounded-2xl sm:rounded-3xl shadow-none"
                          >
                            Tanggapi
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            aria-label={`Hapus tiket ${ticket.ticketNumber}`}
                            onClick={() => setDeletingTicketNum(ticket.ticketNumber)}
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
            <TablePagination {...ticketPagination} itemLabel="tiket" />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSaveAll} disabled={isSaving} className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90">
          {isSaving ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Save aria-hidden="true" />}
          {isSaving ? "Menyimpan…" : "Simpan perubahan"}
        </Button>
      </div>

      {/* MODAL 1: ADD/EDIT SALURAN PENGADUAN */}
      <Dialog open={channelDialogOpen} onOpenChange={setChannelDialogOpen}>
        <DialogContent aria-describedby={undefined} className="shadow-none border border-border rounded-2xl sm:rounded-3xl bg-card max-w-lg max-h-[85dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold tracking-tight">
              {editingChannel ? "Edit Saluran Pengaduan" : "Tambah Saluran Pengaduan"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="cms-complaint-field-6" className="text-sm font-medium text-foreground">Nomor Urut</label>
                <Input id="cms-complaint-field-6"
                  value={channelForm.number}
                  onChange={(e) => setChannelForm({ ...channelForm, number: e.target.value })}
                  placeholder="01"
                  className="mt-1.5 h-10 text-sm bg-background border border-input rounded-2xl sm:rounded-3xl tabular-nums font-medium shadow-none"
                />
              </div>
              <div>
                <label htmlFor="cms-complaint-field-7" className="text-sm font-medium text-foreground">Tipe Saluran</label>
                <select id="cms-complaint-field-7"
                  value={channelForm.type}
                  onChange={(e) =>
                    setChannelForm({
                      ...channelForm,
                      type: e.target.value as "whatsapp" | "email" | "external",
                    })
                  }
                  className="mt-1.5 w-full h-10 text-sm bg-background pl-3 pr-9 rounded-2xl sm:rounded-3xl border border-input bg-card shadow-none cursor-pointer"
                >
                  <option value="whatsapp">WhatsApp Hotline</option>
                  <option value="email">Email Pengaduan</option>
                  <option value="external">Portal Eksternal</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="cms-complaint-field-8" className="text-sm font-medium text-foreground">Nama Saluran</label>
              <Input id="cms-complaint-field-8"
                value={channelForm.name}
                onChange={(e) => setChannelForm({ ...channelForm, name: e.target.value })}
                placeholder="cth. WhatsApp Halo Gaharu / SP4N-LAPOR!"
                className="mt-1.5 h-10 text-sm bg-background border border-input rounded-2xl sm:rounded-3xl font-semibold shadow-none"
              />
            </div>

            <div>
              <label htmlFor="cms-complaint-field-9" className="text-sm font-medium text-foreground">Deskripsi &amp; Petunjuk</label>
              <Textarea id="cms-complaint-field-9"
                value={channelForm.description}
                onChange={(e) => setChannelForm({ ...channelForm, description: e.target.value })}
                rows={3}
                placeholder="Petunjuk penyampaian aduan, jam operasional, atau jaminan kerahasiaan..."
                className="mt-1.5 text-sm bg-background border border-input rounded-2xl sm:rounded-3xl leading-relaxed shadow-none"
              />
            </div>

            <div>
              <label htmlFor="cms-complaint-field-10" className="text-sm font-medium text-foreground">Teks Tombol Aksi</label>
              <Input id="cms-complaint-field-10"
                value={channelForm.actionText}
                onChange={(e) => setChannelForm({ ...channelForm, actionText: e.target.value })}
                placeholder="Kirim Pesan / Kunjungi Portal"
                className="mt-1.5 h-10 text-sm bg-background border border-input rounded-2xl sm:rounded-3xl shadow-none"
              />
            </div>

            <div>
              <label htmlFor="cms-complaint-field-11" className="text-sm font-medium text-foreground">URL Tautan Aksi (https://, wa.me, mailto:)</label>
              <Input id="cms-complaint-field-11"
                value={channelForm.actionUrl}
                onChange={(e) => setChannelForm({ ...channelForm, actionUrl: e.target.value })}
                placeholder="https://wa.me/6282110002114 atau https://gol.kpk.go.id"
                className="mt-1.5 h-10 text-sm bg-background border border-input rounded-2xl sm:rounded-3xl font-mono shadow-none"
              />
            </div>

            {/* Toggle Status Aktif Saluran */}
            <div className="flex items-center justify-between p-3 rounded-2xl sm:rounded-3xl border border-border bg-muted/50">
              <div>
                <span className="text-sm font-medium text-foreground block">
                  Status Saluran Pengaduan
                </span>
                <span className="text-xs text-muted-foreground">
                  {channelForm.isActive !== false ? "Saluran aktif dan tampil pada halaman pengaduan publik" : "Saluran dinonaktifkan (disembunyikan)"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground">
                  {channelForm.isActive !== false ? "Aktif" : "Nonaktif"}
                </span>
                <Switch
                  aria-label="Tampilkan saluran di halaman pengaduan"
                  checked={channelForm.isActive !== false}
                  onCheckedChange={(checked) => setChannelForm({ ...channelForm, isActive: checked })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setChannelDialogOpen(false)}
              className="border border-input bg-card text-foreground rounded-2xl sm:rounded-3xl shadow-none text-sm"
            >
              Batal
            </Button>
            <Button size="sm" onClick={handleSaveChannel} className="rounded-2xl sm:rounded-3xl bg-foreground text-background hover:bg-foreground/90 shadow-none text-sm">
              Terapkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: TANGGAPI TIKET */}
      <Dialog open={Boolean(selectedTicket)} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent aria-describedby={undefined} className="shadow-none border border-border rounded-2xl sm:rounded-3xl bg-card max-w-lg max-h-[85dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Tindak Lanjut Tiket {selectedTicket?.ticketNumber}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="p-3 rounded-2xl sm:rounded-3xl bg-muted/40 border border-border space-y-1">
              <p className="text-xs font-semibold">{selectedTicket?.title}</p>
              <p className="text-xs text-muted-foreground">{selectedTicket?.description}</p>
              <p className="text-xs text-muted-foreground pt-1">
                Oleh: {selectedTicket?.reporterName} ({selectedTicket?.agency})
              </p>
            </div>

            <div>
              <label htmlFor="cms-complaint-field-12" className="text-sm font-medium text-foreground">Pembaruan Status</label>
              <select id="cms-complaint-field-12"
                value={ticketStatus}
                onChange={(e) => setTicketStatus(e.target.value as ComplaintStatus)}
                className="mt-1.5 w-full h-10 text-sm bg-background pl-3 pr-9 rounded-2xl sm:rounded-3xl border border-input bg-card shadow-none cursor-pointer"
              >
                <option value="TERKIRIM">Menunggu</option>
                <option value="DIVERIFIKASI">Diverifikasi</option>
                <option value="SEDANG_DITINDAKLANJUTI">Ditindaklanjuti</option>
                <option value="SELESAI">Selesai</option>
              </select>
            </div>

            <div>
              <label htmlFor="cms-complaint-field-13" className="text-sm font-medium text-foreground">Catatan Tindak Lanjut / Jawaban Resmi</label>
              <Textarea id="cms-complaint-field-13"
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                rows={3}
                placeholder="Penjelasan hasil tindak lanjut..."
                className="mt-1.5 text-sm bg-background border border-input rounded-2xl sm:rounded-3xl leading-relaxed shadow-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedTicket(null)}
              className="border border-input bg-card text-foreground rounded-2xl sm:rounded-3xl shadow-none text-sm"
            >
              Batal
            </Button>
            <Button
              size="sm"
              onClick={handleUpdateTicket}
              disabled={isUpdatingTicket}
              className="rounded-2xl sm:rounded-3xl bg-foreground text-background hover:bg-foreground/90 shadow-none text-sm"
            >
              {isUpdatingTicket ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan Tindak Lanjut"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CONFIRM DELETE CHANNEL */}
      <AlertDialog
        open={Boolean(deletingChannelId)}
        onOpenChange={(open) => !open && setDeletingChannelId(null)}
      >
        <AlertDialogContent className="shadow-none border border-border rounded-2xl sm:rounded-3xl ">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Saluran Pengaduan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus saluran pengaduan ini dari halaman depan publik?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="shadow-none border border-input rounded-2xl sm:rounded-3xl">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteChannel} className="bg-destructive hover:bg-destructive/90 shadow-none rounded-2xl sm:rounded-3xl text-white">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* CONFIRM DELETE TICKET */}
      <AlertDialog
        open={Boolean(deletingTicketNum)}
        onOpenChange={(open) => !open && setDeletingTicketNum(null)}
      >
        <AlertDialogContent className="shadow-none border border-border rounded-2xl sm:rounded-3xl ">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Tiket Pengaduan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus tiket pengaduan ini secara permanen?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="shadow-none border border-input rounded-2xl sm:rounded-3xl">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTicket} className="bg-destructive hover:bg-destructive/90 shadow-none rounded-2xl sm:rounded-3xl text-white">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
