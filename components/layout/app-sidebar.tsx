"use client";

import * as React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  CalendarDays,
  DoorOpen,
  Bed,
  Package,
  Building2,
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

const navGroups: NavGroup[] = [
  {
    groupLabel: "Utama",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Peminjaman Ruang Rapat",
        url: "/meeting-room/data",
        icon: CalendarDays,
        items: [
          {
            title: "Data Peminjaman",
            url: "/meeting-room/data",
          },
          {
            title: "Form Peminjaman",
            url: "/meeting-room/add",
          },
          {
            title: "Jadwal Ruang Rapat",
            url: "/",
          },
        ],
      },
      {
        title: "Peminjaman Ruangan",
        url: "/room/data",
        icon: DoorOpen,
        items: [
          {
            title: "Data Peminjaman",
            url: "/room/data",
          },
          {
            title: "Form Peminjaman",
            url: "/room/add",
          },
          {
            title: "Jadwal Ruangan",
            url: "/room",
          },
        ],
      },
      {
        title: "Peminjaman Asrama",
        url: "/dorm/data",
        icon: Bed,
        items: [
          {
            title: "Data Peminjaman",
            url: "/dorm/data",
          },
          {
            title: "Form Peminjaman",
            url: "/dorm/add",
          },
          {
            title: "Jadwal Asrama",
            url: "/dorm",
          },
        ],
      },
    ],
  },
  {
    groupLabel: "Inventaris & Aset",
    items: [
      {
        title: "Kelola Data Aset",
        url: "/assets",
        icon: Package,
        items: [
          {
            title: "Daftar Aset",
            url: "/assets",
          },
          {
            title: "Tambah Aset Baru",
            url: "/assets/add",
          },
        ],
      },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [userData, setUserData] = React.useState({
    name: "Admin",
    email: "admin@setneg.go.id",
    avatar: "https://github.com/shadcn.png",
  });

  React.useEffect(() => {
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
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-none">
                  <Building2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold tracking-wider text-sidebar-foreground uppercase">
                    SARPRAS
                  </span>
                  <span className="truncate text-[11px] text-sidebar-foreground/70">
                    Sistem Sarana & Prasarana
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain groups={navGroups} />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/40 pt-2">
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
