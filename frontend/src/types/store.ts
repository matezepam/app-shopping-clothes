export type Category =
  | "men"
  | "women"
  | "souvenirs"
  | "shirts"
  | "hoodies"
  | "caps"
  | "art"
  | "pants"
  | "bags"
  | "mugs"
  | "embroidery";

export type Gender = "male" | "female" | "non_binary" | "prefer_not_to_say";

export type MaleSubcategory =
  | "camisetas"
  | "sudaderas"
  | "gorras"
  | "bolsos"
  | "pantalones";

export type FemaleSubcategory =
  | "camisetas"
  | "sudaderas"
  | "gorras"
  | "bolsos"
  | "pantalones"
  | "bisuteria"
  | "joyas";

export type ProductSubcategory =
  | MaleSubcategory
  | FemaleSubcategory
  | "recuadros"
  | "tazas"
  | "bordados";

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

export type UserRole = "USER" | "ADMIN" | "VENDOR" | "MODERATOR";

export interface Product {
  id: string;
  sku?: string;
  name: string;
  collection?: "men" | "women" | "souvenirs";
  category: Category;
  concept: string;
  priceUsd: number;
  compareAtPriceUsd?: number | null;
  image: string;
  images?: string[];
  gender: "male" | "female";
  subcategory: ProductSubcategory;
  color: ProductColor;
  sizes?: string[];
  stock?: number;
  status?: "active" | "draft" | "disabled";
  moderationStatus?: "PENDING" | "APPROVED" | "REJECTED" | "OBSERVED";
  moderationNote?: string | null;
  description?: string | null;
  story?: string | null;
  createdAt?: string;
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
  birthDate?: string | null;
  age?: number | null;
  preferredLanguage?: string | null;
  preferredCurrency?: CurrencyCode | null;
  createdAt?: string | null;
  avatarUrl?: string | null;
  currentLocation?: string | null;
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
  shippingAddress: string;
  contactPhone: string;
  whatsappUrl: string;
  items: OrderLine[];
}

export type ReturnStatus = "REQUESTED" | "APPROVED" | "REJECTED" | "RECEIVED";

export interface ReturnRequest {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  reason: string;
  status: ReturnStatus;
  createdAt: string;
  adminNote?: string | null;
}
