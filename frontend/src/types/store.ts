export type Category =
  | "men"
  | "women"
  | "souvenirs"
  | "shirts"
  | "hoodies"
  | "caps"
  | "art";

export type Gender = "male" | "female" | "non_binary" | "prefer_not_to_say";

export type MaleSubcategory = "camisetas" | "gorras" | "bolsos";

export type FemaleSubcategory =
  | "camisetas"
  | "gorras"
  | "bolsos"
  | "bisuteria"
  | "joyas";

export type ProductSubcategory = MaleSubcategory | FemaleSubcategory;

export type ProductColor =
  | "negro"
  | "blanco"
  | "rojo"
  | "azul"
  | "verde"
  | "beige"
  | "gris"
  | "dorado"
  | "plateado"
  | "rosa";

export type UserRole = "USER" | "ADMIN";

export interface Product {
  id: string;
  name: string;
  category: Category;
  concept: string;
  priceUsd: number;
  image: string;
  gender: "male" | "female";
  subcategory: ProductSubcategory;
  color: ProductColor;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roles: UserRole[];
  phone?: string | null;
  country?: string | null;
  gender?: string | null;
  age?: number | null;
  createdAt?: string | null;
  avatarUrl?: string | null;
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