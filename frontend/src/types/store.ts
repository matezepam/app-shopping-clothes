export type Category =
  | "men"
  | "women"
  | "souvenirs"
  | "shirts"
  | "hoodies"
  | "caps"
  | "art";

export type UserRole = "user" | "admin";

export interface Product {
  id: string;
  /** Texto por defecto si falta traducción */
  name: string;
  category: Category;
  concept: string;
  priceUsd: number;
  image: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type CurrencyCode = "USD" | "EUR" | "GBP";

export interface OrderLine {
  productId: string;
  name: string;
  quantity: number;
  unitPriceUsd: number;
}

export interface Order {
  id: string;
  createdAt: string;
  totalUsd: number;
  status: string;
  items: OrderLine[];
}

export type ReturnStatus = "requested" | "approved" | "rejected" | "refunded";

export interface ReturnRequest {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  reason: string;
  status: ReturnStatus;
  createdAt: string;
}
