
"use client";

import type { Income } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Edit2, Trash2, DollarSign, CalendarDays, Info } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface IncomeListProps {
  incomeList: Income[];
  onEdit: (income: Income) => void;
  onDelete: (id: string) => void;
}

export function IncomeList({ incomeList, onEdit, onDelete }: IncomeListProps) {
  const formatCurrency = (amount: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount);
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
     // Adiciona o fuso horário para evitar problemas de "off-by-one" dia
    const adjustedDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    return format(adjustedDate, "MMMM yyyy", { locale: ptBR });
  }

  if (incomeList.length === 0) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Lançamentos de Receitas</CardTitle>
          <CardDescription>Todas as suas receitas registradas aparecerão aqui.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-md border border-dashed bg-muted/30 p-10 text-center">
            <Info className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium text-muted-foreground">
              Nenhuma receita adicionada ainda.
            </p>
            <p className="text-sm text-muted-foreground">
              Comece adicionando seu primeiro lançamento de receita usando o formulário acima.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Lançamentos de Receitas</CardTitle>
        <CardDescription>Uma lista das suas receitas registradas.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Origem</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Mês/Ano</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incomeList.map((income) => (
                <TableRow key={income.id}>
                  <TableCell className="font-medium flex items-center">
                     <DollarSign className="h-4 w-4 mr-2 text-green-500 opacity-70" />
                    {income.source}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(income.amount)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <CalendarDays className="h-4 w-4 mr-2 text-blue-500 opacity-70" />
                      {formatDate(income.date)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(income)} aria-label="Editar receita">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(income.id)} aria-label="Excluir receita" className="text-destructive hover:text-destructive/80">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
