
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
// addMonths e startOfMonth já estão no useFinancialData, não precisa aqui diretamente
// import { addMonths, startOfMonth } from "date-fns"; 
import { Skeleton } from "@/components/ui/skeleton";
import AppLayout from "@/components/layout/app-layout";
import { useAuth } from "@/contexts/AuthContext";

export default function ExpensesPage() {
  const { 
    expenseList, 
    addExpense, 
    updateExpense, 
    deleteExpense, 
    isLoadingData: financialDataIsLoading 
  } = useFinancialData();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const { toast } = useToast(); // toast já é importado pelo useFinancialData
  const { currentUser, isLoading: authIsLoading } = useAuth();
  
  const isLoading = authIsLoading || financialDataIsLoading;

  const handleFormSubmit = (data: ExpenseFormValues) => {
    if (editingExpense) {
      const expenseToUpdate: Expense = {
        ...editingExpense, // Mantém o id e outras propriedades como isInstallment, etc.
        description: data.description,
        amount: data.amount,
        category: data.category,
        date: data.date.toISOString(), // data do formulário é um objeto Date
      };
      updateExpense(expenseToUpdate);
      // toast é tratado dentro do updateExpense
    } else {
      // A lógica de parcelamento e despesa única agora está dentro do addExpense no hook
      addExpense(data); 
      // toast é tratado dentro do addExpense
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
      deleteExpense(expenseToDelete.id, expenseToDelete.description);
      // toast é tratado dentro do deleteExpense
      setExpenseToDelete(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
    setIsFormVisible(false);
  }

  if (authIsLoading || !currentUser) { // Ainda precisamos disso para o AuthProvider
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
            isLoading ? (
              <Skeleton className="h-10 w-40" />
            ) : (
              !isFormVisible && (
                <Button onClick={() => { setIsFormVisible(true); setEditingExpense(null); }}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Despesa
                </Button>
              )
            )
          }
        />

        {(isFormVisible || editingExpense) && (
          <ExpenseForm
            onSubmit={handleFormSubmit}
            initialData={editingExpense} // initialData precisa que a data seja um objeto Date
            onCancel={handleCancelEdit}
          />
        )}

        {isLoading && !isFormVisible && (
          <div className="mt-6 space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        )}
        {!isLoading && (
          <ExpenseList
            // A ordenação já é feita no hook ou será feita ao popular a lista
            expenseList={expenseList} 
            onEdit={handleEdit}
            onDelete={(id) => {
              const expenseItem = expenseList.find(e => e.id === id);
              if (expenseItem) handleDeleteRequest(expenseItem);
            }}
          />
        )}


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
