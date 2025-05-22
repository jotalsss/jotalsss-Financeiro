
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Loader2 } from "lucide-react"; // Removido Coins
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState(""); // Mudou de username para email
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { register, currentUser, isLoading: authIsLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authIsLoading && currentUser) {
      router.push('/'); 
    }
  }, [currentUser, authIsLoading, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      toast({
        title: "Campos Obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Erro de Senha",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    
    // Validação de força da senha do Firebase é feita no backend (mínimo 6 caracteres)
    // if (password.length < 6) { 
    //   toast({ title: "Senha Fraca", description: "A senha deve ter pelo menos 6 caracteres.", variant: "destructive"}); 
    //   setIsSubmitting(false);
    //   return; 
    // }

    const result = await register(email.trim(), password);

    if (result.success) {
      toast({
        title: "Registro Bem-Sucedido!",
        description: `Bem-vindo(a)! Sua conta foi criada.`,
      });
      // O AuthContext (onAuthStateChanged) deve redirecionar automaticamente após o registro bem-sucedido
    } else {
      toast({
        title: "Erro no Registro",
        description: result.message || "Não foi possível criar a conta.",
        variant: "destructive",
      });
    }
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
          <UserPlus className="h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-3xl font-bold">Criar Nova Conta</CardTitle>
          <CardDescription className="text-base">Junte-se ao RealWise para organizar suas finanças.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@exemplo.com"
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
                placeholder="Crie uma senha (mín. 6 caracteres)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirme sua senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              Ao se registrar, você concorda com nossos Termos de Serviço e Política de Privacidade (links de exemplo).
            </p>
            <Button type="submit" className="w-full text-lg py-6" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Criar Conta"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col items-center text-center text-xs text-muted-foreground pt-6 space-y-2">
          <p>
            Já tem uma conta?{" "}
            <Button variant="link" asChild className="p-0 h-auto">
              <Link href="/login">Faça Login</Link>
            </Button>
          </p>
          <p>© {new Date().getFullYear()} RealWise</p>
        </CardFooter>
      </Card>
    </div>
  );
}
