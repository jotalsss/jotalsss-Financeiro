
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
import { useToast } from "@/hooks/use-toast"; // Toast é usado pelo hook
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
    ensureDefaultMonthlyIncomeExists,
    isLoadingData: financialDataIsLoading
  } = useFinancialData();

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [incomeToDelete, setIncomeToDelete] = useState<Income | null>(null);
  const { toast } = useToast();
  const { currentUser, isLoading: authIsLoading } = useAuth();

  const [isDefaultIncomeDialogOpen, setIsDefaultIncomeDialogOpen] = useState(false);
  const [defaultIncomeForm, setDefaultIncomeForm] = useState<DefaultMonthlyIncome>({ source: "", amount: 0 });
  const [isEditingDefaultIncome, setIsEditingDefaultIncome] = useState(false);

  const isLoading = authIsLoading || financialDataIsLoading;

  useEffect(() => {
    if (defaultMonthlyIncome) {
      setDefaultIncomeForm(defaultMonthlyIncome);
    } else {
      setDefaultIncomeForm({ source: "Salário", amount: 0 }); // Preencher com um valor padrão se não houver
    }
  }, [defaultMonthlyIncome]);

  const handleFormSubmit = (data: Omit<Income, "id">) => {
    if (editingIncome) {
      updateIncome({ ...data, id: editingIncome.id });
      // toast é tratado no hook
    } else {
      addIncome(data);
      // toast é tratado no hook
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
      deleteIncome(incomeToDelete.id, incomeToDelete.source);
      // toast é tratado no hook
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

  const handleSaveDefaultIncome = async () => {
    if (defaultIncomeForm.source && defaultIncomeForm.amount > 0) {
      await setDefaultMonthlyIncome(defaultIncomeForm);
      const today = new Date();
      // A lógica de ensureDefaultMonthlyIncomeExists é chamada no hook agora
      // await ensureDefaultMonthlyIncomeExists(getYear(today), getMonth(today)); 

      // toast é tratado no hook
      setIsDefaultIncomeDialogOpen(false);
      setIsEditingDefaultIncome(false);
    } else {
      toast({ title: "Erro", description: "Por favor, preencha a origem e um valor positivo para o salário.", variant: "destructive" });
    }
  };

  const handleRemoveDefaultIncome = async () => {
    await removeDefaultMonthlyIncome();
    // toast é tratado no hook
    setDefaultIncomeForm({ source: "Salário", amount: 0 }); 
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
             isLoading ? (
              <Skeleton className="h-10 w-52" />
            ) : (
            !isFormVisible && (
                <Button onClick={() => { setIsFormVisible(true); setEditingIncome(null); }}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Receita Avulsa
                </Button>
              )
            )
          }
        />

        {isLoading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-5 w-1/2 mb-1" />
              <Skeleton className="h-5 w-1/3" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-40 mr-2" />
              <Skeleton className="h-10 w-40" />
            </CardFooter>
          </Card>
        ) : (
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
        )}
        

        {(isFormVisible || editingIncome) && (
          <IncomeForm
            onSubmit={handleFormSubmit}
            initialData={editingIncome} // initialData precisa que a data seja um objeto Date
            onCancel={handleCancelEdit}
          />
        )}
        
        {isLoading && !isFormVisible && (
           <div className="mt-6 space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        )}
        {!isLoading && (
          <IncomeList
            // A ordenação já é feita no hook
            incomeList={incomeList}
            onEdit={handleEdit}
            onDelete={(id) => {
              const incomeItem = incomeList.find(i => i.id === id);
              if (incomeItem) handleDeleteRequest(incomeItem);
            }}
          />
        )}

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
