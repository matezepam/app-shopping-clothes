export type ProductStatus = "active" | "draft" | "disabled";

export type ReturnStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "received"
  | "refunded";

export type StatusFilter = "all" | ProductStatus;

export type ProductVariant = {
  id: string;
  sku: string;
  colorName: string;
  colorHex: string;
  size: string;
  price: number;
  stock: number;
};

export type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  collection: string;
  shortDescription: string;
  description: string;
  status: ProductStatus;
  images: string[];
  tags: string[];
  featured: boolean;
  createdAt: string;
  variants: ProductVariant[];
};

export type ReturnRequest = {
  id: string;
  orderId: string;
  productId: string;
  variantSku: string;
  customerEmail: string;
  productName: string;
  quantity: number;
  reason: string;
  status: ReturnStatus;
  createdAt: string;
};

export type AdminStatsData = {
  activeProducts: number;
  totalProducts: number;
  totalStock: number;
  lowStock: number;
  inventoryValue: number;
  pendingReturns: number;
};

export type SalesPoint = {
  day: string;
  value: number;
};