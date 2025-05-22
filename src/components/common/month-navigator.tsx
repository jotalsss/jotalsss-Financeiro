
"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface MonthNavigatorProps {
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  className?: string;
}

export function MonthNavigator({
  currentDate,
  onPreviousMonth,
  onNextMonth,
  className,
}: MonthNavigatorProps) {
  return (
    <div className={cn("flex items-center justify-center gap-2 mb-6", className)}>
      <Button
        variant="outline"
        size="icon"
        onClick={onPreviousMonth}
        aria-label="Mês anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-lg font-medium w-36 text-center tabular-nums">
        {format(currentDate, "MMMM yyyy", { locale: ptBR })}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={onNextMonth}
        aria-label="Próximo mês"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
