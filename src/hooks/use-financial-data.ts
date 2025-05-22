
"use client";

import type { Income, Expense, Goal, DefaultMonthlyIncome } from "@/lib/types";
import { useState, useEffect, useCallback } from "react";
import { getMonth, getYear, startOfMonth } from "date-fns";

function useLocalStorageState<T>(key: string, defaultValue: T) {
  const [state, setState] = useState<T>(() => {
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
  const [defaultMonthlyIncome, setDefaultMonthlyIncomeState] = useLocalStorageState<DefaultMonthlyIncome | null>("realwise_default_monthly_income", null);

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

  const ensureDefaultMonthlyIncomeExists = useCallback((year: number, month: number) => {
    if (defaultMonthlyIncome && defaultMonthlyIncome.source && defaultMonthlyIncome.amount > 0) {
      const incomeExistsForMonth = incomeList.some(income => {
        const incomeDate = new Date(income.date);
        return (
          getMonth(incomeDate) === month &&
          getYear(incomeDate) === year &&
          income.source === defaultMonthlyIncome.source
        );
      });

      if (!incomeExistsForMonth) {
        const dateForIncome = startOfMonth(new Date(year, month, 1)).toISOString();
        addIncome({
          source: defaultMonthlyIncome.source,
          amount: defaultMonthlyIncome.amount,
          date: dateForIncome,
        });
      }
    }
  }, [defaultMonthlyIncome, incomeList, addIncome]);
  
  const getTotalIncome = useCallback((filter?: { month: number; year: number }) => {
    if (filter && typeof filter.month === 'number' && typeof filter.year === 'number') {
      ensureDefaultMonthlyIncomeExists(filter.year, filter.month);
    }
    
    let incomesToConsider = incomeList;
    if (filter && typeof filter.month === 'number' && typeof filter.year === 'number') {
      incomesToConsider = incomeList.filter(income => {
        const incomeDate = new Date(income.date);
        return getMonth(incomeDate) === filter.month && getYear(incomeDate) === filter.year;
      });
    }
    return incomesToConsider.reduce((sum, income) => sum + income.amount, 0);
  }, [incomeList, ensureDefaultMonthlyIncomeExists]);

  const getTotalExpenses = useCallback((filter?: { month: number; year: number }) => {
    let expensesToConsider = expenseList;
    if (filter && typeof filter.month === 'number' && typeof filter.year === 'number') {
      expensesToConsider = expenseList.filter(expense => {
        const expenseDate = new Date(expense.date);
        return getMonth(expenseDate) === filter.month && getYear(expenseDate) === filter.year;
      });
    }
    return expensesToConsider.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenseList]);

  const setDefaultMonthlyIncome = useCallback((income: DefaultMonthlyIncome) => {
    setDefaultMonthlyIncomeState(income);
    // Ao definir um novo salário padrão, podemos garantir que ele exista para o mês atual.
    const today = new Date();
    ensureDefaultMonthlyIncomeExists(getYear(today), getMonth(today));
  }, [setDefaultMonthlyIncomeState, ensureDefaultMonthlyIncomeExists]);

  const removeDefaultMonthlyIncome = useCallback(() => {
    setDefaultMonthlyIncomeState(null);
  }, [setDefaultMonthlyIncomeState]);

  // Efeito para garantir que o salário padrão do mês atual seja verificado no carregamento inicial
  useEffect(() => {
    const today = new Date();
    ensureDefaultMonthlyIncomeExists(getYear(today), getMonth(today));
  }, [ensureDefaultMonthlyIncomeExists]);


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
    defaultMonthlyIncome,
    setDefaultMonthlyIncome,
    removeDefaultMonthlyIncome,
    ensureDefaultMonthlyIncomeExists
  };
}
