
"use client";

import type { Income, Expense, Goal, DefaultMonthlyIncome } from "@/lib/types";
import { useState, useEffect, useCallback } from "react";
import { getMonth, getYear, startOfMonth } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

// Helper function para localStorage, agora usando userId (que será o Firebase UID)
function useLocalStorageState<T>(key: string, defaultValue: T, userId: string | null) {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined' || !userId) {
      return defaultValue;
    }
    // Se um novo usuário logar, queremos que ele comece com o defaultValue,
    // não com os dados do usuário anterior se a chave base for a mesma.
    // A compositeKey já resolve isso.
    try {
      const compositeKey = `${key}_${userId}`;
      const storedValue = localStorage.getItem(compositeKey);
      if (storedValue) {
        return JSON.parse(storedValue) as T;
      }
    } catch (error) {
      // console.error(`Error reading localStorage key "${compositeKey}" on init:`, error);
    }
    return defaultValue;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !userId) {
      // Se o usuário deslogar (userId se torna null), não limpar o localStorage aqui.
      // A lógica de carregamento inicial de useState já lida com a troca de usuário.
      return;
    }
    try {
      const compositeKey = `${key}_${userId}`;
      localStorage.setItem(compositeKey, JSON.stringify(state));
    } catch (error) {
      // console.error(`Error writing localStorage key "${compositeKey}":`, error);
    }
  }, [key, state, userId]);

  // Efeito para resetar o estado para o defaultValue quando o userId muda para null (logout)
  // ou quando muda para um novo userId.
  useEffect(() => {
    if (typeof window !== 'undefined' && userId) {
        // Quando o userId muda (novo login), precisamos recarregar do localStorage ou usar defaultValue
        // A inicialização do useState já faz isso ao usar o `userId` na compositeKey.
        // Se quiséssemos forçar uma releitura aqui:
        try {
            const compositeKey = `${key}_${userId}`;
            const storedValue = localStorage.getItem(compositeKey);
            if (storedValue) {
                setState(JSON.parse(storedValue) as T);
            } else {
                setState(defaultValue);
            }
        } catch (error) {
            setState(defaultValue);
        }
    } else if (typeof window !== 'undefined' && !userId) {
        // Usuário deslogou
        setState(defaultValue);
    }
  }, [userId, key, defaultValue]);


  return [state, setState] as const;
}

export function useFinancialData() {
  const { currentUser } = useAuth();
  const userId = currentUser ? currentUser.uid : null; // Usar Firebase UID

  const [incomeList, setIncomeList] = useLocalStorageState<Income[]>("realwise_income", [], userId);
  const [expenseList, setExpenseList] = useLocalStorageState<Expense[]>("realwise_expenses", [], userId);
  const [goalList, setGoalList] = useLocalStorageState<Goal[]>("realwise_goals", [], userId);
  const [defaultMonthlyIncomeData, setDefaultMonthlyIncomeInternal] = useLocalStorageState<DefaultMonthlyIncome | null>("realwise_default_monthly_income", null, userId);

  const addIncome = useCallback((income: Omit<Income, "id">) => {
    if (!userId) return;
    setIncomeList((prev) => [...prev, { ...income, id: crypto.randomUUID() }]);
  }, [setIncomeList, userId]);

  const updateIncome = useCallback((updatedIncome: Income) => {
    if (!userId) return;
    setIncomeList((prev) => prev.map((inc) => (inc.id === updatedIncome.id ? updatedIncome : inc)));
  }, [setIncomeList, userId]);

  const deleteIncome = useCallback((id: string) => {
    if (!userId) return;
    setIncomeList((prev) => prev.filter((inc) => inc.id !== id));
  }, [setIncomeList, userId]);

  const addExpense = useCallback((expense: Omit<Expense, "id">) => {
    if (!userId) return;
    setExpenseList((prev) => [...prev, { ...expense, id: crypto.randomUUID() }]);
  }, [setExpenseList, userId]);

  const updateExpense = useCallback((updatedExpense: Expense) => {
    if (!userId) return;
    setExpenseList((prev) => prev.map((exp) => (exp.id === updatedExpense.id ? updatedExpense : exp)));
  }, [setExpenseList, userId]);

  const deleteExpense = useCallback((id: string) => {
    if (!userId) return;
    setExpenseList((prev) => prev.filter((exp) => exp.id !== id));
  }, [setExpenseList, userId]);

  const addGoal = useCallback((goal: Omit<Goal, "id">) => {
    if (!userId) return;
    setGoalList((prev) => [...prev, { ...goal, id: crypto.randomUUID() }]);
  }, [setGoalList, userId]);

  const updateGoal = useCallback((updatedGoal: Goal) => {
    if (!userId) return;
    setGoalList((prev) => prev.map((g) => (g.id === updatedGoal.id ? updatedGoal : g)));
  }, [setGoalList, userId]);

  const deleteGoal = useCallback((id: string) => {
    if (!userId) return;
    setGoalList((prev) => prev.filter((g) => g.id !== id));
  }, [setGoalList, userId]);

  const ensureDefaultMonthlyIncomeExists = useCallback((year: number, month: number) => {
    if (!userId || !defaultMonthlyIncomeData || !defaultMonthlyIncomeData.source || defaultMonthlyIncomeData.amount <= 0) {
      return;
    }
    
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
      setIncomeList((prev) => [...prev, { 
        id: crypto.randomUUID(), 
        source: defaultMonthlyIncomeData.source, 
        amount: defaultMonthlyIncomeData.amount, 
        date: dateForIncome 
      }]);
    }
  }, [defaultMonthlyIncomeData, incomeList, userId, setIncomeList]); // Removido addIncome, usando setIncomeList diretamente
  
  const getTotalIncome = useCallback((filter?: { month: number; year: number }) => {
    if (!userId) return 0;
    
    // A chamada para ensureDefaultMonthlyIncomeExists foi movida para um useEffect abaixo
    // para evitar chamadas dentro de uma função que é usada durante o render.
    
    let incomesToConsider = incomeList;
    if (filter && typeof filter.month === 'number' && typeof filter.year === 'number') {
      incomesToConsider = incomeList.filter(income => {
        const incomeDate = new Date(income.date);
        return getMonth(incomeDate) === filter.month && getYear(incomeDate) === filter.year;
      });
    }
    return incomesToConsider.reduce((sum, income) => sum + income.amount, 0);
  }, [incomeList, userId]); // Removido ensureDefaultMonthlyIncomeExists

  const getTotalExpenses = useCallback((filter?: { month: number; year: number }) => {
    if (!userId) return 0;
    let expensesToConsider = expenseList;
    if (filter && typeof filter.month === 'number' && typeof filter.year === 'number') {
      expensesToConsider = expenseList.filter(expense => {
        const expenseDate = new Date(expense.date);
        return getMonth(expenseDate) === filter.month && getYear(expenseDate) === filter.year;
      });
    }
    return expensesToConsider.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenseList, userId]);

  const setDefaultMonthlyIncome = useCallback((income: DefaultMonthlyIncome) => {
    if (!userId) return;
    setDefaultMonthlyIncomeInternal(income);
    // A lógica de ensureDefaultMonthlyIncomeExists será acionada pelo useEffect abaixo.
  }, [setDefaultMonthlyIncomeInternal, userId]);

  const removeDefaultMonthlyIncome = useCallback(() => {
    if (!userId) return;
    setDefaultMonthlyIncomeInternal(null);
  }, [setDefaultMonthlyIncomeInternal, userId]);

  useEffect(() => {
    // Garante o salário padrão para o mês atual APENAS quando o usuário está logado
    // e os dados do salário padrão existem.
    if (userId && defaultMonthlyIncomeData && defaultMonthlyIncomeData.source && defaultMonthlyIncomeData.amount > 0) {
      const today = new Date();
      ensureDefaultMonthlyIncomeExists(getYear(today), getMonth(today));
    }
  }, [userId, defaultMonthlyIncomeData, ensureDefaultMonthlyIncomeExists]);

  return {
    incomeList,
    addIncome,
    updateIncome,
    deleteIncome,
    expenseList,
    addExpense,
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
    ensureDefaultMonthlyIncomeExists // Mantido caso seja necessário chamar externamente
  };
}
