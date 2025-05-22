
"use client";

import { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/common/page-header";
import { FinancialOverview } from "@/components/dashboard/financial-overview";
import { AiInsights } from "@/components/dashboard/ai-insights";
import { GoalsSummary } from "@/components/dashboard/goals-summary";
import { LayoutDashboard, Activity } from "lucide-react";
import { MonthlyCategoryExpenseChart as MonthlyExpensesDetailChart } from "@/components/dashboard/monthly-category-expense-chart";
import { MonthNavigator } from "@/components/common/month-navigator";
import { startOfMonth, subMonths, addMonths, getMonth, getYear } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const [currentDate, setCurrentDate] = useState(startOfMonth(new Date()));
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handlePreviousMonth = () => {
    setCurrentDate(prevDate => startOfMonth(subMonths(prevDate, 1)));
  };

  const handleNextMonth = () => {
    setCurrentDate(prevDate => startOfMonth(addMonths(prevDate, 1)));
  };

  const selectedMonthYear = useMemo(() => {
    return { month: getMonth(currentDate), year: getYear(currentDate) };
  }, [currentDate]);

  if (!isClient) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Painel"
          description="Bem-vindo(a) ao RealWise! Aqui está seu resumo financeiro."
          icon={LayoutDashboard}
        />
        <div className="flex items-center justify-center gap-2 mb-6 animate-pulse">
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-6 w-36 rounded-md" />
            <Skeleton className="h-10 w-10 rounded-md" />
        </div>
        <FinancialOverview isLoading={true} />
        <div className="my-8">
            <Skeleton className="h-10 w-1/2 mb-2" />
            <Skeleton className="h-6 w-3/4 mb-4" />
            <Skeleton className="h-[450px] rounded-md flex items-center justify-center">
                <Activity className="h-12 w-12 text-muted-foreground/30 animate-spin" />
            </Skeleton>
        </div>
         <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-72 rounded-md" />
          <Skeleton className="h-72 rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Painel"
        description="Bem-vindo(a) ao RealWise! Aqui está seu resumo financeiro."
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section aria-labelledby="ai-insights-heading">
          <h2 id="ai-insights-heading" className="sr-only">Insights Financeiros com IA</h2>
          <AiInsights selectedMonth={selectedMonthYear.month} selectedYear={selectedMonthYear.year} />
        </section>
        <section aria-labelledby="goals-summary-heading">
          <h2 id="goals-summary-heading" className="sr-only">Resumo de Metas</h2>
          {/* GoalsSummary não será filtrado por mês por enquanto, mas poderia ser uma melhoria futura */}
          <GoalsSummary />
        </section>
      </div>
    </div>
  );
}
