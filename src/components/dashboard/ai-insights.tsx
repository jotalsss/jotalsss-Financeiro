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
    return goalList.map(g => `${g.name} (Target: $${g.targetAmount.toFixed(2)})`).join(", ") || "No specific goals set yet.";
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
        title: "Not Enough Data",
        description: "Please add some income and expenses to generate insights.",
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
        title: "Insights Generated",
        description: "Personalized financial tips are ready!",
      });
    } catch (e) {
      console.error("Error generating insights:", e);
      setError("Failed to generate insights. Please try again.");
      toast({
        title: "Error",
        description: "Could not generate insights. Check console for details.",
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
            AI Financial Insights
          </CardTitle>
          <CardDescription>
            Personalized tips to help you manage your finances better.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-24 animate-pulse rounded-md bg-muted"></div>
        </CardContent>
        <CardFooter>
           <Button disabled className="w-full">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading AI Insights...
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
          AI Financial Insights
        </CardTitle>
        <CardDescription>
          Get personalized tips based on your income, expenses, and goals.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {insights && (
          <Textarea
            readOnly
            value={insights}
            className="h-40 resize-none bg-muted/50"
            aria-label="Generated financial insights"
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
              Click the button below to generate your personalized financial tips.
            </p>
          </div>
        )}
         {isLoading && !insights && (
           <div className="flex h-40 flex-col items-center justify-center rounded-md border bg-muted/30 p-4 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">
              Generating your insights...
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
          {insights ? "Regenerate Insights" : "Generate Insights"}
        </Button>
      </CardFooter>
    </Card>
  );
}
