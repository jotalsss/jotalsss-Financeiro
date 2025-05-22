
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
import { Coins, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, logout, isLoading: authIsLoading } = useAuth();
  const pathname = usePathname();

  // Se estiver carregando ou não houver usuário, ou estiver em rotas públicas, não renderizar o layout principal.
  // O AuthProvider e as páginas de login/registro já mostram seus próprios Loaders.
  if (authIsLoading || !currentUser || pathname === '/login' || pathname === '/register') {
    return <>{children}</>; 
  }

  const userDisplayName = currentUser?.email || "Usuário"; // Mostrar e-mail ou um placeholder

  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="sidebar" collapsible="icon" side="left">
        <SidebarHeader className="p-4">
          <Link href="/" className="flex items-center gap-2" aria-label="Página Inicial RealWise">
            <Coins className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary group-data-[collapsible=icon]:hidden">
              RealWise
            </h1>
          </Link>
          {currentUser && (
            <p className="text-xs text-muted-foreground mt-1 group-data-[collapsible=icon]:hidden truncate" title={userDisplayName}>
              {userDisplayName}
            </p>
          )}
        </SidebarHeader>
        <Separator className="mb-2" />
        <SidebarContent>
          <MainNav />
        </SidebarContent>
        <SidebarFooter className="p-4 space-y-2">
           <Button 
            variant="ghost" 
            className="w-full justify-start group-data-[collapsible=icon]:justify-center"
            onClick={logout}
            aria-label="Sair da conta"
           >
            <LogOut className="h-4 w-4 group-data-[collapsible=icon]:mr-0 mr-2" />
            <span className="group-data-[collapsible=icon]:hidden">Sair</span>
          </Button>
          <p className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
            © {new Date().getFullYear()} RealWise
          </p>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md sm:h-16 sm:px-6 md:hidden">
          <SidebarTrigger />
           <Link href="/" className="flex items-center gap-2" aria-label="Página Inicial RealWise">
            <Coins className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-semibold text-primary">
              RealWise
            </h1>
          </Link>
          {currentUser && (
             <Button 
              variant="ghost" 
              size="icon"
              onClick={logout}
              className="ml-auto"
              aria-label="Sair da conta"
             >
              <LogOut className="h-5 w-5" />
            </Button>
          )}
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
