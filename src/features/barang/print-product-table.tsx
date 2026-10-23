import { formatDateTime, formatRupiah } from "@/lib/format";
import type { Product } from "@/lib/types";

export function PrintProductTable({
  products,
  storeName,
}: {
  products: Product[];
  storeName: string;
}) {
  return (
    <div className="bg-white text-black">
      <h1 className="text-lg font-bold">Daftar Barang - {storeName}</h1>
      <p className="mb-3 text-xs">Dicetak: {formatDateTime(new Date())}</p>

      <table className="w-full border-collapse text-[11px]">
        <thead>
          <tr>
            {[
              "Kode barang",
              "Nama barang",
              "Kategori",
              "Satuan",
              "Harga beli",
              "Harga jual",
              "Stok",
              "Min. stok",
              "Status",
            ].map((head) => (
              <th
                key={head}
                className="border border-black px-2 py-1.5 text-left font-bold"
              >
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td className="border border-black px-2 py-1">{p.code}</td>
              <td className="border border-black px-2 py-1">{p.name}</td>
              <td className="border border-black px-2 py-1">{p.category}</td>
              <td className="border border-black px-2 py-1">{p.unit}</td>
              <td className="border border-black px-2 py-1 text-right">
                {formatRupiah(p.buyPrice)}
              </td>
              <td className="border border-black px-2 py-1 text-right">
                {formatRupiah(p.sellPrice)}
              </td>
              <td className="border border-black px-2 py-1 text-right">
                {p.stock}
              </td>
              <td className="border border-black px-2 py-1 text-right">
                {p.minStock}
              </td>
              <td className="border border-black px-2 py-1">
                {p.active ? "Aktif" : "Nonaktif"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs">Total: {products.length} barang</p>
    </div>
  );
}
