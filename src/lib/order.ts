import { toDateInputValue } from "./format";
import type { OrderCounter } from "./types";

export const DEFAULT_TRX_FORMAT = "DDMMYY";

function pad(value: number, length: number): string {
  return String(value).padStart(length, "0");
}

export function isValidTrxFormat(format: string): boolean {
  const matched = format.match(/YYYY|YY|DD|MM/g);
  const tokens: string[] = matched ? Array.from(matched) : [];
  const rest = format.replace(/YYYY|YY|DD|MM/g, "");
  const hasYear = tokens.includes("YYYY") || tokens.includes("YY");
  return (
    tokens.length === 3 &&
    tokens.includes("DD") &&
    tokens.includes("MM") &&
    hasYear &&
    /^[-.]*$/.test(rest)
  );
}

export function formatTrxDate(date: Date, format: string): string {
  return format.replace(/YYYY|YY|DD|MM/g, (token) => {
    switch (token) {
      case "YYYY":
        return String(date.getFullYear());
      case "YY":
        return pad(date.getFullYear() % 100, 2);
      case "DD":
        return pad(date.getDate(), 2);
      default:
        return pad(date.getMonth() + 1, 2);
    }
  });
}

export function nextOrderId(counter: OrderCounter, now: Date): number {
  return counter.date === toDateInputValue(now) ? counter.last + 1 : 1;
}

export function formatOrderId(orderId: number): string {
  return `#${pad(orderId, 3)}`;
}

export function makeTrxNo(
  date: Date,
  orderId: number,
  format: string = DEFAULT_TRX_FORMAT,
): string {
  const safeFormat = isValidTrxFormat(format) ? format : DEFAULT_TRX_FORMAT;
  return `TRX-${formatTrxDate(date, safeFormat)}-${pad(orderId, 3)}`;
}
