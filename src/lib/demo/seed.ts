import { computeTotals, itemsSubtotal } from "@/lib/calc";
import { toDateInputValue } from "@/lib/format";
import { DEFAULT_TRX_FORMAT, makeTrxNo } from "@/lib/order";
import type {
  Expense,
  ExpenseCategory,
  PaymentMethod,
  Product,
  Settings,
  Transaction,
  TransactionItem,
  User,
} from "@/lib/types";
import { DEMO_DB_VERSION, DEMO_STORE_NAME, type DemoDb } from "./types";

const DAYS_BACK = 14;
const OPEN_MINUTE = 9 * 60;
const OPEN_SPAN_MINUTES = 12.5 * 60;

const CUSTOMERS = [
  "Budi",
  "Siti",
  "Andi",
  "Rina",
  "Dewi",
  "Agus",
  "Wahyu",
  "Maya",
  "Fajar",
  "Lestari",
  "Dimas",
  "Putri",
  "Rizky",
  "Nanda",
  "Hendra",
];

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type ProductSeed = Omit<Product, "id" | "barcode" | "description" | "image">;

function product(seed: ProductSeed): Product {
  return {
    ...seed,
    id: `prd-${seed.code}`,
    barcode: "",
    description: "",
    image: null,
  };
}

const PRODUCTS: Product[] = [
  product({
    code: "BRG-101",
    name: "Iced Latte",
    category: "Minuman",
    unit: "Cup",
    buyPrice: 5500,
    sellPrice: 14000,
    stock: 80,
    minStock: 10,
    active: true,
  }),
  product({
    code: "BRG-102",
    name: "Caramel Macchiato",
    category: "Minuman",
    unit: "Cup",
    buyPrice: 7000,
    sellPrice: 17000,
    stock: 70,
    minStock: 10,
    active: true,
  }),
  product({
    code: "BRG-103",
    name: "Cappuccino",
    category: "Minuman",
    unit: "Cup",
    buyPrice: 5000,
    sellPrice: 13000,
    stock: 90,
    minStock: 10,
    active: true,
  }),
  product({
    code: "BRG-104",
    name: "Espresso",
    category: "Minuman",
    unit: "Cup",
    buyPrice: 2500,
    sellPrice: 8000,
    stock: 100,
    minStock: 10,
    active: true,
  }),
  product({
    code: "BRG-105",
    name: "Americano",
    category: "Minuman",
    unit: "Cup",
    buyPrice: 3000,
    sellPrice: 10000,
    stock: 100,
    minStock: 10,
    active: true,
  }),
  product({
    code: "BRG-106",
    name: "Butterscotch Frappe",
    category: "Minuman",
    unit: "Cup",
    buyPrice: 8000,
    sellPrice: 18000,
    stock: 60,
    minStock: 10,
    active: true,
  }),
  product({
    code: "BRG-107",
    name: "Iced Palm Sugar Coffee",
    category: "Minuman",
    unit: "Cup",
    buyPrice: 5000,
    sellPrice: 13000,
    stock: 85,
    minStock: 10,
    active: true,
  }),
  product({
    code: "BRG-108",
    name: "Matcha",
    category: "Minuman",
    unit: "Cup",
    buyPrice: 7000,
    sellPrice: 16000,
    stock: 65,
    minStock: 10,
    active: true,
  }),
  product({
    code: "BRG-109",
    name: "Spaghetti Carbonara",
    category: "Makanan",
    unit: "Pcs",
    buyPrice: 9000,
    sellPrice: 22000,
    stock: 40,
    minStock: 10,
    active: true,
  }),
  product({
    code: "BRG-110",
    name: "Chicken Fire Wings",
    category: "Makanan",
    unit: "Pcs",
    buyPrice: 10000,
    sellPrice: 22000,
    stock: 45,
    minStock: 10,
    active: true,
  }),
  product({
    code: "BRG-111",
    name: "Nasi Goreng",
    category: "Makanan",
    unit: "Pcs",
    buyPrice: 7000,
    sellPrice: 16000,
    stock: 50,
    minStock: 10,
    active: true,
  }),
  product({
    code: "BRG-112",
    name: "Churros",
    category: "Makanan",
    unit: "Pcs",
    buyPrice: 5000,
    sellPrice: 14000,
    stock: 6,
    minStock: 10,
    active: true,
  }),
  product({
    code: "BRG-113",
    name: "Cheesecake (Slice)",
    category: "Makanan",
    unit: "Pcs",
    buyPrice: 8000,
    sellPrice: 18000,
    stock: 12,
    minStock: 3,
    active: true,
  }),
  product({
    code: "BRG-114",
    name: "Beef Steak",
    category: "Makanan",
    unit: "Pcs",
    buyPrice: 19000,
    sellPrice: 35000,
    stock: 20,
    minStock: 5,
    active: true,
  }),
  product({
    code: "BRG-115",
    name: "Air Mineral 600ml",
    category: "Minuman",
    unit: "Botol",
    buyPrice: 3000,
    sellPrice: 5000,
    stock: 30,
    minStock: 10,
    active: true,
  }),
];

const SALES_POOL = [
  "BRG-101",
  "BRG-101",
  "BRG-102",
  "BRG-103",
  "BRG-103",
  "BRG-104",
  "BRG-105",
  "BRG-106",
  "BRG-107",
  "BRG-107",
  "BRG-108",
  "BRG-109",
  "BRG-110",
  "BRG-111",
  "BRG-111",
  "BRG-112",
  "BRG-113",
  "BRG-114",
];

const SETTINGS: Settings = {
  storeName: DEMO_STORE_NAME,
  address: "Jl. Contoh No. 1, Kabupaten Contoh",
  phone: "+62 812-0000-0000",
  whatsapp: "+62 812-0000-0000",
  npwp: "",
  logo: null,
  ppnDefault: true,
  ppnRate: 11,
  maxDiscount: 50,
  rounding: "none",
  trxFormat: DEFAULT_TRX_FORMAT,
  resetPeriod: "daily",
  paperSize: "88mm",
  margin: 5,
  autoPrint: true,
};

const USERS: User[] = [
  {
    id: "usr-demo-owner",
    name: "Demo Owner",
    username: "owner",
    password: "owner123",
    role: "Owner",
    active: true,
  },
  {
    id: "usr-demo-kasir",
    name: "Demo Kasir",
    username: "kasir",
    password: "kasir123",
    role: "Kasir",
    active: true,
  },
];

function findProduct(code: string): Product {
  const found = PRODUCTS.find((p) => p.code === code);
  if (!found) throw new Error(`Data contoh: produk ${code} tidak ditemukan`);
  return found;
}

function pickMethod(value: number): PaymentMethod {
  if (value < 0.5) return "Tunai";
  if (value < 0.85) return "QRIS";
  return "Debit";
}

function roundUpCash(total: number): number {
  return Math.ceil(total / 10000) * 10000;
}

function buildTransactions(
  now: Date,
  rng: () => number,
): { transactions: Transaction[]; counters: Record<string, number> } {
  const transactions: Transaction[] = [];
  const counters: Record<string, number> = {};
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  for (let back = DAYS_BACK - 1; back >= 0; back -= 1) {
    const day = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - back,
    );
    const dayKey = toDateInputValue(day);
    const weekend = day.getDay() === 0 || day.getDay() === 6;
    const count = (weekend ? 10 : 6) + Math.floor(rng() * 5);

    const minutes: number[] = [];
    for (let i = 0; i < count; i += 1) {
      const minute = OPEN_MINUTE + Math.floor(rng() * OPEN_SPAN_MINUTES);
      if (back === 0 && minute > nowMinutes) continue;
      minutes.push(minute);
    }
    minutes.sort((a, b) => a - b);

    minutes.forEach((minute, index) => {
      const orderId = index + 1;
      const date = new Date(
        day.getFullYear(),
        day.getMonth(),
        day.getDate(),
        Math.floor(minute / 60),
        minute % 60,
      );

      const kinds = 1 + Math.floor(rng() * 3);
      const codes: string[] = [];
      while (codes.length < kinds) {
        const code = SALES_POOL[Math.floor(rng() * SALES_POOL.length)];
        if (!codes.includes(code)) codes.push(code);
      }

      const items: TransactionItem[] = codes.map((code) => {
        const p = findProduct(code);
        const qty = rng() < 0.15 ? 3 : 1 + Math.floor(rng() * 2);
        return {
          productId: p.id,
          code: p.code,
          name: p.name,
          qty,
          price: p.sellPrice,
          cost: p.buyPrice,
        };
      });

      const withDiscount = rng() < 0.12;
      const ppnEnabled = rng() < 0.4;
      const totals = computeTotals({
        subtotal: itemsSubtotal(items),
        discountType: "percent",
        discountValue: withDiscount ? 10 : 0,
        maxDiscountPercent: SETTINGS.maxDiscount,
        ppnEnabled,
        ppnRate: SETTINGS.ppnRate,
        rounding: SETTINGS.rounding,
      });

      const method = pickMethod(rng());
      const paid =
        method === "Tunai" ? roundUpCash(totals.total) : totals.total;

      transactions.push({
        id: `trx-demo-${dayKey}-${orderId}`,
        orderId,
        trxNo: makeTrxNo(date, orderId, SETTINGS.trxFormat),
        createdAt: date.toISOString(),
        cashier: rng() < 0.85 ? "Demo Kasir" : "Demo Owner",
        customerName: CUSTOMERS[Math.floor(rng() * CUSTOMERS.length)],
        items,
        subtotal: totals.subtotal,
        discountType: "percent",
        discountValue: withDiscount ? 10 : 0,
        discountAmount: totals.discountAmount,
        ppnEnabled,
        ppnAmount: totals.ppnAmount,
        roundingAmount: totals.roundingAmount,
        total: totals.total,
        method,
        paid,
        change: paid - totals.total,
        status: "Lunas",
      });
    });

    if (minutes.length > 0) counters[dayKey] = minutes.length;
  }

  return { transactions, counters };
}

type ExpenseSeed = {
  daysAgo: number;
  category: ExpenseCategory;
  description: string;
  amount: number;
};

const EXPENSES: ExpenseSeed[] = [
  {
    daysAgo: 12,
    category: "Sewa",
    description: "Sewa tempat bulan ini",
    amount: 3000000,
  },
  {
    daysAgo: 10,
    category: "Listrik",
    description: "Bayar listrik bulan ini",
    amount: 850000,
  },
  {
    daysAgo: 7,
    category: "Gaji",
    description: "Gaji mingguan karyawan",
    amount: 1500000,
  },
  {
    daysAgo: 5,
    category: "Perlengkapan",
    description: "Beli gelas plastik dan sedotan",
    amount: 275000,
  },
  {
    daysAgo: 3,
    category: "Lainnya",
    description: "Beli biji kopi dan bahan baku",
    amount: 1250000,
  },
  {
    daysAgo: 1,
    category: "Perlengkapan",
    description: "Beli tisu dan kantong plastik",
    amount: 120000,
  },
];

function buildExpenses(now: Date): Expense[] {
  return EXPENSES.map((e, index) => ({
    id: `exp-demo-${index + 1}`,
    date: new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - e.daysAgo,
      10,
      0,
    ).toISOString(),
    category: e.category,
    description: e.description,
    amount: e.amount,
    userName: "Demo Owner",
    attachment: null,
  }));
}

export function buildSeed(now: Date = new Date()): DemoDb {
  const rng = mulberry32(20260101);
  const { transactions, counters } = buildTransactions(now, rng);

  return {
    version: DEMO_DB_VERSION,
    products: structuredClone(PRODUCTS),
    transactions,
    expenses: buildExpenses(now),
    settings: structuredClone(SETTINGS),
    users: structuredClone(USERS),
    orderCounters: counters,
  };
}
