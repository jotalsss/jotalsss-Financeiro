
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Scale } from "lucide-react";
import { useFinancialData } from "@/hooks/use-financial-data";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState, useMemo } from "react";

const StatCard = ({ title, value, icon: Icon, colorClass, isLoading }: { title: string; value: string; icon: React.ElementType; colorClass: string; isLoading?: boolean }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className={`h-5 w-5 ${colorClass}`} />
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Skeleton className="h-8 w-3/4" />
      ) : (
        <div className="text-2xl font-bold">{value}</div>
      )}
    </CardContent>
  </Card>
);

interface FinancialOverviewProps {
  selectedMonth?: number;
  selectedYear?: number;
  isLoading?: boolean; 
}

export function FinancialOverview({ selectedMonth, selectedYear, isLoading: pageIsLoading }: FinancialOverviewProps) {
  const { getTotalIncome, getTotalExpenses } = useFinancialData();
  const [isClient, setIsClient] = useState(false);

  const financialData = useMemo(() => {
    if (!isClient) return { totalIncome: 0, totalExpenses: 0, isLoadingInternal: true };
    
    const filter = (typeof selectedMonth === 'number' && typeof selectedYear === 'number')
      ? { month: selectedMonth, year: selectedYear }
      : undefined; // Se não houver filtro, calcula o total geral (ou poderia ser um erro/estado vazio)

    const income = getTotalIncome(filter);
    const expenses = getTotalExpenses(filter);
    return { totalIncome: income, totalExpenses: expenses, isLoadingInternal: false };
  }, [isClient, selectedMonth, selectedYear, getTotalIncome, getTotalExpenses]);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const { totalIncome, totalExpenses, isLoadingInternal } = financialData;
  const finalIsLoading = pageIsLoading || !isClient || isLoadingInternal;

  const netBalance = totalIncome - totalExpenses;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StatCard
        title="Receitas do Mês"
        value={formatCurrency(totalIncome)}
        icon={TrendingUp}
        colorClass="text-green-500"
        isLoading={finalIsLoading}
      />
      <StatCard
        title="Despesas do Mês"
        value={formatCurrency(totalExpenses)}
        icon={TrendingDown}
        colorClass="text-red-500"
        isLoading={finalIsLoading}
      />
      <StatCard
        title="Saldo do Mês"
        value={formatCurrency(netBalance)}
        icon={Scale}
        colorClass={netBalance >= 0 ? "text-blue-500" : "text-orange-500"}
        isLoading={finalIsLoading}
      />
    </div>
  );
}
