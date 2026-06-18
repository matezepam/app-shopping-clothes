import type { Order, Product, ReturnRequest, User } from "../types/store";

const base = () => import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "";

async function request<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, headers, ...rest } = options;
  const isFormData = rest.body instanceof FormData;

  const res = await fetch(`${base()}${path}`, {
    ...rest,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  }).catch(() => {
    throw new Error(
      "No se pudo conectar con el backend. Verifica que el servidor esté iniciado en http://localhost:8080.",
    );
  });

  const data = (await res.json().catch(() => ({}))) as T & {
    error?: string;
    message?: string;
  };

  if (!res.ok) {
    const msg =
      typeof data === "object" && data
        ? data.error || data.message || res.statusText
        : res.statusText;

    throw new Error(String(msg));
  }

  return data as T;
}

export const api = {
  products: () => request<{ products: Product[] }>("/api/products"),

  product: (id: string) =>
    request<{ product: Product }>(`/api/products/${encodeURIComponent(id)}`),

  adminProducts: (token: string) =>
    request<{ products: Product[] }>("/api/products/admin", { token }),

  createProduct: (token: string, body: ProductPayload) =>
    request<{ product: Product }>("/api/products/admin", {
      method: "POST",
      token,
      body: JSON.stringify(body),
    }),

  updateProduct: (token: string, id: string, body: ProductPayload) =>
    request<{ product: Product }>(
      `/api/products/admin/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        token,
        body: JSON.stringify(body),
      },
    ),

  deleteProduct: (token: string, id: string) =>
    request<void>(`/api/products/admin/${encodeURIComponent(id)}`, {
      method: "DELETE",
      token,
    }),

  register: (body: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    country: string;
    gender: string;
    birthDate: string;
    age: number;
  }) =>
    request<{ token: string; tokenType: string; user: User }>(
      "/api/auth/register",
      {
        method: "POST",
        body: JSON.stringify(body),
      },
    ),

  login: (body: { email: string; password: string }) =>
    request<{ token: string; tokenType: string; user: User }>(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify(body),
      },
    ),

  me: (token: string) => request<{ user: User }>("/api/auth/me", { token }),

  updateProfile: (
    token: string,
    body: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      country?: string;
      gender?: string;
      age?: number;
      preferredLanguage?: string;
      preferredCurrency?: string;
      currentLocation?: string;
    },
  ) =>
    request<{ token?: string; tokenType?: string; user: User }>("/api/auth/profile", {
      method: "PATCH",
      token,
      body: JSON.stringify(body),
    }),

  uploadAvatar: (token: string, file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);

    return request<{ user: User }>("/api/auth/avatar", {
      method: "PATCH",
      token,
      headers: {},
      body: formData,
    });
  },

  deleteAvatar: (token: string) =>
    request<{ user: User }>("/api/auth/avatar", {
      method: "DELETE",
      token,
    }),

  changePassword: (
    token: string,
    body: { currentPassword: string; newPassword: string },
  ) =>
    request<void>("/api/auth/password", {
      method: "PATCH",
      token,
      body: JSON.stringify(body),
    }),

  orders: (token: string) =>
    request<{ orders: Order[] }>("/api/orders", { token }),

  checkout: (
    token: string,
    body: { items: { productId: string; quantity: number }[] },
  ) =>
    request<{ order: Order }>("/api/orders", {
      method: "POST",
      token,
      body: JSON.stringify(body),
    }),

  returnsList: (token: string) =>
    request<{ returns: ReturnRequest[] }>("/api/returns", { token }),

  createReturn: (
    token: string,
    body: {
      orderId: string;
      productId: string;
      quantity: number;
      reason: string;
    },
  ) =>
    request<{ return: ReturnRequest }>("/api/returns", {
      method: "POST",
      token,
      body: JSON.stringify(body),
    }),

  adminStats: (token: string) =>
    request<AdminStats>("/api/admin/stats", { token }),

  adminReturns: (token: string) =>
    request<{ returns: AdminReturnRow[] }>("/api/admin/returns", { token }),

  adminReturnPatch: (
    token: string,
    id: string,
    body: { status: string; adminNote?: string },
  ) =>
    request<{ return: AdminReturnRow }>(`/api/admin/returns/${id}`, {
      method: "PATCH",
      token,
      body: JSON.stringify(body),
    }),
};

export interface AdminStats {
  summary: {
    ordersCount: number;
    revenueUsd: number;
    unitsSold: number;
    returnsPending: number;
  };
  topProducts: {
    productId: string;
    name: string;
    unitsSold: number;
    revenueUsd: number;
  }[];
  revenueByDay: { day: string; revenueUsd: number }[];
}

export interface AdminReturnRow {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  reason: string;
  status: string;
  createdAt: string;
  adminNote: string | null;
  userEmail: string;
}

export type ProductPayload = {
  id?: string;
  sku: string;
  name: string;
  collection: string;
  category: string;
  subcategory: string;
  concept: string;
  priceUsd: number;
  compareAtPriceUsd?: number | null;
  image: string;
  images: string[];
  description?: string | null;
  story?: string | null;
  gender: string;
  color: string;
  sizes: string[];
  stock: number;
  status: string;
};
