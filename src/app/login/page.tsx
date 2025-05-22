
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, currentUser, isLoading: authIsLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authIsLoading && currentUser) {
      router.push('/');
    }
  }, [currentUser, authIsLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!email.trim() || !password.trim()) {
      toast({
        title: "Campos Obrigatórios",
        description: "Por favor, insira o e-mail e a senha.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const result = await login(email.trim(), password);
    
    if (!result.success) {
      toast({
        title: "Erro de Login",
        description: result.message || "Não foi possível fazer login. Verifique suas credenciais.",
        variant: "destructive",
      });
    }
    // O redirecionamento em caso de sucesso é tratado pelo AuthProvider/useEffect
    setIsSubmitting(false);
  };
  
  if (authIsLoading || (!authIsLoading && currentUser)) {
    return (
      <div className="flex h-screen items-center justify-center bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="items-center text-center">
           <Coins className="h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold">Bem-vindo ao RealWise!</CardTitle>
          <CardDescription className="text-base">Entre com seu e-mail e senha.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email" 
                placeholder="ex: joao.silva@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <Button type="submit" className="w-full text-lg py-6" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Entrar"}
            </Button>
          </form>
        </CardContent>
         <CardFooter className="flex-col items-center text-center text-xs text-muted-foreground pt-6 space-y-2">
            <p>
              Não tem uma conta?{" "}
              <Button variant="link" asChild className="p-0 h-auto">
                <Link href="/register">Registre-se</Link>
              </Button>
            </p>
             <p className="text-red-500 mt-2 text-xs">
              Atenção: Este é um sistema de protótipo. <br/>As senhas são armazenadas de forma insegura (apenas codificadas). <br/>Não use senhas reais ou importantes.
            </p>
            <p>© {new Date().getFullYear()} RealWise</p>
            <p className="mt-1">Simples e direto ao ponto para suas finanças.</p>
         </CardFooter>
      </Card>
    </div>
  );
}
