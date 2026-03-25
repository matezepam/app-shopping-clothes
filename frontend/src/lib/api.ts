import type { Order, ReturnRequest, User } from "../types/store";

const base = () =>
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "";

async function request<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, headers, ...rest } = options;
  const res = await fetch(`${base()}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });
  const data = (await res.json().catch(() => ({}))) as T & {
    error?: string;
    message?: string;
  };
  if (!res.ok) {
    const msg =
      typeof data === "object" && data && "error" in data && data.error
        ? String(data.error)
        : res.statusText;
    throw new Error(msg);
  }
  return data as T;
}

export const api = {
  register: (body: { email: string; password: string; name: string }) =>
    request<{ token: string; user: User }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<{ token: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  me: (token: string) =>
    request<{ user: User }>("/api/auth/me", { token }),

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
