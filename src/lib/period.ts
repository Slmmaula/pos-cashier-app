import { toDateInputValue, type DateInput } from "./format";

export type Period = { from: string; to: string };

export const EMPTY_PERIOD: Period = { from: "", to: "" };

export function isPeriodActive(period: Period): boolean {
  return period.from !== "" || period.to !== "";
}

export function inPeriod(date: DateInput, period: Period): boolean {
  const day = toDateInputValue(date);
  if (period.from && day < period.from) return false;
  if (period.to && day > period.to) return false;
  return true;
}

function display(value: string): string {
  return value.split("-").reverse().join("/");
}

export function formatPeriod(period: Period): string {
  if (period.from && period.to) {
    return `${display(period.from)} - ${display(period.to)}`;
  }
  if (period.from) return `Sejak ${display(period.from)}`;
  if (period.to) return `Sampai ${display(period.to)}`;
  return "Filter periode";
}
