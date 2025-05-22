"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Scale } from "lucide-react";
import { useFinancialData } from "@/hooks/use-financial-data";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

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

export function FinancialOverview() {
  const { getTotalIncome, getTotalExpenses } = useFinancialData();
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading and ensure data is ready client-side
    const income = getTotalIncome();
    const expenses = getTotalExpenses();
    setTotalIncome(income);
    setTotalExpenses(expenses);
    setIsLoading(false);
  }, [getTotalIncome, getTotalExpenses]);
  
  const netBalance = totalIncome - totalExpenses;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StatCard
        title="Total Income"
        value={formatCurrency(totalIncome)}
        icon={TrendingUp}
        colorClass="text-green-500"
        isLoading={isLoading}
      />
      <StatCard
        title="Total Expenses"
        value={formatCurrency(totalExpenses)}
        icon={TrendingDown}
        colorClass="text-red-500"
        isLoading={isLoading}
      />
      <StatCard
        title="Net Balance"
        value={formatCurrency(netBalance)}
        icon={Scale}
        colorClass={netBalance >= 0 ? "text-blue-500" : "text-orange-500"}
        isLoading={isLoading}
      />
    </div>
  );
}
