"use client";

import type { Income } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Edit2, Trash2, DollarSign, CalendarDays, Info } from "lucide-react";

interface IncomeListProps {
  incomeList: Income[];
  onEdit: (income: Income) => void;
  onDelete: (id: string) => void;
}

export function IncomeList({ incomeList, onEdit, onDelete }: IncomeListProps) {
  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  if (incomeList.length === 0) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Income Entries</CardTitle>
          <CardDescription>All your recorded income will appear here.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-md border border-dashed bg-muted/30 p-10 text-center">
            <Info className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium text-muted-foreground">
              No income added yet.
            </p>
            <p className="text-sm text-muted-foreground">
              Start by adding your first income entry using the form above.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Income Entries</CardTitle>
        <CardDescription>A list of your recorded income.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                  <TableCell className="flex items-center">
                    <CalendarDays className="h-4 w-4 mr-2 text-blue-500 opacity-70" />
                    {formatDate(income.date)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(income)} aria-label="Edit income">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(income.id)} aria-label="Delete income" className="text-destructive hover:text-destructive/80">
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
