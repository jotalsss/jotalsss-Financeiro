
"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/common/page-header";
import { IncomeForm } from "@/components/income/income-form";
import { IncomeList } from "@/components/income/income-list";
import { useFinancialData } from "@/hooks/use-financial-data";
import type { Income, DefaultMonthlyIncome } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlusCircle, TrendingUp, Edit3, Trash, Save, Loader2 } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/common/delete-confirmation-dialog";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { getMonth, getYear } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import AppLayout from "@/components/layout/app-layout";
import { useAuth } from "@/contexts/AuthContext";


export default function IncomePage() {
  const { 
    incomeList, 
    addIncome, 
    updateIncome, 
    deleteIncome, 
    defaultMonthlyIncome, 
    setDefaultMonthlyIncome, 
    removeDefaultMonthlyIncome,
    ensureDefaultMonthlyIncomeExists 
  } = useFinancialData();

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [incomeToDelete, setIncomeToDelete] = useState<Income | null>(null);
  const { toast } = useToast();
  const { currentUser, isLoading: authIsLoading } = useAuth();

  const [isDefaultIncomeDialogOpen, setIsDefaultIncomeDialogOpen] = useState(false);
  const [defaultIncomeForm, setDefaultIncomeForm] = useState<DefaultMonthlyIncome>({ source: "", amount: 0 });
  const [isEditingDefaultIncome, setIsEditingDefaultIncome] = useState(false);


  useEffect(() => {
    if (defaultMonthlyIncome) {
      setDefaultIncomeForm(defaultMonthlyIncome);
    } else {
      setDefaultIncomeForm({ source: "", amount: 0 });
    }
  }, [defaultMonthlyIncome]);

  const handleFormSubmit = (data: Omit<Income, "id">) => {
    if (editingIncome) {
      updateIncome({ ...data, id: editingIncome.id });
      toast({ title: "Receita Atualizada", description: `A receita de "${data.source}" foi atualizada.` });
    } else {
      addIncome(data);
      toast({ title: "Receita Adicionada", description: `A receita de "${data.source}" foi adicionada.` });
    }
    setEditingIncome(null);
    setIsFormVisible(false);
  };

  const handleEdit = (income: Income) => {
    setEditingIncome(income);
    setIsFormVisible(true);
  };

  const handleDeleteRequest = (income: Income) => {
    setIncomeToDelete(income);
  };

  const confirmDelete = () => {
    if (incomeToDelete) {
      deleteIncome(incomeToDelete.id);
      toast({ title: "Receita Excluída", description: `A receita de "${incomeToDelete.source}" foi excluída.`, variant: "destructive" });
      setIncomeToDelete(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingIncome(null);
    setIsFormVisible(false);
  }

  const handleDefaultIncomeFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDefaultIncomeForm(prev => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSaveDefaultIncome = () => {
    if (defaultIncomeForm.source && defaultIncomeForm.amount > 0) {
      setDefaultMonthlyIncome(defaultIncomeForm);
      const today = new Date();
      ensureDefaultMonthlyIncomeExists(getYear(today), getMonth(today));

      toast({ title: "Salário Padrão Salvo", description: `Salário mensal de "${defaultIncomeForm.source}" configurado.` });
      setIsDefaultIncomeDialogOpen(false);
      setIsEditingDefaultIncome(false);
    } else {
      toast({ title: "Erro", description: "Por favor, preencha a origem e um valor positivo para o salário.", variant: "destructive" });
    }
  };

  const handleRemoveDefaultIncome = () => {
    removeDefaultMonthlyIncome();
    toast({ title: "Salário Padrão Removido", variant: "destructive" });
    setDefaultIncomeForm({ source: "", amount: 0 }); 
    setIsEditingDefaultIncome(false);
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount);

  if (authIsLoading || !currentUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <PageHeader
          title="Receitas"
          description="Monitore e gerencie todas as suas fontes de receita, incluindo seu salário padrão."
          icon={TrendingUp}
          action={
            !isFormVisible && (
              <Button onClick={() => { setIsFormVisible(true); setEditingIncome(null); }}>
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Receita Avulsa
              </Button>
            )
          }
        />

        <Card>
          <CardHeader>
            <CardTitle>Salário Mensal Padrão</CardTitle>
            <CardDescription>
              Defina um salário que será automaticamente considerado em suas receitas mensais.
              Ele será adicionado a cada mês caso ainda não exista uma entrada com a mesma origem.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {defaultMonthlyIncome ? (
              <div>
                <p><strong>Origem:</strong> {defaultMonthlyIncome.source}</p>
                <p><strong>Valor:</strong> {formatCurrency(defaultMonthlyIncome.amount)}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhum salário mensal padrão definido.</p>
            )}
          </CardContent>
          <CardFooter className="gap-2">
            <Dialog open={isDefaultIncomeDialogOpen} onOpenChange={setIsDefaultIncomeDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={() => {
                    setIsEditingDefaultIncome(!!defaultMonthlyIncome);
                    if (defaultMonthlyIncome) setDefaultIncomeForm(defaultMonthlyIncome);
                    else setDefaultIncomeForm({ source: "Salário", amount: 0 }); 
                    setIsDefaultIncomeDialogOpen(true);
                }}>
                  <Edit3 className="mr-2 h-4 w-4" /> 
                  {defaultMonthlyIncome ? "Editar Salário Padrão" : "Definir Salário Padrão"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{isEditingDefaultIncome ? "Editar" : "Definir"} Salário Mensal Padrão</DialogTitle>
                  <DialogDescription>
                    Este salário será automaticamente considerado em suas receitas mensais.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="default-income-source" className="text-right">
                      Origem
                    </Label>
                    <Input
                      id="default-income-source"
                      name="source"
                      value={defaultIncomeForm.source}
                      onChange={handleDefaultIncomeFormChange}
                      className="col-span-3"
                      placeholder="Ex: Salário Empresa XPTO"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="default-income-amount" className="text-right">
                      Valor (R$)
                    </Label>
                    <Input
                      id="default-income-amount"
                      name="amount"
                      type="number"
                      value={defaultIncomeForm.amount}
                      onChange={handleDefaultIncomeFormChange}
                      className="col-span-3"
                      placeholder="Ex: 5000"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancelar</Button>
                  </DialogClose>
                  <Button onClick={handleSaveDefaultIncome}><Save className="mr-2 h-4 w-4" /> Salvar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {defaultMonthlyIncome && (
              <Button variant="destructive" onClick={handleRemoveDefaultIncome}>
                <Trash className="mr-2 h-4 w-4" /> Remover Salário Padrão
              </Button>
            )}
          </CardFooter>
        </Card>
        

        {(isFormVisible || editingIncome) && (
          <IncomeForm
            onSubmit={handleFormSubmit}
            initialData={editingIncome}
            onCancel={handleCancelEdit}
          />
        )}

        <IncomeList
          incomeList={incomeList.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
          onEdit={handleEdit}
          onDelete={(id) => {
            const incomeItem = incomeList.find(i => i.id === id);
            if (incomeItem) handleDeleteRequest(incomeItem);
          }}
        />

        {incomeToDelete && (
          <DeleteConfirmationDialog
            open={!!incomeToDelete}
            onOpenChange={() => setIncomeToDelete(null)}
            onConfirm={confirmDelete}
            itemName={`a receita de "${incomeToDelete.source}"`}
          />
        )}
      </div>
    </AppLayout>
  );
}
