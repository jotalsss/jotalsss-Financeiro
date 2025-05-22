
"use client";

import { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/common/page-header";
import { FinancialOverview } from "@/components/dashboard/financial-overview";
import { GoalsSummary } from "@/components/dashboard/goals-summary";
import { LayoutDashboard, Activity, Loader2 } from "lucide-react";
import { MonthlyCategoryExpenseChart as MonthlyExpensesDetailChart } from "@/components/dashboard/monthly-category-expense-chart";
import { MonthNavigator } from "@/components/common/month-navigator";
import { startOfMonth, subMonths, addMonths, getMonth, getYear } from "date-fns";
// Removido Skeleton pois não é usado diretamente aqui, os componentes filhos têm seus skeletons
import AppLayout from "@/components/layout/app-layout";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const [currentDate, setCurrentDate] = useState(startOfMonth(new Date()));
  const { currentUser, isLoading: authIsLoading } = useAuth();

  const handlePreviousMonth = () => {
    setCurrentDate(prevDate => startOfMonth(subMonths(prevDate, 1)));
  };

  const handleNextMonth = () => {
    setCurrentDate(prevDate => startOfMonth(addMonths(prevDate, 1)));
  };

  const selectedMonthYear = useMemo(() => {
    return { month: getMonth(currentDate), year: getYear(currentDate) };
  }, [currentDate]);

  if (authIsLoading || !currentUser) {
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

        <MonthNavigator
          currentDate={currentDate}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
        />

        <section aria-labelledby="financial-overview-heading">
          <h2 id="financial-overview-heading" className="sr-only">Visão Geral Financeira</h2>
          <FinancialOverview selectedMonth={selectedMonthYear.month} selectedYear={selectedMonthYear.year} />
        </section>

        <section aria-labelledby="monthly-expenses-heading" className="my-8">
          <h2 id="monthly-expenses-heading" className="sr-only">Despesas Detalhadas do Mês</h2>
          <MonthlyExpensesDetailChart currentDate={currentDate} />
        </section>

        <div className="grid grid-cols-1 gap-6">
          <section aria-labelledby="goals-summary-heading">
            <h2 id="goals-summary-heading" className="sr-only">Resumo de Metas</h2>
            <GoalsSummary />
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
