import type { Settings } from "./types";

type StoreInfo = Pick<Settings, "storeName" | "address" | "phone" | "whatsapp">;

export function isStoreInfoComplete(info: StoreInfo): boolean {
  return [info.storeName, info.address, info.phone, info.whatsapp].every(
    (value) => value.trim().length > 0,
  );
}
