import { buildSeed } from "./seed";
import { DEMO_DB_VERSION, type DemoDb } from "./types";

const STORAGE_KEY = "pos-demo-db";

export const STORAGE_ERROR =
  "Penyimpanan browser penuh atau tidak tersedia. Coba kosongkan data situs atau reset demo.";

export type UpdateResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export type TxResult<T> = { ok: true; data: T } | { ok: false; error: string };

let cache: DemoDb | null = null;

function isDemoDb(value: unknown): value is DemoDb {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<DemoDb>;
  return (
    v.version === DEMO_DB_VERSION &&
    Array.isArray(v.products) &&
    Array.isArray(v.transactions) &&
    Array.isArray(v.expenses) &&
    Array.isArray(v.users) &&
    typeof v.settings === "object" &&
    v.settings !== null &&
    typeof v.orderCounters === "object" &&
    v.orderCounters !== null
  );
}

function readStored(): DemoDb | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isDemoDb(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveDb(db: DemoDb): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    cache = db;
    return true;
  } catch {
    return false;
  }
}

export function loadDb(): DemoDb {
  if (typeof window === "undefined") return buildSeed();
  if (cache) return cache;

  const stored = readStored();
  if (stored) {
    cache = stored;
    return stored;
  }

  const fresh = buildSeed();
  if (!saveDb(fresh)) cache = fresh;
  return fresh;
}

export function updateDb<T>(mutate: (db: DemoDb) => T): UpdateResult<T> {
  const next = structuredClone(loadDb());
  const value = mutate(next);
  if (!saveDb(next)) return { ok: false, error: STORAGE_ERROR };
  return { ok: true, value };
}

export function transact<T>(mutate: (db: DemoDb) => TxResult<T>): TxResult<T> {
  const next = structuredClone(loadDb());
  const outcome = mutate(next);
  if (!outcome.ok) return outcome;
  if (!saveDb(next)) return { ok: false, error: STORAGE_ERROR };
  return outcome;
}

export function resetDb(): DemoDb {
  const fresh = buildSeed();
  cache = fresh;
  saveDb(fresh);
  return fresh;
}
