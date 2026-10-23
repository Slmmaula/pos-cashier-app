import { cn } from "@/lib/cn";
import { formatDateTime, formatRupiah, formatRupiahTight } from "@/lib/format";
import { formatOrderId } from "@/lib/order";
import type { Settings, Transaction } from "@/lib/types";

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className={cn("flex justify-between gap-2", bold && "font-bold")}>
      <span>{label}</span>
      <span className="text-right tabular-nums">{value}</span>
    </div>
  );
}

function Divider() {
  return <div className="my-2 border-t border-dashed border-black" />;
}

type ReceiptProps = {
  transaction: Transaction;
  settings: Settings;
  widthMm: number;
};

export function Receipt({ transaction: t, settings, widthMm }: ReceiptProps) {
  const logo = settings.logo;

  return (
    <div
      className="bg-white font-mono text-[11px] leading-4 text-black"
      style={{ width: `${widthMm}mm` }}
    >
      <div className="text-center">
        {logo && logo.type.startsWith("image/") && (
          <img
            src={logo.dataUrl}
            alt="Logo toko"
            className="mx-auto mb-1 max-h-12 max-w-full object-contain"
          />
        )}
        <p className="text-sm font-bold">{settings.storeName}</p>
        {settings.address && <p>{settings.address}</p>}
        {settings.phone && <p>Telp: {settings.phone}</p>}
        {settings.npwp && <p>NPWP: {settings.npwp}</p>}
      </div>

      <Divider />

      <div className="text-center">
        <p>No. Order</p>
        <p className="text-2xl font-bold leading-8">
          {formatOrderId(t.orderId)}
        </p>
      </div>

      <Divider />

      <Row label="No." value={t.trxNo} />
      <Row label="Tanggal" value={formatDateTime(t.createdAt)} />
      <Row label="Kasir" value={t.cashier} />
      <Row label="Customer" value={t.customerName} />

      <Divider />

      <div className="flex flex-col gap-1">
        {t.items.map((item) => (
          <div key={item.productId}>
            <p className="font-bold">{item.name}</p>
            <Row
              label={`${item.qty} x ${formatRupiahTight(item.price)}`}
              value={formatRupiahTight(item.price * item.qty)}
            />
          </div>
        ))}
      </div>

      <Divider />

      <Row label="Sub total" value={formatRupiah(t.subtotal)} />
      {t.discountAmount > 0 && (
        <Row
          label={
            t.discountType === "percent"
              ? `Diskon (${t.discountValue}%)`
              : "Diskon"
          }
          value={`-${formatRupiah(t.discountAmount)}`}
        />
      )}
      {t.ppnEnabled && (
        <Row
          label={`PPN ${settings.ppnRate}%`}
          value={formatRupiah(t.ppnAmount)}
        />
      )}
      {t.roundingAmount !== 0 && (
        <Row label="Pembulatan" value={formatRupiah(t.roundingAmount)} />
      )}
      <div className="mt-1 text-xs">
        <Row label="TOTAL" value={formatRupiah(t.total)} bold />
      </div>

      <Divider />

      <Row label={`Bayar (${t.method})`} value={formatRupiah(t.paid)} />
      <Row label="Kembalian" value={formatRupiah(t.change)} />

      <Divider />

      <p className="text-center">Terima kasih atas kunjungan Anda</p>
    </div>
  );
}
