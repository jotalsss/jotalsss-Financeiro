import type { LucideIcon } from "lucide-react";
import {
  Home,
  Car,
  Utensils,
  Lightbulb,
  Stethoscope,
  ShoppingBag,
  Clapperboard,
  Landmark,
  PiggyBank,
  MoreHorizontal,
  Briefcase,
  GraduationCap,
  Gift,
  Plane
} from "lucide-react";
import type { ExpenseCategory } from "@/lib/types";

export const expenseCategoryIcons: Record<ExpenseCategory, LucideIcon> = {
  "Housing": Home,
  "Transportation": Car,
  "Food": Utensils,
  "Utilities": Lightbulb,
  "Healthcare": Stethoscope,
  "Personal Spending": ShoppingBag,
  "Entertainment": Clapperboard,
  "Debt Payments": Landmark,
  "Savings": PiggyBank,
  "Other": MoreHorizontal,
};

export const defaultExpenseCategories: ExpenseCategory[] = [
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
];
