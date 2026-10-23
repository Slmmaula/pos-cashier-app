import { create } from "zustand";
import type { Transaction } from "@/lib/types";

type PrintState = {
  transaction: Transaction | null;
  print: (transaction: Transaction) => void;
  clear: () => void;
};

export const usePrintStore = create<PrintState>((set) => ({
  transaction: null,
  print: (transaction) => set({ transaction }),
  clear: () => set({ transaction: null }),
}));
