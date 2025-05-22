
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
  const { 
    goalList, 
    addGoal, 
    updateGoal, 
    deleteGoal, 
    isLoadingData: financialDataIsLoading 
  } = useFinancialData();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);
  const { toast } = useToast(); // Usado pelo hook
  const { currentUser, isLoading: authIsLoading } = useAuth();

  const isLoading = authIsLoading || financialDataIsLoading;

  const handleFormSubmit = (data: Omit<Goal, "id">) => {
    if (editingGoal) {
      updateGoal({ ...data, id: editingGoal.id });
      // toast é tratado no hook
    } else {
      addGoal(data);
      // toast é tratado no hook
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
      deleteGoal(goalToDelete.id, goalToDelete.name);
      // toast é tratado no hook
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
            isLoading ? (
              <Skeleton className="h-10 w-48" />
            ) : (
              !isFormVisible && (
                <Button onClick={() => { setIsFormVisible(true); setEditingGoal(null); }}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Definir Nova Meta
                </Button>
              )
            )
          }
        />

        {(isFormVisible || editingGoal) && (
          <GoalForm
            onSubmit={handleFormSubmit}
            initialData={editingGoal} // initialData precisa que a data seja um objeto Date
            onCancel={handleCancelEdit}
          />
        )}

        {isLoading && !isFormVisible && (
          <div className="mt-6 grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        )}
        {!isLoading && (
          <GoalList
            goalList={goalList}
            onEdit={handleEdit}
            onDelete={(id) => {
              const goalItem = goalList.find(g => g.id === id);
              if (goalItem) handleDeleteRequest(goalItem);
            }}
          />
        )}


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
