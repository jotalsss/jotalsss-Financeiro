
"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/common/page-header";
import { ExpenseForm, type ExpenseFormValues } from "@/components/expenses/expense-form";
import { ExpenseList } from "@/components/expenses/expense-list";
import { useFinancialData } from "@/hooks/use-financial-data";
import type { Expense } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlusCircle, TrendingDown, Loader2 } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/common/delete-confirmation-dialog";
import { useToast } from "@/hooks/use-toast";
import { addMonths, startOfMonth } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import AppLayout from "@/components/layout/app-layout";
import { useAuth } from "@/contexts/AuthContext";

export default function ExpensesPage() {
  const { expenseList, addExpense, updateExpense, deleteExpense } = useFinancialData();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const { toast } = useToast();
  const { currentUser, isLoading: authIsLoading } = useAuth();
  

  const handleFormSubmit = (data: ExpenseFormValues) => {
    if (editingExpense) {
      const expenseToUpdate: Expense = {
        ...editingExpense,
        description: data.description,
        amount: data.amount,
        category: data.category,
        date: data.date.toISOString(),
      };
      updateExpense(expenseToUpdate);
      toast({ title: "Despesa Atualizada", description: `A despesa "${data.description}" foi atualizada.` });
    } else if (data.isInstallmentPurchase && data.numberOfInstallments && data.numberOfInstallments >= 2) {
      const purchaseId = crypto.randomUUID();
      const installmentAmount = parseFloat((data.amount / data.numberOfInstallments).toFixed(2));
      const firstInstallmentDate = startOfMonth(data.date);

      for (let i = 0; i < data.numberOfInstallments; i++) {
        const installmentDate = addMonths(firstInstallmentDate, i);
        const newInstallment: Omit<Expense, "id"> = {
          description: `${data.description} (Parcela ${i + 1} de ${data.numberOfInstallments})`,
          amount: installmentAmount,
          category: data.category,
          date: installmentDate.toISOString(),
          isInstallment: true,
          totalInstallments: data.numberOfInstallments,
          currentInstallment: i + 1,
          installmentPurchaseId: purchaseId,
        };
        addExpense(newInstallment);
      }
      toast({ title: "Compra Parcelada Adicionada", description: `As ${data.numberOfInstallments} parcelas de "${data.description}" foram adicionadas.` });
    } else {
      addExpense({
        description: data.description,
        amount: data.amount,
        category: data.category,
        date: data.date.toISOString(),
      });
      toast({ title: "Despesa Adicionada", description: `A despesa "${data.description}" foi adicionada.` });
    }
    
    setEditingExpense(null);
    setIsFormVisible(false);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsFormVisible(true);
  };

  const handleDeleteRequest = (expense: Expense) => {
    setExpenseToDelete(expense);
  };

  const confirmDelete = () => {
    if (expenseToDelete) {
      deleteExpense(expenseToDelete.id);
      toast({ title: "Despesa Excluída", description: `A despesa "${expenseToDelete.description}" foi excluída.`, variant: "destructive" });
      setExpenseToDelete(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
    setIsFormVisible(false);
  }

  if (authIsLoading || !currentUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <PageHeader
          title="Despesas"
          description="Registre e categorize todos os seus gastos, incluindo compras parceladas."
          icon={TrendingDown}
          action={
            !isFormVisible && (
              <Button onClick={() => { setIsFormVisible(true); setEditingExpense(null); }}>
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Despesa
              </Button>
            )
          }
        />

        {(isFormVisible || editingExpense) && (
          <ExpenseForm
            onSubmit={handleFormSubmit}
            initialData={editingExpense}
            onCancel={handleCancelEdit}
          />
        )}

        <ExpenseList
          expenseList={expenseList.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
          onEdit={handleEdit}
          onDelete={(id) => {
            const expenseItem = expenseList.find(e => e.id === id);
            if (expenseItem) handleDeleteRequest(expenseItem);
          }}
        />

        {expenseToDelete && (
          <DeleteConfirmationDialog
            open={!!expenseToDelete}
            onOpenChange={() => setExpenseToDelete(null)}
            onConfirm={confirmDelete}
            itemName={`a despesa "${expenseToDelete.description}"`}
          />
        )}
      </div>
    </AppLayout>
  );
}
