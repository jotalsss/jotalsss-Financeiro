"use client";

import type { Goal } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Target, CalendarClock } from "lucide-react";

interface GoalProgressCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
}

export function GoalProgressCard({ goal, onEdit, onDelete }: GoalProgressCardProps) {
  const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {goal.name}
          </CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => onEdit(goal)} aria-label={`Edit goal ${goal.name}`}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(goal.id)} aria-label={`Delete goal ${goal.name}`} className="text-destructive hover:text-destructive/80">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>
          Target: {formatCurrency(goal.targetAmount)} | Current: {formatCurrency(goal.currentAmount)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <Progress value={Math.min(progress, 100)} aria-label={`${goal.name} progress`} className="h-3 mb-1" />
        <p className="text-sm text-muted-foreground text-right">
          {Math.min(progress, 100).toFixed(0)}% completed
        </p>
      </CardContent>
      {goal.deadline && (
        <CardFooter>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <CalendarClock className="h-3 w-3" />
            Deadline: {new Date(goal.deadline).toLocaleDateString()}
          </p>
        </CardFooter>
      )}
    </Card>
  );
}
