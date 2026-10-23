import { create } from "zustand";
import {
  createExpense,
  fetchExpenses,
  removeExpense,
  saveExpense,
  type ExpenseInput,
} from "@/lib/db/expenses";
import {
  createProduct,
  fetchProducts,
  removeProduct,
  saveProduct,
  type ProductInput,
} from "@/lib/db/products";
import {
  fetchSettings,
  saveSettings,
  type SettingsPatch,
} from "@/lib/db/settings";
import {
  checkoutTransaction,
  fetchTransactions,
  type CheckoutParams,
} from "@/lib/db/transactions";
import { DEFAULT_TRX_FORMAT } from "@/lib/order";
import type { Expense, Product, Settings, Transaction } from "@/lib/types";
import { useAuthStore } from "./auth-store";

export type { ProductInput, ExpenseInput, SettingsPatch };

export type ActionResult = { ok: true } | { ok: false; error: string };

export type CheckoutInput = CheckoutParams;

export type CheckoutResult =
  | { ok: true; transaction: Transaction }
  | { ok: false; error: string };

export type DataStatus = "idle" | "loading" | "ready" | "error";

type AppData = {
  products: Product[];
  transactions: Transaction[];
  expenses: Expense[];
  settings: Settings;
};

type AppState = AppData & {
  hydrated: boolean;
  dataStatus: DataStatus;

  loadData: () => Promise<void>;
  unloadData: () => void;

  addProduct: (input: ProductInput) => Promise<ActionResult>;
  updateProduct: (id: string, input: ProductInput) => Promise<ActionResult>;
  deleteProduct: (id: string) => Promise<ActionResult>;

  checkout: (input: CheckoutInput) => Promise<CheckoutResult>;

  addExpense: (input: ExpenseInput) => Promise<ActionResult>;
  updateExpense: (id: string, input: ExpenseInput) => Promise<ActionResult>;
  deleteExpense: (id: string) => Promise<ActionResult>;

  updateSettings: (patch: SettingsPatch) => Promise<ActionResult>;
};

const EMPTY_SETTINGS: Settings = {
  storeName: "",
  address: "",
  phone: "",
  whatsapp: "",
  npwp: "",
  logo: null,
  ppnDefault: true,
  ppnRate: 11,
  maxDiscount: 50,
  rounding: "none",
  trxFormat: DEFAULT_TRX_FORMAT,
  resetPeriod: "daily",
  paperSize: "88mm",
  margin: 5,
  autoPrint: true,
};

function preloadLogo(settings: Settings): void {
  if (typeof window === "undefined" || !settings.logo) return;
  const img = new window.Image();
  img.src = settings.logo.dataUrl;
}

const PRODUCT_NOT_FOUND = "Barang tidak ditemukan";
const EXPENSE_NOT_FOUND = "Pengeluaran tidak ditemukan";
const SESSION_ENDED = "Sesi berakhir. Silakan login ulang.";

export const useAppStore = create<AppState>()((set, get) => ({
  products: [],
  transactions: [],
  expenses: [],
  settings: EMPTY_SETTINGS,
  hydrated: true,
  dataStatus: "idle",

  loadData: async () => {
    const current = get().dataStatus;
    if (current === "loading" || current === "ready") return;

    set({ dataStatus: "loading" });
    try {
      const isOwner = useAuthStore.getState().profile?.role === "Owner";
      const [products, transactions, settings, expenses] = await Promise.all([
        fetchProducts(),
        fetchTransactions(),
        fetchSettings(),
        isOwner ? fetchExpenses() : Promise.resolve([] as Expense[]),
      ]);
      preloadLogo(settings);
      set({ products, transactions, expenses, settings, dataStatus: "ready" });
    } catch {
      set({ dataStatus: "error" });
    }
  },

  unloadData: () =>
    set({
      products: [],
      transactions: [],
      expenses: [],
      settings: EMPTY_SETTINGS,
      dataStatus: "idle",
    }),

  addProduct: async (input) => {
    const result = await createProduct(input);
    if (!result.ok) return { ok: false, error: result.error };
    set((state) => ({ products: [...state.products, result.data] }));
    return { ok: true };
  },

  updateProduct: async (id, input) => {
    const existing = get().products.find((p) => p.id === id);
    if (!existing) return { ok: false, error: PRODUCT_NOT_FOUND };

    const result = await saveProduct(existing, input);
    if (!result.ok) return { ok: false, error: result.error };
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? result.data : p)),
    }));
    return { ok: true };
  },

  deleteProduct: async (id) => {
    const existing = get().products.find((p) => p.id === id);
    if (!existing) return { ok: false, error: PRODUCT_NOT_FOUND };

    const result = await removeProduct(existing);
    if (!result.ok) return { ok: false, error: result.error };
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    }));
    return { ok: true };
  },

  checkout: async (input) => {
    const customerName = input.customerName.trim();
    if (!customerName) {
      return { ok: false, error: "Nama customer wajib diisi" };
    }
    if (input.items.length === 0) {
      return { ok: false, error: "Keranjang masih kosong" };
    }

    const result = await checkoutTransaction({ ...input, customerName });
    if (!result.ok) return { ok: false, error: result.error };

    const transaction = result.data;
    const sold = new Map<string, number>();
    transaction.items.forEach((item) => {
      sold.set(item.productId, (sold.get(item.productId) ?? 0) + item.qty);
    });

    set((state) => ({
      products: state.products.map((p) => {
        const qty = sold.get(p.id);
        return qty ? { ...p, stock: p.stock - qty } : p;
      }),
      transactions: [...state.transactions, transaction],
    }));

    return { ok: true, transaction };
  },

  addExpense: async (input) => {
    const profile = useAuthStore.getState().profile;
    if (!profile) return { ok: false, error: SESSION_ENDED };

    const result = await createExpense(input, {
      id: profile.id,
      name: profile.name,
    });
    if (!result.ok) return { ok: false, error: result.error };
    set((state) => ({ expenses: [...state.expenses, result.data] }));
    return { ok: true };
  },

  updateExpense: async (id, input) => {
    const existing = get().expenses.find((e) => e.id === id);
    if (!existing) return { ok: false, error: EXPENSE_NOT_FOUND };

    const result = await saveExpense(existing, input);
    if (!result.ok) return { ok: false, error: result.error };
    set((state) => ({
      expenses: state.expenses.map((e) => (e.id === id ? result.data : e)),
    }));
    return { ok: true };
  },

  deleteExpense: async (id) => {
    const existing = get().expenses.find((e) => e.id === id);
    if (!existing) return { ok: false, error: EXPENSE_NOT_FOUND };

    const result = await removeExpense(existing);
    if (!result.ok) return { ok: false, error: result.error };
    set((state) => ({
      expenses: state.expenses.filter((e) => e.id !== id),
    }));
    return { ok: true };
  },

  updateSettings: async (patch) => {
    const result = await saveSettings(get().settings, patch);
    if (!result.ok) return { ok: false, error: result.error };
    preloadLogo(result.data);
    set({ settings: result.data });
    return { ok: true };
  },
}));
