"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Save } from "lucide-react";
import type { Goal } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const goalSchema = z.object({
  name: z.string().min(2, { message: "O nome da meta deve ter pelo menos 2 caracteres." }),
  targetAmount: z.coerce.number().positive({ message: "O valor alvo deve ser positivo." }),
  currentAmount: z.coerce.number().min(0, { message: "O valor atual não pode ser negativo." }).optional(),
  deadline: z.date().optional(),
}).refine(data => !data.currentAmount || data.currentAmount <= data.targetAmount, {
  message: "O valor atual não pode exceder o valor alvo.",
  path: ["currentAmount"],
});


type GoalFormValues = z.infer<typeof goalSchema>;

interface GoalFormProps {
  onSubmit: (data: Omit<Goal, "id">) => void;
  initialData?: Goal | null;
  onCancel?: () => void;
}

export function GoalForm({ onSubmit, initialData, onCancel }: GoalFormProps) {
  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: initialData
      ? { 
          ...initialData, 
          deadline: initialData.deadline ? new Date(initialData.deadline) : undefined,
          currentAmount: initialData.currentAmount || 0,
        }
      : { name: "", targetAmount: 0, currentAmount: 0, deadline: undefined },
  });

  const handleSubmit = (data: GoalFormValues) => {
    onSubmit({
      ...data,
      currentAmount: data.currentAmount || 0,
      deadline: data.deadline?.toISOString(),
    });
    if (!initialData) {
      form.reset({ name: "", targetAmount: 0, currentAmount: 0, deadline: undefined });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Editar Meta" : "Definir Nova Meta"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Meta</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: Fundo de Férias, Reserva de Emergência" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="targetAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Alvo</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0,00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Atual (Opcional)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0,00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Prazo (Opcional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>Escolha uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setDate(new Date().getDate() -1)) // Disable past dates
                        }
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>}
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                {initialData ? "Salvar Alterações" : "Definir Meta"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
