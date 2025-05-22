
"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/common/page-header";
import { GoalForm } from "@/components/goals/goal-form";
import { GoalList } from "@/components/goals/goal-list";
import { useFinancialData } from "@/hooks/use-financial-data";
import type { Goal } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlusCircle, Target as TargetIcon, Loader2 } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/common/delete-confirmation-dialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import AppLayout from "@/components/layout/app-layout";
import { useAuth } from "@/contexts/AuthContext";

export default function GoalsPage() {
  const { goalList, addGoal, updateGoal, deleteGoal } = useFinancialData();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);
  const { toast } = useToast();
  const { currentUser, isLoading: authIsLoading } = useAuth();

  const handleFormSubmit = (data: Omit<Goal, "id">) => {
    if (editingGoal) {
      updateGoal({ ...data, id: editingGoal.id });
      toast({ title: "Meta Atualizada", description: `A meta "${data.name}" foi atualizada.` });
    } else {
      addGoal(data);
      toast({ title: "Meta Definida", description: `Nova meta "${data.name}" foi definida.` });
    }
    setEditingGoal(null);
    setIsFormVisible(false);
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setIsFormVisible(true);
  };

  const handleDeleteRequest = (goal: Goal) => {
    setGoalToDelete(goal);
  };

  const confirmDelete = () => {
    if (goalToDelete) {
      deleteGoal(goalToDelete.id);
      toast({ title: "Meta Excluída", description: `A meta "${goalToDelete.name}" foi excluída.`, variant: "destructive" });
      setGoalToDelete(null);
    }
  };
  
  const handleCancelEdit = () => {
    setEditingGoal(null);
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
          title="Metas Financeiras"
          description="Defina suas ambições financeiras e acompanhe seu progresso."
          icon={TargetIcon}
          action={
            !isFormVisible && (
              <Button onClick={() => { setIsFormVisible(true); setEditingGoal(null); }}>
                <PlusCircle className="mr-2 h-4 w-4" /> Definir Nova Meta
              </Button>
            )
          }
        />

        {(isFormVisible || editingGoal) && (
          <GoalForm
            onSubmit={handleFormSubmit}
            initialData={editingGoal}
            onCancel={handleCancelEdit}
          />
        )}

        <GoalList
          goalList={goalList}
          onEdit={handleEdit}
          onDelete={(id) => {
            const goalItem = goalList.find(g => g.id === id);
            if (goalItem) handleDeleteRequest(goalItem);
          }}
        />

        {goalToDelete && (
          <DeleteConfirmationDialog
            open={!!goalToDelete}
            onOpenChange={() => setGoalToDelete(null)}
            onConfirm={confirmDelete}
            itemName={`a meta "${goalToDelete.name}"`}
          />
        )}
      </div>
    </AppLayout>
  );
}
