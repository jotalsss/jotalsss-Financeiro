"use client";

import { PageHeader } from "@/components/common/page-header";
import { FinancialOverview } from "@/components/dashboard/financial-overview";
import { AiInsights } from "@/components/dashboard/ai-insights";
import { GoalsSummary } from "@/components/dashboard/goals-summary";
import { LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Welcome to RealWise! Here's your financial snapshot."
        icon={LayoutDashboard}
      />

      <section aria-labelledby="financial-overview-heading">
        <h2 id="financial-overview-heading" className="sr-only">Financial Overview</h2>
        <FinancialOverview />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section aria-labelledby="ai-insights-heading">
          <h2 id="ai-insights-heading" className="sr-only">AI Financial Insights</h2>
          <AiInsights />
        </section>
        <section aria-labelledby="goals-summary-heading">
          <h2 id="goals-summary-heading" className="sr-only">Goals Summary</h2>
          <GoalsSummary />
        </section>
      </div>
    </div>
  );
}
