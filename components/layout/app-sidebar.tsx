"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronsUpDown,
  LayoutDashboard,
  CalendarDays,
  DoorOpen,
  Bed,
  Package,
  Home,
  GraduationCap,
  Building,
  ShieldAlert,
  Newspaper,
} from "lucide-react";

import { NavMain, type NavGroup } from "@/components/layout/nav-main";
import { NavUser } from "@/components/layout/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SidebarMode = "portal" | "sarpras";
const sidebarModeStorageKey = "ppkasn-sidebar-mode";

const navGroups: NavGroup[] = [
  {
    groupLabel: "Sarana & Prasarana",
    items: [
      {
        title: "Dashboard",
        url: "/cms/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Kelola Data Aset",
        url: "/cms/assets",
        icon: Package,
        items: [
          {
            title: "Daftar Aset",
            url: "/cms/assets",
          },
          {
            title: "Tambah Aset Baru",
            url: "/cms/assets/add",
          },
        ],
      },
      {
        title: "Peminjaman Ruang Rapat",
        url: "/cms/meeting-room/data",
        icon: CalendarDays,
        items: [
          {
            title: "Data Peminjaman",
            url: "/cms/meeting-room/data",
          },
          {
            title: "Form Peminjaman",
            url: "/cms/meeting-room/add",
          },
          {
            title: "Jadwal Ruang Rapat",
            url: "/cms/meeting-room",
          },
        ],
      },
      {
        title: "Peminjaman Ruangan",
        url: "/cms/room/data",
        icon: DoorOpen,
        items: [
          {
            title: "Data Peminjaman",
            url: "/cms/room/data",
          },
          {
            title: "Form Peminjaman",
            url: "/cms/room/add",
          },
          {
            title: "Jadwal Ruangan",
            url: "/cms/room",
          },
        ],
      },
      {
        title: "Peminjaman Asrama",
        url: "/cms/dorm/data",
        icon: Bed,
        items: [
          {
            title: "Data Peminjaman",
            url: "/cms/dorm/data",
          },
          {
            title: "Form Peminjaman",
            url: "/cms/dorm/add",
          },
          {
            title: "Jadwal Asrama",
            url: "/cms/dorm",
          },
        ],
      },
    ],
  },
  {
    groupLabel: "Pelatihan",
    items: [
      {
        title: "Program Pelatihan",
        url: "/cms/program",
        icon: GraduationCap,
        items: [
          {
            title: "Daftar Program",
            url: "/cms/program",
          },
          {
            title: "Data Pendaftar",
            url: "/cms/program/pendaftar",
          },
        ],
      },
    ],
  },
  {
    groupLabel: "Portal & Informasi Publik",
    items: [
      {
        title: "Beranda",
        url: "/cms/beranda",
        icon: Home,
      },
      {
        title: "Profil PPKASN",
        url: "/cms/profil",
        icon: Building,
      },
      {
        title: "Berita",
        url: "/cms/berita",
        icon: Newspaper,
      },
      {
        title: "Layanan Pengaduan",
        url: "/cms/pengaduan",
        icon: ShieldAlert,
      },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const [selectedMode, setSelectedMode] = React.useState<SidebarMode | null>(null);
  const routeMode: SidebarMode = /^\/cms\/(dashboard|assets|room|meeting-room|dorm|backup-restore)(\/|$)/.test(pathname) ? "sarpras" : "portal";
  const mode = selectedMode ?? routeMode;
  const visibleGroups = mode === "sarpras"
    ? navGroups.filter(group => group.groupLabel === "Sarana & Prasarana")
    : ["Portal & Informasi Publik", "Pelatihan"].flatMap(label => navGroups.filter(group => group.groupLabel === label));

  const changeMode = (value: string) => {
    if (value !== "portal" && value !== "sarpras") return;
    setSelectedMode(value);
    try { localStorage.setItem(sidebarModeStorageKey, value); } catch { /* Selection still works when storage is unavailable. */ }
  };

  const [userData, setUserData] = React.useState({
    name: "Admin",
    email: "admin@setneg.go.id",
    avatar: "https://github.com/shadcn.png",
  });

  React.useEffect(() => {
    try {
      const savedMode = localStorage.getItem(sidebarModeStorageKey);
      if (savedMode === "portal" || savedMode === "sarpras") setSelectedMode(savedMode);
    } catch { /* Use the current page when storage is unavailable. */ }
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUserData({
          name:
            data.user.user_metadata?.full_name ||
            data.user.user_metadata?.name ||
            data.user.email?.split("@")[0] ||
            "Admin",
          email: data.user.email || "admin@setneg.go.id",
          avatar:
            data.user.user_metadata?.avatar_url ||
            "https://github.com/shadcn.png",
        });
      }
    });
  }, []);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b border-sidebar-border/40 pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-sidebar-accent">
              <Link href="/cms/dashboard" className="flex items-center gap-3">
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold tracking-wider text-sidebar-foreground uppercase">
                    CMS PPKASN
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton aria-label={`Pilih Section: ${mode === "portal" ? "Portal" : "Sarpras"}`} tooltip={`Section: ${mode === "portal" ? "Portal" : "Sarpras"}`}>
                  <span>Section: {mode === "portal" ? "Portal" : "Sarpras"}</span>
                  <ChevronsUpDown className="ml-auto size-4" aria-hidden="true" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="bottom" className="min-w-44">
                <DropdownMenuRadioGroup value={mode} onValueChange={changeMode}>
                  <DropdownMenuRadioItem value="portal">Section: Portal</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="sarpras">Section: Sarpras</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain key={mode} groups={visibleGroups} />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/40 pt-2">
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
