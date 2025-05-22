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
  "Moradia": Home,
  "Transporte": Car,
  "Alimentação": Utensils,
  "Contas de Casa": Lightbulb,
  "Saúde": Stethoscope,
  "Despesas Pessoais": ShoppingBag,
  "Lazer": Clapperboard,
  "Pagamento de Dívidas": Landmark,
  "Economias": PiggyBank,
  "Outros": MoreHorizontal,
};

export const defaultExpenseCategories: ExpenseCategory[] = [
  "Moradia",
  "Transporte",
  "Alimentação",
  "Contas de Casa",
  "Saúde",
  "Despesas Pessoais",
  "Lazer",
  "Pagamento de Dívidas",
  "Economias",
  "Outros",
];
