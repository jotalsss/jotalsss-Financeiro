
"use client";

import type { Income, Expense, Goal } from "@/lib/types";
import { useState, useEffect, useCallback } from "react";

function useLocalStorageState<T>(key: string, defaultValue: T) {
  const [state, setState] = useState<T>(() => {
    // Lazy initializer: runs only on initial mount
    if (typeof window === 'undefined') {
      return defaultValue;
    }
    try {
      const storedValue = localStorage.getItem(key);
      if (storedValue) {
        return JSON.parse(storedValue) as T;
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}" on init:`, error);
    }
    return defaultValue;
  });

  // Effect to save state to localStorage when it changes
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error(`Error writing localStorage key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState] as const;
}

export function useFinancialData() {
  const [incomeList, setIncomeList] = useLocalStorageState<Income[]>("realwise_income", []);
  const [expenseList, setExpenseList] = useLocalStorageState<Expense[]>("realwise_expenses", []);
  const [goalList, setGoalList] = useLocalStorageState<Goal[]>("realwise_goals", []);

  const addIncome = useCallback((income: Omit<Income, "id">) => {
    setIncomeList((prev) => [...prev, { ...income, id: crypto.randomUUID() }]);
  }, [setIncomeList]);

  const updateIncome = useCallback((updatedIncome: Income) => {
    setIncomeList((prev) => prev.map((inc) => (inc.id === updatedIncome.id ? updatedIncome : inc)));
  }, [setIncomeList]);

  const deleteIncome = useCallback((id: string) => {
    setIncomeList((prev) => prev.filter((inc) => inc.id !== id));
  }, [setIncomeList]);

  const addExpense = useCallback((expense: Omit<Expense, "id">) => {
    setExpenseList((prev) => [...prev, { ...expense, id: crypto.randomUUID() }]);
  }, [setExpenseList]);

  const updateExpense = useCallback((updatedExpense: Expense) => {
    setExpenseList((prev) => prev.map((exp) => (exp.id === updatedExpense.id ? updatedExpense : exp)));
  }, [setExpenseList]);

  const deleteExpense = useCallback((id: string) => {
    setExpenseList((prev) => prev.filter((exp) => exp.id !== id));
  }, [setExpenseList]);

  const addGoal = useCallback((goal: Omit<Goal, "id">) => {
    setGoalList((prev) => [...prev, { ...goal, id: crypto.randomUUID() }]);
  }, [setGoalList]);

  const updateGoal = useCallback((updatedGoal: Goal) => {
    setGoalList((prev) => prev.map((g) => (g.id === updatedGoal.id ? updatedGoal : g)));
  }, [setGoalList]);

  const deleteGoal = useCallback((id: string) => {
    setGoalList((prev) => prev.filter((g) => g.id !== id));
  }, [setGoalList]);
  
  const getTotalIncome = useCallback(() => {
    return incomeList.reduce((sum, income) => sum + income.amount, 0);
  }, [incomeList]);

  const getTotalExpenses = useCallback(() => {
    return expenseList.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenseList]);

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
  };
}
