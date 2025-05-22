"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/common/page-header";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { ExpenseList } from "@/components/expenses/expense-list";
import { useFinancialData } from "@/hooks/use-financial-data";
import type { Expense } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlusCircle, TrendingDown } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/common/delete-confirmation-dialog";
import { useToast } from "@/hooks/use-toast";

export default function ExpensesPage() {
  const { expenseList, addExpense, updateExpense, deleteExpense } = useFinancialData();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleFormSubmit = (data: Omit<Expense, "id">) => {
    if (editingExpense) {
      updateExpense({ ...data, id: editingExpense.id });
      toast({ title: "Expense Updated", description: `Expense "${data.description}" has been updated.` });
    } else {
      addExpense(data);
      toast({ title: "Expense Added", description: `Expense "${data.description}" has been added.` });
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
      toast({ title: "Expense Deleted", description: `Expense "${expenseToDelete.description}" has been deleted.`, variant: "destructive" });
      setExpenseToDelete(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
    setIsFormVisible(false);
  }

  if (!isClient) {
     return (
      <div className="space-y-6">
        <PageHeader title="Expenses" description="Track and manage your expenses." icon={TrendingDown} />
        <div className="animate-pulse">
          <div className="h-12 w-32 rounded-md bg-muted"></div>
          <div className="mt-6 h-64 rounded-md bg-muted"></div>
          <div className="mt-6 h-96 rounded-md bg-muted"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        description="Log and categorize all your expenditures."
        icon={TrendingDown}
        action={
          !isFormVisible && (
            <Button onClick={() => { setIsFormVisible(true); setEditingExpense(null); }}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
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
        expenseList={expenseList}
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
          itemName={`expense "${expenseToDelete.description}"`}
        />
      )}
    </div>
  );
}
