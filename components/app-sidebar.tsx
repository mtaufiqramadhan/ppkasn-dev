
"use client"

import * as React from "react"
import {
  Package,
  LayoutDashboard,
  CalendarRange,
  Bed,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Admin",
    email: "admin@setneg.go.id",
    avatar: "https://github.com/shadcn.png",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      items: [],
    },
    {
      title: "Kelola Data Aset",
      url: "/assets",
      icon: Package,
      items: [],
    },
    {
      title: "Peminjaman Ruangan",
      url: "/room",
      icon: CalendarRange,
      items: [],
    },
    {
      title: "Peminjaman Ruang Rapat",
      url: "/meeting-room",
      icon: CalendarRange,
      items: [],
    },
    {
      title: "Peminjaman Asrama",
      url: "/dorm",
      icon: Bed,
      items: [],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          {/* <SidebarMenuItem>
            <a href="/dashboard">
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold uppercase text-lg p-2">Sarpras</span>
              </div>
            </a>
          </SidebarMenuItem> */}
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

