export interface Income {
  id: string;
  source: string;
  amount: number;
  date: string; // ISO string
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string; // ISO string
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string; // Optional ISO string
}

export const ExpenseCategories = [
  "Housing",
  "Transportation",
  "Food",
  "Utilities",
  "Healthcare",
  "Personal Spending",
  "Entertainment",
  "Debt Payments",
  "Savings",
  "Other",
] as const;

export type ExpenseCategory = typeof ExpenseCategories[number];
