"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Banknote,
  Eye,
  Printer,
  Search,
  ShoppingCart,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DateRangeFilter } from "@/components/ui/date-range-filter";
import { Input } from "@/components/ui/input";
import { Pagination, paginate } from "@/components/ui/pagination";
import { StatCard } from "@/components/ui/stat-card";
import {
  Table,
  TableInfo,
  TBody,
  Td,
  Th,
  THead,
  Tr,
} from "@/components/ui/table";
import { totalQty, transactionProfit } from "@/lib/calc";
import { formatDateTime, formatRupiah } from "@/lib/format";
import { EMPTY_PERIOD, inPeriod, type Period } from "@/lib/period";
import type { Transaction } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { usePrintStore } from "@/store/print-store";
import { TransactionDetailModal } from "./transaction-detail-modal";

export function RiwayatPage() {
  const transactions = useAppStore((s) => s.transactions);

  const [period, setPeriod] = useState<Period>(EMPTY_PERIOD);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState<Transaction | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Terbaru di atas. Untuk urutan lama ke baru, hapus ".reverse()".
  const inRange = useMemo(
    () =>
      transactions
        .filter((t) => inPeriod(t.createdAt, period))
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        .reverse(),
    [transactions, period],
  );

  const stats = useMemo(
    () => ({
      count: inRange.length,
      sales: inRange.reduce((sum, t) => sum + t.total, 0),
      profit: inRange.reduce((sum, t) => sum + transactionProfit(t), 0),
    }),
    [inRange],
  );

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return inRange;
    return inRange.filter(
      (t) =>
        t.trxNo.toLowerCase().includes(keyword) ||
        t.customerName.toLowerCase().includes(keyword) ||
        t.items.some(
          (item) =>
            item.name.toLowerCase().includes(keyword) ||
            item.code.toLowerCase().includes(keyword),
        ),
    );
  }, [inRange, query]);

  const paged = paginate(filtered, page);

  const closeDetail = useCallback(() => setDetailOpen(false), []);

  function openDetail(transaction: Transaction) {
    setSelected(transaction);
    setDetailOpen(true);
  }

  return (
    <>
      <Card className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard
            label="Total transaksi"
            value={String(stats.count)}
            icon={ShoppingCart}
            tone="purple"
          />
          <StatCard
            label="Total penjualan"
            value={formatRupiah(stats.sales)}
            icon={Banknote}
            tone="primary"
          />
          <StatCard
            label="Laba kotor"
            value={formatRupiah(stats.profit)}
            icon={Wallet}
            tone="success"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <DateRangeFilter
            value={period}
            onChange={(next) => {
              setPeriod(next);
              setPage(1);
            }}
          />
          <Input
            aria-label="Cari transaksi"
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
              <Th>No. Transaksi</Th>
              <Th>Tanggal/Jam</Th>
              <Th>Kasir</Th>
              <Th align="right">Total item</Th>
              <Th align="right">Total pembayaran</Th>
              <Th>Metode bayar</Th>
              <Th align="center">Status</Th>
              <Th align="center">Aksi</Th>
            </THead>
            <TBody>
              {paged.rows.length === 0 ? (
                <Tr>
                  <Td colSpan={8} align="center" className="py-10 text-muted">
                    Data tidak ditemukan
                  </Td>
                </Tr>
              ) : (
                paged.rows.map((t) => (
                  <Tr key={t.id}>
                    <Td className="whitespace-nowrap">{t.trxNo}</Td>
                    <Td className="whitespace-nowrap">
                      {formatDateTime(t.createdAt)}
                    </Td>
                    <Td className="whitespace-nowrap">{t.cashier}</Td>
                    <Td align="right" className="tabular-nums">
                      {totalQty(t.items)}
                    </Td>
                    <Td
                      align="right"
                      className="whitespace-nowrap tabular-nums"
                    >
                      {formatRupiah(t.total)}
                    </Td>
                    <Td>{t.method}</Td>
                    <Td align="center">
                      <Badge>{t.status}</Badge>
                    </Td>
                    <Td align="center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          aria-label={`Lihat detail ${t.trxNo}`}
                          onClick={() => openDetail(t)}
                          className="flex size-7 items-center justify-center rounded text-primary transition hover:bg-primary-soft"
                        >
                          <Eye className="size-4" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Cetak ulang ${t.trxNo}`}
                          onClick={() => usePrintStore.getState().print(t)}
                          className="flex size-7 items-center justify-center rounded text-primary transition hover:bg-primary-soft"
                        >
                          <Printer className="size-4" />
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

      <TransactionDetailModal
        open={detailOpen}
        onClose={closeDetail}
        transaction={selected}
      />
    </>
  );
}
