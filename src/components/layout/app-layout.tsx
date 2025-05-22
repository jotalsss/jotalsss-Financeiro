"use client";

import React from "react";
import Link from "next/link";
import { MainNav } from "./main-nav";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Coins } from "lucide-react"; // Using Coins as a logo icon

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="sidebar" collapsible="icon" side="left">
        <SidebarHeader className="p-4">
          <Link href="/" className="flex items-center gap-2" aria-label="RealWise Home">
            <Coins className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary group-data-[collapsible=icon]:hidden">
              RealWise
            </h1>
          </Link>
        </SidebarHeader>
        <Separator className="mb-2" />
        <SidebarContent>
          <MainNav />
        </SidebarContent>
        <SidebarFooter className="p-4 group-data-[collapsible=icon]:hidden">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} RealWise
          </p>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md sm:h-16 sm:px-6 md:hidden">
          <SidebarTrigger />
           <Link href="/" className="flex items-center gap-2" aria-label="RealWise Home">
            <Coins className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-semibold text-primary">
              RealWise
            </h1>
          </Link>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
