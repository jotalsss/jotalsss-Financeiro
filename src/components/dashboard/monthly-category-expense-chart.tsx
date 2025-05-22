
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { useFinancialData } from "@/hooks/use-financial-data";
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { format, getYear, getMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MonthlyExpenseData {
  name: string; 
  value: number; 
}

interface MonthlyExpensesDetailChartProps {
  currentDate: Date; 
}

export function MonthlyCategoryExpenseChart({ currentDate }: MonthlyExpensesDetailChartProps) { 
  const { expenseList } = useFinancialData();
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

    const formattedChartData = monthlyExpenses
      .map(expense => ({
        name: expense.description,
        value: expense.amount,
      }))
      .sort((a, b) => a.value - b.value); 

    setChartData(formattedChartData);
  }, [expenseList, selectedMonthYear, isClient]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const chartConfig = useMemo(() => {
    if (!isClient) return {} as ChartConfig;
    return {
      value: {
        label: "Valor da Despesa",
        color: "hsl(var(--primary))",
      },
    } satisfies ChartConfig;
  }, [isClient]);

  const monthYearDisplay = format(currentDate, "MMMM yyyy", { locale: ptBR });

  if (!isClient) {
    return (
      <Card>
        <CardHeader>
             <div>
                <CardTitle className="flex items-center gap-2">
                <Activity className="h-6 w-6 text-primary" />
                Despesas Detalhadas do Mês
                </CardTitle>
                <CardDescription>Carregando detalhes das suas despesas para {monthYearDisplay}.</CardDescription>
             </div>
        </CardHeader>
        <CardContent className="h-[450px] animate-pulse rounded-md bg-muted flex items-center justify-center">
           <Activity className="h-12 w-12 text-muted-foreground/30 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const yAxisTickFormatter = (value: string) => {
    if (value.length > 20) { 
      return `${value.substring(0, 20)}...`;
    }
    return value;
  };

  return (
    <Card>
      <CardHeader>
        <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              Despesas Detalhadas de {monthYearDisplay}
            </CardTitle>
            <CardDescription>Lista de todas as despesas registradas para este mês.</CardDescription>
          </div>
      </CardHeader>
      <CardContent className="h-[450px] flex items-center justify-center pr-4">
        {chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="w-full h-full">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 5, right: 10, left: 10, bottom: 5 }} 
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false}/>
              <XAxis type="number" tickFormatter={formatCurrency} stroke="hsl(var(--muted-foreground))" />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={180} 
                interval={0} 
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} 
                tickFormatter={yAxisTickFormatter}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                content={<ChartTooltipContent 
                            formatter={(value, name, props) => (
                                <div className="flex flex-col">
                                    <span className="font-semibold">{props.payload.name}</span>
                                    <span>{formatCurrency(Number(value))}</span>
                                </div>
                            )}
                         />}
              />
              <Bar dataKey="value" name="Valor" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={15} />
            </BarChart>
          </ChartContainer>
        ) : (
          <p className="text-muted-foreground text-center">
            Nenhuma despesa registrada para {monthYearDisplay}.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
