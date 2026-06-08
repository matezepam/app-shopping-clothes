import type {
  AdminProduct,
  AdminStatsData,
  ProductStatus,
  ReturnRequest,
  ReturnStatus,
} from "../types/admin";

export function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

export function createDemoId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function formatMoney(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(value);
}

export function buildSku(
  category: string,
  collection: string,
  color: string,
  size: string
) {
  const categoryCode = category.slice(0, 3).toUpperCase();
  const collectionCode = collection.slice(0, 3).toUpperCase();
  const colorCode = color.slice(0, 3).toUpperCase();
  const sizeCode = size.toUpperCase();

  return `${categoryCode}-${collectionCode}-${colorCode}-${sizeCode}`;
}

export function getProductTotalStock(product: AdminProduct) {
  return product.variants.reduce((total, variant) => total + variant.stock, 0);
}

export function getProductInventoryValue(product: AdminProduct) {
  return product.variants.reduce(
    (total, variant) => total + variant.price * variant.stock,
    0
  );
}

export function getProductPriceRange(product: AdminProduct) {
  const prices = product.variants.map((variant) => variant.price);

  if (prices.length === 0) {
    return "$0.00";
  }

  const min = Math.min(...prices);
  const max = Math.max(...prices);

  if (min === max) {
    return formatMoney(min);
  }

  return `${formatMoney(min)} - ${formatMoney(max)}`;
}

export function getLowStockProducts(products: AdminProduct[]) {
  return products.filter((product) => getProductTotalStock(product) <= 8);
}

export function calculateAdminStats(
  products: AdminProduct[],
  returns: ReturnRequest[]
): AdminStatsData {
  const activeProducts = products.filter(
    (product) => product.status === "active"
  ).length;

  const totalStock = products.reduce(
    (total, product) => total + getProductTotalStock(product),
    0
  );

  const lowStock = getLowStockProducts(products).length;

  const inventoryValue = products.reduce(
    (total, product) => total + getProductInventoryValue(product),
    0
  );

  const pendingReturns = returns.filter(
    (item) => item.status === "pending"
  ).length;

  return {
    activeProducts,
    totalProducts: products.length,
    totalStock,
    lowStock,
    inventoryValue,
    pendingReturns,
  };
}

export function statusLabel(status: ProductStatus) {
  if (status === "active") return "Activo";
  if (status === "draft") return "Borrador";
  return "Desactivado";
}

export function returnStatusLabel(status: ReturnStatus) {
  if (status === "pending") return "Pendiente";
  if (status === "approved") return "Aprobada";
  if (status === "rejected") return "Rechazada";
  if (status === "received") return "Recibida";
  return "Reembolsada";
}