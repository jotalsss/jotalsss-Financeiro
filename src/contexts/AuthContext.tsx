
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { addUser, findUserByUsername, verifyPassword } from '@/lib/auth-utils'; // Importar novas funções
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  currentUser: string | null;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>; // Modificado
  logout: () => void;
  register: (username: string, password: string) => Promise<{ success: boolean; message?: string }>; // Novo
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center bg-background p-4">
      <div className="space-y-4 text-center">
        <Skeleton className="mx-auto h-12 w-12 rounded-full" />
        <Skeleton className="h-6 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>
    </div>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem('realwise_currentUser');
    if (storedUser) {
      setCurrentUser(storedUser);
    }
    setInitialLoading(false);
  }, []);

  useEffect(() => {
    if (!initialLoading) {
      const publicPaths = ['/login', '/register'];
      const isPublicPath = publicPaths.includes(pathname);

      if (currentUser && isPublicPath) {
        router.push('/');
      } else if (!currentUser && !isPublicPath) {
        if (!pathname.startsWith('/api/') && !pathname.startsWith('/_next/')) {
          router.push('/login');
        }
      }
      setAuthChecked(true);
    }
  }, [currentUser, pathname, router, initialLoading]);

  const login = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    const user = findUserByUsername(username);
    if (!user) {
      return { success: false, message: "Usuário não encontrado." };
    }
    if (!verifyPassword(password, user.hashedPassword)) {
      return { success: false, message: "Senha incorreta." };
    }
    localStorage.setItem('realwise_currentUser', user.username);
    setCurrentUser(user.username);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('realwise_currentUser');
    setCurrentUser(null);
    router.push('/login'); // Garante o redirecionamento imediato
  };

  const register = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    const result = addUser(username, password);
    if (result.success) {
      // Auto-login após registro bem-sucedido
      localStorage.setItem('realwise_currentUser', username);
      setCurrentUser(username);
      return { success: true };
    }
    return result; // Retorna { success: false, message: ... }
  };

  if (!authChecked && !initialLoading) { // Pequena correção na condição para evitar piscar o loading screen desnecessariamente
     // Se não checou a autenticação E não está no carregamento inicial, mostra o LoadingScreen
     // Isso ajuda a cobrir o momento entre o fim do initialLoading e o authChecked se tornar true
     return <LoadingScreen />;
  }
  if (initialLoading) { // Se ainda está carregando o usuário do localStorage
    return <LoadingScreen />;
  }


  return (
    <AuthContext.Provider value={{ currentUser, login, logout, register, isLoading: initialLoading || !authChecked }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
