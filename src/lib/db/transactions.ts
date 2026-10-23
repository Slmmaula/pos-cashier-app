import { computeTotals, itemsSubtotal } from "@/lib/calc";
import { loadDb, transact } from "@/lib/demo/db";
import { toDateInputValue } from "@/lib/format";
import { uid } from "@/lib/id";
import { makeTrxNo } from "@/lib/order";
import type {
  DiscountType,
  PaymentMethod,
  Transaction,
  TransactionItem,
} from "@/lib/types";
import { useAuthStore } from "@/store/auth-store";
import type { DbResult } from "./products";

const METHODS: PaymentMethod[] = ["Tunai", "QRIS", "Debit"];
const MAX_LINES = 100;

export async function fetchTransactions(): Promise<Transaction[]> {
  return structuredClone(
    [...loadDb().transactions].sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt),
    ),
  );
}

export async function peekNextOrderId(): Promise<number | null> {
  const day = toDateInputValue(new Date());
  return (loadDb().orderCounters[day] ?? 0) + 1;
}

export type CheckoutParams = {
  customerName: string;
  items: { productId: string; qty: number }[];
  discountType: DiscountType;
  discountValue: number;
  ppnEnabled: boolean;
  method: PaymentMethod;
  paid: number;
};

export async function checkoutTransaction(
  params: CheckoutParams,
): Promise<DbResult<Transaction>> {
  const cashier = useAuthStore.getState().profile?.name ?? "Kasir";

  return transact<Transaction>((db) => {
    const now = new Date();
    const customer = params.customerName.trim();

    if (!customer) return { ok: false, error: "Nama customer wajib diisi" };
    if (!METHODS.includes(params.method)) {
      return { ok: false, error: "Metode pembayaran tidak valid" };
    }
    if (
      params.discountType !== "percent" &&
      params.discountType !== "nominal"
    ) {
      return { ok: false, error: "Jenis diskon tidak valid" };
    }
    if (params.items.length === 0 || params.items.length > MAX_LINES) {
      return { ok: false, error: "Keranjang tidak valid" };
    }

    const items: TransactionItem[] = [];
    for (const entry of params.items) {
      const qty = Math.floor(entry.qty);
      if (!Number.isFinite(qty) || qty < 1) {
        return { ok: false, error: "Jumlah barang tidak valid" };
      }

      const product = db.products.find((p) => p.id === entry.productId);
      if (!product) return { ok: false, error: "Barang tidak ditemukan" };
      if (!product.active) {
        return { ok: false, error: `Barang ${product.name} sedang nonaktif` };
      }
      if (product.stock < qty) {
        return {
          ok: false,
          error: `Stok ${product.name} tidak mencukupi (sisa ${product.stock})`,
        };
      }

      product.stock -= qty;
      items.push({
        productId: product.id,
        code: product.code,
        name: product.name,
        qty,
        price: product.sellPrice,
        cost: product.buyPrice,
      });
    }

    const discountValue = Math.max(0, Math.round(params.discountValue));
    const totals = computeTotals({
      subtotal: itemsSubtotal(items),
      discountType: params.discountType,
      discountValue,
      maxDiscountPercent: db.settings.maxDiscount,
      ppnEnabled: params.ppnEnabled,
      ppnRate: db.settings.ppnRate,
      rounding: db.settings.rounding,
    });

    const paid =
      params.method === "Tunai"
        ? Math.max(0, Math.round(params.paid))
        : totals.total;
    if (paid < totals.total) {
      return { ok: false, error: "Jumlah bayar kurang dari total" };
    }

    const day = toDateInputValue(now);
    const orderId = (db.orderCounters[day] ?? 0) + 1;
    db.orderCounters[day] = orderId;

    const transaction: Transaction = {
      id: uid(),
      orderId,
      trxNo: makeTrxNo(now, orderId, db.settings.trxFormat),
      createdAt: now.toISOString(),
      cashier,
      customerName: customer,
      items,
      subtotal: totals.subtotal,
      discountType: params.discountType,
      discountValue,
      discountAmount: totals.discountAmount,
      ppnEnabled: params.ppnEnabled,
      ppnAmount: totals.ppnAmount,
      roundingAmount: totals.roundingAmount,
      total: totals.total,
      method: params.method,
      paid,
      change: paid - totals.total,
      status: "Lunas",
    };

    db.transactions.push(transaction);
    return { ok: true, data: transaction };
  });
}
