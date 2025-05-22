
"use client";

import type { Expense, ExpenseCategory } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Edit2, Trash2, CalendarDays, Info } from "lucide-react";
import { expenseCategoryIcons } from "./expense-categories";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ExpenseListProps {
  expenseList: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export function ExpenseList({ expenseList, onEdit, onDelete }: ExpenseListProps) {
  const formatCurrency = (amount: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount);
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // Adiciona o fuso horário para evitar problemas de "off-by-one" dia
    const adjustedDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    return format(adjustedDate, "MMMM yyyy", { locale: ptBR });
  }

  if (expenseList.length === 0) {
     return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Lançamentos de Despesas</CardTitle>
          <CardDescription>Todas as suas despesas registradas aparecerão aqui.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-md border border-dashed bg-muted/30 p-10 text-center">
            <Info className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium text-muted-foreground">
              Nenhuma despesa adicionada ainda.
            </p>
            <p className="text-sm text-muted-foreground">
              Comece adicionando seu primeiro lançamento de despesa usando o formulário acima.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Lançamentos de Despesas</CardTitle>
        <CardDescription>Uma lista das suas despesas registradas.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Mês/Ano</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenseList.map((expense) => {
                const CategoryIcon = expenseCategoryIcons[expense.category as ExpenseCategory] || Info;
                return (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.description}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                        {expense.category}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <CalendarDays className="h-4 w-4 mr-2 text-blue-500 opacity-70" />
                        {formatDate(expense.date)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(expense)} aria-label="Editar despesa">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(expense.id)} aria-label="Excluir despesa" className="text-destructive hover:text-destructive/80">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
