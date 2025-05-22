"use client";

import type { Goal } from "@/lib/types";
import { GoalProgressCard } from "./goal-progress-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Target } from "lucide-react";

interface GoalListProps {
  goalList: Goal[];
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
}

export function GoalList({ goalList, onEdit, onDelete }: GoalListProps) {
  if (goalList.length === 0) {
    return (
       <Card className="mt-6">
        <CardHeader>
          <CardTitle>Suas Metas Financeiras</CardTitle>
          <CardDescription>Todas as suas metas financeiras aparecerão aqui.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-md border border-dashed bg-muted/30 p-10 text-center">
            <Target className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium text-muted-foreground">
              Nenhuma meta definida ainda.
            </p>
            <p className="text-sm text-muted-foreground">
              Defina suas aspirações financeiras usando o formulário acima.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-6 grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {goalList.map((goal) => (
        <GoalProgressCard
          key={goal.id}
          goal={goal}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
