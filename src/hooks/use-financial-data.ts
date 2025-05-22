
"use client";

import type { Income, Expense, Goal, DefaultMonthlyIncome } from "@/lib/types";
import { useState, useEffect, useCallback } from "react";
import { getMonth, getYear, startOfMonth } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

// Helper function para localStorage, agora usando userId
function useLocalStorageState<T>(key: string, defaultValue: T, userId: string | null) {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined' || !userId) {
      return defaultValue;
    }
    try {
      const compositeKey = `${key}_${userId}`;
      const storedValue = localStorage.getItem(compositeKey);
      if (storedValue) {
        return JSON.parse(storedValue) as T;
      }
    } catch (error) {
      // console.error(`Error reading localStorage key "${key}_${userId}" on init:`, error);
    }
    return defaultValue;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !userId) {
      return;
    }
    try {
      const compositeKey = `${key}_${userId}`;
      localStorage.setItem(compositeKey, JSON.stringify(state));
    } catch (error) {
      // console.error(`Error writing localStorage key "${key}_${userId}":`, error);
    }
  }, [key, state, userId]);

  return [state, setState] as const;
}

export function useFinancialData() {
  const { currentUser } = useAuth();

  const [incomeList, setIncomeList] = useLocalStorageState<Income[]>("realwise_income", [], currentUser);
  const [expenseList, setExpenseList] = useLocalStorageState<Expense[]>("realwise_expenses", [], currentUser);
  const [goalList, setGoalList] = useLocalStorageState<Goal[]>("realwise_goals", [], currentUser);
  const [defaultMonthlyIncomeData, setDefaultMonthlyIncomeInternal] = useLocalStorageState<DefaultMonthlyIncome | null>("realwise_default_monthly_income", null, currentUser);

  const addIncome = useCallback((income: Omit<Income, "id">) => {
    if (!currentUser) return;
    setIncomeList((prev) => [...prev, { ...income, id: crypto.randomUUID() }]);
  }, [setIncomeList, currentUser]);

  const updateIncome = useCallback((updatedIncome: Income) => {
    if (!currentUser) return;
    setIncomeList((prev) => prev.map((inc) => (inc.id === updatedIncome.id ? updatedIncome : inc)));
  }, [setIncomeList, currentUser]);

  const deleteIncome = useCallback((id: string) => {
    if (!currentUser) return;
    setIncomeList((prev) => prev.filter((inc) => inc.id !== id));
  }, [setIncomeList, currentUser]);

  const addExpense = useCallback((expense: Omit<Expense, "id">) => {
    if (!currentUser) return;
    setExpenseList((prev) => [...prev, { ...expense, id: crypto.randomUUID() }]);
  }, [setExpenseList, currentUser]);

  const updateExpense = useCallback((updatedExpense: Expense) => {
    if (!currentUser) return;
    setExpenseList((prev) => prev.map((exp) => (exp.id === updatedExpense.id ? updatedExpense : exp)));
  }, [setExpenseList, currentUser]);

  const deleteExpense = useCallback((id: string) => {
    if (!currentUser) return;
    setExpenseList((prev) => prev.filter((exp) => exp.id !== id));
  }, [setExpenseList, currentUser]);

  const addGoal = useCallback((goal: Omit<Goal, "id">) => {
    if (!currentUser) return;
    setGoalList((prev) => [...prev, { ...goal, id: crypto.randomUUID() }]);
  }, [setGoalList, currentUser]);

  const updateGoal = useCallback((updatedGoal: Goal) => {
    if (!currentUser) return;
    setGoalList((prev) => prev.map((g) => (g.id === updatedGoal.id ? updatedGoal : g)));
  }, [setGoalList, currentUser]);

  const deleteGoal = useCallback((id: string) => {
    if (!currentUser) return;
    setGoalList((prev) => prev.filter((g) => g.id !== id));
  }, [setGoalList, currentUser]);

  const ensureDefaultMonthlyIncomeExists = useCallback((year: number, month: number) => {
    if (!currentUser || !defaultMonthlyIncomeData || !defaultMonthlyIncomeData.source || defaultMonthlyIncomeData.amount <= 0) {
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
      // Use a non-hook version of addIncome or directly set state if needed to avoid dependency issues
      setIncomeList((prev) => [...prev, { 
        id: crypto.randomUUID(), 
        source: defaultMonthlyIncomeData.source, 
        amount: defaultMonthlyIncomeData.amount, 
        date: dateForIncome 
      }]);
    }
  }, [defaultMonthlyIncomeData, incomeList, addIncome, currentUser, setIncomeList]);
  
  const getTotalIncome = useCallback((filter?: { month: number; year: number }) => {
    if (!currentUser) return 0;
    
    if (filter && typeof filter.month === 'number' && typeof filter.year === 'number') {
      // Chamada síncrona para ensureDefaultMonthlyIncomeExists pode ser problemática se ela disparar setState
      // No entanto, a versão acima de ensureDefaultMonthlyIncomeExists usa setIncomeList diretamente.
    }
    
    let incomesToConsider = incomeList;
    if (filter && typeof filter.month === 'number' && typeof filter.year === 'number') {
      incomesToConsider = incomeList.filter(income => {
        const incomeDate = new Date(income.date);
        return getMonth(incomeDate) === filter.month && getYear(incomeDate) === filter.year;
      });
    }
    return incomesToConsider.reduce((sum, income) => sum + income.amount, 0);
  }, [incomeList, ensureDefaultMonthlyIncomeExists, currentUser]);

  const getTotalExpenses = useCallback((filter?: { month: number; year: number }) => {
    if (!currentUser) return 0;
    let expensesToConsider = expenseList;
    if (filter && typeof filter.month === 'number' && typeof filter.year === 'number') {
      expensesToConsider = expenseList.filter(expense => {
        const expenseDate = new Date(expense.date);
        return getMonth(expenseDate) === filter.month && getYear(expenseDate) === filter.year;
      });
    }
    return expensesToConsider.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenseList, currentUser]);

  const setDefaultMonthlyIncome = useCallback((income: DefaultMonthlyIncome) => {
    if (!currentUser) return;
    setDefaultMonthlyIncomeInternal(income);
    const today = new Date();
    // Chamada síncrona para ensureDefaultMonthlyIncomeExists aqui também
    // ensureDefaultMonthlyIncomeExists(getYear(today), getMonth(today));
  }, [setDefaultMonthlyIncomeInternal, ensureDefaultMonthlyIncomeExists, currentUser]);

  const removeDefaultMonthlyIncome = useCallback(() => {
    if (!currentUser) return;
    setDefaultMonthlyIncomeInternal(null);
  }, [setDefaultMonthlyIncomeInternal, currentUser]);

  useEffect(() => {
    if (currentUser) {
      const today = new Date();
      ensureDefaultMonthlyIncomeExists(getYear(today), getMonth(today));
    }
  }, [currentUser, ensureDefaultMonthlyIncomeExists]); // Adicionado currentUser

  // Se não houver usuário, as listas já estarão vazias devido ao defaultValue e a verificação de !userId em useLocalStorageState
  // E as funções de modificação já têm a guarda `if (!currentUser) return;`
  // As funções getTotal* também.
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
    ensureDefaultMonthlyIncomeExists
  };
}
