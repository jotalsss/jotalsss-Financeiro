
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Scale, type LucideIcon } from "lucide-react";
import { useFinancialData } from "@/hooks/use-financial-data";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";

const StatCard = ({ title, value, icon: IconComponent, colorClass, isLoading }: { title: string; value: string; icon: LucideIcon; colorClass: string; isLoading?: boolean }) => (
  <motion.div
    whileHover={{ scale: 1.03, y: -2 }}
    transition={{ type: "spring", stiffness: 300, damping: 15 }}
  >
    <Card className="transition-shadow duration-200 ease-in-out hover:shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {isLoading ? <Skeleton className="h-5 w-5 rounded-full" /> : (IconComponent && <IconComponent className={`h-5 w-5 ${colorClass}`} />)}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-3/4" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

interface FinancialOverviewProps {
  selectedMonth?: number;
  selectedYear?: number;
  isLoading?: boolean; 
}

export function FinancialOverview({ selectedMonth, selectedYear, isLoading: pageIsLoading }: FinancialOverviewProps) {
  // O isLoadingData do useFinancialData já considera o carregamento do Firestore.
  // O pageIsLoading é passado da página pai, que combina authIsLoading e financialDataIsLoading.
  const { getTotalIncome, getTotalExpenses, isLoadingData: financialHookLoading } = useFinancialData();
  
  // O useEffect com setIsClient não é mais necessário aqui, pois isLoading é gerenciado de forma mais central.
  // const [isClient, setIsClient] = useState(false);
  // useEffect(() => {
  //   setIsClient(true);
  // }, []);

  const financialData = useMemo(() => {
    // Se a página estiver carregando (auth ou dados), ou se os dados do hook ainda não chegaram,
    // ou se mês/ano não estão definidos, consideramos como carregando.
    if (pageIsLoading || financialHookLoading || typeof selectedMonth !== 'number' || typeof selectedYear !== 'number') {
      return { totalIncome: 0, totalExpenses: 0, isLoadingInternal: true };
    }
    
    const filter = { month: selectedMonth, year: selectedYear };
    const income = getTotalIncome(filter);
    const expenses = getTotalExpenses(filter);
    return { totalIncome: income, totalExpenses: expenses, isLoadingInternal: false };
  }, [pageIsLoading, financialHookLoading, selectedMonth, selectedYear, getTotalIncome, getTotalExpenses]);
  
  const { totalIncome, totalExpenses, isLoadingInternal } = financialData;
  const finalIsLoading = pageIsLoading || isLoadingInternal; // Combina o carregamento da página com o cálculo interno

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
