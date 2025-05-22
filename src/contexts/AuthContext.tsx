
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/hooks/use-toast";
import { loginUser, registerUser } from '@/lib/auth-simulation'; // Usar a simulação

const LOGGED_IN_USER_KEY = "realwise_logged_in_user_email";

// Interface para o usuário logado (simulado)
interface AppUser {
  email: string;
}

interface AuthContextType {
  currentUser: AppUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
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
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    // Verificar se há um usuário "logado" no localStorage ao iniciar
    if (typeof window !== "undefined") {
      const storedUserEmail = localStorage.getItem(LOGGED_IN_USER_KEY);
      if (storedUserEmail) {
        setCurrentUser({ email: storedUserEmail });
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const publicPaths = ['/login', '/register'];
      const isPublicPath = publicPaths.includes(pathname);

      if (currentUser && isPublicPath) {
        router.push('/');
      } else if (!currentUser && !isPublicPath) {
        if (!pathname.startsWith('/api/') && !pathname.startsWith('/_next/')) {
          router.push('/login');
        }
      }
    }
  }, [currentUser, pathname, router, isLoading]);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    const result = loginUser(email, password);
    if (result.success && result.user) {
      setCurrentUser({ email: result.user.email });
      if (typeof window !== "undefined") {
        localStorage.setItem(LOGGED_IN_USER_KEY, result.user.email);
      }
      // O useEffect cuidará do redirecionamento
    }
    return result;
  };

  const logout = async () => {
    setCurrentUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(LOGGED_IN_USER_KEY);
    }
    // O useEffect cuidará do redirecionamento para /login
  };

  const register = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    const result = registerUser(email, password);
    if (result.success) {
      // Auto-login após registro bem-sucedido
      const loginResult = await login(email, password);
      if (!loginResult.success) {
        // Isso não deveria acontecer se o registro foi bem-sucedido e o login usa a mesma lógica
        return { success: false, message: "Erro ao fazer login após o registro." };
      }
    }
    return result;
  };
  
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, register, isLoading }}>
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
