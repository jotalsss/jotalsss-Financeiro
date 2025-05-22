
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { auth } from '@/lib/firebase'; // Importar auth do Firebase
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  type User 
} from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  currentUser: User | null; // Agora é o objeto User do Firebase
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Combina initialLoading e authChecked
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const publicPaths = ['/login', '/register'];
      const isPublicPath = publicPaths.includes(pathname);

      if (currentUser && isPublicPath) {
        router.push('/');
      } else if (!currentUser && !isPublicPath) {
        // Evitar redirecionamento para rotas internas do Next.js ou API
        if (!pathname.startsWith('/api/') && !pathname.startsWith('/_next/')) {
          router.push('/login');
        }
      }
    }
  }, [currentUser, pathname, router, isLoading]);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error: any) {
      console.error("Erro de login:", error);
      let message = "Falha no login. Verifique suas credenciais.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = "E-mail ou senha inválidos.";
      } else if (error.code === 'auth/invalid-email') {
        message = "Formato de e-mail inválido.";
      }
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // O useEffect cuidará do redirecionamento
    } catch (error) {
      console.error("Erro ao sair:", error);
      toast({ title: "Erro ao Sair", description: "Não foi possível fazer logout.", variant: "destructive" });
    }
  };

  const register = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // O onAuthStateChanged irá atualizar currentUser e o useEffect cuidará do redirecionamento
      return { success: true };
    } catch (error: any) {
      console.error("Erro de registro:", error);
      let message = "Falha no registro.";
      if (error.code === 'auth/email-already-in-use') {
        message = "Este e-mail já está em uso.";
      } else if (error.code === 'auth/invalid-email') {
        message = "Formato de e-mail inválido.";
      } else if (error.code === 'auth/weak-password') {
        message = "A senha é muito fraca. Use pelo menos 6 caracteres.";
      }
      return { success: false, message };
    }
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
