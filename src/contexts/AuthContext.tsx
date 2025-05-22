
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

interface AuthContextType {
  currentUser: string | null;
  login: (username: string) => void;
  logout: () => void;
  isLoading: boolean; // Renomeado de authLoading para isLoading para clareza
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
  const [initialLoading, setInitialLoading] = useState(true); // Para o carregamento inicial do localStorage
  const [authChecked, setAuthChecked] = useState(false); // Para saber se a lógica de rota foi executada
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = localStorage.getItem('realwise_currentUser');
    if (storedUser) {
      setCurrentUser(storedUser);
    }
    setInitialLoading(false);
  }, []);

  useEffect(() => {
    if (!initialLoading) { // Só executa após o carregamento do localStorage
      if (currentUser && pathname === '/login') {
        router.push('/');
      } else if (!currentUser && pathname !== '/login') {
        // Permite acesso a rotas de API ou assets públicos sem redirecionar
        if (!pathname.startsWith('/api/') && !pathname.startsWith('/_next/')) {
           router.push('/login');
        }
      }
      setAuthChecked(true);
    }
  }, [currentUser, pathname, router, initialLoading]);

  const login = (username: string) => {
    localStorage.setItem('realwise_currentUser', username);
    setCurrentUser(username);
    // O useEffect acima cuidará do redirecionamento
  };

  const logout = () => {
    localStorage.removeItem('realwise_currentUser');
    setCurrentUser(null);
    // O useEffect acima cuidará do redirecionamento para /login
  };

  if (!authChecked) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isLoading: initialLoading || !authChecked }}>
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
