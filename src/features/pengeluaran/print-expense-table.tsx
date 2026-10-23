import { formatDateTime, formatRupiah } from "@/lib/format";
import type { Expense } from "@/lib/types";

export function PrintExpenseTable({
  expenses,
  storeName,
}: {
  expenses: Expense[];
  storeName: string;
}) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="bg-white text-black">
      <h1 className="text-lg font-bold">Pengeluaran Toko - {storeName}</h1>
      <p className="mb-3 text-xs">Dicetak: {formatDateTime(new Date())}</p>

      <table className="w-full border-collapse text-[11px]">
        <thead>
          <tr>
            {["Tanggal", "Kategori", "Deskripsi", "Nominal", "Pengguna"].map(
              (head) => (
                <th
                  key={head}
                  className="border border-black px-2 py-1.5 text-left font-bold"
                >
                  {head}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {expenses.map((e) => (
            <tr key={e.id}>
              <td className="border border-black px-2 py-1">
                {formatDateTime(e.date)}
              </td>
              <td className="border border-black px-2 py-1">{e.category}</td>
              <td className="border border-black px-2 py-1">{e.description}</td>
              <td className="border border-black px-2 py-1 text-right">
                {formatRupiah(e.amount)}
              </td>
              <td className="border border-black px-2 py-1">{e.userName}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td
              colSpan={3}
              className="border border-black px-2 py-1.5 font-bold"
            >
              Total ({expenses.length} pengeluaran)
            </td>
            <td className="border border-black px-2 py-1.5 text-right font-bold">
              {formatRupiah(total)}
            </td>
            <td className="border border-black px-2 py-1.5" />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
