
"use client";

import { PageHeader } from "@/components/common/page-header";
import { FinancialOverview } from "@/components/dashboard/financial-overview";
import { AiInsights } from "@/components/dashboard/ai-insights";
import { GoalsSummary } from "@/components/dashboard/goals-summary";
import { LayoutDashboard } from "lucide-react";
import { MonthlyCategoryExpenseChart } from "@/components/dashboard/monthly-category-expense-chart";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Painel"
        description="Bem-vindo(a) ao RealWise! Aqui está seu resumo financeiro."
        icon={LayoutDashboard}
      />

      <section aria-labelledby="financial-overview-heading">
        <h2 id="financial-overview-heading" className="sr-only">Visão Geral Financeira</h2>
        <FinancialOverview />
      </section>

      <section aria-labelledby="monthly-expenses-heading" className="my-8">
        <h2 id="monthly-expenses-heading" className="sr-only">Despesas Mensais por Categoria</h2>
        <MonthlyCategoryExpenseChart />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section aria-labelledby="ai-insights-heading">
          <h2 id="ai-insights-heading" className="sr-only">Insights Financeiros com IA</h2>
          <AiInsights />
        </section>
        <section aria-labelledby="goals-summary-heading">
          <h2 id="goals-summary-heading" className="sr-only">Resumo de Metas</h2>
          <GoalsSummary />
        </section>
      </div>
    </div>
  );
}

    