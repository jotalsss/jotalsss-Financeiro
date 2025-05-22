
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type { Expense, ExpenseCategory } from "@/lib/types";
import { ExpenseCategories } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { expenseCategoryIcons, defaultExpenseCategories } from "./expense-categories";
import React from "react";

const expenseSchema = z.object({
  description: z.string().min(2, { message: "A descrição deve ter pelo menos 2 caracteres." }),
  amount: z.coerce.number().positive({ message: "O valor deve ser positivo." }),
  category: z.enum(ExpenseCategories, { required_error: "A categoria é obrigatória."}),
  date: z.date({ required_error: "A data (mês/ano) é obrigatória." }),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  onSubmit: (data: Omit<Expense, "id">) => void;
  initialData?: Expense | null;
  onCancel?: () => void;
}

export function ExpenseForm({ onSubmit, initialData, onCancel }: ExpenseFormProps) {
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: initialData
      ? { 
          ...initialData, 
          date: initialData.date ? new Date(new Date(initialData.date).getFullYear(), new Date(initialData.date).getMonth(), 1) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      : { 
          description: "", 
          amount: 0, 
          category: defaultExpenseCategories[0], 
          date: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
        },
  });

  const handleSubmit = (data: ExpenseFormValues) => {
    onSubmit({ ...data, date: data.date.toISOString() });
     if (!initialData) {
      form.reset({ 
        description: "", 
        amount: 0, 
        category: defaultExpenseCategories[0], 
        date: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Editar Despesa" : "Adicionar Nova Despesa"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="ex: Supermercado, Conta de Luz" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0,00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {defaultExpenseCategories.map((category) => {
                          const Icon = expenseCategoryIcons[category as ExpenseCategory];
                          return (
                            <SelectItem key={category} value={category}>
                              <div className="flex items-center gap-2">
                                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                                {category}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Mês/Ano</FormLabel>
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
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
                            format(field.value, "MMMM yyyy", { locale: ptBR })
                          ) : (
                            <span>Escolha um mês/ano</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(currentMonth) => {
                          if (currentMonth) {
                            field.onChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1));
                          } else {
                            field.onChange(undefined);
                          }
                          setIsCalendarOpen(false);
                        }}
                        captionLayout="dropdown-buttons"
                        fromYear={new Date().getFullYear() - 20}
                        toYear={new Date().getFullYear() + 5}
                        defaultMonth={field.value || new Date()}
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
                {initialData ? "Salvar Alterações" : "Adicionar Despesa"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
