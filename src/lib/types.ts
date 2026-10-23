export type Category = "Makanan" | "Minuman" | "Lainnya";
export type PaymentMethod = "Tunai" | "QRIS" | "Debit";
export type DiscountType = "percent" | "nominal";
export type Rounding = "none" | "100" | "500" | "1000";
export type ResetPeriod = "daily" | "monthly" | "yearly";
export type PaperSize = "58mm" | "80mm" | "88mm";
export type ExpenseCategory =
  | "Listrik"
  | "Gaji"
  | "Perlengkapan"
  | "Sewa"
  | "Lainnya";
export type UserRole = "Owner" | "Kasir";

export type StoredFile = {
  name: string;
  type: string;
  dataUrl: string;
};

export type Product = {
  id: string;
  code: string;
  barcode: string;
  name: string;
  description: string;
  category: Category;
  unit: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  minStock: number;
  active: boolean;
  image: string | null;
};

export type TransactionItem = {
  productId: string;
  code: string;
  name: string;
  qty: number;
  price: number;
  cost: number;
};

export type Transaction = {
  id: string;
  orderId: number;
  trxNo: string;
  createdAt: string;
  cashier: string;
  customerName: string;
  items: TransactionItem[];
  subtotal: number;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  ppnEnabled: boolean;
  ppnAmount: number;
  roundingAmount: number;
  total: number;
  method: PaymentMethod;
  paid: number;
  change: number;
  status: "Lunas";
};

export type Expense = {
  id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  userName: string;
  attachment: StoredFile | null;
};

export type User = {
  id: string;
  name: string;
  username: string;
  password: string;
  role: UserRole;
  active: boolean;
};

export type Settings = {
  storeName: string;
  address: string;
  phone: string;
  whatsapp: string;
  npwp: string;
  logo: StoredFile | null;
  ppnDefault: boolean;
  ppnRate: number;
  maxDiscount: number;
  rounding: Rounding;
  trxFormat: string;
  resetPeriod: ResetPeriod;
  paperSize: PaperSize;
  margin: number;
  autoPrint: boolean;
};

export type OrderCounter = {
  date: string;
  last: number;
};
