"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/common/page-header";
import { IncomeForm } from "@/components/income/income-form";
import { IncomeList } from "@/components/income/income-list";
import { useFinancialData } from "@/hooks/use-financial-data";
import type { Income } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlusCircle, TrendingUp } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/common/delete-confirmation-dialog";
import { useToast } from "@/hooks/use-toast";

export default function IncomePage() {
  const { incomeList, addIncome, updateIncome, deleteIncome } = useFinancialData();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [incomeToDelete, setIncomeToDelete] = useState<Income | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);


  const handleFormSubmit = (data: Omit<Income, "id">) => {
    if (editingIncome) {
      updateIncome({ ...data, id: editingIncome.id });
      toast({ title: "Income Updated", description: `Income from "${data.source}" has been updated.` });
    } else {
      addIncome(data);
      toast({ title: "Income Added", description: `Income from "${data.source}" has been added.` });
    }
    setEditingIncome(null);
    setIsFormVisible(false);
  };

  const handleEdit = (income: Income) => {
    setEditingIncome(income);
    setIsFormVisible(true);
  };

  const handleDeleteRequest = (income: Income) => {
    setIncomeToDelete(income);
  };

  const confirmDelete = () => {
    if (incomeToDelete) {
      deleteIncome(incomeToDelete.id);
      toast({ title: "Income Deleted", description: `Income from "${incomeToDelete.source}" has been deleted.`, variant: "destructive" });
      setIncomeToDelete(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingIncome(null);
    setIsFormVisible(false);
  }

  if (!isClient) {
    return (
      <div className="space-y-6">
        <PageHeader title="Income" description="Manage your income sources." icon={TrendingUp} />
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
        title="Income"
        description="Track and manage all your income sources."
        icon={TrendingUp}
        action={
          !isFormVisible && (
            <Button onClick={() => { setIsFormVisible(true); setEditingIncome(null); }}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Income
            </Button>
          )
        }
      />

      {(isFormVisible || editingIncome) && (
        <IncomeForm
          onSubmit={handleFormSubmit}
          initialData={editingIncome}
          onCancel={handleCancelEdit}
        />
      )}

      <IncomeList
        incomeList={incomeList}
        onEdit={handleEdit}
        onDelete={(id) => {
          const incomeItem = incomeList.find(i => i.id === id);
          if (incomeItem) handleDeleteRequest(incomeItem);
        }}
      />

      {incomeToDelete && (
        <DeleteConfirmationDialog
          open={!!incomeToDelete}
          onOpenChange={() => setIncomeToDelete(null)}
          onConfirm={confirmDelete}
          itemName={`income from "${incomeToDelete.source}"`}
        />
      )}
    </div>
  );
}
