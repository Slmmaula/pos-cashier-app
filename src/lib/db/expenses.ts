import { loadDb, transact } from "@/lib/demo/db";
import { MAX_ATTACHMENT_LENGTH, blobToDataUrl } from "@/lib/demo/files";
import { uid } from "@/lib/id";
import type { Expense, ExpenseCategory, StoredFile } from "@/lib/types";
import type { DbResult } from "./products";

const NOT_FOUND_MESSAGE = "Data sudah tidak ada.";
const FILE_ERROR_MESSAGE = "Lampiran gagal diproses. Coba lagi.";
const TOO_BIG_MESSAGE =
  "Lampiran terlalu besar untuk mode demo (maksimal sekitar 300KB).";

type NewAttachment = { blob: Blob; name: string; type: string };

export type ExpenseInput = {
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  newAttachment?: NewAttachment;
  removeAttachment?: boolean;
};

async function toStoredFile(file: NewAttachment): Promise<StoredFile> {
  const dataUrl = await blobToDataUrl(file.blob);
  if (dataUrl.length > MAX_ATTACHMENT_LENGTH) throw new Error(TOO_BIG_MESSAGE);
  return { name: file.name, type: file.type, dataUrl };
}

function attachmentError(error: unknown): string {
  return error instanceof Error && error.message === TOO_BIG_MESSAGE
    ? TOO_BIG_MESSAGE
    : FILE_ERROR_MESSAGE;
}

export async function getAttachmentUrl(path: string): Promise<string | null> {
  return path || null;
}

export async function fetchExpenses(): Promise<Expense[]> {
  return structuredClone(
    [...loadDb().expenses].sort((a, b) => a.date.localeCompare(b.date)),
  );
}

export async function createExpense(
  input: ExpenseInput,
  user: { id: string; name: string },
): Promise<DbResult<Expense>> {
  if (!(input.amount > 0)) {
    return { ok: false, error: "Nominal harus lebih dari 0" };
  }

  let attachment: StoredFile | null = null;
  if (input.newAttachment) {
    try {
      attachment = await toStoredFile(input.newAttachment);
    } catch (error) {
      return { ok: false, error: attachmentError(error) };
    }
  }

  return transact<Expense>((db) => {
    const created: Expense = {
      id: uid(),
      date: input.date,
      category: input.category,
      description: input.description,
      amount: input.amount,
      userName: user.name,
      attachment,
    };
    db.expenses.push(created);
    return { ok: true, data: created };
  });
}

export async function saveExpense(
  existing: Expense,
  input: ExpenseInput,
): Promise<DbResult<Expense>> {
  if (!(input.amount > 0)) {
    return { ok: false, error: "Nominal harus lebih dari 0" };
  }

  let attachment: StoredFile | null | undefined;
  if (input.newAttachment) {
    try {
      attachment = await toStoredFile(input.newAttachment);
    } catch (error) {
      return { ok: false, error: attachmentError(error) };
    }
  } else if (input.removeAttachment) {
    attachment = null;
  }

  return transact<Expense>((db) => {
    const target = db.expenses.find((e) => e.id === existing.id);
    if (!target) return { ok: false, error: NOT_FOUND_MESSAGE };

    target.date = input.date;
    target.category = input.category;
    target.description = input.description;
    target.amount = input.amount;
    if (attachment !== undefined) target.attachment = attachment;

    return { ok: true, data: target };
  });
}

export async function removeExpense(expense: Expense): Promise<DbResult<null>> {
  return transact<null>((db) => {
    const index = db.expenses.findIndex((e) => e.id === expense.id);
    if (index === -1) return { ok: false, error: NOT_FOUND_MESSAGE };
    db.expenses.splice(index, 1);
    return { ok: true, data: null };
  });
}
