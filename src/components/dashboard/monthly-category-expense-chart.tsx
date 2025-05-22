
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Loader2 } from "lucide-react"; // Adicionado Loader2
import { useFinancialData } from "@/hooks/use-financial-data";
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, getYear, getMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from "@/components/ui/skeleton";


interface MonthlyExpenseData {
  name: string; 
  value: number; 
}

interface MonthlyExpensesDetailChartProps {
  currentDate: Date; 
  isLoading?: boolean; // Recebe o estado de carregamento da página pai
}

export function MonthlyCategoryExpenseChart({ currentDate, isLoading: pageIsLoading }: MonthlyExpensesDetailChartProps) { 
  // isLoadingData do hook é específico para o carregamento dos dados financeiros.
  // pageIsLoading é o estado combinado (auth + financial) da página pai.
  const { expenseList, isLoadingData: financialHookLoading } = useFinancialData();
  const [chartData, setChartData] = useState<MonthlyExpenseData[]>([]);
  // const [isClient, setIsClient] = useState(false); // Não mais necessário aqui

  // useEffect(() => {
  //   setIsClient(true);
  // }, []);

  const selectedMonthYear = useMemo(() => {
    // if (!isClient) return { month: getMonth(new Date()), year: getYear(new Date()) }; // Comentado
    return { month: getMonth(currentDate), year: getYear(currentDate) };
  }, [currentDate]);

  useEffect(() => {
    // Se os dados do hook ainda estão carregando ou não há lista de despesas, não faz nada
    if (financialHookLoading || !expenseList) {
      setChartData([]); // Garante que os dados do gráfico sejam limpos se as despesas estiverem carregando
      return;
    }

    const monthlyExpenses = expenseList.filter(expense => {
      const expenseDate = new Date(expense.date); // A data no estado é ISO string
      return getMonth(expenseDate) === selectedMonthYear.month && getYear(expenseDate) === selectedMonthYear.year;
    });

    const formattedChartData = monthlyExpenses
      .map(expense => ({
        name: expense.description,
        value: expense.amount,
      }))
      .sort((a, b) => a.value - b.value); 

    setChartData(formattedChartData);
  }, [expenseList, selectedMonthYear, financialHookLoading]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const chartConfig = useMemo(() => {
    // if (!isClient) return {} as ChartConfig; // Comentado
    return {
      value: {
        label: "Valor da Despesa",
        color: "hsl(var(--primary))",
      },
    } satisfies ChartConfig;
  }, []); // Removido isClient das dependências

  const monthYearDisplay = format(currentDate, "MMMM yyyy", { locale: ptBR });

  if (pageIsLoading) { // Usar o isLoading combinado da página
    return (
      <Card>
        <CardHeader>
             <div>
                <Skeleton className="h-7 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
             </div>
        </CardHeader>
        <CardContent className="h-[450px] flex items-center justify-center">
           {/* <Activity className="h-12 w-12 text-muted-foreground/30 animate-spin" /> */}
           <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const yAxisTickFormatter = (value: string) => {
    if (value.length > 25) { // Aumentado um pouco o limite
      return `${value.substring(0, 25)}...`;
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
      <CardContent className="h-[450px] flex items-center justify-center pr-0 md:pr-4"> {/* Ajustado padding para mobile */}
        {chartData.length > 0 ? (
          // ChartContainer já tem ResponsiveContainer embutido, não precisa duplicar
          <ChartContainer config={chartConfig} className="w-full h-full">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 5, right: 10, left: 10, bottom: 5 }} 
              barCategoryGap={chartData.length < 5 ? "40%" : "20%"} // Ajusta o espaçamento da barra
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false}/>
              <XAxis type="number" tickFormatter={formatCurrency} stroke="hsl(var(--muted-foreground))" axisLine={false} tickLine={false} />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={150} // Reduzido um pouco para dar mais espaço ao gráfico
                interval={0} 
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} 
                tickFormatter={yAxisTickFormatter}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                content={<ChartTooltipContent 
                            formatter={(value, name, props) => ( // name aqui é 'value'
                                <div className="flex flex-col p-1">
                                    <span className="font-semibold text-sm">{props.payload.name}</span>
                                    <span className="text-xs">{formatCurrency(Number(value))}</span>
                                </div>
                            )}
                         />}
              />
              <Bar dataKey="value" name="Valor" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={chartData.length < 10 ? 20 : 15} />
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
