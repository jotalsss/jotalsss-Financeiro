"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, AlertTriangle } from "lucide-react";
import { generateFinancialTips, type FinancialTipsInput } from "@/ai/flows/generate-financial-tips";
import { useFinancialData } from "@/hooks/use-financial-data";
import { useToast } from "@/hooks/use-toast";
import type { Expense } from "@/lib/types";

export function AiInsights() {
  const { incomeList, expenseList, goalList, getTotalIncome } = useFinancialData();
  const [insights, setInsights] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const aggregatedExpenses = useMemo(() => {
    if (!isClient) return [];
    return expenseList.reduce((acc, expense) => {
      const existingCategory = acc.find(e => e.category === expense.category);
      if (existingCategory) {
        existingCategory.amount += expense.amount;
      } else {
        acc.push({ category: expense.category, amount: expense.amount });
      }
      return acc;
    }, [] as { category: string; amount: number }[]);
  }, [expenseList, isClient]);

  const financialGoalsString = useMemo(() => {
    if (!isClient) return "";
    return goalList.map(g => `${g.name} (Meta: R$${g.targetAmount.toFixed(2)})`).join(", ") || "Nenhuma meta específica definida ainda.";
  }, [goalList, isClient]);

  const currentTotalIncome = useMemo(() => {
    if (!isClient) return 0;
    return getTotalIncome();
  }, [getTotalIncome, isClient]);


  const handleGenerateInsights = useCallback(async () => {
    if (!isClient) return;

    setIsLoading(true);
    setError(null);
    setInsights(null);

    if (currentTotalIncome === 0 && aggregatedExpenses.length === 0) {
      toast({
        title: "Dados Insuficientes",
        description: "Por favor, adicione algumas receitas e despesas para gerar insights.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const input: FinancialTipsInput = {
      income: currentTotalIncome,
      expenses: aggregatedExpenses,
      financialGoals: financialGoalsString,
    };

    try {
      const result = await generateFinancialTips(input);
      setInsights(result.tips);
      toast({
        title: "Insights Gerados",
        description: "Suas dicas financeiras personalizadas estão prontas!",
      });
    } catch (e) {
      console.error("Erro ao gerar insights:", e);
      setError("Falha ao gerar insights. Por favor, tente novamente.");
      toast({
        title: "Erro",
        description: "Não foi possível gerar os insights. Verifique o console para detalhes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [isClient, currentTotalIncome, aggregatedExpenses, financialGoalsString, toast]);

  if (!isClient) {
    return (
       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Insights Financeiros com IA
          </CardTitle>
          <CardDescription>
            Dicas personalizadas para ajudar você a gerenciar melhor suas finanças.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-24 animate-pulse rounded-md bg-muted"></div>
        </CardContent>
        <CardFooter>
           <Button disabled className="w-full">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Carregando Insights com IA...
          </Button>
        </CardFooter>
      </Card>
    );
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Insights Financeiros com IA
        </CardTitle>
        <CardDescription>
          Receba dicas personalizadas com base em suas receitas, despesas e metas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {insights && (
          <Textarea
            readOnly
            value={insights}
            className="h-40 resize-none bg-muted/50"
            aria-label="Insights financeiros gerados"
          />
        )}
        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        )}
        {!insights && !isLoading && !error && (
          <div className="flex h-40 flex-col items-center justify-center rounded-md border border-dashed bg-muted/30 p-4 text-center">
            <Sparkles className="h-10 w-10 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              Clique no botão abaixo para gerar suas dicas financeiras personalizadas.
            </p>
          </div>
        )}
         {isLoading && !insights && (
           <div className="flex h-40 flex-col items-center justify-center rounded-md border bg-muted/30 p-4 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">
              Gerando seus insights...
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleGenerateInsights}
          disabled={isLoading || !isClient}
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {insights ? "Gerar Novos Insights" : "Gerar Insights"}
        </Button>
      </CardFooter>
    </Card>
  );
}
