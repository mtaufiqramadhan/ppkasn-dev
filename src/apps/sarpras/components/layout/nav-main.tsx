"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "@/types";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export interface NavSubItem {
  title: string;
  url: string;
}

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
  items?: NavSubItem[];
}

export interface NavGroup {
  groupLabel?: string;
  items: NavItem[];
}

export function NavMain({
  groups,
  items,
}: {
  groups?: NavGroup[];
  items?: NavItem[];
}) {
  const pathname = usePathname();

  const navGroups: NavGroup[] = groups || (items ? [{ groupLabel: "Menu", items }] : []);

  return (
    <>
      {navGroups.map((group, groupIdx) => (
        <SidebarGroup key={group.groupLabel || groupIdx} className="py-1.5">
          {group.groupLabel && (
            <SidebarGroupLabel className="text-sidebar-foreground/50 text-[11px] font-semibold tracking-wider uppercase mb-1 px-3">
              {group.groupLabel}
            </SidebarGroupLabel>
          )}
          <SidebarMenu>
            {group.items.map((item) => {
              const hasSubItems = Boolean(item.items && item.items.length > 0);

              const isSubActive = Boolean(
                item.items?.some(
                  (subItem) =>
                    pathname === subItem.url ||
                    (subItem.url !== "/" && pathname.startsWith(subItem.url))
                )
              );

              const isDirectActive =
                pathname === item.url ||
                (item.url !== "/" && item.url !== "#" && pathname.startsWith(item.url));

              const isMainActive = hasSubItems ? isSubActive : isDirectActive;

              return (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={isSubActive || isDirectActive}
                >
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={isMainActive}
                      className="cursor-pointer transition-colors"
                    >
                      <Link href={item.url}>
                        <item.icon className="size-4" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>

                    {hasSubItems ? (
                      <>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuAction className="data-[state=open]:rotate-90 cursor-pointer transition-transform">
                            <ChevronRight className="size-4" />
                            <span className="sr-only">Toggle {item.title}</span>
                          </SidebarMenuAction>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items?.map((subItem) => {
                              const isChildActive = pathname === subItem.url;

                              return (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={isChildActive}
                                    className="cursor-pointer"
                                  >
                                    <Link href={subItem.url}>
                                      <span>{subItem.title}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </>
                    ) : null}
                  </SidebarMenuItem>
                </Collapsible>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
}
