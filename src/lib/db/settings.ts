import { loadDb, transact } from "@/lib/demo/db";
import { blobToDataUrl } from "@/lib/demo/files";
import { isValidTrxFormat } from "@/lib/order";
import type { Settings, StoredFile } from "@/lib/types";
import type { DbResult } from "./products";

const INVALID_MESSAGE = "Nilai pengaturan tidak valid";
const LOGO_ERROR_MESSAGE = "Logo gagal diproses. Coba lagi.";
const LOGO_TOO_BIG_MESSAGE = "Logo terlalu besar untuk mode demo.";
const MAX_LOGO_LENGTH = 400_000;

const ROUNDINGS = ["none", "100", "500", "1000"];
const PAPERS = ["58mm", "80mm", "88mm"];

export type SettingsPatch = Partial<Omit<Settings, "logo">> & {
  newLogo?: { blob: Blob; type: string };
  removeLogo?: boolean;
};

function isValid(s: Settings): boolean {
  return (
    s.ppnRate >= 0 &&
    s.ppnRate <= 100 &&
    s.maxDiscount >= 0 &&
    s.maxDiscount <= 100 &&
    s.margin >= 0 &&
    s.margin <= 20 &&
    ROUNDINGS.includes(s.rounding) &&
    PAPERS.includes(s.paperSize) &&
    isValidTrxFormat(s.trxFormat)
  );
}

export async function fetchSettings(): Promise<Settings> {
  return structuredClone(loadDb().settings);
}

export async function saveSettings(
  existing: Settings,
  patch: SettingsPatch,
): Promise<DbResult<Settings>> {
  let logo: StoredFile | null | undefined;

  if (patch.newLogo) {
    try {
      const dataUrl = await blobToDataUrl(patch.newLogo.blob);
      if (dataUrl.length > MAX_LOGO_LENGTH) {
        return { ok: false, error: LOGO_TOO_BIG_MESSAGE };
      }
      logo = { name: "Logo toko", type: patch.newLogo.type, dataUrl };
    } catch {
      return { ok: false, error: LOGO_ERROR_MESSAGE };
    }
  } else if (patch.removeLogo) {
    logo = null;
  }

  const changes = Object.fromEntries(
    Object.entries(patch).filter(
      ([key, value]) =>
        key !== "newLogo" && key !== "removeLogo" && value !== undefined,
    ),
  );

  return transact<Settings>((db) => {
    const next: Settings = { ...existing, ...db.settings, ...changes };
    if (logo !== undefined) next.logo = logo;

    if (!isValid(next)) return { ok: false, error: INVALID_MESSAGE };

    db.settings = next;
    return { ok: true, data: next };
  });
}
