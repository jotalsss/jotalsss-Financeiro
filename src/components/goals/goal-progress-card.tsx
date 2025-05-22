
"use client";

import type { Goal } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Target, CalendarClock } from "lucide-react";
import { motion } from "framer-motion";

interface GoalProgressCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
}

export function GoalProgressCard({ goal, onEdit, onDelete }: GoalProgressCardProps) {
  const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  const formatCurrency = (amount: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount);

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className="h-full" // Garante que o motion.div ocupe a altura do card
    >
      <Card className="flex flex-col h-full transition-shadow duration-200 ease-in-out hover:shadow-xl">
        <CardHeader>
          <div className="flex items-start justify-between"> {/* items-start para alinhar o título e os botões corretamente */}
            <CardTitle className="flex items-center gap-2 text-lg"> {/* Ajuste no tamanho da fonte do título se necessário */}
              <Target className="h-5 w-5 text-primary" />
              {goal.name}
            </CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => onEdit(goal)} aria-label={`Editar meta ${goal.name}`}>
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(goal.id)} aria-label={`Excluir meta ${goal.name}`} className="text-destructive hover:text-destructive/80">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription>
            Meta: {formatCurrency(goal.targetAmount)} | Atual: {formatCurrency(goal.currentAmount)}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <Progress value={Math.min(progress, 100)} aria-label={`Progresso da meta ${goal.name}`} className="h-3 mb-1" />
          <p className="text-sm text-muted-foreground text-right">
            {Math.min(progress, 100).toFixed(0)}% completo
          </p>
        </CardContent>
        {goal.deadline && (
          <CardFooter>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <CalendarClock className="h-3 w-3" />
              Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}
            </p>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}
