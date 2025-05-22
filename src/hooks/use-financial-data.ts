
"use client";

import type { Income, Expense, Goal, DefaultMonthlyIncome } from "@/lib/types";
import { useState, useEffect, useCallback } from "react";
import { getMonth, getYear, startOfMonth, addMonths } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  deleteDoc,
  writeBatch,
  getDoc,
  Timestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";

// Helper para converter data do Firestore (Timestamp ou string) para string ISO
const convertFirestoreDateToString = (date: any): string => {
  if (date instanceof Timestamp) {
    return date.toDate().toISOString();
  }
  if (typeof date === 'string') {
    return date; // Assumir que já é ISO string se for string
  }
  // Fallback para data atual se o formato for inesperado
  return new Date().toISOString();
};


export function useFinancialData() {
  const { currentUser } = useAuth();
  const userEmail = currentUser ? currentUser.email.toLowerCase() : null;
  const { toast } = useToast();

  const [incomeList, setIncomeList] = useState<Income[]>([]);
  const [expenseList, setExpenseList] = useState<Expense[]>([]);
  const [goalList, setGoalList] = useState<Goal[]>([]);
  const [defaultMonthlyIncomeData, setDefaultMonthlyIncomeData] = useState<DefaultMonthlyIncome | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const fetchData = useCallback(async (email: string) => {
    setIsLoadingData(true);
    try {
      // Fetch Income
      const incomeQuery = query(collection(db, 'users', email, 'income'), orderBy("date", "desc"));
      const incomeSnapshot = await getDocs(incomeQuery);
      const fetchedIncome = incomeSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: convertFirestoreDateToString(doc.data().date),
      })) as Income[];
      setIncomeList(fetchedIncome);

      // Fetch Expenses
      const expensesQuery = query(collection(db, 'users', email, 'expenses'), orderBy("date", "desc"));
      const expensesSnapshot = await getDocs(expensesQuery);
      const fetchedExpenses = expensesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: convertFirestoreDateToString(doc.data().date),
      })) as Expense[];
      setExpenseList(fetchedExpenses);

      // Fetch Goals
      const goalsQuery = query(collection(db, 'users', email, 'goals'), orderBy("name")); // ou outra ordenação
      const goalsSnapshot = await getDocs(goalsQuery);
      const fetchedGoals = goalsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        deadline: doc.data().deadline ? convertFirestoreDateToString(doc.data().deadline) : undefined,
      })) as Goal[];
      setGoalList(fetchedGoals);

      // Fetch Default Monthly Income
      const defaultIncomeDocRef = doc(db, 'users', email, 'settings', 'defaultMonthlyIncome');
      const defaultIncomeSnap = await getDoc(defaultIncomeDocRef);
      if (defaultIncomeSnap.exists()) {
        setDefaultMonthlyIncomeData(defaultIncomeSnap.data() as DefaultMonthlyIncome);
      } else {
        setDefaultMonthlyIncomeData(null);
      }

    } catch (error) {
      console.error("Erro ao buscar dados do Firestore:", error);
      toast({ title: "Erro de Dados", description: "Não foi possível carregar seus dados financeiros.", variant: "destructive" });
    } finally {
      setIsLoadingData(false);
    }
  }, [toast]);

  useEffect(() => {
    if (userEmail) {
      fetchData(userEmail);
    } else {
      // Limpar dados se não houver usuário
      setIncomeList([]);
      setExpenseList([]);
      setGoalList([]);
      setDefaultMonthlyIncomeData(null);
      setIsLoadingData(false); // Não está carregando se não há usuário
    }
  }, [userEmail, fetchData]);

  const addIncome = useCallback(async (incomeData: Omit<Income, "id">) => {
    if (!userEmail) return;
    try {
      const incomeCollectionRef = collection(db, 'users', userEmail, 'income');
      const dataToSave = {
        ...incomeData,
        date: Timestamp.fromDate(new Date(incomeData.date)), // Salvar como Timestamp
      };
      const docRef = await addDoc(incomeCollectionRef, dataToSave);
      // Atualiza o estado local otimisticamente ou refaz o fetch
      setIncomeList(prev => [{ ...incomeData, date: new Date(incomeData.date).toISOString(), id: docRef.id }, ...prev, ]);
      toast({ title: "Receita Adicionada", description: `A receita de "${incomeData.source}" foi adicionada.` });
    } catch (error) {
      console.error("Erro ao adicionar receita:", error);
      toast({ title: "Erro", description: "Não foi possível adicionar a receita.", variant: "destructive" });
    }
  }, [userEmail, toast]);

  const updateIncome = useCallback(async (updatedIncome: Income) => {
    if (!userEmail) return;
    try {
      const incomeDocRef = doc(db, 'users', userEmail, 'income', updatedIncome.id);
      const dataToSave = {
        ...updatedIncome,
        date: Timestamp.fromDate(new Date(updatedIncome.date)),
      };
      delete (dataToSave as any).id; // Não salvar o ID dentro do documento
      await setDoc(incomeDocRef, dataToSave);
      setIncomeList(prev => prev.map(inc => inc.id === updatedIncome.id ? { ...updatedIncome, date: new Date(updatedIncome.date).toISOString() } : inc));
      toast({ title: "Receita Atualizada", description: `A receita de "${updatedIncome.source}" foi atualizada.` });
    } catch (error) {
      console.error("Erro ao atualizar receita:", error);
      toast({ title: "Erro", description: "Não foi possível atualizar a receita.", variant: "destructive" });
    }
  }, [userEmail, toast]);

  const deleteIncome = useCallback(async (id: string, sourceDescription?: string) => {
    if (!userEmail) return;
    try {
      const incomeDocRef = doc(db, 'users', userEmail, 'income', id);
      await deleteDoc(incomeDocRef);
      setIncomeList(prev => prev.filter(inc => inc.id !== id));
      toast({ title: "Receita Excluída", description: `A receita ${sourceDescription ? `"${sourceDescription}"` : ''} foi excluída.`, variant: "destructive" });
    } catch (error) {
      console.error("Erro ao excluir receita:", error);
      toast({ title: "Erro", description: "Não foi possível excluir a receita.", variant: "destructive" });
    }
  }, [userEmail, toast]);


  const addExpense = useCallback(async (expenseData: ExpenseFormValues) => {
    if (!userEmail) return;

    if (expenseData.isInstallmentPurchase && expenseData.numberOfInstallments && expenseData.numberOfInstallments >= 2) {
        const purchaseId = crypto.randomUUID();
        const installmentAmount = parseFloat((expenseData.amount / expenseData.numberOfInstallments).toFixed(2));
        // A data do formulário já é o primeiro dia do mês
        const firstInstallmentDate = startOfMonth(expenseData.date);

        const batch = writeBatch(db);
        const newLocalExpenses: Expense[] = [];

        for (let i = 0; i < expenseData.numberOfInstallments; i++) {
            const installmentDate = addMonths(firstInstallmentDate, i);
            const newInstallmentData: Omit<Expense, "id"> = {
                description: `${expenseData.description} (Parcela ${i + 1} de ${expenseData.numberOfInstallments})`,
                amount: installmentAmount,
                category: expenseData.category,
                date: installmentDate.toISOString(), // Para o estado local
                isInstallment: true,
                totalInstallments: expenseData.numberOfInstallments,
                currentInstallment: i + 1,
                installmentPurchaseId: purchaseId,
            };
            const expenseDocRef = doc(collection(db, 'users', userEmail, 'expenses'));
            batch.set(expenseDocRef, {
                ...newInstallmentData,
                date: Timestamp.fromDate(installmentDate) // Salvar como Timestamp no Firestore
            });
            newLocalExpenses.push({ ...newInstallmentData, id: expenseDocRef.id });
        }
        try {
            await batch.commit();
            setExpenseList(prev => [...newLocalExpenses, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            toast({ title: "Compra Parcelada Adicionada", description: `As ${expenseData.numberOfInstallments} parcelas de "${expenseData.description}" foram adicionadas.` });
        } catch (error) {
            console.error("Erro ao adicionar despesa parcelada:", error);
            toast({ title: "Erro", description: "Não foi possível adicionar a despesa parcelada.", variant: "destructive" });
        }
    } else {
        // Despesa única
        try {
            const expenseCollectionRef = collection(db, 'users', userEmail, 'expenses');
            const dataToSave = {
                description: expenseData.description,
                amount: expenseData.amount,
                category: expenseData.category,
                date: Timestamp.fromDate(expenseData.date), // Salvar como Timestamp
            };
            const docRef = await addDoc(expenseCollectionRef, dataToSave);
            const newExpenseEntry: Expense = {
                id: docRef.id,
                description: expenseData.description,
                amount: expenseData.amount,
                category: expenseData.category,
                date: expenseData.date.toISOString() // Para o estado local
            };
            setExpenseList(prev => [newExpenseEntry, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            toast({ title: "Despesa Adicionada", description: `A despesa "${expenseData.description}" foi adicionada.` });
        } catch (error) {
            console.error("Erro ao adicionar despesa:", error);
            toast({ title: "Erro", description: "Não foi possível adicionar a despesa.", variant: "destructive" });
        }
    }
  }, [userEmail, toast]);


  const updateExpense = useCallback(async (updatedExpense: Expense) => {
    if (!userEmail) return;
    try {
      const expenseDocRef = doc(db, 'users', userEmail, 'expenses', updatedExpense.id);
      const dataToSave = {
        ...updatedExpense,
        date: Timestamp.fromDate(new Date(updatedExpense.date)),
      };
      delete (dataToSave as any).id;
      await setDoc(expenseDocRef, dataToSave);
      setExpenseList(prev => prev.map(exp => exp.id === updatedExpense.id ? { ...updatedExpense, date: new Date(updatedExpense.date).toISOString() } : exp)
                                  .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      toast({ title: "Despesa Atualizada", description: `A despesa "${updatedExpense.description}" foi atualizada.` });
    } catch (error) {
      console.error("Erro ao atualizar despesa:", error);
      toast({ title: "Erro", description: "Não foi possível atualizar a despesa.", variant: "destructive" });
    }
  }, [userEmail, toast]);

  const deleteExpense = useCallback(async (id: string, description?: string) => {
    if (!userEmail) return;
    try {
      const expenseDocRef = doc(db, 'users', userEmail, 'expenses', id);
      await deleteDoc(expenseDocRef);
      setExpenseList(prev => prev.filter(exp => exp.id !== id));
      toast({ title: "Despesa Excluída", description: `A despesa ${description ? `"${description}"`: ""} foi excluída.`, variant: "destructive" });
    } catch (error) {
      console.error("Erro ao excluir despesa:", error);
      toast({ title: "Erro", description: "Não foi possível excluir a despesa.", variant: "destructive" });
    }
  }, [userEmail, toast]);

  const addGoal = useCallback(async (goalData: Omit<Goal, "id">) => {
    if (!userEmail) return;
    try {
      const goalCollectionRef = collection(db, 'users', userEmail, 'goals');
      const dataToSave = {
        ...goalData,
        deadline: goalData.deadline ? Timestamp.fromDate(new Date(goalData.deadline)) : null,
      };
      const docRef = await addDoc(goalCollectionRef, dataToSave);
      setGoalList(prev => [...prev, { ...goalData, deadline: goalData.deadline ? new Date(goalData.deadline).toISOString() : undefined, id: docRef.id }]);
      toast({ title: "Meta Definida", description: `Nova meta "${goalData.name}" foi definida.` });
    } catch (error) {
      console.error("Erro ao adicionar meta:", error);
      toast({ title: "Erro", description: "Não foi possível adicionar a meta.", variant: "destructive" });
    }
  }, [userEmail, toast]);

  const updateGoal = useCallback(async (updatedGoal: Goal) => {
    if (!userEmail) return;
    try {
      const goalDocRef = doc(db, 'users', userEmail, 'goals', updatedGoal.id);
      const dataToSave = {
        ...updatedGoal,
        deadline: updatedGoal.deadline ? Timestamp.fromDate(new Date(updatedGoal.deadline)) : null,
      };
      delete (dataToSave as any).id;
      await setDoc(goalDocRef, dataToSave);
      setGoalList(prev => prev.map(g => g.id === updatedGoal.id ? { ...updatedGoal, deadline: updatedGoal.deadline ? new Date(updatedGoal.deadline).toISOString() : undefined } : g));
      toast({ title: "Meta Atualizada", description: `A meta "${updatedGoal.name}" foi atualizada.` });
    } catch (error) {
      console.error("Erro ao atualizar meta:", error);
      toast({ title: "Erro", description: "Não foi possível atualizar a meta.", variant: "destructive" });
    }
  }, [userEmail, toast]);

  const deleteGoal = useCallback(async (id: string, name?: string) => {
    if (!userEmail) return;
    try {
      const goalDocRef = doc(db, 'users', userEmail, 'goals', id);
      await deleteDoc(goalDocRef);
      setGoalList(prev => prev.filter(g => g.id !== id));
      toast({ title: "Meta Excluída", description: `A meta ${name ? `"${name}"` : ""} foi excluída.`, variant: "destructive" });
    } catch (error) {
      console.error("Erro ao excluir meta:", error);
      toast({ title: "Erro", description: "Não foi possível excluir a meta.", variant: "destructive" });
    }
  }, [userEmail, toast]);

  const setDefaultMonthlyIncome = useCallback(async (income: DefaultMonthlyIncome) => {
    if (!userEmail) return;
    try {
      const settingsDocRef = doc(db, 'users', userEmail, 'settings', 'defaultMonthlyIncome');
      await setDoc(settingsDocRef, income);
      setDefaultMonthlyIncomeData(income); // Atualiza estado local
      toast({ title: "Salário Padrão Salvo", description: `Salário mensal de "${income.source}" configurado.` });
    } catch (error) {
      console.error("Erro ao definir salário padrão:", error);
      toast({ title: "Erro", description: "Não foi possível salvar o salário padrão.", variant: "destructive" });
    }
  }, [userEmail, toast]);

  const removeDefaultMonthlyIncome = useCallback(async () => {
    if (!userEmail) return;
    try {
      const settingsDocRef = doc(db, 'users', userEmail, 'settings', 'defaultMonthlyIncome');
      await deleteDoc(settingsDocRef);
      setDefaultMonthlyIncomeData(null); // Atualiza estado local
      toast({ title: "Salário Padrão Removido", variant: "destructive" });
    } catch (error) {
      console.error("Erro ao remover salário padrão:", error);
      toast({ title: "Erro", description: "Não foi possível remover o salário padrão.", variant: "destructive" });
    }
  }, [userEmail, toast]);

  const ensureDefaultMonthlyIncomeExists = useCallback(async (year: number, month: number) => {
    if (!userEmail || !defaultMonthlyIncomeData || !defaultMonthlyIncomeData.source || defaultMonthlyIncomeData.amount <= 0) {
      return;
    }
    
    // Verifica no estado local (que é sincronizado com o Firestore)
    const incomeExistsForMonth = incomeList.some(income => {
      const incomeDate = new Date(income.date);
      return (
        getMonth(incomeDate) === month &&
        getYear(incomeDate) === year &&
        income.source === defaultMonthlyIncomeData.source
      );
    });

    if (!incomeExistsForMonth) {
      const dateForIncome = startOfMonth(new Date(year, month, 1)).toISOString();
      const newIncomeEntry: Omit<Income, "id"> = {
        source: defaultMonthlyIncomeData.source,
        amount: defaultMonthlyIncomeData.amount,
        date: dateForIncome,
      };
      // Adiciona ao Firestore e, por consequência, ao estado local através do addIncome
      await addIncome(newIncomeEntry);
    }
  }, [userEmail, defaultMonthlyIncomeData, incomeList, addIncome]);

  const getTotalIncome = useCallback((filter?: { month: number; year: number }) => {
    if (!userEmail) return 0;
    let incomesToConsider = incomeList;
    if (filter && typeof filter.month === 'number' && typeof filter.year === 'number') {
      incomesToConsider = incomeList.filter(income => {
        const incomeDate = new Date(income.date); // A data no estado já é ISO string
        return getMonth(incomeDate) === filter.month && getYear(incomeDate) === filter.year;
      });
    }
    return incomesToConsider.reduce((sum, income) => sum + income.amount, 0);
  }, [incomeList, userEmail]);

  const getTotalExpenses = useCallback((filter?: { month: number; year: number }) => {
    if (!userEmail) return 0;
    let expensesToConsider = expenseList;
    if (filter && typeof filter.month === 'number' && typeof filter.year === 'number') {
      expensesToConsider = expenseList.filter(expense => {
        const expenseDate = new Date(expense.date); // A data no estado já é ISO string
        return getMonth(expenseDate) === filter.month && getYear(expenseDate) === filter.year;
      });
    }
    return expensesToConsider.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenseList, userEmail]);

  useEffect(() => {
    // Garante que o salário padrão seja verificado para o mês atual ao carregar os dados
    // ou quando o salário padrão muda.
    if (userEmail && defaultMonthlyIncomeData && defaultMonthlyIncomeData.source && defaultMonthlyIncomeData.amount > 0 && !isLoadingData) {
      const today = new Date();
      ensureDefaultMonthlyIncomeExists(getYear(today), getMonth(today));
    }
  }, [userEmail, defaultMonthlyIncomeData, ensureDefaultMonthlyIncomeExists, isLoadingData]);

  // Para uso nos formulários
  type ExpenseFormValues = import("@/components/expenses/expense-form").ExpenseFormValues;


  return {
    incomeList,
    addIncome,
    updateIncome,
    deleteIncome,
    expenseList,
    addExpense, // A função addExpense agora aceita ExpenseFormValues
    updateExpense,
    deleteExpense,
    goalList,
    addGoal,
    updateGoal,
    deleteGoal,
    getTotalIncome,
    getTotalExpenses,
    defaultMonthlyIncome: defaultMonthlyIncomeData,
    setDefaultMonthlyIncome,
    removeDefaultMonthlyIncome,
    ensureDefaultMonthlyIncomeExists,
    isLoadingData, // Exportar o estado de carregamento
  };
}
