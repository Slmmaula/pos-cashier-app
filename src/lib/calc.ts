import type {
  DiscountType,
  Rounding,
  Transaction,
  TransactionItem,
} from "./types";

export type TotalsInput = {
  subtotal: number;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountPercent: number;
  ppnEnabled: boolean;
  ppnRate: number;
  rounding: Rounding;
};

export type Totals = {
  subtotal: number;
  discountAmount: number;
  taxable: number;
  ppnAmount: number;
  roundingAmount: number;
  total: number;
};

function roundingStep(rounding: Rounding): number {
  return rounding === "none" ? 0 : Number(rounding);
}

export function computeTotals(input: TotalsInput): Totals {
  const subtotal = Math.max(0, Math.round(input.subtotal));

  const maxPercent = Math.min(100, Math.max(0, input.maxDiscountPercent));
  const cap = Math.round((subtotal * maxPercent) / 100);

  const rawDiscount =
    input.discountType === "percent"
      ? Math.round((subtotal * Math.max(0, input.discountValue)) / 100)
      : Math.max(0, Math.round(input.discountValue));

  const discountAmount = Math.min(rawDiscount, cap, subtotal);
  const taxable = subtotal - discountAmount;
  const ppnAmount = input.ppnEnabled
    ? Math.round((taxable * input.ppnRate) / 100)
    : 0;

  const beforeRounding = taxable + ppnAmount;
  const step = roundingStep(input.rounding);
  const total =
    step > 0 ? Math.round(beforeRounding / step) * step : beforeRounding;

  return {
    subtotal,
    discountAmount,
    taxable,
    ppnAmount,
    roundingAmount: total - beforeRounding,
    total,
  };
}

export function itemsSubtotal(
  items: Pick<TransactionItem, "price" | "qty">[],
): number {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

export function totalQty(items: Pick<TransactionItem, "qty">[]): number {
  return items.reduce((sum, item) => sum + item.qty, 0);
}

export function transactionProfit(transaction: Transaction): number {
  const cogs = transaction.items.reduce(
    (sum, item) => sum + item.cost * item.qty,
    0,
  );
  return transaction.subtotal - transaction.discountAmount - cogs;
}
