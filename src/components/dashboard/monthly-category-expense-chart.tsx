
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ChevronLeft, ChevronRight } from "lucide-react";
import { useFinancialData } from "@/hooks/use-financial-data";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { format, getYear, getMonth, subMonths, addMonths, startOfMonth, isSameMonth, isSameYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Gerador de cores para o gráfico
const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(var(--secondary))', // Adicionando mais cores
  'hsl(197, 71%, 73%)', // Exemplo de cor adicional
  'hsl(217, 91%, 60%)', // Exemplo de cor adicional
];

interface MonthlyExpenseData {
  name: string;
  value: number;
  fill: string;
}

export function MonthlyCategoryExpenseChart() {
  const { expenseList } = useFinancialData();
  const [currentDate, setCurrentDate] = useState(startOfMonth(new Date())); // Mês e ano atual, início do mês
  const [chartData, setChartData] = useState<MonthlyExpenseData[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const selectedMonthYear = useMemo(() => {
    if (!isClient) return { month: getMonth(new Date()), year: getYear(new Date()) };
    return { month: getMonth(currentDate), year: getYear(currentDate) };
  }, [currentDate, isClient]);

  useEffect(() => {
    if (!isClient || !expenseList) return;

    const monthlyExpenses = expenseList.filter(expense => {
      const expenseDate = new Date(expense.date);
      return getMonth(expenseDate) === selectedMonthYear.month && getYear(expenseDate) === selectedMonthYear.year;
    });

    const aggregatedExpenses = monthlyExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const formattedChartData = Object.entries(aggregatedExpenses)
      .map(([name, value], index) => ({
        name,
        value,
        fill: COLORS[index % COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);

    setChartData(formattedChartData);
  }, [expenseList, selectedMonthYear, isClient]);

  const handlePreviousMonth = () => {
    setCurrentDate(prevDate => startOfMonth(subMonths(prevDate, 1)));
  };

  const handleNextMonth = () => {
    setCurrentDate(prevDate => startOfMonth(addMonths(prevDate, 1)));
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const chartConfig = useMemo(() => {
    if (!isClient) return {} as ChartConfig;
    const config: ChartConfig = {};
    chartData.forEach(entry => {
      config[entry.name] = {
        label: entry.name,
        color: entry.fill,
      };
    });
    return config;
  }, [chartData, isClient]);

  if (!isClient) {
    return (
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
             <div>
                <CardTitle className="flex items-center gap-2">
                <Activity className="h-6 w-6 text-primary" />
                Despesas por Categoria
                </CardTitle>
                <CardDescription>Distribuição de despesas no mês selecionado.</CardDescription>
             </div>
             <div className="flex items-center gap-2 animate-pulse">
                <Button variant="outline" size="icon" disabled><ChevronLeft className="h-4 w-4" /></Button>
                <div className="h-6 w-32 rounded-md bg-muted"></div>
                <Button variant="outline" size="icon" disabled><ChevronRight className="h-4 w-4" /></Button>
             </div>
          </div>
        </CardHeader>
        <CardContent className="h-[350px] animate-pulse rounded-md bg-muted flex items-center justify-center">
           <Activity className="h-12 w-12 text-muted-foreground/30 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const isCurrentMonthOrFuture = isSameMonth(currentDate, new Date()) && isSameYear(currentDate, new Date()) || currentDate > new Date();


  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              Despesas por Categoria
            </CardTitle>
            <CardDescription>Distribuição de despesas no mês selecionado.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePreviousMonth} aria-label="Mês anterior">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium w-32 text-center tabular-nums">
              {format(currentDate, "MMMM yyyy", { locale: ptBR })}
            </span>
            <Button variant="outline" size="icon" onClick={handleNextMonth} disabled={isCurrentMonthOrFuture} aria-label="Próximo mês">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[350px] flex items-center justify-center">
        {chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="w-full h-full">
            <PieChart accessibilityLayer>
              <Tooltip
                cursor={true}
                content={<ChartTooltipContent 
                            hideLabel 
                            formatter={(value, name) => (
                                <div className="flex flex-col">
                                    <span className="font-semibold">{name}</span>
                                    <span>{formatCurrency(Number(value))}</span>
                                </div>
                            )}
                         />}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={60}
                paddingAngle={2}
                labelLine={false}
              >
                {chartData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.fill} name={entry.name} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="name" />} />
            </PieChart>
          </ChartContainer>
        ) : (
          <p className="text-muted-foreground text-center">
            Nenhuma despesa registrada para {format(currentDate, "MMMM yyyy", { locale: ptBR })}.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

    