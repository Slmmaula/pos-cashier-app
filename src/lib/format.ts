const numberFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat("id-ID", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const clockFormatter = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: "Asia/Jakarta",
});

const longDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export type DateInput = Date | string | number;

function toDate(value: DateInput): Date {
  return value instanceof Date ? value : new Date(value);
}

function pad(value: number, length = 2): string {
  return String(value).padStart(length, "0");
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatRupiah(value: number): string {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? "-" : "";
  return `${sign}Rp ${numberFormatter.format(Math.abs(rounded))}`;
}

export function formatRupiahTight(value: number): string {
  return formatRupiah(value).replace("Rp ", "Rp");
}

export function parseRupiah(input: string): number {
  const digits = input.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

export function formatPercent(value: number): string {
  return `${percentFormatter.format(value)}%`;
}

export function formatDate(value: DateInput): string {
  const d = toDate(value);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function formatDateTime(value: DateInput): string {
  const d = toDate(value);
  return `${formatDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatLongDate(value: DateInput): string {
  return longDateFormatter.format(toDate(value));
}

export function formatClock(value: DateInput): string {
  return `${clockFormatter.format(toDate(value)).replace(/\./g, ":")} WIB`;
}

export function toDateInputValue(value: DateInput): string {
  const d = toDate(value);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
