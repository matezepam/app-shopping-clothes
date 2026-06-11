import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Activity,
  AlertTriangle,
  BadgeDollarSign,
  Box,
  CheckCircle2,
  Edit3,
  Eye,
  Package,
  Plus,
  RefreshCcw,
  Search,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { formatMoney } from "../../lib/currency";

type ProductStatus = "active" | "draft" | "disabled";

type AdminProduct = {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  status: ProductStatus;
  image: string;
  sizes: string[];
  colors: string[];
  description: string;
  createdAt: string;
};

type ReturnRequest = {
  id: string;
  userEmail: string;
  orderId: string;
  productName: string;
  quantity: number;
  reason: string;
  status: "pending" | "approved" | "rejected" | "refunded";
};

const initialProducts: AdminProduct[] = [
  {
    id: "black-oversized-hoodie",
    sku: "HD-BLK-001",
    name: "Black Oversized Hoodie",
    category: "Hoodies",
    price: 59.99,
    compareAtPrice: 79.99,
    stock: 18,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Gray"],
    description:
      "Hoodie oversize de algodón premium con capucha ajustable y estilo urbano.",
    createdAt: "2026-05-20",
  },
  {
    id: "white-street-tshirt",
    sku: "TS-WHT-014",
    name: "White Street T-Shirt",
    category: "T-Shirts",
    price: 29.99,
    stock: 42,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
    sizes: ["S", "M", "L"],
    colors: ["White"],
    description:
      "Camiseta blanca de corte regular, ideal para outfits casuales y streetwear.",
    createdAt: "2026-05-18",
  },
  {
    id: "eagle-classic-cap",
    sku: "CP-EGL-009",
    name: "Eagle Classic Cap",
    category: "Caps",
    price: 24.99,
    stock: 7,
    status: "active",
    image:
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800&auto=format&fit=crop",
    sizes: ["One Size"],
    colors: ["Black", "Beige"],
    description:
      "Gorra clásica con ajuste trasero, bordado frontal y acabado premium.",
    createdAt: "2026-05-14",
  },
  {
    id: "urban-cargo-pants",
    sku: "PT-CRG-021",
    name: "Urban Cargo Pants",
    category: "Pants",
    price: 64.99,
    compareAtPrice: 89.99,
    stock: 3,
    status: "draft",
    image:
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=800&auto=format&fit=crop",
    sizes: ["M", "L", "XL"],
    colors: ["Olive", "Black"],
    description:
      "Pantalón cargo con bolsillos laterales, corte relajado y tela resistente.",
    createdAt: "2026-05-12",
  },
];

const initialReturns: ReturnRequest[] = [
  {
    id: "ret-001",
    userEmail: "mateo@example.com",
    orderId: "ORD-92018",
    productName: "Black Oversized Hoodie",
    quantity: 1,
    reason: "La talla no coincidió con lo esperado.",
    status: "pending",
  },
  {
    id: "ret-002",
    userEmail: "cliente@example.com",
    orderId: "ORD-83022",
    productName: "White Street T-Shirt",
    quantity: 2,
    reason: "Cambio por otro color.",
    status: "approved",
  },
];

const emptyProduct: AdminProduct = {
  id: "",
  sku: "",
  name: "",
  category: "T-Shirts",
  price: 0,
  compareAtPrice: undefined,
  stock: 0,
  status: "active",
  image: "",
  sizes: ["S", "M", "L"],
  colors: ["Black"],
  description: "",
  createdAt: new Date().toISOString().slice(0, 10),
};

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

function statusLabel(status: ProductStatus) {
  if (status === "active") return "Activo";
  if (status === "draft") return "Borrador";
  return "Desactivado";
}

function returnStatusLabel(status: ReturnRequest["status"]) {
  if (status === "pending") return "Pendiente";
  if (status === "approved") return "Aprobado";
  if (status === "rejected") return "Rechazado";
  return "Reembolsado";
}

export function AdminPage() {
  const { t } = useTranslation();

  const [products, setProducts] = useState<AdminProduct[]>(initialProducts);
  const [returns, setReturns] = useState<ReturnRequest[]>(initialReturns);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"all" | ProductStatus>(
    "all"
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AdminProduct>(emptyProduct);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.sku.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        selectedStatus === "all" || product.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [products, search, selectedStatus]);

  const stats = useMemo(() => {
    const activeProducts = products.filter((p) => p.status === "active").length;
    const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
    const lowStock = products.filter((p) => p.stock <= 8).length;
    const inventoryValue = products.reduce(
      (acc, p) => acc + p.price * p.stock,
      0
    );
    const pendingReturns = returns.filter((r) => r.status === "pending").length;

    return {
      activeProducts,
      totalStock,
      lowStock,
      inventoryValue,
      pendingReturns,
    };
  }, [products, returns]);

  const revenueByDay = [
    { day: "Lun", value: 420 },
    { day: "Mar", value: 690 },
    { day: "Mié", value: 510 },
    { day: "Jue", value: 880 },
    { day: "Vie", value: 730 },
    { day: "Sáb", value: 1100 },
    { day: "Dom", value: 940 },
  ];

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyProduct);
    setIsFormOpen(true);
  };

  const openEditForm = (product: AdminProduct) => {
    setEditingId(product.id);
    setForm(product);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setEditingId(null);
    setForm(emptyProduct);
    setIsFormOpen(false);
  };

  const saveProduct = () => {
    const cleanName = form.name.trim();

    if (!cleanName || !form.sku.trim() || !form.category.trim()) {
      alert("Completa nombre, SKU y categoría.");
      return;
    }

    const productToSave: AdminProduct = {
      ...form,
      id: editingId ?? createSlug(cleanName),
      image:
        form.image.trim() ||
        "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=800&auto=format&fit=crop",
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice
        ? Number(form.compareAtPrice)
        : undefined,
      stock: Number(form.stock),
      sizes: form.sizes.length ? form.sizes : ["S", "M", "L"],
      colors: form.colors.length ? form.colors : ["Black"],
    };

    if (editingId) {
      setProducts((current) =>
        current.map((product) =>
          product.id === editingId ? productToSave : product
        )
      );
    } else {
      setProducts((current) => [productToSave, ...current]);
    }

    closeForm();
  };

  const deleteProduct = (id: string) => {
    const confirmed = window.confirm("¿Eliminar este producto de la demo?");

    if (!confirmed) return;

    setProducts((current) => current.filter((product) => product.id !== id));
  };

  const toggleProductStatus = (id: string) => {
    setProducts((current) =>
      current.map((product) =>
        product.id === id
          ? {
              ...product,
              status: product.status === "active" ? "disabled" : "active",
            }
          : product
      )
    );
  };

  const updateReturnStatus = (
    id: string,
    status: ReturnRequest["status"]
  ) => {
    setReturns((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item))
    );
  };

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-eagle-mist/25 bg-[#090f18] p-6 shadow-2xl shadow-black/25 sm:p-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-eagle-gold/10 blur-3xl" />
          <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-eagle-mist/10 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-eagle-mist/25 bg-eagle-night/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-eagle-sand/70">
              <Activity size={15} className="text-eagle-gold" />
              Admin Demo
            </div>

            <h1 className="font-display text-4xl font-bold text-eagle-foam sm:text-5xl">
              {t("admin.title", "Panel administrativo")}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-eagle-sand/75">
              Vista de prueba para gestionar productos, stock, estados y
              devoluciones. Todo funciona localmente con datos demo, sin backend
              todavía.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-eagle-gold px-5 py-3 text-sm font-bold text-eagle-night shadow-lg shadow-eagle-gold/20 transition hover:-translate-y-0.5 hover:bg-eagle-foam"
          >
            <Plus size={18} />
            Agregar producto
          </button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-3xl border border-eagle-mist/25 bg-eagle-deep/60 p-5 shadow-xl shadow-black/10">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-eagle-gold/12 text-eagle-gold">
            <ShoppingBag size={22} />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-eagle-sand/50">
            Productos activos
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-eagle-foam">
            {stats.activeProducts}
          </p>
        </div>

        <div className="rounded-3xl border border-eagle-mist/25 bg-eagle-deep/60 p-5 shadow-xl shadow-black/10">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-eagle-gold/12 text-eagle-gold">
            <Box size={22} />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-eagle-sand/50">
            Stock total
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-eagle-foam">
            {stats.totalStock}
          </p>
        </div>

        <div className="rounded-3xl border border-eagle-mist/25 bg-eagle-deep/60 p-5 shadow-xl shadow-black/10">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/12 text-red-300">
            <AlertTriangle size={22} />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-eagle-sand/50">
            Stock bajo
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-eagle-foam">
            {stats.lowStock}
          </p>
        </div>

        <div className="rounded-3xl border border-eagle-mist/25 bg-eagle-deep/60 p-5 shadow-xl shadow-black/10">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-300">
            <BadgeDollarSign size={22} />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-eagle-sand/50">
            Valor inventario
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-eagle-foam">
            {formatMoney(stats.inventoryValue, "USD")}
          </p>
        </div>

        <div className="rounded-3xl border border-eagle-mist/25 bg-eagle-deep/60 p-5 shadow-xl shadow-black/10">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-eagle-gold/12 text-eagle-gold">
            <RefreshCcw size={22} />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-eagle-sand/50">
            Devoluciones
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-eagle-foam">
            {stats.pendingReturns}
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-eagle-mist/25 bg-eagle-deep/55 p-5 shadow-xl shadow-black/10">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-eagle-foam">
                Ventas demo
              </h2>
              <p className="mt-1 text-sm text-eagle-sand/65">
                Simulación visual para probar el dashboard.
              </p>
            </div>

            <span className="rounded-full border border-eagle-mist/25 bg-eagle-night/70 px-3 py-1 text-xs font-bold text-eagle-sand/70">
              Últimos 7 días
            </span>
          </div>

          <div className="flex h-56 items-end gap-3 rounded-3xl border border-eagle-mist/20 bg-eagle-night/45 p-5">
            {revenueByDay.map((item) => {
              const max = Math.max(...revenueByDay.map((day) => day.value));
              const height = (item.value / max) * 100;

              return (
                <div
                  key={item.day}
                  className="flex flex-1 flex-col items-center justify-end gap-2"
                >
                  <div
                    className="w-full max-w-10 rounded-t-2xl bg-eagle-gold/85 shadow-lg shadow-eagle-gold/10 transition hover:bg-eagle-foam"
                    style={{ height: `${Math.max(height, 12)}%` }}
                    title={`${item.day}: ${formatMoney(item.value, "USD")}`}
                  />
                  <span className="text-xs font-bold text-eagle-sand/55">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[2rem] border border-eagle-mist/25 bg-eagle-deep/55 p-5 shadow-xl shadow-black/10">
          <h2 className="font-display text-2xl font-bold text-eagle-foam">
            Productos con stock bajo
          </h2>

          <div className="mt-5 space-y-3">
            {products
              .filter((product) => product.stock <= 8)
              .map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 rounded-3xl border border-eagle-mist/20 bg-eagle-night/55 p-3"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-16 w-16 rounded-2xl object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-eagle-foam">
                      {product.name}
                    </p>
                    <p className="text-sm text-eagle-sand/60">
                      {product.sku} · {product.category}
                    </p>
                  </div>

                  <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-bold text-red-300">
                    {product.stock} uds.
                  </span>
                </div>
              ))}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-eagle-mist/25 bg-eagle-deep/55 p-5 shadow-xl shadow-black/10 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-eagle-foam">
              Gestión de productos
            </h2>
            <p className="mt-1 text-sm text-eagle-sand/65">
              Agrega, edita o elimina productos de prueba para validar la vista.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex items-center gap-3 rounded-2xl border border-eagle-mist/25 bg-eagle-night/70 px-4 py-3">
              <Search size={18} className="text-eagle-sand/50" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar producto..."
                className="w-full bg-transparent text-sm font-semibold text-eagle-foam outline-none placeholder:text-eagle-sand/45 sm:w-60"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(event.target.value as "all" | ProductStatus)
              }
              className="rounded-2xl border border-eagle-mist/25 bg-eagle-night/70 px-4 py-3 text-sm font-bold text-eagle-foam outline-none"
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="draft">Borradores</option>
              <option value="disabled">Desactivados</option>
            </select>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-3xl border border-eagle-mist/20">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-eagle-night/80 text-xs uppercase tracking-[0.16em] text-eagle-sand/50">
              <tr>
                <th className="p-4">Producto</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Categoría</th>
                <th className="p-4">Precio</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className="border-t border-eagle-mist/15 text-eagle-sand/80 transition hover:bg-eagle-night/35"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-16 w-16 rounded-2xl object-cover"
                      />

                      <div>
                        <p className="font-bold text-eagle-foam">
                          {product.name}
                        </p>
                        <p className="mt-1 line-clamp-1 max-w-xs text-xs text-eagle-sand/55">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 font-mono text-xs">{product.sku}</td>
                  <td className="p-4">{product.category}</td>

                  <td className="p-4">
                    <div>
                      <p className="font-bold text-eagle-foam">
                        {formatMoney(product.price, "USD")}
                      </p>

                      {product.compareAtPrice ? (
                        <p className="text-xs text-eagle-sand/45 line-through">
                          {formatMoney(product.compareAtPrice, "USD")}
                        </p>
                      ) : null}
                    </div>
                  </td>

                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        product.stock <= 8
                          ? "bg-red-500/15 text-red-300"
                          : "bg-emerald-500/15 text-emerald-300"
                      }`}
                    >
                      {product.stock} uds.
                    </span>
                  </td>

                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        product.status === "active"
                          ? "bg-emerald-500/15 text-emerald-300"
                          : product.status === "draft"
                            ? "bg-eagle-gold/15 text-eagle-gold"
                            : "bg-eagle-mist/10 text-eagle-sand/60"
                      }`}
                    >
                      {statusLabel(product.status)}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => toggleProductStatus(product.id)}
                        className="rounded-xl border border-eagle-mist/20 bg-eagle-night/70 p-2 text-eagle-sand transition hover:text-eagle-gold"
                        title="Activar / desactivar"
                      >
                        <Eye size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditForm(product)}
                        className="rounded-xl border border-eagle-mist/20 bg-eagle-night/70 p-2 text-eagle-sand transition hover:text-eagle-gold"
                        title="Editar"
                      >
                        <Edit3 size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteProduct(product.id)}
                        className="rounded-xl border border-red-400/20 bg-red-500/10 p-2 text-red-300 transition hover:bg-red-500/20"
                        title="Eliminar"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center text-eagle-sand/60"
                  >
                    No se encontraron productos.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-[2rem] border border-eagle-mist/25 bg-eagle-deep/55 p-5 shadow-xl shadow-black/10 sm:p-6">
        <h2 className="font-display text-2xl font-bold text-eagle-foam">
          Devoluciones demo
        </h2>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {returns.map((item) => (
            <article
              key={item.id}
              className="rounded-3xl border border-eagle-mist/20 bg-eagle-night/55 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-eagle-foam">
                    {item.productName}
                  </p>
                  <p className="mt-1 text-xs text-eagle-sand/55">
                    {item.orderId} · {item.userEmail}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    item.status === "pending"
                      ? "bg-eagle-gold/15 text-eagle-gold"
                      : item.status === "approved"
                        ? "bg-emerald-500/15 text-emerald-300"
                        : item.status === "rejected"
                          ? "bg-red-500/15 text-red-300"
                          : "bg-sky-500/15 text-sky-300"
                  }`}
                >
                  {returnStatusLabel(item.status)}
                </span>
              </div>

              <p className="mt-4 text-sm leading-6 text-eagle-sand/75">
                {item.reason}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => updateReturnStatus(item.id, "approved")}
                  className="rounded-xl bg-emerald-600/80 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-500"
                >
                  Aprobar
                </button>

                <button
                  type="button"
                  onClick={() => updateReturnStatus(item.id, "rejected")}
                  className="rounded-xl bg-red-700/80 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-600"
                >
                  Rechazar
                </button>

                <button
                  type="button"
                  onClick={() => updateReturnStatus(item.id, "refunded")}
                  className="rounded-xl bg-eagle-gold px-3 py-2 text-xs font-bold text-eagle-night transition hover:bg-eagle-foam"
                >
                  Reembolsar
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {isFormOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border border-eagle-mist/25 bg-[#09111d] p-5 shadow-2xl shadow-black/40 sm:p-6">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-3xl font-bold text-eagle-foam">
                  {editingId ? "Editar producto" : "Agregar producto"}
                </h2>

                <p className="mt-2 text-sm text-eagle-sand/65">
                  Este formulario es demo. Luego estos datos se enviarán al
                  backend.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-2xl border border-eagle-mist/20 bg-eagle-night/70 p-3 text-eagle-sand transition hover:text-eagle-foam"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-3xl border border-eagle-mist/20 bg-eagle-deep/55 p-4">
                <div className="aspect-square overflow-hidden rounded-3xl bg-eagle-night">
                  <img
                    src={
                      form.image ||
                      "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=800&auto=format&fit=crop"
                    }
                    alt="Vista previa"
                    className="h-full w-full object-cover"
                  />
                </div>

                <label className="mt-4 block text-sm font-bold text-eagle-foam">
                  URL de imagen
                  <input
                    value={form.image}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        image: event.target.value,
                      }))
                    }
                    placeholder="https://..."
                    className="mt-2 w-full rounded-2xl border border-eagle-mist/25 bg-eagle-night/80 px-4 py-3 text-sm text-eagle-foam outline-none placeholder:text-eagle-sand/40 focus:border-eagle-gold/50"
                  />
                </label>

                <p className="mt-3 text-xs leading-5 text-eagle-sand/50">
                  Para la demo puedes pegar una imagen de Unsplash. Luego se
                  reemplaza por Cloudinary o subida real de archivos.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-bold text-eagle-foam">
                  Nombre
                  <input
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Black Oversized Hoodie"
                    className="mt-2 w-full rounded-2xl border border-eagle-mist/25 bg-eagle-night/80 px-4 py-3 text-sm text-eagle-foam outline-none placeholder:text-eagle-sand/40 focus:border-eagle-gold/50"
                  />
                </label>

                <label className="block text-sm font-bold text-eagle-foam">
                  SKU
                  <input
                    value={form.sku}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        sku: event.target.value,
                      }))
                    }
                    placeholder="HD-BLK-001"
                    className="mt-2 w-full rounded-2xl border border-eagle-mist/25 bg-eagle-night/80 px-4 py-3 text-sm text-eagle-foam outline-none placeholder:text-eagle-sand/40 focus:border-eagle-gold/50"
                  />
                </label>

                <label className="block text-sm font-bold text-eagle-foam">
                  Categoría
                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        category: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-2xl border border-eagle-mist/25 bg-eagle-night/80 px-4 py-3 text-sm text-eagle-foam outline-none focus:border-eagle-gold/50"
                  >
                    <option value="T-Shirts">T-Shirts</option>
                    <option value="Hoodies">Hoodies</option>
                    <option value="Pants">Pants</option>
                    <option value="Caps">Caps</option>
                    <option value="Sneakers">Sneakers</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </label>

                <label className="block text-sm font-bold text-eagle-foam">
                  Estado
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        status: event.target.value as ProductStatus,
                      }))
                    }
                    className="mt-2 w-full rounded-2xl border border-eagle-mist/25 bg-eagle-night/80 px-4 py-3 text-sm text-eagle-foam outline-none focus:border-eagle-gold/50"
                  >
                    <option value="active">Activo</option>
                    <option value="draft">Borrador</option>
                    <option value="disabled">Desactivado</option>
                  </select>
                </label>

                <label className="block text-sm font-bold text-eagle-foam">
                  Precio
                  <input
                    type="number"
                    value={form.price}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        price: Number(event.target.value),
                      }))
                    }
                    className="mt-2 w-full rounded-2xl border border-eagle-mist/25 bg-eagle-night/80 px-4 py-3 text-sm text-eagle-foam outline-none focus:border-eagle-gold/50"
                  />
                </label>

                <label className="block text-sm font-bold text-eagle-foam">
                  Precio anterior
                  <input
                    type="number"
                    value={form.compareAtPrice ?? ""}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        compareAtPrice: event.target.value
                          ? Number(event.target.value)
                          : undefined,
                      }))
                    }
                    placeholder="Opcional"
                    className="mt-2 w-full rounded-2xl border border-eagle-mist/25 bg-eagle-night/80 px-4 py-3 text-sm text-eagle-foam outline-none placeholder:text-eagle-sand/40 focus:border-eagle-gold/50"
                  />
                </label>

                <label className="block text-sm font-bold text-eagle-foam">
                  Stock
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        stock: Number(event.target.value),
                      }))
                    }
                    className="mt-2 w-full rounded-2xl border border-eagle-mist/25 bg-eagle-night/80 px-4 py-3 text-sm text-eagle-foam outline-none focus:border-eagle-gold/50"
                  />
                </label>

                <label className="block text-sm font-bold text-eagle-foam">
                  Tallas
                  <input
                    value={form.sizes.join(", ")}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        sizes: event.target.value
                          .split(",")
                          .map((item) => item.trim())
                          .filter(Boolean),
                      }))
                    }
                    placeholder="S, M, L, XL"
                    className="mt-2 w-full rounded-2xl border border-eagle-mist/25 bg-eagle-night/80 px-4 py-3 text-sm text-eagle-foam outline-none placeholder:text-eagle-sand/40 focus:border-eagle-gold/50"
                  />
                </label>

                <label className="block text-sm font-bold text-eagle-foam sm:col-span-2">
                  Colores
                  <input
                    value={form.colors.join(", ")}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        colors: event.target.value
                          .split(",")
                          .map((item) => item.trim())
                          .filter(Boolean),
                      }))
                    }
                    placeholder="Black, White, Gray"
                    className="mt-2 w-full rounded-2xl border border-eagle-mist/25 bg-eagle-night/80 px-4 py-3 text-sm text-eagle-foam outline-none placeholder:text-eagle-sand/40 focus:border-eagle-gold/50"
                  />
                </label>

                <label className="block text-sm font-bold text-eagle-foam sm:col-span-2">
                  Descripción
                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    rows={4}
                    placeholder="Descripción corta del producto..."
                    className="mt-2 w-full resize-none rounded-2xl border border-eagle-mist/25 bg-eagle-night/80 px-4 py-3 text-sm text-eagle-foam outline-none placeholder:text-eagle-sand/40 focus:border-eagle-gold/50"
                  />
                </label>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-2xl border border-eagle-mist/25 bg-eagle-night/70 px-5 py-3 text-sm font-bold text-eagle-sand transition hover:text-eagle-foam"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={saveProduct}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-eagle-gold px-5 py-3 text-sm font-bold text-eagle-night shadow-lg shadow-eagle-gold/20 transition hover:-translate-y-0.5 hover:bg-eagle-foam"
              >
                <CheckCircle2 size={18} />
                Guardar producto
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="rounded-3xl border border-eagle-mist/20 bg-eagle-deep/40 p-5 text-sm leading-7 text-eagle-sand/70">
        <div className="mb-2 flex items-center gap-2 font-bold text-eagle-foam">
          <Package size={18} className="text-eagle-gold" />
          Nota para producción
        </div>
        Ahora esto está en memoria con <strong>useState</strong>. Cuando
        conectes backend, este mismo diseño se puede mantener y solo cambias
        las acciones por llamadas reales tipo{" "}
        <strong>GET /products</strong>, <strong>POST /products</strong>,{" "}
        <strong>PUT /products/:id</strong> y{" "}
        <strong>DELETE /products/:id</strong>.
      </div>
    </div>
  );
}