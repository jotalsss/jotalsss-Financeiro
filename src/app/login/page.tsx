
"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, currentUser, isLoading: authIsLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authIsLoading && currentUser) {
      router.push('/'); // Redireciona se já estiver logado
    }
  }, [currentUser, authIsLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (username.trim()) {
      // Simula um pequeno delay para o login
      await new Promise(resolve => setTimeout(resolve, 500));
      login(username.trim());
      // O redirecionamento é tratado pelo AuthProvider
    } else {
      toast({
        title: "Erro de Login",
        description: "Por favor, insira um nome de usuário.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };
  
  // Se ainda está carregando o estado de autenticação ou se já está logado, não mostra o form.
  // O AuthProvider já mostra um LoadingScreen se authChecked for false.
  // Este useEffect lida com o caso de já estar logado.
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
          <CardDescription className="text-base">Entre com seu nome de usuário para organizar suas finanças.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Nome de Usuário</Label>
              <Input
                id="username"
                type="text"
                placeholder="ex: joaosilva"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
               <p className="text-xs text-muted-foreground pt-1">Nota: Para este protótipo, qualquer senha é válida.</p>
            </div>
            <Button type="submit" className="w-full text-lg py-6" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Entrar"}
            </Button>
          </form>
        </CardContent>
         <CardFooter className="flex-col items-center text-center text-xs text-muted-foreground pt-6">
            <p>© {new Date().getFullYear()} RealWise</p>
            <p className="mt-1">Simples e direto ao ponto para suas finanças.</p>
         </CardFooter>
      </Card>
    </div>
  );
}
