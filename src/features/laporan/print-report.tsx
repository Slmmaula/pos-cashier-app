import { formatDateTime, formatPercent, formatRupiah } from "@/lib/format";
import { formatPeriod, isPeriodActive, type Period } from "@/lib/period";
import { parseDayKey, type Report } from "./report-data";
import { formatDate } from "@/lib/format";

const cell = "border border-black px-2 py-1";

export function PrintReport({
  report,
  period,
  storeName,
}: {
  report: Report;
  period: Period;
  storeName: string;
}) {
  return (
    <div className="bg-white text-black">
      <h1 className="text-lg font-bold">Laporan - {storeName}</h1>
      <p className="text-xs">
        Periode: {isPeriodActive(period) ? formatPeriod(period) : "Semua data"}
      </p>
      <p className="mb-3 text-xs">Dicetak: {formatDateTime(new Date())}</p>

      <table className="mb-4 w-full border-collapse text-[11px]">
        <tbody>
          <tr>
            <td className={cell}>Total transaksi</td>
            <td className={`${cell} text-right`}>{report.count}</td>
          </tr>
          <tr>
            <td className={cell}>Total pendapatan</td>
            <td className={`${cell} text-right`}>
              {formatRupiah(report.revenue)}
            </td>
          </tr>
          <tr>
            <td className={cell}>Total pengeluaran</td>
            <td className={`${cell} text-right`}>
              {formatRupiah(report.expense)}
            </td>
          </tr>
          <tr>
            <td className={cell}>Laba kotor</td>
            <td className={`${cell} text-right`}>
              {formatRupiah(report.profit)}
            </td>
          </tr>
        </tbody>
      </table>

      <h2 className="mb-1 text-sm font-bold">Per hari</h2>
      <table className="mb-4 w-full border-collapse text-[11px]">
        <thead>
          <tr>
            <th className={`${cell} text-left`}>Tanggal</th>
            <th className={`${cell} text-right`}>Pendapatan</th>
            <th className={`${cell} text-right`}>Pengeluaran</th>
          </tr>
        </thead>
        <tbody>
          {report.days.map((d) => (
            <tr key={d.date}>
              <td className={cell}>{formatDate(parseDayKey(d.date))}</td>
              <td className={`${cell} text-right`}>
                {formatRupiah(d.revenue)}
              </td>
              <td className={`${cell} text-right`}>
                {formatRupiah(d.expense)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="mb-1 text-sm font-bold">Metode pembayaran</h2>
      <table className="w-full border-collapse text-[11px]">
        <thead>
          <tr>
            <th className={`${cell} text-left`}>Metode</th>
            <th className={`${cell} text-right`}>Transaksi</th>
            <th className={`${cell} text-right`}>Persentase</th>
            <th className={`${cell} text-right`}>Nominal</th>
          </tr>
        </thead>
        <tbody>
          {report.methods.map((m) => (
            <tr key={m.method}>
              <td className={cell}>{m.method}</td>
              <td className={`${cell} text-right`}>{m.count}</td>
              <td className={`${cell} text-right`}>
                {formatPercent(
                  report.count ? (m.count / report.count) * 100 : 0,
                )}
              </td>
              <td className={`${cell} text-right`}>{formatRupiah(m.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
