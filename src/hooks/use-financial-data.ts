
"use client";

import type { Income, Expense, Goal, DefaultMonthlyIncome } from "@/lib/types";
import { useState, useEffect, useCallback } from "react";
import { getMonth, getYear, startOfMonth } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

// Helper function para localStorage, agora usando o email do usuário (simulado)
function useLocalStorageState<T>(key: string, defaultValue: T, userEmail: string | null) {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined' || !userEmail) {
      return defaultValue;
    }
    try {
      const compositeKey = `${key}_${userEmail.toLowerCase()}`; // Usa email para chavear
      const storedValue = localStorage.getItem(compositeKey);
      if (storedValue) {
        return JSON.parse(storedValue) as T;
      }
    } catch (error) {
      // console.error(`Error reading localStorage key "${key}_${userEmail}" on init:`, error);
    }
    return defaultValue;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !userEmail) {
      return;
    }
    try {
      const compositeKey = `${key}_${userEmail.toLowerCase()}`;
      localStorage.setItem(compositeKey, JSON.stringify(state));
    } catch (error) {
      // console.error(`Error writing localStorage key "${compositeKey}":`, error);
    }
  }, [key, state, userEmail]);

  useEffect(() => {
    if (typeof window !== 'undefined' && userEmail) {
        try {
            const compositeKey = `${key}_${userEmail.toLowerCase()}`;
            const storedValue = localStorage.getItem(compositeKey);
            if (storedValue) {
                setState(JSON.parse(storedValue) as T);
            } else {
                setState(defaultValue);
            }
        } catch (error) {
            setState(defaultValue);
        }
    } else if (typeof window !== 'undefined' && !userEmail) {
        setState(defaultValue);
    }
  }, [userEmail, key, defaultValue]);


  return [state, setState] as const;
}

export function useFinancialData() {
  const { currentUser } = useAuth();
  const userEmail = currentUser ? currentUser.email : null; // Usar e-mail do usuário simulado

  const [incomeList, setIncomeList] = useLocalStorageState<Income[]>("realwise_income", [], userEmail);
  const [expenseList, setExpenseList] = useLocalStorageState<Expense[]>("realwise_expenses", [], userEmail);
  const [goalList, setGoalList] = useLocalStorageState<Goal[]>("realwise_goals", [], userEmail);
  const [defaultMonthlyIncomeData, setDefaultMonthlyIncomeInternal] = useLocalStorageState<DefaultMonthlyIncome | null>("realwise_default_monthly_income", null, userEmail);

  const addIncome = useCallback((income: Omit<Income, "id">) => {
    if (!userEmail) return;
    setIncomeList((prev) => [...prev, { ...income, id: crypto.randomUUID() }]);
  }, [setIncomeList, userEmail]);

  const updateIncome = useCallback((updatedIncome: Income) => {
    if (!userEmail) return;
    setIncomeList((prev) => prev.map((inc) => (inc.id === updatedIncome.id ? updatedIncome : inc)));
  }, [setIncomeList, userEmail]);

  const deleteIncome = useCallback((id: string) => {
    if (!userEmail) return;
    setIncomeList((prev) => prev.filter((inc) => inc.id !== id));
  }, [setIncomeList, userEmail]);

  const addExpense = useCallback((expense: Omit<Expense, "id">) => {
    if (!userEmail) return;
    setExpenseList((prev) => [...prev, { ...expense, id: crypto.randomUUID() }]);
  }, [setExpenseList, userEmail]);

  const updateExpense = useCallback((updatedExpense: Expense) => {
    if (!userEmail) return;
    setExpenseList((prev) => prev.map((exp) => (exp.id === updatedExpense.id ? updatedExpense : exp)));
  }, [setExpenseList, userEmail]);

  const deleteExpense = useCallback((id: string) => {
    if (!userEmail) return;
    setExpenseList((prev) => prev.filter((exp) => exp.id !== id));
  }, [setExpenseList, userEmail]);

  const addGoal = useCallback((goal: Omit<Goal, "id">) => {
    if (!userEmail) return;
    setGoalList((prev) => [...prev, { ...goal, id: crypto.randomUUID() }]);
  }, [setGoalList, userEmail]);

  const updateGoal = useCallback((updatedGoal: Goal) => {
    if (!userEmail) return;
    setGoalList((prev) => prev.map((g) => (g.id === updatedGoal.id ? updatedGoal : g)));
  }, [setGoalList, userEmail]);

  const deleteGoal = useCallback((id: string) => {
    if (!userEmail) return;
    setGoalList((prev) => prev.filter((g) => g.id !== id));
  }, [setGoalList, userEmail]);

  const ensureDefaultMonthlyIncomeExists = useCallback((year: number, month: number) => {
    if (!userEmail || !defaultMonthlyIncomeData || !defaultMonthlyIncomeData.source || defaultMonthlyIncomeData.amount <= 0) {
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
  }, [defaultMonthlyIncomeData, incomeList, userEmail, setIncomeList]);
  
  const getTotalIncome = useCallback((filter?: { month: number; year: number }) => {
    if (!userEmail) return 0;
        
    let incomesToConsider = incomeList;
    if (filter && typeof filter.month === 'number' && typeof filter.year === 'number') {
      incomesToConsider = incomeList.filter(income => {
        const incomeDate = new Date(income.date);
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
        const expenseDate = new Date(expense.date);
        return getMonth(expenseDate) === filter.month && getYear(expenseDate) === filter.year;
      });
    }
    return expensesToConsider.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenseList, userEmail]);

  const setDefaultMonthlyIncome = useCallback((income: DefaultMonthlyIncome) => {
    if (!userEmail) return;
    setDefaultMonthlyIncomeInternal(income);
  }, [setDefaultMonthlyIncomeInternal, userEmail]);

  const removeDefaultMonthlyIncome = useCallback(() => {
    if (!userEmail) return;
    setDefaultMonthlyIncomeInternal(null);
  }, [setDefaultMonthlyIncomeInternal, userEmail]);

  useEffect(() => {
    if (userEmail && defaultMonthlyIncomeData && defaultMonthlyIncomeData.source && defaultMonthlyIncomeData.amount > 0) {
      const today = new Date();
      ensureDefaultMonthlyIncomeExists(getYear(today), getMonth(today));
    }
  }, [userEmail, defaultMonthlyIncomeData, ensureDefaultMonthlyIncomeExists]);

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
