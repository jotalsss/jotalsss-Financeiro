"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/common/page-header";
import { GoalForm } from "@/components/goals/goal-form";
import { GoalList } from "@/components/goals/goal-list";
import { useFinancialData } from "@/hooks/use-financial-data";
import type { Goal } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlusCircle, Target as TargetIcon } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/common/delete-confirmation-dialog";
import { useToast } from "@/hooks/use-toast";

export default function GoalsPage() {
  const { goalList, addGoal, updateGoal, deleteGoal } = useFinancialData();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleFormSubmit = (data: Omit<Goal, "id">) => {
    if (editingGoal) {
      updateGoal({ ...data, id: editingGoal.id });
      toast({ title: "Goal Updated", description: `Goal "${data.name}" has been updated.` });
    } else {
      addGoal(data);
      toast({ title: "Goal Set", description: `New goal "${data.name}" has been set.` });
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
      toast({ title: "Goal Deleted", description: `Goal "${goalToDelete.name}" has been deleted.`, variant: "destructive" });
      setGoalToDelete(null);
    }
  };
  
  const handleCancelEdit = () => {
    setEditingGoal(null);
    setIsFormVisible(false);
  }

  if (!isClient) {
     return (
      <div className="space-y-6">
        <PageHeader title="Financial Goals" description="Set and track your financial goals." icon={TargetIcon} />
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
        title="Financial Goals"
        description="Define your financial ambitions and track your progress."
        icon={TargetIcon}
        action={
          !isFormVisible && (
            <Button onClick={() => { setIsFormVisible(true); setEditingGoal(null); }}>
              <PlusCircle className="mr-2 h-4 w-4" /> Set New Goal
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
          itemName={`goal "${goalToDelete.name}"`}
        />
      )}
    </div>
  );
}
