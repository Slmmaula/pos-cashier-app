import type {
  Expense,
  Product,
  Settings,
  Transaction,
  User,
} from "@/lib/types";

export type DemoDb = {
  version: number;
  products: Product[];
  transactions: Transaction[];
  expenses: Expense[];
  settings: Settings;
  users: User[];
  orderCounters: Record<string, number>;
};

export const DEMO_DB_VERSION = 1;

export const DEMO_STORE_NAME = "Xyz Caffe & Resto";
