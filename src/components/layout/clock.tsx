"use client";

import { useSyncExternalStore } from "react";
import { formatClock } from "@/lib/format";

const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
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

/** Jakarta = UTC+7 sepanjang tahun (tanpa jam musim panas) */
const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;

function formatJakartaDate(ms: number): string {
  const d = new Date(ms + JAKARTA_OFFSET_MS);
  return `${DAYS[d.getUTCDay()]}, ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 250);
  return () => clearInterval(id);
}

function getSnapshot() {
  return Math.floor(Date.now() / 1000);
}

function getServerSnapshot() {
  return 0;
}

export function Clock() {
  const seconds = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  if (seconds === 0) return <>--:--:-- WIB</>;

  const ms = seconds * 1000;
  return (
    <>
      <span className="hidden sm:inline">{formatJakartaDate(ms)} · </span>
      {formatClock(ms)}
    </>
  );
}
