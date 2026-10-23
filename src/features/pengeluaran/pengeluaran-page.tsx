"use client";

import { useCallback, useMemo, useState } from "react";
import { Pencil, Plus, Printer, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { DateRangeFilter } from "@/components/ui/date-range-filter";
import { Input } from "@/components/ui/input";
import { Pagination, paginate } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableInfo,
  TBody,
  Td,
  Th,
  THead,
  Tr,
} from "@/components/ui/table";
import { PrintDocument } from "@/components/print-document";
import { EXPENSE_CATEGORIES, EXPENSE_COLORS } from "@/lib/expense";
import { formatDateTime, formatRupiah } from "@/lib/format";
import { EMPTY_PERIOD, inPeriod, type Period } from "@/lib/period";
import type { Expense } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { toast } from "@/store/toast-store";
import { ExpenseFormModal } from "./expense-form-modal";
import { PrintExpenseTable } from "./print-expense-table";

const CATEGORY_FILTER = [
  { value: "semua", label: "Semua kategori" },
  ...EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c })),
];

export function PengeluaranPage() {
  const expenses = useAppStore((s) => s.expenses);
  const storeName = useAppStore((s) => s.settings.storeName);

  const [category, setCategory] = useState("semua");
  const [period, setPeriod] = useState<Period>(EMPTY_PERIOD);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [editing, setEditing] = useState<Expense | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [printing, setPrinting] = useState(false);

  // Terbaru di atas
  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return expenses
      .filter((e) => category === "semua" || e.category === category)
      .filter((e) => inPeriod(e.date, period))
      .filter((e) => !keyword || e.description.toLowerCase().includes(keyword))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, category, period, query]);

  const total = useMemo(
    () => filtered.reduce((sum, e) => sum + e.amount, 0),
    [filtered],
  );

  const paged = paginate(filtered, page);

  const closeForm = useCallback(() => setFormOpen(false), []);
  const closeDelete = useCallback(() => setDeleteOpen(false), []);
  const finishPrint = useCallback(() => setPrinting(false), []);

  function openAdd() {
    setEditing(null);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }

  function openEdit(expense: Expense) {
    setEditing(expense);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }

  function askDelete(expense: Expense) {
    setDeleteTarget(expense);
    setDeleteOpen(true);
  }

  async function confirmDelete() {
    if (!deleteTarget || deleting) return;

    setDeleting(true);
    const result = await useAppStore.getState().deleteExpense(deleteTarget.id);
    setDeleting(false);
    setDeleteOpen(false);

    if (result.ok) {
      toast.success("Data berhasil dihapus");
    } else {
      toast.error(result.error);
    }
  }

  return (
    <>
      <Card className="flex flex-col gap-4">
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setPrinting(true)}>
            <Printer className="size-4" />
            Cetak Pengeluaran
          </Button>
          <Button onClick={openAdd}>
            <Plus className="size-4" />
            Tambah Pengeluaran
          </Button>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-control border border-danger-border bg-danger-banner px-4 py-3">
          <div>
            <p className="text-[13px] text-danger">Total pengeluaran</p>
            <p className="text-2xl font-bold tabular-nums text-danger">
              {formatRupiah(total)}
            </p>
          </div>
          <p className="text-[13px] font-bold text-danger">
            {filtered.length} Pengeluaran tercatat
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select
            aria-label="Filter kategori"
            wrapperClassName="w-[180px]"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            options={CATEGORY_FILTER}
          />
          <DateRangeFilter
            value={period}
            onChange={(next) => {
              setPeriod(next);
              setPage(1);
            }}
          />
          <Input
            aria-label="Cari pengeluaran"
            placeholder="Cari deskripsi pengeluaran..."
            leftIcon={<Search className="size-4" />}
            wrapperClassName="ml-auto w-[360px] max-w-full"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Table>
            <THead>
              <Th>Tanggal</Th>
              <Th>Kategori pengeluaran</Th>
              <Th>Deskripsi</Th>
              <Th align="right">Nominal</Th>
              <Th>Pengguna</Th>
              <Th align="center">Aksi</Th>
            </THead>
            <TBody>
              {paged.rows.length === 0 ? (
                <Tr>
                  <Td colSpan={6} align="center" className="py-10 text-muted">
                    Data tidak ditemukan
                  </Td>
                </Tr>
              ) : (
                paged.rows.map((e) => (
                  <Tr key={e.id}>
                    <Td className="whitespace-nowrap">
                      {formatDateTime(e.date)}
                    </Td>
                    <Td>
                      <Badge variant="solid" color={EXPENSE_COLORS[e.category]}>
                        {e.category}
                      </Badge>
                    </Td>
                    <Td className="min-w-[200px]">{e.description || "-"}</Td>
                    <Td
                      align="right"
                      className="whitespace-nowrap tabular-nums text-danger"
                    >
                      {formatRupiah(e.amount)}
                    </Td>
                    <Td className="whitespace-nowrap">{e.userName}</Td>
                    <Td align="center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          aria-label={`Edit pengeluaran ${e.category}`}
                          onClick={() => openEdit(e)}
                          className="flex size-7 items-center justify-center rounded text-primary transition hover:bg-primary-soft"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Hapus pengeluaran ${e.category}`}
                          onClick={() => askDelete(e)}
                          className="flex size-7 items-center justify-center rounded text-danger transition hover:bg-danger-soft"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </Td>
                  </Tr>
                ))
              )}
            </TBody>
          </Table>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <TableInfo
              total={filtered.length}
              from={paged.from}
              to={paged.to}
            />
            <Pagination
              page={paged.page}
              totalPages={paged.totalPages}
              onChange={setPage}
            />
          </div>
        </div>
      </Card>

      <ExpenseFormModal
        key={formKey}
        open={formOpen}
        onClose={closeForm}
        expense={editing}
      />

      <ConfirmModal
        open={deleteOpen}
        onClose={closeDelete}
        onConfirm={confirmDelete}
        title="Hapus Pengeluaran"
        message={`Hapus pengeluaran "${deleteTarget?.description || deleteTarget?.category || ""}"? Tindakan ini tidak bisa dibatalkan.`}
      />

      {printing && (
        <PrintDocument onDone={finishPrint}>
          <PrintExpenseTable expenses={filtered} storeName={storeName} />
        </PrintDocument>
      )}
    </>
  );
}
