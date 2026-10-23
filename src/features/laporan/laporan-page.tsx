"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Banknote,
  ChartColumn,
  Printer,
  ShoppingCart,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DateRangeFilter } from "@/components/ui/date-range-filter";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { Tabs, type TabItem } from "@/components/ui/tabs";
import { PrintDocument } from "@/components/print-document";
import { cn } from "@/lib/cn";
import { fetchReport } from "@/lib/db/reports";
import { formatPercent, formatRupiah } from "@/lib/format";
import { EMPTY_PERIOD, type Period } from "@/lib/period";
import { useAppStore } from "@/store/app-store";
import { PrintReport } from "./print-report";
import type { Report } from "./report-data";
import {
  COLORS,
  CompareBars,
  MainChart,
  MethodDonut,
  type MainMode,
} from "./report-charts";

const TABS: TabItem<MainMode>[] = [
  { value: "pendapatan", label: "Pendapatan" },
  { value: "pengeluaran", label: "Pengeluaran" },
  { value: "perbandingan", label: "Perbandingan" },
];

const MAIN_TITLES: Record<MainMode, string> = {
  pendapatan: "Pendapatan Harian",
  pengeluaran: "Pengeluaran Harian",
  perbandingan: "Pendapatan vs Pengeluaran Harian",
};

type Result = {
  /** permintaan yang menghasilkan data ini */
  key: string;
  report: Report | null;
  error: boolean;
};

export function LaporanPage() {
  const storeName = useAppStore((s) => s.settings.storeName);

  const [period, setPeriod] = useState<Period>(EMPTY_PERIOD);
  const [mode, setMode] = useState<MainMode>("pendapatan");
  const [printing, setPrinting] = useState(false);
  const [reload, setReload] = useState(0);
  const [result, setResult] = useState<Result>({
    key: "",
    report: null,
    error: false,
  });

  const key = `${period.from}|${period.to}|${reload}`;

  useEffect(() => {
    let cancelled = false;

    fetchReport({ from: period.from, to: period.to })
      .then((report) => {
        if (!cancelled) setResult({ key, report, error: false });
      })
      .catch(() => {
        if (!cancelled) {
          setResult((previous) => ({
            key,
            report: previous.report,
            error: true,
          }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [key, period.from, period.to]);

  const finishPrint = useCallback(() => setPrinting(false), []);

  const report = result.report;
  const stale = result.key !== key;
  const failed = result.error && !stale;

  if (!report) {
    return (
      <Card className="flex flex-col items-center gap-4 py-16 text-center">
        {failed ? (
          <>
            <p className="text-sm text-foreground">
              Laporan gagal dimuat. Periksa koneksi internet lalu coba lagi.
            </p>
            <Button onClick={() => setReload((value) => value + 1)}>
              Coba lagi
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted">Memuat laporan...</p>
        )}
      </Card>
    );
  }

  const mainHasData =
    mode === "pendapatan"
      ? report.days.some((d) => d.revenue > 0)
      : mode === "pengeluaran"
        ? report.days.some((d) => d.expense > 0)
        : report.days.length > 0;

  return (
    <>
      <Card className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <DateRangeFilter value={period} onChange={setPeriod} />
          <Button
            variant="outline"
            disabled={stale}
            onClick={() => setPrinting(true)}
          >
            <Printer className="size-4" />
            Cetak Laporan
          </Button>
        </div>

        {failed && (
          <div className="flex items-center justify-between gap-3 rounded-control border border-danger-border bg-danger-banner px-4 py-3 text-[13px] text-danger">
            <span>
              Laporan gagal diperbarui. Angka di bawah mungkin bukan yang
              terbaru.
            </span>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => setReload((value) => value + 1)}
            >
              Coba lagi
            </Button>
          </div>
        )}

        <div
          className={cn(
            "flex flex-col gap-4 transition-opacity",
            stale && "opacity-60",
          )}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total transaksi"
              value={String(report.count)}
              icon={ShoppingCart}
              tone="purple"
            />
            <StatCard
              label="Total pendapatan"
              value={formatRupiah(report.revenue)}
              icon={Banknote}
              tone="primary"
            />
            <StatCard
              label="Total pengeluaran"
              value={formatRupiah(report.expense)}
              icon={Banknote}
              tone="danger"
            />
            <StatCard
              label="Laba kotor"
              value={formatRupiah(report.profit)}
              icon={Wallet}
              tone="success"
            />
          </div>

          <Tabs<MainMode> items={TABS} value={mode} onChange={setMode} />

          <Card className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-foreground">
              {MAIN_TITLES[mode]}
            </h2>
            {mainHasData ? (
              <MainChart mode={mode} days={report.days} />
            ) : (
              <EmptyState
                icon={ChartColumn}
                title="Belum ada data pada periode ini"
                className="h-[300px]"
              />
            )}
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="flex flex-col gap-3">
              <h2 className="text-sm font-bold text-foreground">
                Metode Pembayaran
              </h2>
              {report.count === 0 ? (
                <EmptyState
                  icon={ChartColumn}
                  title="Belum ada transaksi"
                  className="h-[240px]"
                />
              ) : (
                <div className="flex flex-wrap items-center gap-6">
                  <MethodDonut methods={report.methods} />
                  <ul className="flex min-w-[200px] flex-1 flex-col gap-3 text-[13px]">
                    {report.methods.map((m) => (
                      <li
                        key={m.method}
                        className="flex items-center justify-between gap-4"
                      >
                        <span className="flex items-center gap-2 text-foreground">
                          <span
                            className="size-3 rounded-full"
                            style={{ backgroundColor: COLORS[m.method] }}
                          />
                          {m.method}
                        </span>
                        <span className="font-semibold tabular-nums text-foreground">
                          {m.count} (
                          {formatPercent((m.count / report.count) * 100)})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>

            <Card className="flex flex-col gap-3">
              <h2 className="text-sm font-bold text-foreground">
                Pendapatan vs Pengeluaran
              </h2>
              {report.days.length === 0 ? (
                <EmptyState
                  icon={ChartColumn}
                  title="Belum ada data pada periode ini"
                  className="h-[240px]"
                />
              ) : (
                <CompareBars days={report.days} />
              )}
            </Card>
          </div>
        </div>
      </Card>

      {printing && (
        <PrintDocument onDone={finishPrint} pageSize="A4 portrait">
          <PrintReport report={report} period={period} storeName={storeName} />
        </PrintDocument>
      )}
    </>
  );
}
