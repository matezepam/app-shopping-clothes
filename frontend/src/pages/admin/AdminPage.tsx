import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Package,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { api, type ProductPayload } from "../../lib/api";
import { formatMoney } from "../../lib/currency";
import { useStore } from "../../context/StoreContext";
import type { Product } from "../../types/store";

const emptyForm: ProductPayload = {
  sku: "",
  name: "",
  collection: "men",
  category: "shirts",
  subcategory: "camisetas",
  concept: "galapagos",
  priceUsd: 0,
  compareAtPriceUsd: null,
  image: "",
  images: [],
  description: "",
  story: "",
  gender: "male",
  color: "negro",
  sizes: ["S", "M", "L"],
  stock: 0,
  status: "active",
};

function listToText(value?: string[]) {
  return value?.join(", ") ?? "";
}

function textToList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toForm(product: Product): ProductPayload {
  return {
    id: product.id,
    sku: product.sku ?? "",
    name: product.name,
    collection: product.collection ?? "men",
    category: product.category,
    subcategory: product.subcategory,
    concept: product.concept,
    priceUsd: product.priceUsd,
    compareAtPriceUsd: product.compareAtPriceUsd ?? null,
    image: product.image,
    images: product.images ?? [product.image],
    description: product.description ?? "",
    story: product.story ?? "",
    gender: product.gender,
    color: product.color,
    sizes: product.sizes ?? [],
    stock: product.stock ?? 0,
    status: product.status ?? "active",
  };
}

export function AdminPage() {
  const { t } = useTranslation();
  const { user, token, refreshProducts } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<ProductPayload>(emptyForm);
  const [imagesText, setImagesText] = useState("");
  const [sizesText, setSizesText] = useState("S, M, L");
  const [message, setMessage] = useState("");

  const isAdmin = user?.roles?.includes("ADMIN") ?? false;
  const canManageProducts = user?.roles?.some((role) => role === "ADMIN" || role === "VENDOR") ?? false;
  const canViewProducts = user?.roles?.some((role) => ["ADMIN", "VENDOR", "MODERATOR"].includes(role)) ?? false;

  const loadProducts = async () => {
    if (!token || !canViewProducts) return;
    const { products: nextProducts } = await api.adminProducts(token);
    setProducts(nextProducts);
  };

  useEffect(() => {
    void loadProducts();
  }, [token, canViewProducts]);

  const stats = useMemo(() => {
    return {
      active: products.filter((product) => product.status === "active").length,
      stock: products.reduce((sum, product) => sum + (product.stock ?? 0), 0),
      lowStock: products.filter((product) => (product.stock ?? 0) <= 8).length,
      value: products.reduce(
        (sum, product) => sum + product.priceUsd * (product.stock ?? 0),
        0,
      ),
    };
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const query = search.toLowerCase();
      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        product.id.toLowerCase().includes(query) ||
        (product.sku ?? "").toLowerCase().includes(query);
      const matchesStatus = status === "all" || product.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [products, search, status]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImagesText("");
    setSizesText("S, M, L");
    setFormOpen(true);
  };

  const openEdit = (product: Product) => {
    const nextForm = toForm(product);
    setEditingId(product.id);
    setForm(nextForm);
    setImagesText(listToText(nextForm.images));
    setSizesText(listToText(nextForm.sizes));
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const saveProduct = async () => {
    if (!token || !canManageProducts) return;
    setMessage("");

    const payload = {
      ...form,
      images: textToList(imagesText).length ? textToList(imagesText) : [form.image],
      sizes: textToList(sizesText),
      priceUsd: Number(form.priceUsd),
      compareAtPriceUsd: form.compareAtPriceUsd
        ? Number(form.compareAtPriceUsd)
        : null,
      stock: Number(form.stock),
    };

    try {
      if (editingId) {
        await api.updateProduct(token, editingId, payload);
      } else {
        await api.createProduct(token, payload);
      }
      await loadProducts();
      await refreshProducts();
      closeForm();
      setMessage(t("adminProducts.status.saved"));
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : t("adminProducts.status.error"),
      );
    }
  };

  const deleteProduct = async (id: string) => {
    if (!token || !window.confirm(t("adminProducts.confirmDelete"))) return;
    await api.deleteProduct(token, id);
    await loadProducts();
    await refreshProducts();
  };

  const toggleProductStatus = async (product: Product) => {
    if (!token || !canManageProducts) return;
    await api.updateProduct(token, product.id, {
      ...toForm(product),
      status: product.status === "active" ? "disabled" : "active",
    });
    await loadProducts();
    await refreshProducts();
  };

  if (!user || !canViewProducts) {
    return (
      <section className="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center text-center">
        <AlertTriangle size={42} className="text-primary" />
        <h1 className="mt-5 text-3xl font-black text-neutral-950">
          {t("admin.forbidden")}
        </h1>
      </section>
    );
  }

  return (
    <div className="space-y-7">
      <section className="rounded-[2rem] bg-[#0a0f1a] p-8 text-white shadow-2xl shadow-black/15">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-black text-emerald-300">
            <CheckCircle2 size={15} /> Sesión verificada por AWS Cognito
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white/70">
            Rol activo: {user.roles.join(" · ")}
          </span>
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
          {t("adminProducts.eyebrow")}
        </p>
        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-display text-4xl font-black">
              {t("adminProducts.title")}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
              {t("adminProducts.subtitle")}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
          <Link to="/admin/operations" className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10">Operaciones</Link>
          {canManageProducts ? <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-black text-neutral-950 transition hover:bg-white"
          >
            <Plus size={18} />
            {t("adminProducts.add")}
          </button> : null}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          [ShoppingBag, t("adminProducts.stats.active"), stats.active],
          [Package, t("adminProducts.stats.stock"), stats.stock],
          [AlertTriangle, t("adminProducts.stats.low"), stats.lowStock],
          [CheckCircle2, t("adminProducts.stats.value"), formatMoney(stats.value, "USD")],
        ].map(([Icon, label, value]) => {
          const IconComponent = Icon as typeof ShoppingBag;
          return (
            <div key={String(label)} className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm">
              <IconComponent size={22} className="text-accent" />
              <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-neutral-400">
                {String(label)}
              </p>
              <p className="mt-2 text-3xl font-black text-neutral-950">
                {String(value)}
              </p>
            </div>
          );
        })}
      </section>

      {message ? (
        <p className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-bold text-neutral-700">
          {message}
        </p>
      ) : null}

      <section className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-black text-neutral-950">
              {t("adminProducts.table.title")}
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              {t("adminProducts.table.subtitle")}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex items-center gap-3 rounded-2xl border border-neutral-200 px-4 py-3">
              <Search size={18} className="text-neutral-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("adminProducts.search")}
                className="bg-transparent text-sm font-semibold outline-none"
              />
            </label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="rounded-2xl border border-neutral-200 px-4 py-3 text-sm font-bold outline-none"
            >
              <option value="all">{t("adminProducts.statuses.all")}</option>
              <option value="active">{t("adminProducts.statuses.active")}</option>
              <option value="draft">{t("adminProducts.statuses.draft")}</option>
              <option value="disabled">{t("adminProducts.statuses.disabled")}</option>
            </select>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-neutral-200 text-xs uppercase tracking-[0.16em] text-neutral-400">
              <tr>
                <th className="p-4">{t("adminProducts.table.product")}</th>
                <th className="p-4">SKU</th>
                <th className="p-4">{t("adminProducts.table.collection")}</th>
                <th className="p-4">{t("adminProducts.table.price")}</th>
                <th className="p-4">{t("adminProducts.table.stock")}</th>
                <th className="p-4">{t("adminProducts.table.status")}</th>
                <th className="p-4 text-right">{t("adminProducts.table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} className="border-b border-neutral-100">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt=""
                        className="h-16 w-16 rounded-2xl object-cover"
                      />
                      <div>
                        <p className="font-black text-neutral-950">{product.name}</p>
                        <p className="text-xs text-neutral-500">{product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-xs">{product.sku}</td>
                  <td className="p-4">{t(`categories.${product.collection ?? product.category}`)}</td>
                  <td className="p-4 font-bold">{formatMoney(product.priceUsd, "USD")}</td>
                  <td className="p-4">{product.stock}</td>
                  <td className="p-4">
                    <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-black text-neutral-700">
                      {t(`adminProducts.statuses.${product.status ?? "active"}`)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      {canManageProducts ? <button
                        type="button"
                        onClick={() => void toggleProductStatus(product)}
                        className="rounded-xl border border-neutral-200 p-2 transition hover:bg-neutral-100"
                        title={t("adminProducts.toggle")}
                      >
                        <CheckCircle2 size={17} />
                      </button> : null}
                      {canManageProducts ? <button
                        type="button"
                        onClick={() => openEdit(product)}
                        className="rounded-xl border border-neutral-200 p-2 transition hover:bg-neutral-100"
                        title={t("adminProducts.edit")}
                      >
                        <Edit3 size={17} />
                      </button> : null}
                      {isAdmin ? <button
                        type="button"
                        onClick={() => void deleteProduct(product.id)}
                        className="rounded-xl border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
                        title={t("adminProducts.delete")}
                      >
                        <Trash2 size={17} />
                      </button> : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {formOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black text-neutral-950">
                  {editingId ? t("adminProducts.form.edit") : t("adminProducts.form.create")}
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  {t("adminProducts.form.text")}
                </p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-2xl border border-neutral-200 p-3 transition hover:bg-neutral-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
              <div>
                <div className="aspect-square overflow-hidden rounded-[2rem] bg-neutral-100">
                  <img
                    src={form.image || "/images/hero/galapagos.svg"}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ["name", t("adminProducts.form.name")],
                  ["sku", "SKU"],
                  ["image", t("adminProducts.form.image")],
                  ["concept", t("adminProducts.form.concept")],
                  ["subcategory", t("adminProducts.form.subcategory")],
                  ["color", t("adminProducts.form.color")],
                ].map(([key, label]) => (
                  <label key={key} className="text-sm font-bold text-neutral-700">
                    {label}
                    <input
                      value={String(form[key as keyof ProductPayload] ?? "")}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          [key]: event.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-primary"
                    />
                  </label>
                ))}

                <label className="text-sm font-bold text-neutral-700">
                  {t("adminProducts.form.collection")}
                  <select
                    value={form.collection}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, collection: event.target.value }))
                    }
                    className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-primary"
                  >
                    <option value="men">{t("categories.men")}</option>
                    <option value="women">{t("categories.women")}</option>
                    <option value="souvenirs">{t("categories.souvenirs")}</option>
                  </select>
                </label>

                <label className="text-sm font-bold text-neutral-700">
                  {t("adminProducts.form.category")}
                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, category: event.target.value }))
                    }
                    className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-primary"
                  >
                    {["shirts", "hoodies", "caps", "souvenirs", "art"].map((item) => (
                      <option key={item} value={item}>
                        {t(`categories.${item}`)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-bold text-neutral-700">
                  {t("adminProducts.form.gender")}
                  <select
                    value={form.gender}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, gender: event.target.value }))
                    }
                    className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-primary"
                  >
                    <option value="male">{t("profile.genders.male")}</option>
                    <option value="female">{t("profile.genders.female")}</option>
                  </select>
                </label>

                <label className="text-sm font-bold text-neutral-700">
                  {t("adminProducts.form.status")}
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, status: event.target.value }))
                    }
                    className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-primary"
                  >
                    <option value="active">{t("adminProducts.statuses.active")}</option>
                    <option value="draft">{t("adminProducts.statuses.draft")}</option>
                    <option value="disabled">{t("adminProducts.statuses.disabled")}</option>
                  </select>
                </label>

                <label className="text-sm font-bold text-neutral-700">
                  {t("adminProducts.form.price")}
                  <input
                    type="number"
                    value={form.priceUsd}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, priceUsd: Number(event.target.value) }))
                    }
                    className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                </label>

                <label className="text-sm font-bold text-neutral-700">
                  {t("adminProducts.form.compareAt")}
                  <input
                    type="number"
                    value={form.compareAtPriceUsd ?? ""}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        compareAtPriceUsd: event.target.value ? Number(event.target.value) : null,
                      }))
                    }
                    className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                </label>

                <label className="text-sm font-bold text-neutral-700">
                  Stock (gestionar en Operaciones)
                  <input
                    type="number"
                    disabled
                    value={form.stock}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, stock: Number(event.target.value) }))
                    }
                    className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-100 px-4 py-3 text-sm text-neutral-500"
                  />
                </label>

                <label className="text-sm font-bold text-neutral-700 sm:col-span-2">
                  {t("adminProducts.form.images")}
                  <input
                    value={imagesText}
                    onChange={(event) => setImagesText(event.target.value)}
                    placeholder="/img/a.jpg, /img/b.jpg"
                    className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                </label>

                <label className="text-sm font-bold text-neutral-700 sm:col-span-2">
                  {t("adminProducts.form.sizes")}
                  <input
                    value={sizesText}
                    onChange={(event) => setSizesText(event.target.value)}
                    placeholder="S, M, L, XL"
                    className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                </label>

                <label className="text-sm font-bold text-neutral-700 sm:col-span-2">
                  {t("adminProducts.form.description")}
                  <textarea
                    value={form.description ?? ""}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, description: event.target.value }))
                    }
                    rows={3}
                    className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                </label>

                <label className="text-sm font-bold text-neutral-700 sm:col-span-2">
                  {t("adminProducts.form.story")}
                  <textarea
                    value={form.story ?? ""}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, story: event.target.value }))
                    }
                    rows={4}
                    className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-neutral-100 pt-5">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-full border border-neutral-200 px-5 py-3 text-sm font-bold text-neutral-700 transition hover:bg-neutral-100"
              >
                {t("profile.actions.cancel")}
              </button>
              <button
                type="button"
                onClick={() => void saveProduct()}
                className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-primary hover:text-neutral-950"
              >
                <CheckCircle2 size={18} />
                {t("adminProducts.form.save")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
