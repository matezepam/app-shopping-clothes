import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Edit3,
  Eye,
  Loader2,
  Package,
  Plus,
  Save,
  Search,
  Send,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Upload,
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
  image: "/images/catalog/camiseta-galapagos-negra.png",
  images: ["/images/catalog/camiseta-galapagos-negra.png"],
  description: "",
  story: "",
  gender: "male",
  color: "negro",
  sizes: ["S", "M", "L"],
  stock: 0,
  status: "draft",
};

const CONCEPTS = ["galapagos", "quito", "otavalo", "andes", "amazonia", "coast"];
const COLORS = ["negro", "blanco", "rojo", "azul", "verde", "beige", "gris", "dorado", "plateado", "rosa"];
const APPAREL_SUBCATEGORIES = ["camisetas", "sudaderas", "gorras", "pantalones", "bolsos", "bisuteria", "joyas"];
const SOUVENIR_SUBCATEGORIES = ["recuadros", "tazas", "bordados"];

function statusTone(status?: string) {
  switch (status) {
    case "APPROVED":
      return "bg-emerald-50 text-emerald-700";
    case "REJECTED":
      return "bg-red-50 text-red-700";
    case "OBSERVED":
      return "bg-amber-50 text-amber-800";
    default:
      return "bg-blue-50 text-blue-700";
  }
}

function moderationLabel(status?: string) {
  switch (status) {
    case "APPROVED": return "Aprobado";
    case "REJECTED": return "Rechazado";
    case "OBSERVED": return "Con observaciones";
    default: return "Pendiente de revisión";
  }
}

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
  const [formStep, setFormStep] = useState<"edit" | "preview">("edit");
  const [form, setForm] = useState<ProductPayload>(emptyForm);
  const [imagesText, setImagesText] = useState("");
  const [sizesText, setSizesText] = useState("S, M, L");
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

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
      active: products.filter(
        (product) => product.status === "active" && product.moderationStatus === "APPROVED",
      ).length,
      pending: products.filter((product) => product.moderationStatus === "PENDING").length,
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
    setImagesText(emptyForm.image);
    setSizesText("S, M, L");
    setFormStep("edit");
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (product: Product) => {
    const nextForm = toForm(product);
    setEditingId(product.id);
    setForm(nextForm);
    setImagesText(listToText(nextForm.images));
    setSizesText(listToText(nextForm.sizes));
    setFormStep("edit");
    setFormError("");
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setFormStep("edit");
    setFormError("");
  };

  const buildPayload = (nextStatus: "active" | "draft") => ({
    ...form,
    images: textToList(imagesText).length ? textToList(imagesText) : [form.image],
    sizes: textToList(sizesText),
    priceUsd: Number(form.priceUsd),
    compareAtPriceUsd: form.compareAtPriceUsd
      ? Number(form.compareAtPriceUsd)
      : null,
    stock: Number(form.stock),
    status: nextStatus,
  });

  const validateForm = () => {
    if (!form.name.trim() || !form.sku.trim()) return "Completa el nombre y el SKU.";
    if (!form.image.trim()) return "Agrega una imagen principal válida.";
    if (Number(form.priceUsd) <= 0) return "El precio debe ser mayor que cero.";
    if (
      form.compareAtPriceUsd &&
      Number(form.compareAtPriceUsd) <= Number(form.priceUsd)
    ) return "El precio anterior debe ser mayor que el precio actual.";
    if ((form.description ?? "").trim().length < 40) {
      return "La descripción debe explicar material, uso y beneficio en al menos 40 caracteres.";
    }
    if ((form.story ?? "").trim().length < 30) {
      return "La historia debe explicar el concepto del producto en al menos 30 caracteres.";
    }
    if (form.collection !== "souvenirs" && textToList(sizesText).length === 0) {
      return "Agrega al menos una talla para esta prenda.";
    }
    return "";
  };

  const openPreview = () => {
    const error = validateForm();
    setFormError(error);
    if (error) return;
    setFormStep("preview");
  };

  const changeCollection = (collection: string) => {
    const souvenirs = collection === "souvenirs";
    setForm((current) => ({
      ...current,
      collection,
      category: souvenirs ? "art" : "shirts",
      subcategory: souvenirs ? "recuadros" : "camisetas",
      gender: collection === "women" ? "female" : "male",
      sizes: souvenirs ? [] : ["S", "M", "L"],
    }));
    setSizesText(souvenirs ? "" : "S, M, L");
  };

  const changeCategory = (category: string) => {
    const subcategoryByCategory: Record<string, string> = {
      shirts: "camisetas",
      hoodies: "sudaderas",
      caps: "gorras",
      pants: "pantalones",
      bags: "bolsos",
      art: "recuadros",
      mugs: "tazas",
      embroidery: "bordados",
    };
    setForm((current) => ({
      ...current,
      category,
      subcategory: subcategoryByCategory[category] ?? current.subcategory,
    }));
  };

  const uploadImages = async (files: FileList | null) => {
    if (!token || !files?.length) return;
    const selected = Array.from(files);
    if (selected.length > 4) {
      setFormError("Puedes seleccionar hasta 4 imágenes por producto.");
      return;
    }
    const invalid = selected.find((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 2 * 1024 * 1024);
    if (invalid) {
      setFormError("Usa imágenes JPG, PNG o WebP de máximo 2 MB cada una.");
      return;
    }
    setUploadingImages(true);
    setFormError("");
    try {
      const result = await api.uploadProductImages(token, selected);
      const uploadedUrls = result.images.map((image) => image.url);
      const currentUrls = textToList(imagesText).filter((url) => url !== emptyForm.image);
      const merged = [...new Set([...currentUrls, ...uploadedUrls])].slice(0, 4);
      setImagesText(merged.join(", "));
      setForm((current) => ({ ...current, image: uploadedUrls[0] ?? current.image, images: merged }));
      setMessage(`${uploadedUrls.length} imagen${uploadedUrls.length === 1 ? "" : "es"} cargada${uploadedUrls.length === 1 ? "" : "s"} correctamente.`);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "No se pudieron cargar las imágenes.");
    } finally {
      setUploadingImages(false);
    }
  };

  const saveProduct = async (nextStatus: "active" | "draft") => {
    if (!token || !canManageProducts) return;
    setMessage("");
    const error = validateForm();
    setFormError(error);
    if (error) {
      setFormStep("edit");
      return;
    }
    const payload = buildPayload(nextStatus);
    setSaving(true);

    try {
      if (editingId) {
        await api.updateProduct(token, editingId, payload);
      } else {
        await api.createProduct(token, payload);
      }
      await loadProducts();
      await refreshProducts();
      closeForm();
      setMessage(
        nextStatus === "draft"
          ? "Borrador guardado. No es visible en la tienda."
          : "Producto enviado a moderación. Se publicará cuando sea aprobado.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : t("adminProducts.status.error"),
      );
    } finally {
      setSaving(false);
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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          [Eye, "Visibles en tienda", stats.active],
          [ShieldCheck, "Pendientes de revisión", stats.pending],
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
          <table className="w-full min-w-[1160px] text-left text-sm">
            <thead className="border-b border-neutral-200 text-xs uppercase tracking-[0.16em] text-neutral-400">
              <tr>
                <th className="p-4">{t("adminProducts.table.product")}</th>
                <th className="p-4">SKU</th>
                <th className="p-4">{t("adminProducts.table.collection")}</th>
                <th className="p-4">{t("adminProducts.table.price")}</th>
                <th className="p-4">{t("adminProducts.table.stock")}</th>
                <th className="p-4">{t("adminProducts.table.status")}</th>
                <th className="p-4">Moderación</th>
                <th className="p-4">Visibilidad</th>
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
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = "/images/catalog/coleccion-recuerdos-andes.png";
                        }}
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
                    <span className={`rounded-full px-3 py-1 text-xs font-black ${statusTone(product.moderationStatus)}`}>
                      {moderationLabel(product.moderationStatus)}
                    </span>
                    {product.moderationNote ? (
                      <p className="mt-2 max-w-44 text-xs leading-5 text-neutral-500">
                        {product.moderationNote}
                      </p>
                    ) : null}
                  </td>
                  <td className="p-4">
                    {product.status === "active" && product.moderationStatus === "APPROVED" ? (
                      <span className="font-bold text-emerald-700">Publicado</span>
                    ) : (
                      <span className="font-bold text-neutral-500">No visible</span>
                    )}
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

            <div className="mt-5 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em]">
              <span className={`rounded-full px-4 py-2 ${formStep === "edit" ? "bg-neutral-950 text-white" : "bg-emerald-50 text-emerald-700"}`}>
                1. Información
              </span>
              <span className={`rounded-full px-4 py-2 ${formStep === "preview" ? "bg-neutral-950 text-white" : "bg-neutral-100 text-neutral-500"}`}>
                2. Vista previa
              </span>
              <span className="rounded-full bg-neutral-100 px-4 py-2 text-neutral-500">
                3. Moderación
              </span>
            </div>

            {formError ? (
              <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {formError}
              </p>
            ) : null}

            {formStep === "edit" ? (
              <div className="mt-6 grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
                <div>
                  <div className="aspect-square overflow-hidden rounded-[2rem] bg-neutral-100">
                    <img
                      src={form.image || "/images/catalog/coleccion-recuerdos-andes.png"}
                      alt={form.name || "Vista del producto"}
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = "/images/catalog/coleccion-recuerdos-andes.png";
                      }}
                    />
                  </div>
                  <p className="mt-3 text-xs leading-5 text-neutral-500">
                    La imagen debe mostrar el producto real, con fondo limpio y sin rótulos técnicos.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-bold text-neutral-700">
                    {t("adminProducts.form.name")}
                    <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-primary" />
                  </label>
                  <label className="text-sm font-bold text-neutral-700">
                    SKU
                    <input value={form.sku} onChange={(event) => setForm((current) => ({ ...current, sku: event.target.value.toUpperCase() }))} placeholder="GLP-CAM-025" className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-primary" />
                  </label>
                  <div className="sm:col-span-2">
                    <span className="text-sm font-bold text-neutral-700">Imágenes del producto</span>
                    <label className="mt-2 flex cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-5 py-5 text-sm font-bold text-neutral-700 transition hover:border-primary hover:bg-primary/5">
                      {uploadingImages ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                      {uploadingImages ? "Cargando imágenes…" : "Seleccionar fotografías"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        disabled={uploadingImages}
                        onChange={(event) => { void uploadImages(event.target.files); event.currentTarget.value = ""; }}
                        className="sr-only"
                      />
                    </label>
                    <p className="mt-2 text-xs leading-5 text-neutral-500">Hasta 4 archivos JPG, PNG o WebP. Máximo 2 MB por imagen. La primera fotografía será la portada.</p>
                    <details className="mt-3 text-xs text-neutral-500">
                      <summary className="cursor-pointer font-bold">Usar una ruta existente</summary>
                      <input value={form.image} onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))} placeholder="/images/catalog/producto.webp" className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-primary" />
                    </details>
                  </div>

                  <label className="text-sm font-bold text-neutral-700">
                    {t("adminProducts.form.collection")}
                    <select value={form.collection} onChange={(event) => changeCollection(event.target.value)} className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-primary">
                      <option value="men">{t("categories.men")}</option>
                      <option value="women">{t("categories.women")}</option>
                      <option value="souvenirs">{t("categories.souvenirs")}</option>
                    </select>
                  </label>
                  <label className="text-sm font-bold text-neutral-700">
                    {t("adminProducts.form.category")}
                    <select value={form.category} onChange={(event) => changeCategory(event.target.value)} className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-primary">
                      {(form.collection === "souvenirs" ? ["art", "mugs", "embroidery"] : ["shirts", "hoodies", "caps", "pants", "bags"]).map((item) => <option key={item} value={item}>{t(`categories.${item}`)}</option>)}
                    </select>
                  </label>
                  <label className="text-sm font-bold text-neutral-700">
                    {t("adminProducts.form.subcategory")}
                    <select value={form.subcategory} onChange={(event) => setForm((current) => ({ ...current, subcategory: event.target.value }))} className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-primary">
                      {(form.collection === "souvenirs" ? SOUVENIR_SUBCATEGORIES : APPAREL_SUBCATEGORIES).map((item) => <option key={item} value={item}>{t(`${form.collection === "souvenirs" ? "shop.souvenirFilters" : "shop.subcategories"}.${item}`)}</option>)}
                    </select>
                  </label>
                  <label className="text-sm font-bold text-neutral-700">
                    {t("adminProducts.form.concept")}
                    <select value={form.concept} onChange={(event) => setForm((current) => ({ ...current, concept: event.target.value }))} className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-primary">
                      {CONCEPTS.map((item) => <option key={item} value={item}>{t(`concepts.${item}.title`)}</option>)}
                    </select>
                  </label>
                  <label className="text-sm font-bold text-neutral-700">
                    {t("adminProducts.form.color")}
                    <select value={form.color} onChange={(event) => setForm((current) => ({ ...current, color: event.target.value }))} className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-primary">
                      {COLORS.map((item) => <option key={item} value={item}>{t(`shop.colors.${item}`)}</option>)}
                    </select>
                  </label>
                  <label className="text-sm font-bold text-neutral-700">
                    {t("adminProducts.form.gender")}
                    <select value={form.gender} onChange={(event) => setForm((current) => ({ ...current, gender: event.target.value }))} className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-primary">
                      <option value="male">{t("profile.genders.male")}</option>
                      <option value="female">{t("profile.genders.female")}</option>
                    </select>
                  </label>
                  <label className="text-sm font-bold text-neutral-700">
                    {t("adminProducts.form.price")}
                    <input type="number" min="0.01" step="0.01" value={form.priceUsd} onChange={(event) => setForm((current) => ({ ...current, priceUsd: Number(event.target.value) }))} className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-primary" />
                  </label>
                  <label className="text-sm font-bold text-neutral-700">
                    {t("adminProducts.form.compareAt")}
                    <input type="number" min="0" step="0.01" value={form.compareAtPriceUsd ?? ""} onChange={(event) => setForm((current) => ({ ...current, compareAtPriceUsd: event.target.value ? Number(event.target.value) : null }))} className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-primary" />
                  </label>
                  <label className="text-sm font-bold text-neutral-700">
                    Stock actual
                    <input type="number" disabled value={form.stock} className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-100 px-4 py-3 text-sm text-neutral-500" />
                    <span className="mt-1 block text-xs font-normal text-neutral-400">Se actualiza desde Operaciones.</span>
                  </label>
                  <label className="text-sm font-bold text-neutral-700 sm:col-span-2">
                    {t("adminProducts.form.images")} · 4 vistas recomendadas
                    <input value={imagesText} onChange={(event) => setImagesText(event.target.value)} placeholder="Frontal, posterior, detalle y vista completa; separadas por comas" className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-primary" />
                    <span className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs font-normal text-neutral-500">
                      <span>Orden: frontal → posterior → detalle → producto completo.</span>
                      <span className={`rounded-full px-2.5 py-1 font-black ${textToList(imagesText).length === 4 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>
                        {textToList(imagesText).length}/4 imágenes
                      </span>
                    </span>
                  </label>
                  {form.collection !== "souvenirs" ? (
                    <label className="text-sm font-bold text-neutral-700 sm:col-span-2">
                      {t("adminProducts.form.sizes")}
                      <input value={sizesText} onChange={(event) => setSizesText(event.target.value)} placeholder="S, M, L, XL" className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-primary" />
                    </label>
                  ) : null}
                  <label className="text-sm font-bold text-neutral-700 sm:col-span-2">
                    {t("adminProducts.form.description")}
                    <textarea value={form.description ?? ""} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={4} placeholder="Explica el material, el corte, el uso y por qué conviene comprarlo." className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm leading-6 outline-none focus:border-primary" />
                  </label>
                  <label className="text-sm font-bold text-neutral-700 sm:col-span-2">
                    {t("adminProducts.form.story")}
                    <textarea value={form.story ?? ""} onChange={(event) => setForm((current) => ({ ...current, story: event.target.value }))} rows={4} placeholder="Cuenta de forma breve de dónde nace el concepto del producto." className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm leading-6 outline-none focus:border-primary" />
                  </label>
                </div>
              </div>
            ) : (
              <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
                <article className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-xl shadow-black/10">
                  <img src={form.image} alt={form.name} className="aspect-square w-full object-cover" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/images/catalog/coleccion-recuerdos-andes.png"; }} />
                  <div className="p-6">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-accent">{t(`categories.${form.collection}`)} · {t(`concepts.${form.concept}.title`)}</p>
                    <h3 className="mt-3 font-display text-3xl font-black text-neutral-950">{form.name}</h3>
                    <p className="mt-3 text-sm leading-7 text-neutral-600">{form.description}</p>
                    <div className="mt-5 flex items-end gap-3">
                      <span className="text-3xl font-black">{formatMoney(Number(form.priceUsd), "USD")}</span>
                      {form.compareAtPriceUsd ? <span className="pb-1 text-sm font-bold text-neutral-400 line-through">{formatMoney(Number(form.compareAtPriceUsd), "USD")}</span> : null}
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {textToList(sizesText).map((size) => <span key={size} className="rounded-full border border-neutral-200 px-3 py-2 text-xs font-black">{size}</span>)}
                      <span className="rounded-full bg-neutral-100 px-3 py-2 text-xs font-black">{t(`shop.colors.${form.color}`)}</span>
                    </div>
                  </div>
                </article>
                <aside className="space-y-4">
                  <div className="rounded-[2rem] bg-[#0a0f1a] p-6 text-white">
                    <ShieldCheck className="text-emerald-300" />
                    <h3 className="mt-4 text-xl font-black">Revisión antes de publicar</h3>
                    <p className="mt-3 text-sm leading-6 text-white/65">Esta es la apariencia comercial. Al enviarlo, un administrador o moderador revisará el contenido. Solo quedará visible cuando esté activo y aprobado.</p>
                  </div>
                  <div className="rounded-[2rem] border border-neutral-200 p-6">
                    <p className="text-sm font-black text-neutral-950">Comprobación editorial</p>
                    <ul className="mt-4 space-y-3 text-sm text-neutral-600">
                      <li>✓ Nombre y SKU identificables</li>
                      <li>✓ Precio y descuento coherentes</li>
                      <li>✓ Imagen principal disponible</li>
                      <li>✓ Descripción útil para comprar</li>
                      <li>✓ Tallas, color y categoría definidos</li>
                    </ul>
                  </div>
                </aside>
              </div>
            )}

            <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-neutral-100 pt-5">
              {formStep === "edit" ? (
                <>
                  <button type="button" onClick={closeForm} className="rounded-full border border-neutral-200 px-5 py-3 text-sm font-bold text-neutral-700 transition hover:bg-neutral-100">{t("profile.actions.cancel")}</button>
                  <button type="button" onClick={openPreview} className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-primary hover:text-neutral-950"><Eye size={18} /> Revisar vista previa</button>
                </>
              ) : (
                <>
                  <button type="button" disabled={saving} onClick={() => setFormStep("edit")} className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-5 py-3 text-sm font-bold text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-50"><ArrowLeft size={18} /> Volver a editar</button>
                  <button type="button" disabled={saving} onClick={() => void saveProduct("draft")} className="inline-flex items-center gap-2 rounded-full border border-neutral-950 px-5 py-3 text-sm font-bold text-neutral-950 transition hover:bg-neutral-100 disabled:opacity-50"><Save size={18} /> Guardar borrador</button>
                  <button type="button" disabled={saving} onClick={() => void saveProduct("active")} className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50">{saving ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} Enviar a moderación</button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
