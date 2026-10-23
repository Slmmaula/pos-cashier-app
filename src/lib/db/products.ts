import { loadDb, transact } from "@/lib/demo/db";
import { blobToDataUrl } from "@/lib/demo/files";
import { uid } from "@/lib/id";
import type { Product } from "@/lib/types";

export const DUPLICATE_CODE_MESSAGE = "Kode barang sudah digunakan";
const NOT_FOUND_MESSAGE = "Data sudah tidak ada.";
const IMAGE_ERROR_MESSAGE = "Gambar gagal diproses. Coba lagi.";

export type DbResult<T> = { ok: true; data: T } | { ok: false; error: string };

export type ProductInput = Omit<Product, "id" | "image"> & {
  newImage?: Blob;
  removeImage?: boolean;
};

export async function fetchProducts(): Promise<Product[]> {
  return structuredClone(loadDb().products);
}

export async function createProduct(
  input: ProductInput,
): Promise<DbResult<Product>> {
  let image: string | null = null;

  if (input.newImage) {
    try {
      image = await blobToDataUrl(input.newImage);
    } catch {
      return { ok: false, error: IMAGE_ERROR_MESSAGE };
    }
  }

  return transact<Product>((db) => {
    const code = input.code.trim().toUpperCase();
    if (db.products.some((p) => p.code.toUpperCase() === code)) {
      return { ok: false, error: DUPLICATE_CODE_MESSAGE };
    }

    const created: Product = {
      id: uid(),
      code,
      barcode: input.barcode,
      name: input.name,
      description: input.description,
      category: input.category,
      unit: input.unit,
      buyPrice: input.buyPrice,
      sellPrice: input.sellPrice,
      stock: input.stock,
      minStock: input.minStock,
      active: input.active,
      image,
    };
    db.products.push(created);
    return { ok: true, data: created };
  });
}

export async function saveProduct(
  existing: Product,
  input: ProductInput,
): Promise<DbResult<Product>> {
  let image: string | null | undefined;

  if (input.newImage) {
    try {
      image = await blobToDataUrl(input.newImage);
    } catch {
      return { ok: false, error: IMAGE_ERROR_MESSAGE };
    }
  } else if (input.removeImage) {
    image = null;
  }

  return transact<Product>((db) => {
    const target = db.products.find((p) => p.id === existing.id);
    if (!target) return { ok: false, error: NOT_FOUND_MESSAGE };

    const code = input.code.trim().toUpperCase();
    if (
      db.products.some(
        (p) => p.id !== target.id && p.code.toUpperCase() === code,
      )
    ) {
      return { ok: false, error: DUPLICATE_CODE_MESSAGE };
    }

    target.code = code;
    target.barcode = input.barcode;
    target.name = input.name;
    target.description = input.description;
    target.category = input.category;
    target.unit = input.unit;
    target.buyPrice = input.buyPrice;
    target.sellPrice = input.sellPrice;
    target.stock = input.stock;
    target.minStock = input.minStock;
    target.active = input.active;
    if (image !== undefined) target.image = image;

    return { ok: true, data: target };
  });
}

export async function removeProduct(product: Product): Promise<DbResult<null>> {
  return transact<null>((db) => {
    const index = db.products.findIndex((p) => p.id === product.id);
    if (index === -1) return { ok: false, error: NOT_FOUND_MESSAGE };
    db.products.splice(index, 1);
    return { ok: true, data: null };
  });
}
