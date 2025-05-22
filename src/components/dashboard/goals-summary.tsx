"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Target, PlusCircle } from "lucide-react";
import { useFinancialData } from "@/hooks/use-financial-data";
import type { Goal } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

function GoalProgressItem({ goal }: { goal: Goal }) {
  const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  return (
    <div className="mb-4 rounded-md border p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-1 flex items-center justify-between">
        <h4 className="font-semibold">{goal.name}</h4>
        <span className="text-sm text-muted-foreground">
          {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
        </span>
      </div>
      <Progress value={Math.min(progress, 100)} aria-label={`${goal.name} progress`} className="h-3" />
      <p className="mt-1 text-xs text-muted-foreground text-right">
        {Math.min(progress, 100).toFixed(0)}% completed
        {goal.deadline && ` (Due: ${new Date(goal.deadline).toLocaleDateString()})`}
      </p>
    </div>
  );
}

export function GoalsSummary() {
  const { goalList } = useFinancialData();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Goals Overview
          </CardTitle>
          <CardDescription>Track your progress towards your financial goals.</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-full mb-4" />
          <Skeleton className="h-8 w-full mb-4" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full" disabled>
            <Link href="/goals">
              <PlusCircle className="mr-2 h-4 w-4" />
              Manage Goals
            </Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  const displayedGoals = goalList.slice(0, 3); // Show top 3 goals

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-6 w-6 text-primary" />
          Goals Overview
        </CardTitle>
        <CardDescription>Track your progress towards your financial goals.</CardDescription>
      </CardHeader>
      <CardContent>
        {goalList.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-md border border-dashed bg-muted/30 p-6 text-center">
            <Target className="h-10 w-10 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">
              You haven't set any financial goals yet.
            </p>
            <Button asChild variant="link" className="mt-1">
              <Link href="/goals">Set your first goal</Link>
            </Button>
          </div>
        ) : (
          <div>
            {displayedGoals.map((goal) => (
              <GoalProgressItem key={goal.id} goal={goal} />
            ))}
            {goalList.length > 3 && (
              <p className="text-sm text-center text-muted-foreground mt-2">
                And {goalList.length - 3} more...
              </p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href="/goals">
            <PlusCircle className="mr-2 h-4 w-4" />
            Manage Goals
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
