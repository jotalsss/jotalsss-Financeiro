
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
import type { Income } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";

const incomeSchema = z.object({
  source: z.string().min(2, { message: "A origem deve ter pelo menos 2 caracteres." }),
  amount: z.coerce.number().positive({ message: "O valor deve ser positivo." }),
  date: z.date({ required_error: "A data (mês/ano) é obrigatória." }),
});

type IncomeFormValues = z.infer<typeof incomeSchema>;

interface IncomeFormProps {
  onSubmit: (data: Omit<Income, "id">) => void;
  initialData?: Income | null;
  onCancel?: () => void;
}

export function IncomeForm({ onSubmit, initialData, onCancel }: IncomeFormProps) {
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeSchema),
    defaultValues: initialData
      ? { 
          ...initialData, 
          date: initialData.date ? new Date(new Date(initialData.date).getFullYear(), new Date(initialData.date).getMonth(), 1) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      : { 
          source: "", 
          amount: 0, 
          date: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
        },
  });

  const handleSubmit = (data: IncomeFormValues) => {
    onSubmit({ ...data, date: data.date.toISOString() });
    if (!initialData) { // Reset form only if it's for new entry
      form.reset({ 
        source: "", 
        amount: 0, 
        date: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Editar Receita" : "Adicionar Nova Receita"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Origem da Receita</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: Salário, Projeto Freelance" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                {initialData ? "Salvar Alterações" : "Adicionar Receita"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
