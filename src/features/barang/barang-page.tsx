"use client";

import { useCallback, useMemo, useState } from "react";
import { Download, Package, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmModal } from "@/components/ui/confirm-modal";
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
import { cn } from "@/lib/cn";
import { formatRupiah } from "@/lib/format";
import type { Product } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "@/store/toast-store";
import { PrintProductTable } from "./print-product-table";
import { ProductFormModal } from "./product-form-modal";

const CATEGORY_FILTER = [
  { value: "semua", label: "Semua kategori" },
  { value: "Makanan", label: "Makanan" },
  { value: "Minuman", label: "Minuman" },
  { value: "Lainnya", label: "Lainnya" },
];

export function BarangPage() {
  const products = useAppStore((s) => s.products);
  const storeName = useAppStore((s) => s.settings.storeName);
  const isOwner = useAuthStore((s) => s.profile?.role === "Owner");

  const [category, setCategory] = useState("semua");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [editing, setEditing] = useState<Product | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [printing, setPrinting] = useState(false);

  const lowStockCount = products.filter((p) => p.stock < p.minStock).length;

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return products
      .filter((p) => category === "semua" || p.category === category)
      .filter(
        (p) =>
          !keyword ||
          p.name.toLowerCase().includes(keyword) ||
          p.code.toLowerCase().includes(keyword),
      );
  }, [products, category, query]);

  const paged = paginate(filtered, page);

  const closeForm = useCallback(() => setFormOpen(false), []);
  const closeDelete = useCallback(() => setDeleteOpen(false), []);
  const finishPrint = useCallback(() => setPrinting(false), []);

  function openAdd() {
    setEditing(null);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }

  function askDelete(product: Product) {
    setDeleteTarget(product);
    setDeleteOpen(true);
  }

  async function confirmDelete() {
    if (!deleteTarget || deleting) return;

    setDeleting(true);
    const result = await useAppStore.getState().deleteProduct(deleteTarget.id);
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
            <Download className="size-4" />
            Ekspor PDF
          </Button>
          {isOwner && (
            <Button onClick={openAdd}>
              <Plus className="size-4" />
              Tambah Barang
            </Button>
          )}
        </div>

        {lowStockCount > 0 && (
          <div className="flex items-center gap-2 rounded-control border border-warning-border bg-warning-bg px-4 py-3 text-[13px] font-medium text-warning-text">
            <Package className="size-4 shrink-0" />
            {lowStockCount} barang memiliki stok di bawah minimum
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
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
          <Input
            aria-label="Cari barang"
            placeholder="Cari nama atau kode barang..."
            leftIcon={<Search className="size-4" />}
            wrapperClassName="w-[360px] max-w-full"
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
              <Th>Kode barang</Th>
              <Th>Nama barang</Th>
              <Th>Kategori</Th>
              <Th>Satuan</Th>
              <Th align="right">Harga beli</Th>
              <Th align="right">Harga jual</Th>
              <Th align="right">Stok</Th>
              <Th align="right">Min. stok</Th>
              <Th align="center">Status</Th>
              {isOwner && <Th align="center">Aksi</Th>}
            </THead>
            <TBody>
              {paged.rows.length === 0 ? (
                <Tr>
                  <Td
                    colSpan={isOwner ? 10 : 9}
                    align="center"
                    className="py-10 text-muted"
                  >
                    Data tidak ditemukan
                  </Td>
                </Tr>
              ) : (
                paged.rows.map((p) => (
                  <Tr key={p.id}>
                    <Td className="whitespace-nowrap">{p.code}</Td>
                    <Td className="min-w-[180px]">{p.name}</Td>
                    <Td>{p.category}</Td>
                    <Td>{p.unit}</Td>
                    <Td
                      align="right"
                      className="whitespace-nowrap tabular-nums"
                    >
                      {formatRupiah(p.buyPrice)}
                    </Td>
                    <Td
                      align="right"
                      className="whitespace-nowrap tabular-nums"
                    >
                      {formatRupiah(p.sellPrice)}
                    </Td>
                    <Td
                      align="right"
                      className={cn(
                        "tabular-nums",
                        p.stock < p.minStock && "font-semibold text-danger",
                      )}
                    >
                      {p.stock}
                    </Td>
                    <Td align="right" className="tabular-nums">
                      {p.minStock}
                    </Td>
                    <Td align="center">
                      {p.active ? (
                        <Badge>Aktif</Badge>
                      ) : (
                        <Badge variant="solid" color="#9CA3AF">
                          Nonaktif
                        </Badge>
                      )}
                    </Td>
                    {isOwner && (
                      <Td align="center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            aria-label={`Edit ${p.name}`}
                            onClick={() => openEdit(p)}
                            className="flex size-7 items-center justify-center rounded text-primary transition hover:bg-primary-soft"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Hapus ${p.name}`}
                            onClick={() => askDelete(p)}
                            className="flex size-7 items-center justify-center rounded text-danger transition hover:bg-danger-soft"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </Td>
                    )}
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

      {isOwner && (
        <>
          <ProductFormModal
            key={formKey}
            open={formOpen}
            onClose={closeForm}
            product={editing}
          />

          <ConfirmModal
            open={deleteOpen}
            onClose={closeDelete}
            onConfirm={confirmDelete}
            title="Hapus Barang"
            message={`Hapus barang "${deleteTarget?.name ?? ""}"? Tindakan ini tidak bisa dibatalkan.`}
          />
        </>
      )}

      {printing && (
        <PrintDocument onDone={finishPrint}>
          <PrintProductTable products={filtered} storeName={storeName} />
        </PrintDocument>
      )}
    </>
  );
}
