
"use client";

import { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/common/page-header";
import { FinancialOverview } from "@/components/dashboard/financial-overview";
import { GoalsSummary } from "@/components/dashboard/goals-summary";
import { LayoutDashboard, Loader2 } from "lucide-react";
import { MonthlyCategoryExpenseChart as MonthlyExpensesDetailChart } from "@/components/dashboard/monthly-category-expense-chart"; // Mantido o nome do arquivo para evitar renomeação em cascata, mas o componente foi alterado
import { MonthNavigator } from "@/components/common/month-navigator";
import { startOfMonth, subMonths, addMonths, getMonth, getYear } from "date-fns";
import AppLayout from "@/components/layout/app-layout";
import { useAuth } from "@/contexts/AuthContext";
import { useFinancialData } from "@/hooks/use-financial-data"; // Importar para isLoadingData
import { Skeleton } from "@/components/ui/skeleton";


export default function DashboardPage() {
  const [currentDate, setCurrentDate] = useState(startOfMonth(new Date()));
  const { currentUser, isLoading: authIsLoading } = useAuth();
  const { isLoadingData: financialDataIsLoading } = useFinancialData(); // Obter estado de carregamento dos dados financeiros

  const isLoading = authIsLoading || financialDataIsLoading;

  const handlePreviousMonth = () => {
    setCurrentDate(prevDate => startOfMonth(subMonths(prevDate, 1)));
  };

  const handleNextMonth = () => {
    setCurrentDate(prevDate => startOfMonth(addMonths(prevDate, 1)));
  };

  const selectedMonthYear = useMemo(() => {
    return { month: getMonth(currentDate), year: getYear(currentDate) };
  }, [currentDate]);

  if (authIsLoading || !currentUser) { // Verificação inicial de autenticação
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  const userDisplayName = currentUser?.email || "Usuário";

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          title="Painel"
          description={`Bem-vindo(a), ${userDisplayName}! Aqui está seu resumo financeiro.`}
          icon={LayoutDashboard}
        />

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 mb-6">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-10 w-10" />
          </div>
        ) : (
          <MonthNavigator
            currentDate={currentDate}
            onPreviousMonth={handlePreviousMonth}
            onNextMonth={handleNextMonth}
          />
        )}
        

        <section aria-labelledby="financial-overview-heading">
          <h2 id="financial-overview-heading" className="sr-only">Visão Geral Financeira</h2>
          <FinancialOverview 
            selectedMonth={selectedMonthYear.month} 
            selectedYear={selectedMonthYear.year} 
            isLoading={isLoading} // Passar o estado de carregamento combinado
          />
        </section>

        <section aria-labelledby="monthly-expenses-heading" className="my-8">
          <h2 id="monthly-expenses-heading" className="sr-only">Despesas Detalhadas do Mês</h2>
          <MonthlyExpensesDetailChart currentDate={currentDate} isLoading={isLoading} />
        </section>

        <div className="grid grid-cols-1 gap-6">
          <section aria-labelledby="goals-summary-heading">
            <h2 id="goals-summary-heading" className="sr-only">Resumo de Metas</h2>
            <GoalsSummary isLoading={isLoading} />
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
