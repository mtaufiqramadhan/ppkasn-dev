import { isCmsAdmin } from "@/lib/security/admin-policy";
import React from "react";
import tableStyles from "@/styles/cms-tables.module.css";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar, DynamicBreadcrumb } from "@/components/layout";
import { PageTransition } from "@/components/animation";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default async function CmsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isCmsAdmin(user)) {
    redirect("/auth");
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset className="bg-white dark:bg-background">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b bg-white dark:bg-card rounded-t-2xl sm:rounded-t-3xl px-4">
          <div className="flex items-center gap-2 w-full max-w-7xl mx-auto">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <DynamicBreadcrumb />
          </div>
        </header>
        <main className={`${tableStyles.scope} flex flex-1 flex-col gap-4 p-4 pt-0 w-full max-w-7xl mx-auto`}>
          <PageTransition className="flex-1 flex flex-col w-full">
            {children}
          </PageTransition>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
