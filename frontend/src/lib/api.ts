import type { Order, Product, ReturnRequest, User } from "../types/store";

const base = () => import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "";

export class ApiClientError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly requestId?: string;
  readonly validationErrors?: Record<string, string>;

  constructor(
    message: string,
    status: number,
    code?: string,
    requestId?: string,
    validationErrors?: Record<string, string>,
  ) {
    super(requestId ? `${message} · Ref. ${requestId}` : message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.requestId = requestId;
    this.validationErrors = validationErrors;
  }
}

async function request<T>(path: string, options: RequestInit & { token?: string | null } = {}): Promise<T> {
  const { token, headers, ...rest } = options;
  const isFormData = rest.body instanceof FormData;
  const res = await fetch(`${base()}${path}`, {
    ...rest,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  }).catch(() => { throw new Error("No se pudo conectar con el servicio de Sprint."); });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string; message?: string; code?: string; requestId?: string; validationErrors?: Record<string, string> };
  if (!res.ok) {
    const requestId = data.requestId || res.headers.get("X-Request-ID") || undefined;
    throw new ApiClientError(String(data?.error || data?.message || res.statusText), res.status, data.code, requestId, data.validationErrors);
  }
  return data as T;
}

export const api = {
  products: () => request<{ products: Product[] }>("/api/products"),
  product: (id: string) => request<{ product: Product }>(`/api/products/${encodeURIComponent(id)}`),
  adminProducts: (token: string) => request<{ products: Product[] }>("/api/products/admin", { token }),
  createProduct: (token: string, body: ProductPayload) => request<{ product: Product }>("/api/products/admin", { method: "POST", token, body: JSON.stringify(body) }),
  updateProduct: (token: string, id: string, body: ProductPayload) => request<{ product: Product }>(`/api/products/admin/${encodeURIComponent(id)}`, { method: "PUT", token, body: JSON.stringify(body) }),
  updateProductStatus: (token: string, id: string, status: "active" | "hidden" | "disabled") => request<{ product: Product }>(`/api/products/admin/${encodeURIComponent(id)}/status`, { method: "PATCH", token, body: JSON.stringify({ status }) }),
  productDeletionRequests: (token: string) => request<{ requests: ProductDeletionRow[] }>("/api/admin/product-deletions", { token }),
  requestProductDeletion: (token: string, id: string, reason: string) => request<{ request: ProductDeletionRow }>(`/api/admin/product-deletions/${encodeURIComponent(id)}`, { method: "POST", token, body: JSON.stringify({ reason }) }),
  resolveProductDeletion: (token: string, id: string, decision: "APPROVED" | "REJECTED", note?: string) => request<{ request: ProductDeletionRow }>(`/api/admin/product-deletions/${encodeURIComponent(id)}`, { method: "PATCH", token, body: JSON.stringify({ decision, note }) }),
  uploadProductImages: (token: string, files: File[]) => {
    const form = new FormData();
    files.forEach((file) => form.append("images", file));
    return request<{ images: { url: string; name: string; size: number }[] }>("/api/products/admin/images", { method: "POST", token, body: form });
  },

  register: (body: RegisterPayload) => request<RegistrationResponse>("/api/auth/register", { method: "POST", body: JSON.stringify(body) }),
  confirmRegistration: (email: string, code: string) => request<void>("/api/auth/confirm", { method: "POST", body: JSON.stringify({ email, code }) }),
  resendCode: (email: string) => request<{ delivery: string | null }>("/api/auth/resend-code", { method: "POST", body: JSON.stringify({ email }) }),
  login: (body: { email: string; password: string }) => request<AuthTokens>("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
  refresh: (refreshToken: string, username: string) => request<AuthTokens>("/api/auth/refresh", { method: "POST", body: JSON.stringify({ refreshToken, username }) }),
  forgotPassword: (email: string) => request<{ delivery: string | null }>("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
  resetPassword: (email: string, code: string, newPassword: string) => request<void>("/api/auth/reset-password", { method: "POST", body: JSON.stringify({ email, code, newPassword }) }),
  me: (token: string) => request<{ user: User }>("/api/auth/me", { token }),
  updateProfile: (token: string, body: Partial<User>) => request<{ user: User }>("/api/auth/profile", { method: "PATCH", token, body: JSON.stringify(body) }),
  uploadAvatar: (token: string, file: File) => { const form = new FormData(); form.append("avatar", file); return request<{ user: User }>("/api/auth/avatar", { method: "PATCH", token, body: form }); },
  deleteAvatar: (token: string) => request<{ user: User }>("/api/auth/avatar", { method: "DELETE", token }),
  changePassword: (token: string, body: { currentPassword: string; newPassword: string }) => request<void>("/api/auth/password", { method: "PATCH", token, body: JSON.stringify(body) }),

  orders: (token: string) => request<{ orders: Order[] }>("/api/orders", { token }),
  checkout: (token: string, body: { items: { productId: string; quantity: number }[]; shippingAddress: string; contactPhone: string }) =>
    request<{ order: Order }>("/api/orders", { method: "POST", token, headers: { "Idempotency-Key": crypto.randomUUID() }, body: JSON.stringify(body) }),
  returnsList: (token: string) => request<{ returns: ReturnRequest[] }>("/api/returns", { token }),
  createReturn: (token: string, body: { orderId: string; productId: string; quantity: number; reason: string }) => request<{ return: ReturnRequest }>("/api/returns", { method: "POST", token, body: JSON.stringify(body) }),

  adminStats: (token: string) => request<AdminStats>("/api/admin/stats", { token }),
  adminReturns: (token: string) => request<{ returns: AdminReturnRow[] }>("/api/admin/returns", { token }),
  adminReturnPatch: (token: string, id: string, body: { status: string; adminNote?: string }) => request<{ return: AdminReturnRow }>(`/api/admin/returns/${id}`, { method: "PATCH", token, body: JSON.stringify(body) }),
  adminOrders: (token: string) => request<{ orders: Order[] }>("/api/admin/orders", { token }),
  adminOrderPatch: (token: string, id: string, status: string) => request<{ order: Order }>(`/api/admin/orders/${id}`, { method: "PATCH", token, body: JSON.stringify({ status }) }),
  categories: () => request<{ categories: CategoryRow[] }>("/api/categories"),
  adminCategories: (token: string) => request<{ categories: CategoryRow[] }>("/api/categories/admin", { token }),
  createCategory: (token: string, body: { name: string; parentId?: number | null; active?: boolean }) => request<{ category: CategoryRow }>("/api/categories/admin", { method: "POST", token, body: JSON.stringify(body) }),
  updateCategory: (token: string, id: number, body: { name: string; parentId?: number | null; active?: boolean }) => request<{ category: CategoryRow }>(`/api/categories/admin/${id}`, { method: "PUT", token, body: JSON.stringify(body) }),
  deleteCategory: (token: string, id: number) => request<void>(`/api/categories/admin/${id}`, { method: "DELETE", token }),
  suppliers: (token: string) => request<{ suppliers: SupplierRow[] }>("/api/admin/suppliers", { token }),
  createSupplier: (token: string, body: Omit<SupplierRow, "id">) => request<{ supplier: SupplierRow }>("/api/admin/suppliers", { method: "POST", token, body: JSON.stringify(body) }),
  updateSupplier: (token: string, id: string, body: Omit<SupplierRow, "id">) => request<{ supplier: SupplierRow }>(`/api/admin/suppliers/${id}`, { method: "PUT", token, body: JSON.stringify(body) }),
  deleteSupplier: (token: string, id: string) => request<void>(`/api/admin/suppliers/${id}`, { method: "DELETE", token }),
  inventory: (token: string) => request<{ movements: InventoryRow[] }>("/api/admin/inventory", { token }),
  inventoryMovement: (token: string, body: { productId: string; type: string; quantity: number; supplierId?: string; reference?: string }) => request<{ movement: InventoryRow }>("/api/admin/inventory", { method: "POST", token, body: JSON.stringify(body) }),
  moderation: (token: string) => request<{ products: ModerationRow[] }>("/api/admin/moderation", { token }),
  moderationHistory: (token: string) => request<{ products: ModerationRow[] }>("/api/admin/moderation/history", { token }),
  moderate: (token: string, productId: string, decision: string, note?: string) => request<{ product: ModerationRow }>(`/api/admin/moderation/${encodeURIComponent(productId)}`, { method: "PATCH", token, body: JSON.stringify({ decision, note }) }),
  customers: (token: string) => request<{ customers: CustomerRow[] }>("/api/admin/customers", { token }),
  customerStatus: (token: string, id: number, enabled: boolean) => request<{ customer: CustomerRow }>(`/api/admin/customers/${id}`, { method: "PATCH", token, body: JSON.stringify({ enabled }) }),
};

export interface AuthTokens { token: string; tokenType: string; refreshToken?: string; expiresIn?: number; }
export interface RegistrationResponse { email: string; confirmed: boolean; delivery?: string | null; }
export interface RegisterPayload { firstName: string; lastName: string; email: string; password: string; phone: string; country: string; gender: string; birthDate: string; age: number; }
export interface ProductSalesRow { productId: string; name: string; sku: string; collection: string; image: string; unitsSold: number; revenueUsd: number; currentStock: number; }
export interface AdminStats { summary: { ordersCount: number; revenueUsd: number; unitsSold: number; returnsPending: number; lowStockProducts: number }; topProducts: ProductSalesRow[]; lowProducts: ProductSalesRow[]; revenueByDay: { day: string; revenueUsd: number }[]; }
export interface AdminReturnRow { id: string; orderId: string; productId: string; quantity: number; reason: string; status: string; createdAt: string; adminNote: string | null; userEmail: string; }
export interface CategoryRow { id: number; name: string; slug: string; parentId: number | null; active: boolean; }
export interface SupplierRow { id: string; name: string; taxId: string; email?: string | null; phone?: string | null; status: string; productIds: string[] | Set<string>; }
export interface InventoryRow { id: string; productId: string; productName: string; supplierId?: string | null; type: string; quantity: number; resultingStock: number; reference?: string | null; createdBy: string; createdAt: string; }
export interface ModerationRow { productId: string; name: string; sku: string; status: string; note?: string | null; moderatedBy?: string | null; moderatedAt?: string | null; }
export interface ProductDeletionRow { id: string; productId: string; productName: string; productSku: string; previousStatus: string; requestedBy: string; reason: string; status: "PENDING" | "APPROVED" | "REJECTED"; moderatorNote?: string | null; createdAt: string; resolvedAt?: string | null; canDeletePermanently: boolean; blockers: string[]; }
export interface CustomerRow { id: number; cognitoSub?: string | null; firstName: string; lastName: string; email: string; phone?: string | null; country?: string | null; preferredLanguage: string; enabled: boolean; createdAt: string; }
export type ProductPayload = { id?: string; sku: string; name: string; collection: string; category: string; subcategory: string; concept: string; priceUsd: number; compareAtPriceUsd?: number | null; image: string; images: string[]; description?: string | null; story?: string | null; gender: string; color: string; sizes: string[]; stock: number; status: string; };
