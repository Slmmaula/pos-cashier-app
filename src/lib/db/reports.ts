import type { DayRow, MethodRow, Report } from "@/features/laporan/report-data";
import { transactionProfit } from "@/lib/calc";
import { loadDb } from "@/lib/demo/db";
import { toDateInputValue } from "@/lib/format";
import { inPeriod, type Period } from "@/lib/period";
import type { PaymentMethod } from "@/lib/types";

const METHOD_ORDER: PaymentMethod[] = ["Tunai", "QRIS", "Debit"];

export async function fetchReport(period: Period): Promise<Report> {
  const db = loadDb();
  const trx = db.transactions.filter((t) => inPeriod(t.createdAt, period));
  const exp = db.expenses.filter((e) => inPeriod(e.date, period));

  const byDay = new Map<string, DayRow>();
  const row = (date: string): DayRow => {
    let found = byDay.get(date);
    if (!found) {
      found = { date, revenue: 0, expense: 0 };
      byDay.set(date, found);
    }
    return found;
  };

  trx.forEach((t) => {
    row(toDateInputValue(t.createdAt)).revenue += t.total;
  });
  exp.forEach((e) => {
    row(toDateInputValue(e.date)).expense += e.amount;
  });

  const methods: MethodRow[] = METHOD_ORDER.map((method) => {
    const list = trx.filter((t) => t.method === method);
    return {
      method,
      count: list.length,
      amount: list.reduce((sum, t) => sum + t.total, 0),
    };
  });

  return {
    count: trx.length,
    revenue: trx.reduce((sum, t) => sum + t.total, 0),
    expense: exp.reduce((sum, e) => sum + e.amount, 0),
    profit: trx.reduce((sum, t) => sum + transactionProfit(t), 0),
    days: [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date)),
    methods,
  };
}
