import type { PaymentMethod } from "@/lib/types";

export type DayRow = { date: string; revenue: number; expense: number };
export type MethodRow = {
  method: PaymentMethod;
  count: number;
  amount: number;
};

export type Report = {
  count: number;
  revenue: number;
  expense: number;
  profit: number;
  days: DayRow[];
  methods: MethodRow[];
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

export function parseDayKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function shortDay(key: string): string {
  const [, month, day] = key.split("-").map(Number);
  return `${day} ${MONTHS[month - 1]}`;
}
