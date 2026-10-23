import type { ExpenseCategory } from "./types";

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Listrik",
  "Gaji",
  "Perlengkapan",
  "Sewa",
  "Lainnya",
];

export const EXPENSE_COLORS: Record<ExpenseCategory, string> = {
  Listrik: "#B45309",
  Gaji: "#16A34A",
  Perlengkapan: "#9333EA",
  Sewa: "#2563EB",
  Lainnya: "#6B7280",
};
