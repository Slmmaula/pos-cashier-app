import { create } from "zustand";
import type { DiscountType, PaymentMethod } from "@/lib/types";

export type CartLine = { productId: string; qty: number };

type CartState = {
  lines: CartLine[];
  discountType: DiscountType;
  discountValue: number;
  ppnOverride: boolean | null;
  method: PaymentMethod;

  add: (productId: string, stock: number) => boolean;
  setQty: (productId: string, qty: number, stock: number) => void;
  remove: (productId: string) => void;
  setDiscountType: (type: DiscountType) => void;
  setDiscountValue: (value: number) => void;
  setPpn: (enabled: boolean) => void;
  setMethod: (method: PaymentMethod) => void;
  clear: () => void;
};

const EMPTY = {
  lines: [] as CartLine[],
  discountType: "percent" as DiscountType,
  discountValue: 0,
  ppnOverride: null as boolean | null,
  method: "Tunai" as PaymentMethod,
};

export const useCartStore = create<CartState>((set, get) => ({
  ...EMPTY,

  add: (productId, stock) => {
    const line = get().lines.find((l) => l.productId === productId);
    const current = line?.qty ?? 0;
    if (current >= stock) return false;
    set((state) => ({
      lines: line
        ? state.lines.map((l) =>
            l.productId === productId ? { ...l, qty: l.qty + 1 } : l,
          )
        : [...state.lines, { productId, qty: 1 }],
    }));
    return true;
  },

  setQty: (productId, qty, stock) => {
    const next = Math.max(1, Math.min(qty, stock));
    set((state) => ({
      lines: state.lines.map((l) =>
        l.productId === productId ? { ...l, qty: next } : l,
      ),
    }));
  },

  remove: (productId) =>
    set((state) => ({
      lines: state.lines.filter((l) => l.productId !== productId),
    })),

  setDiscountType: (discountType) => set({ discountType, discountValue: 0 }),
  setDiscountValue: (discountValue) => set({ discountValue }),
  setPpn: (ppnOverride) => set({ ppnOverride }),
  setMethod: (method) => set({ method }),
  clear: () => set({ ...EMPTY }),
}));
